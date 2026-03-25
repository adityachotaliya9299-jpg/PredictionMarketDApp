// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console2 } from "forge-std/Test.sol";
import { MarketFactory } from "../src/MarketFactory.sol";
import { PredictionMarket } from "../src/PredictionMarket.sol";
import { MockOracle } from "../src/mocks/MockOracle.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";
import { IPredictionMarket } from "../src/interfaces/IPredictionMarket.sol";
import { IMarketFactory } from "../src/interfaces/IMarketFactory.sol";

contract BaseTest is Test {
    // ─── Actors ───────────────────────────────────────────────────────────────
    address internal owner = makeAddr("owner");
    address internal feeCollector = makeAddr("feeCollector");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");
    address internal dave = makeAddr("dave");

    // ─── Contracts ────────────────────────────────────────────────────────────
    MockOracle internal oracle;
    MarketFactory internal factory;

    // ─── Constants ────────────────────────────────────────────────────────────
    uint256 internal constant FEE_BPS = 200; // 2%
    uint256 internal constant EXPIRATION_OFFSET = 7 days;

    function setUp() public virtual {
        vm.startPrank(owner);
        oracle = new MockOracle(owner);
        factory = new MarketFactory(address(oracle), feeCollector, FEE_BPS, owner);
        vm.stopPrank();

        // Fund actors
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(dave, 100 ether);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function _createMarket(string memory question) internal returns (address marketAddr, bytes32 marketId) {
        vm.prank(alice);
        (marketAddr, marketId) = factory.createMarket(question, "General", block.timestamp + EXPIRATION_OFFSET);
    }

    function _createMarketWithExpiry(string memory question, uint256 expiry)
        internal
        returns (address marketAddr, bytes32 marketId)
    {
        vm.prank(alice);
        (marketAddr, marketId) = factory.createMarket(question, "General", expiry);
    }

    function _resolveOracle(bytes32 marketId, IOracle.Outcome outcome) internal {
        vm.prank(owner);
        oracle.setResolution(marketId, outcome);
    }

    function _skipToExpiry() internal {
        skip(EXPIRATION_OFFSET + 1);
    }
}
