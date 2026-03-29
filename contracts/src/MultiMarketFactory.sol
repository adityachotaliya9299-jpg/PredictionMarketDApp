// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./MultiOutcomeMarket.sol";
import "./MultiOracle.sol";
import "./LiquidityMining.sol";

/// @title MultiMarketFactory - Deploys and tracks MultiOutcomeMarket instances
/// @author Aditya Chotaliya
contract MultiMarketFactory is Ownable, Pausable {

    uint256 public constant MIN_EXPIRATION_PERIOD = 1 hours;
    uint256 public constant MAX_EXPIRATION_PERIOD = 365 days;
    uint256 public constant MAX_FEE_BPS = 500;

    MultiOracle public oracle;
    address public feeCollector;
    uint256 public feeBps;
    LiquidityMining public liquidityMining;

    struct MarketData {
        address marketAddress;
        address creator;
        string question;
        string[] outcomes;
        uint256 expirationTime;
        bool active;
    }

    mapping(bytes32 => MarketData) private _markets;
    bytes32[] private _marketIds;
    mapping(address => bytes32[]) private _creatorMarkets;

    event MultiMarketCreated(
        bytes32 indexed marketId,
        address indexed market,
        address indexed creator,
        string question,
        string[] outcomes,
        uint256 expirationTime
    );

    error InvalidQuestion();
    error InvalidExpiration();
    error InvalidOutcomes();
    error InvalidFee();

    constructor(
        address _oracle,
        address _feeCollector,
        uint256 _feeBps,
        address _owner
    ) Ownable(_owner) {
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        oracle = MultiOracle(_oracle);
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }

    function createMarket(
        string calldata question,
        string[] calldata outcomes,
        uint256 expirationTime
    ) external whenNotPaused returns (address market, bytes32 marketId) {
        if (bytes(question).length == 0) revert InvalidQuestion();
        if (outcomes.length < 2 || outcomes.length > 10) revert InvalidOutcomes();
        if (expirationTime < block.timestamp + MIN_EXPIRATION_PERIOD ||
            expirationTime > block.timestamp + MAX_EXPIRATION_PERIOD) revert InvalidExpiration();

        marketId = keccak256(abi.encodePacked(question, msg.sender, block.timestamp));

        MultiOutcomeMarket m = new MultiOutcomeMarket(
            marketId, question, outcomes, expirationTime,
            address(oracle), feeCollector, feeBps, address(this)
        );
        market = address(m);

        // Wire LiquidityMining
        if (address(liquidityMining) != address(0)) {
            m.setLiquidityMining(address(liquidityMining));
            try liquidityMining.recordCreation(msg.sender) {} catch {}
        }

        // Authorize creator to resolve via oracle
        // oracle.setResolver(msg.sender, true); // optional

        _markets[marketId] = MarketData({
            marketAddress: market,
            creator: msg.sender,
            question: question,
            outcomes: outcomes,
            expirationTime: expirationTime,
            active: true
        });
        _marketIds.push(marketId);
        _creatorMarkets[msg.sender].push(marketId);

        emit MultiMarketCreated(marketId, market, msg.sender, question, outcomes, expirationTime);
    }

    function setLiquidityMining(address _lm) external onlyOwner {
        liquidityMining = LiquidityMining(_lm);
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert InvalidFee();
        feeBps = _feeBps;
    }

    function getAllMarkets() external view returns (MarketData[] memory) {
        MarketData[] memory result = new MarketData[](_marketIds.length);
        for (uint256 i = 0; i < _marketIds.length; i++) {
            result[i] = _markets[_marketIds[i]];
        }
        return result;
    }

    function getMarketCount() external view returns (uint256) {
        return _marketIds.length;
    }

    function getMarketsByCreator(address creator) external view returns (MarketData[] memory) {
        bytes32[] memory ids = _creatorMarkets[creator];
        MarketData[] memory result = new MarketData[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _markets[ids[i]];
        }
        return result;
    }
}
