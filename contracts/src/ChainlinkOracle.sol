// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOracle.sol";

interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId, int256 answer, uint256 startedAt,
        uint256 updatedAt, uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

/// @title ChainlinkOracle - Auto-resolves markets using Chainlink price feeds
contract ChainlinkOracle is IOracle, Ownable {
    struct MarketConfig {
        address priceFeed;      // Chainlink price feed address
        int256  targetPrice;    // Target price (in feed decimals)
        bool    resolveIfAbove; // true = YES if price > target, false = YES if price < target
        bool    configured;
        IOracle.Outcome outcome;
        bool    resolved;
    }

    mapping(bytes32 => MarketConfig) public markets;
    mapping(address => bool) public authorizedCallers;

    // Sepolia Chainlink price feeds
    address public constant ETH_USD_FEED  = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    address public constant BTC_USD_FEED  = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43;
    address public constant LINK_USD_FEED = 0xc59E3633BAAC79493d908e63626716e204A45EdF;

    error NotConfigured();
    error AlreadyResolved();
    error NotAuthorized();

    event MarketConfigured(bytes32 indexed marketId, address priceFeed, int256 targetPrice);
    event MarketAutoResolved(bytes32 indexed marketId, IOracle.Outcome outcome, int256 currentPrice);

    modifier onlyAuthorized() {
        if (!authorizedCallers[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }

    function configureMarket(
        bytes32 marketId,
        address priceFeed,
        int256 targetPrice,
        bool resolveIfAbove
    ) external onlyAuthorized {
        markets[marketId] = MarketConfig({
            priceFeed: priceFeed,
            targetPrice: targetPrice,
            resolveIfAbove: resolveIfAbove,
            configured: true,
            outcome: IOracle.Outcome.UNRESOLVED,
            resolved: false
        });
        emit MarketConfigured(marketId, priceFeed, targetPrice);
    }

    /// @notice Anyone can trigger resolution if conditions are met
    function tryResolve(bytes32 marketId) external {
        MarketConfig storage config = markets[marketId];
        if (!config.configured) revert NotConfigured();
        if (config.resolved) revert AlreadyResolved();

        int256 currentPrice = getLatestPrice(config.priceFeed);
        bool conditionMet = config.resolveIfAbove
            ? currentPrice >= config.targetPrice
            : currentPrice <= config.targetPrice;

        if (conditionMet) {
            config.outcome = IOracle.Outcome.YES;
            config.resolved = true;
            emit MarketAutoResolved(marketId, IOracle.Outcome.YES, currentPrice);
        }
    }

    /// @notice Manual override for admin (for markets without price conditions)
    function manualResolve(bytes32 marketId, IOracle.Outcome outcome) external onlyOwner {
        MarketConfig storage config = markets[marketId];
        if (!config.configured) {
            // Auto-configure with empty feed for manual markets
            config.configured = true;
        }
        if (config.resolved) revert AlreadyResolved();
        config.outcome = outcome;
        config.resolved = true;
    }

    function getLatestPrice(address feed) public view returns (int256) {
        (, int256 price,,,) = AggregatorV3Interface(feed).latestRoundData();
        return price;
    }

    // IOracle interface implementations
    function isResolved(bytes32 marketId) external view override returns (bool) {
        return markets[marketId].resolved;
    }

    function getOutcome(bytes32 marketId) external view returns (IOracle.Outcome) {
        return markets[marketId].outcome;
    }

    function getResolution(bytes32 marketId) external view override returns (IOracle.Outcome outcome) {
        return markets[marketId].outcome;
    }
}
