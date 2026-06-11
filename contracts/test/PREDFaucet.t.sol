// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PREDToken.sol";
import "../src/PREDFaucet.sol";

contract PREDFaucetTest is Test {
    PREDToken public pred;
    PREDFaucet public faucet;
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    uint256 constant FAUCET_DEPOSIT = 10_000 * 1e18;

    function setUp() public {
        vm.startPrank(owner);
        pred = new PREDToken(owner);
        faucet = new PREDFaucet(address(pred), owner);
        pred.approve(address(faucet), FAUCET_DEPOSIT);
        faucet.deposit(FAUCET_DEPOSIT);
        vm.stopPrank();
    }

    function test_FaucetBalance() public view {
        assertEq(faucet.faucetBalance(), FAUCET_DEPOSIT);
    }

    function test_ClaimAmount() public view {
        assertEq(faucet.claimAmount(), 100 * 1e18);
    }

    function test_Claim() public {
        vm.prank(user1);
        faucet.claim();
        assertEq(pred.balanceOf(user1), 100 * 1e18);
    }

    function test_ClaimReducesFaucetBalance() public {
        vm.prank(user1);
        faucet.claim();
        assertEq(faucet.faucetBalance(), FAUCET_DEPOSIT - 100 * 1e18);
    }

    function test_HasClaimedAfterClaim() public {
        vm.prank(user1);
        faucet.claim();
        assertTrue(faucet.hasClaimed(user1));
    }

    function test_NotClaimedBeforeClaim() public view {
        assertFalse(faucet.hasClaimed(user1));
    }

    function test_RevertDoubleCliam() public {
        vm.prank(user1);
        faucet.claim();
        vm.prank(user1);
        vm.expectRevert();
        faucet.claim();
    }

    function test_DifferentUsersCanClaim() public {
        vm.prank(user1);
        faucet.claim();
        vm.prank(user2);
        faucet.claim();
        assertEq(pred.balanceOf(user1), 100 * 1e18);
        assertEq(pred.balanceOf(user2), 100 * 1e18);
    }

    function test_SetClaimAmount() public {
        vm.prank(owner);
        faucet.setClaimAmount(200 * 1e18);
        assertEq(faucet.claimAmount(), 200 * 1e18);
    }

    function test_RevertSetClaimAmountNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        faucet.setClaimAmount(200 * 1e18);
    }

    function test_RevertClaimWhenEmpty() public {
        vm.prank(owner);
        faucet.setClaimAmount(FAUCET_DEPOSIT + 1);
        vm.prank(user1);
        vm.expectRevert();
        faucet.claim();
    }

    function test_OwnerCanDeposit() public {
        vm.startPrank(owner);
        pred.approve(address(faucet), 1000 * 1e18);
        faucet.deposit(1000 * 1e18);
        vm.stopPrank();
        assertEq(faucet.faucetBalance(), FAUCET_DEPOSIT + 1000 * 1e18);
    }
}
