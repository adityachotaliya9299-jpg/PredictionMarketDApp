// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IOracle } from "./interfaces/IOracle.sol";
import { IPredictionMarket } from "./interfaces/IPredictionMarket.sol";

/// @title PredictionMarket
/// @author Aditya Chotaliya
/// @notice Parimutuel prediction market with dynamic probability pricing.
/// @dev Users buy YES/NO shares with ETH. Winners split the entire pool proportionally.
///      A protocol fee is taken at purchase time.
///      Resolution is triggered by an external oracle (Chainlink-compatible).


contract PredictionMarket is IPredictionMarket, ReentrancyGuard, Pausable, Ownable {
    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_FEE_BPS = 500; // 5% max fee
    uint256 public constant BPS = 10_000;

    // ─── Immutables ───────────────────────────────────────────────────────────

    bytes32 public immutable marketId;
    string public question;
    uint256 public immutable expirationTime;
    IOracle public immutable oracle;
    address public immutable feeCollector;
    uint256 public immutable feeBps; // e.g. 200 = 2%

    // ─── State ────────────────────────────────────────────────────────────────

    IOracle.Outcome public outcome;
    uint256 public resolutionTime;
    bool public resolved;

    uint256 public totalYesShares;
    uint256 public totalNoShares;
    uint256 public totalPool; // after fees
    uint256 public totalFeeCollected;

    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;
    mapping(address => bool) public hasClaimed;

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        bytes32 _marketId,
        string memory _question,
        uint256 _expirationTime,
        address _oracle,
        address _feeCollector,
        uint256 _feeBps,
        address _owner
    ) Ownable(_owner) {
        require(_oracle != address(0), "Invalid oracle");
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_expirationTime > block.timestamp, "Expiration in past");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        require(bytes(_question).length > 0, "Empty question");

        marketId = _marketId;
        question = _question;
        expirationTime = _expirationTime;
        oracle = IOracle(_oracle);
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }

    // ─── External: Trading ────────────────────────────────────────────────────

    /// @inheritdoc IPredictionMarket
    /// @notice Buy YES shares. msg.value is the ETH deposited.
    ///         Shares = (msg.value - fee). Price per share is always 1 wei initially,
    ///         probability is derived from share ratio.
    function buyYesShares() external payable override nonReentrant whenNotPaused returns (uint256 shares) {
        _assertMarketOpen();
        shares = _processShares(true, msg.value);
        emit SharesPurchased(msg.sender, true, msg.value, shares);
    }

    /// @inheritdoc IPredictionMarket
    /// @notice Buy NO shares.
    function buyNoShares() external payable override nonReentrant whenNotPaused returns (uint256 shares) {
        _assertMarketOpen();
        shares = _processShares(false, msg.value);
        emit SharesPurchased(msg.sender, false, msg.value, shares);
    }

    // ─── External: Resolution ─────────────────────────────────────────────────

    /// @inheritdoc IPredictionMarket
    /// @notice Resolve the market by pulling result from oracle.
    ///         Anyone can call this after expiration IF the oracle has resolved.
    function resolveMarket() external override {
        if (resolved) revert MarketAlreadyResolved();
        if (block.timestamp < expirationTime) revert MarketNotExpired();
        if (!oracle.isResolved(marketId)) revert OracleNotResolved();

        IOracle.Outcome _outcome = oracle.getResolution(marketId);
        if (_outcome == IOracle.Outcome.UNRESOLVED) revert OracleNotResolved();

        outcome = _outcome;
        resolved = true;
        resolutionTime = block.timestamp;

        emit MarketResolved(_outcome, totalPool);
    }

    /// @inheritdoc IPredictionMarket
    /// @notice Claim reward after resolution. INVALID outcome refunds proportional ETH.
    function claimReward() external override nonReentrant returns (uint256 reward) {
        if (!resolved) revert MarketNotResolved();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        uint256 userYes = yesShares[msg.sender];
        uint256 userNo = noShares[msg.sender];

        if (outcome == IOracle.Outcome.YES) {
            if (userYes == 0) revert NoSharesToClaim();
            reward = (userYes * totalPool) / totalYesShares;
        } else if (outcome == IOracle.Outcome.NO) {
            if (userNo == 0) revert NoSharesToClaim();
            reward = (userNo * totalPool) / totalNoShares;
        } else if (outcome == IOracle.Outcome.INVALID) {
            // Refund proportional share of pool
            uint256 totalUserShares = userYes + userNo;
            uint256 totalAllShares = totalYesShares + totalNoShares;
            if (totalUserShares == 0) revert NoSharesToClaim();
            reward = (totalUserShares * totalPool) / totalAllShares;
        } else {
            revert InvalidOutcome();
        }

        hasClaimed[msg.sender] = true;

        (bool success,) = msg.sender.call{ value: reward }("");
        if (!success) revert TransferFailed();

        emit RewardClaimed(msg.sender, reward);
    }

    // ─── External: Admin ──────────────────────────────────────────────────────

    /// @notice Emergency pause – factory owner only
    function pause() external onlyOwner {
        _pause();
        emit MarketPaused(true);
    }

    /// @notice Unpause market
    function unpause() external onlyOwner {
        _unpause();
        emit MarketPaused(false);
    }

    /// @notice Collect protocol fees (callable by feeCollector)
    function collectFees() external {
        require(msg.sender == feeCollector, "Not fee collector");
        uint256 fees = totalFeeCollected;
        require(fees > 0, "No fees");
        totalFeeCollected = 0;
        (bool success,) = feeCollector.call{ value: fees }("");
        if (!success) revert TransferFailed();
    }

    // ─── External: Views ──────────────────────────────────────────────────────

    /// @inheritdoc IPredictionMarket
    function getMarketInfo() external view override returns (MarketInfo memory) {
        return MarketInfo({
            marketId: marketId,
            question: question,
            expirationTime: expirationTime,
            resolutionTime: resolutionTime,
            outcome: outcome,
            paused: paused(),
            totalYesShares: totalYesShares,
            totalNoShares: totalNoShares,
            totalPool: totalPool
        });
    }

    // @inheritdoc IPredictionMarket
    function getUserShares(address user) external view override returns (uint256, uint256) {
        return (yesShares[user], noShares[user]);
    }

    // @inheritdoc IPredictionMarket
    // @return Probability scaled to 1e18 (e.g. 6e17 = 60%)
    function calculateProbability() external view override returns (uint256 yesProbability, uint256 noProbability) {
        uint256 totalShares = totalYesShares + totalNoShares;
        if (totalShares == 0) {
            return (PRECISION / 2, PRECISION / 2); // 50/50 when no bets
        }
        yesProbability = (totalYesShares * PRECISION) / totalShares;
        noProbability = PRECISION - yesProbability;
    }

    /// @inheritdoc IPredictionMarket
    function getExpectedPayout(address user) external view override returns (uint256) {
        if (!resolved) {
            // Estimate based on current probability
            uint256 totalShares = totalYesShares + totalNoShares;
            if (totalShares == 0) return 0;
            uint256 userYes = yesShares[user];
            uint256 userNo = noShares[user];

            uint256 yesPayout = totalYesShares > 0 ? (userYes * totalPool) / totalYesShares : 0;
            uint256 noPayout = totalNoShares > 0 ? (userNo * totalPool) / totalNoShares : 0;
            return yesPayout + noPayout; // combined estimated value
        }

        if (hasClaimed[user]) return 0;

        if (outcome == IOracle.Outcome.YES && totalYesShares > 0) {
            return (yesShares[user] * totalPool) / totalYesShares;
        } else if (outcome == IOracle.Outcome.NO && totalNoShares > 0) {
            return (noShares[user] * totalPool) / totalNoShares;
        } else if (outcome == IOracle.Outcome.INVALID) {
            uint256 totalUserShares = yesShares[user] + noShares[user];
            uint256 totalAllShares = totalYesShares + totalNoShares;
            if (totalAllShares == 0) return 0;
            return (totalUserShares * totalPool) / totalAllShares;
        }
        return 0;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _processShares(bool isYes, uint256 amount) internal returns (uint256 shares) {
        if (amount == 0) revert InvalidAmount();

        // Deduct fee
        uint256 fee = (amount * feeBps) / BPS;
        uint256 netAmount = amount - fee;

        totalFeeCollected += fee;
        totalPool += netAmount;
        shares = netAmount; // 1 share = 1 wei net (simplest parimutuel model)

        if (isYes) {
            totalYesShares += shares;
            yesShares[msg.sender] += shares;
        } else {
            totalNoShares += shares;
            noShares[msg.sender] += shares;
        }
    }

    function _assertMarketOpen() internal view {
        if (block.timestamp >= expirationTime) revert MarketExpired();
        if (resolved) revert MarketAlreadyResolved();
    }

    receive() external payable { }
}
