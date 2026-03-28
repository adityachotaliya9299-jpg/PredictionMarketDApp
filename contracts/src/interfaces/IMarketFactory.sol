// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IMarketFactory - Interface for the prediction market factory
/// @author Aditya Chotaliya
interface IMarketFactory {
    // ─── Structs ──────────────────────────────────────────────────────────────

    struct MarketMetadata {
        bytes32 marketId;
        address marketAddress;
        string question;
        string category;
        address creator;
        uint256 createdAt;
        uint256 expirationTime;
        bool active;
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    event MarketCreated(
        bytes32 indexed marketId,
        address indexed market,
        address indexed creator,
        string question,
        uint256 expirationTime
    );
    event OracleUpdated(address oldOracle, address newOracle);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event FactoryPaused(bool paused);
    event MarketDeactivated(bytes32 indexed marketId);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error InvalidOracle();
    error InvalidQuestion();
    error InvalidExpiration();
    error FactoryPausedError();
    error MarketNotFound();
    error InvalidFee();
    error Unauthorized();

    // ─── Functions ────────────────────────────────────────────────────────────

    function createMarket(string calldata question, string calldata category, uint256 expirationTime)
        external
        returns (address market, bytes32 marketId);

    function getMarket(bytes32 marketId) external view returns (MarketMetadata memory);
    function getAllMarkets() external view returns (MarketMetadata[] memory);
    function getActiveMarkets() external view returns (MarketMetadata[] memory);
    function getMarketsByCreator(address creator) external view returns (MarketMetadata[] memory);
}
