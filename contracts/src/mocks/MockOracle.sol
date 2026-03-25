// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IOracle } from "../interfaces/IOracle.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockOracle - A controllable oracle for testing and demo deployments
/// @notice In production, replace with Chainlink Functions or AnyAPI oracle
contract MockOracle is IOracle, Ownable {
    // ─── State ────────────────────────────────────────────────────────────────

    mapping(bytes32 => Outcome) private _resolutions;
    mapping(bytes32 => bool) private _resolved;

    // ─── Events ───────────────────────────────────────────────────────────────

    event ResolutionSet(bytes32 indexed marketId, Outcome outcome);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error AlreadyResolved();
    error InvalidOutcome();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address initialOwner) Ownable(initialOwner) { }

    // ─── External Functions ───────────────────────────────────────────────────

    /// @notice Set the resolution for a market (callable by owner/authorized resolvers)
    /// @param marketId The unique identifier of the market
    /// @param outcome The outcome to set (YES, NO, or INVALID)
    function setResolution(bytes32 marketId, Outcome outcome) external onlyOwner {
        if (_resolved[marketId]) revert AlreadyResolved();
        if (outcome == Outcome.UNRESOLVED) revert InvalidOutcome();

        _resolutions[marketId] = outcome;
        _resolved[marketId] = true;

        emit ResolutionSet(marketId, outcome);
    }

    /// @inheritdoc IOracle
    function getResolution(bytes32 marketId) external view override returns (Outcome outcome) {
        return _resolutions[marketId];
    }

    /// @inheritdoc IOracle
    function isResolved(bytes32 marketId) external view override returns (bool resolved) {
        return _resolved[marketId];
    }
}
