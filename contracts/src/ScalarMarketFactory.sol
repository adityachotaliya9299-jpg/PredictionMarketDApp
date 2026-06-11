// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MultiOutcomeMarket.sol";
import "./MultiOracle.sol";
import "./ChainlinkOracle.sol";
import "./LiquidityMining.sol";

/// @title ScalarMarketFactory - Creates price-range prediction markets using Chainlink
/// @author Aditya Chotaliya
/// @notice Scalar markets automatically resolve based on Chainlink price feed conditions
contract ScalarMarketFactory is Ownable {

    uint256 public constant MIN_EXPIRATION_PERIOD = 1 hours;
    uint256 public constant MAX_EXPIRATION_PERIOD = 365 days;

    MultiOracle public immutable oracle;
    ChainlinkOracle public immutable chainlinkOracle;
    address public feeCollector;
    uint256 public feeBps;
    LiquidityMining public liquidityMining;

    struct ScalarMarketData {
        address marketAddress;
        bytes32 marketId;
        address creator;
        string question;
        string[] ranges;
        address priceFeed;
        uint256 expirationTime;
        bool active;
    }

    ScalarMarketData[] private _markets;

    event ScalarMarketCreated(
        bytes32 indexed marketId,
        address indexed market,
        address indexed creator,
        string question,
        string[] ranges,
        address priceFeed
    );

    error InvalidQuestion();
    error InvalidExpiration();
    error InvalidRanges();

    constructor(
        address _oracle,
        address _chainlinkOracle,
        address _feeCollector,
        uint256 _feeBps,
        address _owner
    ) Ownable(_owner) {
        oracle = MultiOracle(_oracle);
        chainlinkOracle = ChainlinkOracle(_chainlinkOracle);
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }

    /// @notice Creates a scalar market with price ranges as outcomes
    /// @param question The market question (e.g. "What will ETH price be at expiry?")
    /// @param ranges Price range labels (e.g. ["< $2000", "$2000-$3000", "> $3000"])
    /// @param priceFeed Chainlink price feed address
    /// @param expirationTime When trading closes
    function createScalarMarket(
        string calldata question,
        string[] calldata ranges,
        address priceFeed,
        uint256 expirationTime
    ) external returns (address market, bytes32 marketId) {
        if (bytes(question).length == 0) revert InvalidQuestion();
        if (ranges.length < 2 || ranges.length > 10) revert InvalidRanges();
        if (expirationTime < block.timestamp + MIN_EXPIRATION_PERIOD ||
            expirationTime > block.timestamp + MAX_EXPIRATION_PERIOD) revert InvalidExpiration();

        marketId = keccak256(abi.encodePacked(question, msg.sender, block.timestamp));

        MultiOutcomeMarket m = new MultiOutcomeMarket(
            marketId, question, ranges, expirationTime,
            address(oracle), feeCollector, feeBps, address(this)
        );
        market = address(m);

        if (address(liquidityMining) != address(0)) {
            m.setLiquidityMining(address(liquidityMining));
            try liquidityMining.recordCreation(msg.sender) {} catch {}
        }

        _markets.push(ScalarMarketData({
            marketAddress: market,
            marketId: marketId,
            creator: msg.sender,
            question: question,
            ranges: ranges,
            priceFeed: priceFeed,
            expirationTime: expirationTime,
            active: true
        }));

        emit ScalarMarketCreated(marketId, market, msg.sender, question, ranges, priceFeed);
    }

    function getAllMarkets() external view returns (ScalarMarketData[] memory) {
        return _markets;
    }

    function getMarketCount() external view returns (uint256) {
        return _markets.length;
    }

    function setLiquidityMining(address _lm) external onlyOwner {
        liquidityMining = LiquidityMining(payable(_lm));
    }

    function setFeeCollector(address _fc) external onlyOwner {
        feeCollector = _fc;
    }
}
