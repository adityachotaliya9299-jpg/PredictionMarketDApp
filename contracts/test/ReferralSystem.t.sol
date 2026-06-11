// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReferralSystem.sol";

contract ReferralSystemTest is Test {
    ReferralSystem public referral;
    address public owner = address(1);
    address public caller = address(2);
    address public user1 = address(3);
    address public user2 = address(4);
    address public referrer = address(5);

    function setUp() public {
        vm.prank(owner);
        referral = new ReferralSystem(owner);
        vm.prank(owner);
        referral.setAuthorizedCaller(caller, true);
        vm.deal(caller, 100 ether);
    }

    function test_DefaultFee() public view {
        assertEq(referral.referralFeeBps(), 50);
    }

    function test_SetAuthorizedCaller() public {
        vm.prank(owner);
        referral.setAuthorizedCaller(address(99), true);
        assertTrue(referral.authorizedCallers(address(99)));
    }

    function test_RegisterReferral() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        assertEq(referral.referrerOf(user1), referrer);
    }

    function test_ReferralCountIncremented() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        (,uint256 count,,) = referral.getReferralStats(referrer);
        assertEq(count, 1);
    }

    function test_RevertDoubleRegister() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        vm.prank(caller);
        vm.expectRevert();
        referral.registerReferral(user1, referrer);
    }

    function test_RevertSelfReferral() public {
        vm.prank(caller);
        vm.expectRevert();
        referral.registerReferral(user1, user1);
    }

    function test_RevertRegisterUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert();
        referral.registerReferral(user2, referrer);
    }

    function test_RecordTrade() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        uint256 tradeAmount = 1 ether;
        uint256 fee = (tradeAmount * 50) / 10000;
        vm.prank(caller);
        referral.recordTrade{value: fee}(user1, tradeAmount);
        (,,uint256 pending,) = referral.getReferralStats(referrer);
        assertEq(pending, fee);
    }

    function test_NoEarningsWithoutReferral() public {
        vm.prank(caller);
        referral.recordTrade{value: 0}(user1, 1 ether);
        (,,uint256 pending,) = referral.getReferralStats(referrer);
        assertEq(pending, 0);
    }

    function test_ClaimEarnings() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        uint256 tradeAmount = 1 ether;
        uint256 fee = (tradeAmount * 50) / 10000;
        vm.prank(caller);
        referral.recordTrade{value: fee}(user1, tradeAmount);
        uint256 before = referrer.balance;
        vm.prank(referrer);
        referral.claimEarnings();
        assertEq(referrer.balance, before + fee);
    }

    function test_RevertClaimNothingEarned() public {
        vm.prank(referrer);
        vm.expectRevert();
        referral.claimEarnings();
    }

    function test_SetReferralFee() public {
        vm.prank(owner);
        referral.setReferralFee(100);
        assertEq(referral.referralFeeBps(), 100);
    }

    function test_RevertSetFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert();
        referral.setReferralFee(600);
    }

    function test_GetReferralStats() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        (address ref, uint256 count, uint256 pending, uint256 total) = referral.getReferralStats(referrer);
        assertEq(count, 1);
        assertEq(pending, 0);
        assertEq(total, 0);
        assertEq(ref, address(0)); // referrer has no referrer
    }

    function test_MultipleReferrals() public {
        vm.startPrank(caller);
        referral.registerReferral(user1, referrer);
        referral.registerReferral(user2, referrer);
        vm.stopPrank();
        (,uint256 count,,) = referral.getReferralStats(referrer);
        assertEq(count, 2);
    }

    function test_TotalEarningsTracked() public {
        vm.prank(caller);
        referral.registerReferral(user1, referrer);
        uint256 fee = 0.005 ether;
        vm.prank(caller);
        referral.recordTrade{value: fee}(user1, 1 ether);
        vm.prank(referrer);
        referral.claimEarnings();
        (,,,uint256 total) = referral.getReferralStats(referrer);
        assertEq(total, fee);
    }

    receive() external payable {}
}
