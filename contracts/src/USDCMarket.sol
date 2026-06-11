// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LiquidityMining.sol";
import "./interfaces/IOracle.sol";

/// @title USDCMarket - Parimutuel prediction market using USDC instead of ETH
/// @author Aditya Chotaliya
contract USDCMarket is ReentrancyGuard, Pausable, Ownable {

    uint256 public constant MAX_FEE_BPS = 500;
    uint256 public constant BPS = 10_000;

    IERC20 public immutable usdc;
    bytes32 public immutable marketId;
    string public question;
    string public category;
    uint256 public immutable expirationTime;
    IOracle public immutable oracle;
    address public immutable feeCollector;
    uint256 public immutable feeBps;

    IOracle.Outcome public outcome;
    uint256 public resolutionTime;
    bool public resolved;

    uint256 public totalYesShares;
    uint256 public totalNoShares;
    uint256 public totalPool;
    uint256 public totalFeeCollected;

    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;
    mapping(address => bool) public hasClaimed;

    LiquidityMining public liquidityMining;

    event SharesPurchased(address indexed buyer, bool isYes, uint256 amount, uint256 shares);
    event MarketResolved(IOracle.Outcome outcome, uint256 totalPool);
    event RewardClaimed(address indexed claimer, uint256 amount);

    error MarketExpired();
    error MarketNotExpired();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error InvalidAmount();
    error NoSharesToClaim();
    error AlreadyClaimed();
    error OracleNotResolved();
    error TransferFailed();

    constructor(
        bytes32 _marketId,
        string memory _question,
        string memory _category,
        uint256 _expirationTime,
        address _oracle,
        address _feeCollector,
        uint256 _feeBps,
        address _usdc,
        address _owner
    ) Ownable(_owner) {
        require(_expirationTime > block.timestamp, "Expiration in past");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        require(bytes(_question).length > 0, "Empty question");

        marketId = _marketId;
        question = _question;
        category = _category;
        expirationTime = _expirationTime;
        oracle = IOracle(_oracle);
        feeCollector = _feeCollector;
        feeBps = _feeBps;
        usdc = IERC20(_usdc);
    }

    function _processShares(bool isYes, uint256 amount) internal returns (uint256 shares) {
        if (block.timestamp >= expirationTime) revert MarketExpired();
        if (resolved) revert MarketAlreadyResolved();
        if (amount == 0) revert InvalidAmount();

        uint256 fee = (amount * feeBps) / BPS;
        shares = amount - fee;
        totalFeeCollected += fee;
        totalPool += shares;

        if (isYes) totalYesShares += shares;
        else totalNoShares += shares;

        usdc.transferFrom(msg.sender, feeCollector, fee);
    }

    function buyYesShares(uint256 amount) external nonReentrant whenNotPaused returns (uint256 shares) {
        shares = _processShares(true, amount);
        usdc.transferFrom(msg.sender, address(this), shares);
        yesShares[msg.sender] += shares;
        emit SharesPurchased(msg.sender, true, amount, shares);
        if (address(liquidityMining) != address(0)) {
            try liquidityMining.recordTrade(msg.sender) {} catch {}
        }
    }

    function buyNoShares(uint256 amount) external nonReentrant whenNotPaused returns (uint256 shares) {
        shares = _processShares(false, amount);
        usdc.transferFrom(msg.sender, address(this), shares);
        noShares[msg.sender] += shares;
        emit SharesPurchased(msg.sender, false, amount, shares);
        if (address(liquidityMining) != address(0)) {
            try liquidityMining.recordTrade(msg.sender) {} catch {}
        }
    }

    function resolve() external nonReentrant {
        if (resolved) revert MarketAlreadyResolved();
        if (block.timestamp < expirationTime) revert MarketNotExpired();
        if (!oracle.isResolved(marketId)) revert OracleNotResolved();
        IOracle.Outcome _outcome = oracle.getResolution(marketId);
        outcome = _outcome;
        resolved = true;
        resolutionTime = block.timestamp;
        emit MarketResolved(_outcome, totalPool);
    }

    function claimReward() external nonReentrant {
        if (!resolved) revert MarketNotResolved();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        uint256 payout;
        if (outcome == IOracle.Outcome.YES) {
            uint256 userShares = yesShares[msg.sender];
            if (userShares == 0) revert NoSharesToClaim();
            payout = (userShares * totalPool) / totalYesShares;
        } else if (outcome == IOracle.Outcome.NO) {
            uint256 userShares = noShares[msg.sender];
            if (userShares == 0) revert NoSharesToClaim();
            payout = (userShares * totalPool) / totalNoShares;
        } else {
            uint256 total = yesShares[msg.sender] + noShares[msg.sender];
            if (total == 0) revert NoSharesToClaim();
            payout = total;
        }

        hasClaimed[msg.sender] = true;
        require(usdc.transfer(msg.sender, payout), "Transfer failed");
        emit RewardClaimed(msg.sender, payout);
    }

    function getMarketInfo() external view returns (
        bytes32 _marketId, string memory _question, string memory _category,
        uint256 _expirationTime, bool _resolved, uint256 _totalPool
    ) {
        return (marketId, question, category, expirationTime, resolved, totalPool);
    }

    function setLiquidityMining(address _lm) external onlyOwner {
        liquidityMining = LiquidityMining(_lm);
    }
}
