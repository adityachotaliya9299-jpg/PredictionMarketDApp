// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IOracle - Interface for prediction market oracle resolution
interface IOracle {
    enum Outcome {
        UNRESOLVED,
        YES,
        NO,
        INVALID
    }

    /// @notice Get the resolution outcome for a given market
    /// @param marketId The unique identifier of the market
    /// @return outcome The resolved outcome
    function getResolution(bytes32 marketId) external view returns (Outcome outcome);

    /// @notice Check if a market has been resolved
    /// @param marketId The unique identifier of the market
    /// @return resolved True if the market has been resolved
    function isResolved(bytes32 marketId) external view returns (bool resolved);
}
