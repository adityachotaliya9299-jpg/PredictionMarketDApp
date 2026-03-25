// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { BaseTest } from "./BaseTest.t.sol";
import { MockOracle } from "../src/mocks/MockOracle.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";

contract MockOracleTest is BaseTest {
    // ─────────────────────────────────────────────────────────────────────────
    // DEPLOYMENT
    // ─────────────────────────────────────────────────────────────────────────

    function test_deployment_ownerIsSet() public view {
        assertEq(oracle.owner(), owner);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SET RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────

    function test_setResolution_yes() public {
        bytes32 marketId = keccak256("market1");

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit MockOracle.ResolutionSet(marketId, IOracle.Outcome.YES);
        oracle.setResolution(marketId, IOracle.Outcome.YES);

        assertEq(uint256(oracle.getResolution(marketId)), uint256(IOracle.Outcome.YES));
        assertTrue(oracle.isResolved(marketId));
    }

    function test_setResolution_no() public {
        bytes32 marketId = keccak256("market2");

        vm.prank(owner);
        oracle.setResolution(marketId, IOracle.Outcome.NO);

        assertEq(uint256(oracle.getResolution(marketId)), uint256(IOracle.Outcome.NO));
    }

    function test_setResolution_invalid() public {
        bytes32 marketId = keccak256("market3");

        vm.prank(owner);
        oracle.setResolution(marketId, IOracle.Outcome.INVALID);

        assertEq(uint256(oracle.getResolution(marketId)), uint256(IOracle.Outcome.INVALID));
    }

    function test_setResolution_reverts_notOwner() public {
        bytes32 marketId = keccak256("market4");

        vm.prank(alice);
        vm.expectRevert();
        oracle.setResolution(marketId, IOracle.Outcome.YES);
    }

    function test_setResolution_reverts_alreadyResolved() public {
        bytes32 marketId = keccak256("market5");

        vm.prank(owner);
        oracle.setResolution(marketId, IOracle.Outcome.YES);

        vm.prank(owner);
        vm.expectRevert(MockOracle.AlreadyResolved.selector);
        oracle.setResolution(marketId, IOracle.Outcome.NO);
    }

    function test_setResolution_reverts_unresolved() public {
        bytes32 marketId = keccak256("market6");

        vm.prank(owner);
        vm.expectRevert(MockOracle.InvalidOutcome.selector);
        oracle.setResolution(marketId, IOracle.Outcome.UNRESOLVED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────

    function test_getResolution_unresolved_returnsUnresolved() public view {
        bytes32 marketId = keccak256("unknown");
        assertEq(uint256(oracle.getResolution(marketId)), uint256(IOracle.Outcome.UNRESOLVED));
    }

    function test_isResolved_unresolvedMarket_returnsFalse() public view {
        bytes32 marketId = keccak256("unknown");
        assertFalse(oracle.isResolved(marketId));
    }

    function test_multipleMarkets_resolveIndependently() public {
        bytes32 m1 = keccak256("m1");
        bytes32 m2 = keccak256("m2");

        vm.prank(owner);
        oracle.setResolution(m1, IOracle.Outcome.YES);

        assertTrue(oracle.isResolved(m1));
        assertFalse(oracle.isResolved(m2));
        assertEq(uint256(oracle.getResolution(m1)), uint256(IOracle.Outcome.YES));
        assertEq(uint256(oracle.getResolution(m2)), uint256(IOracle.Outcome.UNRESOLVED));
    }
}
