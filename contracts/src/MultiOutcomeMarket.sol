// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MultiOracle.sol";
import "./LiquidityMining.sol";

/// @title MultiOutcomeMarket - Parimutuel prediction market with N outcomes
/// @author Aditya Chotaliya
contract MultiOutcomeMarket is ReentrancyGuard, Pausable, Ownable {

    uint256 public constant MAX_FEE_BPS = 500;
    uint256 public constant BPS = 10_000;
    uint8  public constant INVALID_OUTCOME = 255;
    uint8  public constant MAX_OUTCOMES = 10;

    // ─── Immutables ───────────────────────────────────────────────────────────
    bytes32 public immutable marketId;
    string  public question;
    string[] public outcomes;          // e.g. ["Trump","Biden","Other"]
    uint256 public immutable expirationTime;
    MultiOracle public immutable oracle;
    address public immutable feeCollector;
    uint256 public immutable feeBps;

    // ─── State ────────────────────────────────────────────────────────────────
    bool    public resolved;
    uint8   public winningOutcome;
    uint256 public resolutionTime;
    uint256 public totalPool;
    uint256 public totalFeeCollected;

    mapping(uint8 => uint256) public outcomePools;        // outcome index => total ETH
    mapping(address => mapping(uint8 => uint256)) public shares; // user => outcome => shares
    mapping(address => bool) public hasClaimed;

    LiquidityMining public liquidityMining;

    // ─── Events ───────────────────────────────────────────────────────────────
    event SharesPurchased(address indexed buyer, uint8 outcomeIndex, uint256 amount, uint256 shares);
    event MarketResolved(uint8 winningOutcome, uint256 totalPool);
    event RewardClaimed(address indexed claimer, uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────────
    error MarketExpired();
    error MarketNotExpired();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error InvalidOutcome();
    error InvalidAmount();
    error NoSharesToClaim();
    error AlreadyClaimed();
    error OracleNotResolved();
    error TransferFailed();

    constructor(
        bytes32 _marketId,
        string memory _question,
        string[] memory _outcomes,
        uint256 _expirationTime,
        address _oracle,
        address _feeCollector,
        uint256 _feeBps,
        address _owner
    ) Ownable(_owner) {
        require(_outcomes.length >= 2, "Min 2 outcomes");
        require(_outcomes.length <= MAX_OUTCOMES, "Max 10 outcomes");
        require(_expirationTime > block.timestamp, "Expiration in past");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        require(bytes(_question).length > 0, "Empty question");

        marketId = _marketId;
        question = _question;
        outcomes = _outcomes;
        expirationTime = _expirationTime;
        oracle = MultiOracle(_oracle);
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }

    // ─── Trading ──────────────────────────────────────────────────────────────
    function buyShares(uint8 outcomeIndex) external payable nonReentrant whenNotPaused returns (uint256 sharesReceived) {
        if (block.timestamp >= expirationTime) revert MarketExpired();
        if (resolved) revert MarketAlreadyResolved();
        if (outcomeIndex >= outcomes.length) revert InvalidOutcome();
        if (msg.value == 0) revert InvalidAmount();

        uint256 fee = (msg.value * feeBps) / BPS;
        sharesReceived = msg.value - fee;
        totalFeeCollected += fee;
        totalPool += sharesReceived;
        outcomePools[outcomeIndex] += sharesReceived;
        shares[msg.sender][outcomeIndex] += sharesReceived;

        // Send fee
        (bool ok,) = feeCollector.call{value: fee}("");
        if (!ok) revert TransferFailed();

        emit SharesPurchased(msg.sender, outcomeIndex, msg.value, sharesReceived);

        // PRED reward
        if (address(liquidityMining) != address(0)) {
            try liquidityMining.recordTrade(msg.sender) {} catch {}
        }
    }

    // ─── Resolution ───────────────────────────────────────────────────────────
    function resolve() external nonReentrant {
        if (resolved) revert MarketAlreadyResolved();
        if (block.timestamp < expirationTime) revert MarketNotExpired();
        if (!oracle.isResolved(marketId)) revert OracleNotResolved();

        uint8 _outcome = oracle.getWinningOutcome(marketId);
        winningOutcome = _outcome;
        resolved = true;
        resolutionTime = block.timestamp;

        emit MarketResolved(_outcome, totalPool);
    }

    // ─── Claim ────────────────────────────────────────────────────────────────
    function claimReward() external nonReentrant {
        if (!resolved) revert MarketNotResolved();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        uint256 payout;

        if (winningOutcome == INVALID_OUTCOME) {
            // Invalid: refund all shares proportionally
            uint256 userTotal;
            for (uint8 i = 0; i < outcomes.length; i++) {
                userTotal += shares[msg.sender][i];
            }
            if (userTotal == 0) revert NoSharesToClaim();
            payout = (userTotal * totalPool) / (totalPool + totalFeeCollected - totalFeeCollected);
            // Simplified: just return their shares value
            payout = userTotal;
        } else {
            uint256 userShares = shares[msg.sender][winningOutcome];
            if (userShares == 0) revert NoSharesToClaim();
            uint256 winningPool = outcomePools[winningOutcome];
            if (winningPool == 0) revert NoSharesToClaim();
            payout = (userShares * totalPool) / winningPool;
        }

        hasClaimed[msg.sender] = true;
        (bool ok,) = msg.sender.call{value: payout}("");
        if (!ok) revert TransferFailed();
        emit RewardClaimed(msg.sender, payout);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getOutcomes() external view returns (string[] memory) {
        return outcomes;
    }

    function getOutcomeCount() external view returns (uint256) {
        return outcomes.length;
    }

    function getOutcomePool(uint8 index) external view returns (uint256) {
        return outcomePools[index];
    }

    function getUserShares(address user, uint8 outcomeIndex) external view returns (uint256) {
        return shares[user][outcomeIndex];
    }

    function getAllOutcomePools() external view returns (uint256[] memory pools) {
        pools = new uint256[](outcomes.length);
        for (uint8 i = 0; i < outcomes.length; i++) {
            pools[i] = outcomePools[i];
        }
    }

    function getExpectedPayout(address user) external view returns (uint256) {
        if (!resolved || winningOutcome == INVALID_OUTCOME) return 0;
        uint256 userShares = shares[user][winningOutcome];
        if (userShares == 0) return 0;
        uint256 winningPool = outcomePools[winningOutcome];
        if (winningPool == 0) return 0;
        return (userShares * totalPool) / winningPool;
    }

    function getMarketInfo() external view returns (
        bytes32 _marketId,
        string memory _question,
        uint256 _expirationTime,
        bool _resolved,
        uint256 _totalPool
    ) {
        return (marketId, question, expirationTime, resolved, totalPool);
    }

    function getMarketStatus() external view returns (
        uint8 _winningOutcome,
        bool _paused,
        uint256 _outcomeCount
    ) {
        return (winningOutcome, paused(), outcomes.length);
    }

    function setLiquidityMining(address _lm) external onlyOwner {
        liquidityMining = LiquidityMining(_lm);
    }

    receive() external payable {}
}
