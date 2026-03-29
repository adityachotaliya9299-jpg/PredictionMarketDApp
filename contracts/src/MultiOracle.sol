// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MultiOracle - Oracle for multi-outcome prediction markets
/// @author Aditya Chotaliya
contract MultiOracle is Ownable {

    struct Resolution {
        bool resolved;
        uint8 winningOutcome; // index into outcomes array, 255 = INVALID
    }

    mapping(bytes32 => Resolution) public resolutions;
    mapping(address => bool) public authorizedResolvers;

    error AlreadyResolved();
    error NotAuthorized();
    error InvalidOutcomeIndex();

    event MarketResolved(bytes32 indexed marketId, uint8 winningOutcome);
    event ResolverUpdated(address indexed resolver, bool authorized);

    modifier onlyResolver() {
        if (!authorizedResolvers[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        authorizedResolvers[initialOwner] = true;
    }

    function setResolver(address resolver, bool authorized) external onlyOwner {
        authorizedResolvers[resolver] = authorized;
        emit ResolverUpdated(resolver, authorized);
    }

    function resolve(bytes32 marketId, uint8 winningOutcome) external onlyResolver {
        if (resolutions[marketId].resolved) revert AlreadyResolved();
        resolutions[marketId] = Resolution({ resolved: true, winningOutcome: winningOutcome });
        emit MarketResolved(marketId, winningOutcome);
    }

    function isResolved(bytes32 marketId) external view returns (bool) {
        return resolutions[marketId].resolved;
    }

    function getWinningOutcome(bytes32 marketId) external view returns (uint8) {
        return resolutions[marketId].winningOutcome;
    }
}
