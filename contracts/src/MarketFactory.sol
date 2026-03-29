// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { PredictionMarket } from "./PredictionMarket.sol";
import { IMarketFactory } from "./interfaces/IMarketFactory.sol";
import { IOracle } from "./interfaces/IOracle.sol";
import { LiquidityMining } from "./LiquidityMining.sol";
import { ReferralSystem } from "./ReferralSystem.sol";

/// @title MarketFactory
/// @author Aditya Chotaliya
/// @notice Factory contract that deploys and tracks PredictionMarket instances.
///         Manages global oracle, fees, and access control.
contract MarketFactory is IMarketFactory, Ownable, Pausable {
    // ─── Phase 3 Integrations ─────────────────────────────────────────────────
    LiquidityMining public liquidityMining;
    address public referralSystem;

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant MAX_FEE_BPS = 500; // 5%
    uint256 public constant MIN_EXPIRATION_PERIOD = 1 hours;
    uint256 public constant MAX_EXPIRATION_PERIOD = 365 days;

    // ─── State ────────────────────────────────────────────────────────────────

    address public oracle;
    address public feeCollector;
    uint256 public feeBps;

    bytes32[] public marketIds;
    mapping(bytes32 => MarketMetadata) private _markets;
    mapping(address => bytes32[]) private _creatorMarkets;

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _oracle, address _feeCollector, uint256 _feeBps, address _owner) Ownable(_owner) {
        if (_oracle == address(0)) revert InvalidOracle();
        if (_feeCollector == address(0)) revert InvalidOracle();
        if (_feeBps > MAX_FEE_BPS) revert InvalidFee();

        oracle = _oracle;
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }

    // ─── External: Market Creation ────────────────────────────────────────────

    /// @inheritdoc IMarketFactory
    function createMarket(string calldata question, string calldata category, uint256 expirationTime)
        external
        override
        whenNotPaused
        returns (address market, bytes32 marketId)
    {
        if (bytes(question).length == 0) revert InvalidQuestion();
        if (
            expirationTime < block.timestamp + MIN_EXPIRATION_PERIOD
                || expirationTime > block.timestamp + MAX_EXPIRATION_PERIOD
        ) revert InvalidExpiration();

        // Deterministic marketId from question + creator + timestamp
        marketId = keccak256(abi.encodePacked(question, msg.sender, block.timestamp));

        // Deploy new PredictionMarket — factory itself is the market owner so it can pause/unpause
        PredictionMarket newMarket = new PredictionMarket(
            marketId,
            question,
            expirationTime,
            oracle,
            feeCollector,
            feeBps,
            address(this) 
        );
        market = address(newMarket);

        MarketMetadata memory meta = MarketMetadata({
            marketId: marketId,
            marketAddress: market,
            question: question,
            category: category,
            creator: msg.sender,
            createdAt: block.timestamp,
            expirationTime: expirationTime,
            active: true
        });

        _markets[marketId] = meta;
        marketIds.push(marketId);
        _creatorMarkets[msg.sender].push(marketId);

        emit MarketCreated(marketId, market, msg.sender, question, expirationTime);

        // Phase 3: Record creator reward
        if (address(liquidityMining) != address(0)) {
            try liquidityMining.recordCreation(msg.sender) {} catch {}
        }
    }

    // ─── External: Admin ──────────────────────────────────────────────────────

    /// @notice Update the oracle address for future markets
    function setOracle(address newOracle) external onlyOwner {
        if (newOracle == address(0)) revert InvalidOracle();
        emit OracleUpdated(oracle, newOracle);
        oracle = newOracle;
    }

    /// @notice Update the protocol fee
    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        emit ProtocolFeeUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }

    /// @notice Update the fee collector
    function setFeeCollector(address newCollector) external onlyOwner {
        if (newCollector == address(0)) revert InvalidOracle();
        emit FeeCollectorUpdated(feeCollector, newCollector);
        feeCollector = newCollector;
    }

    /// @notice Pause all new market creation
    function pause() external onlyOwner {
        _pause();
        emit FactoryPaused(true);
    }

    /// @notice Unpause market creation
    function unpause() external onlyOwner {
        _unpause();
        emit FactoryPaused(false);
    }

    /// @notice Deactivate a market (admin only, doesn't affect existing bets)
    function setLiquidityMining(address _liquidityMining) external onlyOwner {
        liquidityMining = LiquidityMining(_liquidityMining);
    }

    function setReferralSystem(address _referralSystem) external onlyOwner {
        referralSystem = _referralSystem;
    }

    function deactivateMarket(bytes32 marketId) external onlyOwner {
        if (_markets[marketId].marketAddress == address(0)) revert MarketNotFound();
        _markets[marketId].active = false;
        emit MarketDeactivated(marketId);
    }

    /// @notice Pause an individual market in emergency
    function pauseMarket(bytes32 marketId) external onlyOwner {
        if (_markets[marketId].marketAddress == address(0)) revert MarketNotFound();
        PredictionMarket(payable(_markets[marketId].marketAddress)).pause();
    }

    /// @notice Unpause an individual market
    function unpauseMarket(bytes32 marketId) external onlyOwner {
        if (_markets[marketId].marketAddress == address(0)) revert MarketNotFound();
        PredictionMarket(payable(_markets[marketId].marketAddress)).unpause();
    }

    // ─── External: Views ──────────────────────────────────────────────────────

    /// @inheritdoc IMarketFactory
    function getMarket(bytes32 marketId) external view override returns (MarketMetadata memory) {
        if (_markets[marketId].marketAddress == address(0)) revert MarketNotFound();
        return _markets[marketId];
    }

    /// @inheritdoc IMarketFactory
    function getAllMarkets() external view override returns (MarketMetadata[] memory) {
        uint256 count = marketIds.length;
        MarketMetadata[] memory all = new MarketMetadata[](count);
        for (uint256 i = 0; i < count; i++) {
            all[i] = _markets[marketIds[i]];
        }
        return all;
    }

    /// @inheritdoc IMarketFactory
    function getActiveMarkets() external view override returns (MarketMetadata[] memory) {
        uint256 count = marketIds.length;
        uint256 activeCount = 0;
        for (uint256 i = 0; i < count; i++) {
            if (_markets[marketIds[i]].active) activeCount++;
        }

        MarketMetadata[] memory active = new MarketMetadata[](activeCount);
        uint256 j = 0;
        for (uint256 i = 0; i < count; i++) {
            if (_markets[marketIds[i]].active) {
                active[j] = _markets[marketIds[i]];
                j++;
            }
        }
        return active;
    }

    /// @inheritdoc IMarketFactory
    function getMarketsByCreator(address creator) external view override returns (MarketMetadata[] memory) {
        bytes32[] memory ids = _creatorMarkets[creator];
        MarketMetadata[] memory result = new MarketMetadata[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _markets[ids[i]];
        }
        return result;
    }

    /// @notice Get total number of markets
    function getMarketCount() external view returns (uint256) {
        return marketIds.length;
    }
}
