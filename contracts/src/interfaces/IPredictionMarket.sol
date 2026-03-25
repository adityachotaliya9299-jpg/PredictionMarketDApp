// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IOracle } from "./IOracle.sol";

/// @title IPredictionMarket - Interface for a single prediction market pool
interface IPredictionMarket {
    // ─── Structs ──────────────────────────────────────────────────────────────

    struct MarketInfo {
        bytes32 marketId;
        string question;
        uint256 expirationTime;
        uint256 resolutionTime;
        IOracle.Outcome outcome;
        bool paused;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 totalPool;
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    event SharesPurchased(address indexed buyer, bool isYes, uint256 amount, uint256 shares);
    event MarketResolved(IOracle.Outcome outcome, uint256 totalPool);
    event RewardClaimed(address indexed claimer, uint256 amount);
    event MarketPaused(bool paused);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error MarketExpired();
    error MarketNotExpired();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error MarketPausedError();
    error InvalidAmount();
    error NoSharesToClaim();
    error AlreadyClaimed();
    error OracleNotResolved();
    error InvalidOutcome();
    error TransferFailed();

    // ─── Functions ────────────────────────────────────────────────────────────

    function buyYesShares() external payable returns (uint256 shares);
    function buyNoShares() external payable returns (uint256 shares);
    function resolveMarket() external;
    function claimReward() external returns (uint256 reward);
    function getMarketInfo() external view returns (MarketInfo memory);
    function getUserShares(address user) external view returns (uint256 yesShares, uint256 noShares);
    function calculateProbability() external view returns (uint256 yesProbability, uint256 noProbability);
    function getExpectedPayout(address user) external view returns (uint256);
}
