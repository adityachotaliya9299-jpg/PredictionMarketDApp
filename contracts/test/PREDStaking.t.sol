// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PREDToken.sol";
import "../src/PREDStaking.sol";

contract PREDStakingTest is Test {
    PREDToken public pred;
    PREDStaking public staking;
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);

    uint256 constant STAKE_AMOUNT = 1000 * 1e18;
    uint256 constant MIN_STAKE = 1 * 1e18;

    function setUp() public {
        vm.startPrank(owner);
        pred = new PREDToken(owner);
        staking = new PREDStaking(address(pred), owner);
        // Distribute PRED
        pred.transfer(user1, 10_000 * 1e18);
        pred.transfer(user2, 10_000 * 1e18);
        pred.transfer(user3, 10_000 * 1e18);
        vm.stopPrank();
    }

    function _approveAndStake(address user, uint256 amount) internal {
        vm.startPrank(user);
        pred.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    function test_InitialTotalStaked() public view {
        assertEq(staking.totalStaked(), 0);
    }

    function test_PREDTokenSet() public view {
        assertEq(address(staking.predToken()), address(pred));
    }

    function test_MinStakeAmount() public view {
        assertEq(staking.MIN_STAKE_AMOUNT(), MIN_STAKE);
    }

    // ─── Staking ──────────────────────────────────────────────────────────────
    function test_Stake() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        assertEq(staking.stakedBalance(user1), STAKE_AMOUNT);
        assertEq(staking.totalStaked(), STAKE_AMOUNT);
    }

    function test_StakeTransfersPRED() public {
        uint256 before = pred.balanceOf(user1);
        _approveAndStake(user1, STAKE_AMOUNT);
        assertEq(pred.balanceOf(user1), before - STAKE_AMOUNT);
        assertEq(pred.balanceOf(address(staking)), STAKE_AMOUNT);
    }

    function test_MultipleUsersStake() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        _approveAndStake(user2, STAKE_AMOUNT * 2);
        assertEq(staking.totalStaked(), STAKE_AMOUNT * 3);
    }

    function test_RevertStakeBelowMinimum() public {
        vm.startPrank(user1);
        pred.approve(address(staking), 0.5 * 1e18);
        vm.expectRevert();
        staking.stake(0.5 * 1e18);
        vm.stopPrank();
    }

    function test_RevertStakeWithoutApproval() public {
        vm.prank(user1);
        vm.expectRevert();
        staking.stake(STAKE_AMOUNT);
    }

    // ─── Unstaking ────────────────────────────────────────────────────────────
    function test_Unstake() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.prank(user1);
        staking.unstake(STAKE_AMOUNT);
        assertEq(staking.stakedBalance(user1), 0);
        assertEq(staking.totalStaked(), 0);
    }

    function test_UnstakeReturnsPRED() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        uint256 before = pred.balanceOf(user1);
        vm.prank(user1);
        staking.unstake(STAKE_AMOUNT);
        assertEq(pred.balanceOf(user1), before + STAKE_AMOUNT);
    }

    function test_PartialUnstake() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.prank(user1);
        staking.unstake(STAKE_AMOUNT / 2);
        assertEq(staking.stakedBalance(user1), STAKE_AMOUNT / 2);
    }

    function test_RevertUnstakeMoreThanStaked() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.prank(user1);
        vm.expectRevert();
        staking.unstake(STAKE_AMOUNT + 1);
    }

    function test_RevertUnstakeNotStaked() public {
        vm.prank(user1);
        vm.expectRevert();
        staking.unstake(1);
    }

    // ─── Rewards ──────────────────────────────────────────────────────────────
    function test_DepositReward() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        assertGt(staking.earned(user1), 0);
    }

    function test_RewardProportionalToStake() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        _approveAndStake(user2, STAKE_AMOUNT * 3);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        uint256 earned1 = staking.earned(user1);
        uint256 earned2 = staking.earned(user2);
        assertApproxEqRel(earned2, earned1 * 3, 1e15); // within 0.1%
    }

    function test_ClaimReward() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        uint256 earned = staking.earned(user1);
        uint256 before = user1.balance;
        vm.prank(user1);
        staking.claimReward();
        assertEq(user1.balance, before + earned);
    }

    function test_RevertClaimNothingEarned() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.prank(user1);
        vm.expectRevert();
        staking.claimReward();
    }

    function test_RewardResetAfterClaim() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        vm.prank(user1);
        staking.claimReward();
        assertEq(staking.earned(user1), 0);
    }

    function test_NoRewardWhenNoStakers() public {
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        assertEq(staking.rewardPerTokenStored(), 0);
    }

    function test_GetStakeInfo() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        (uint256 staked, uint256 pending, uint256 share) = staking.getStakeInfo(user1);
        assertEq(staked, STAKE_AMOUNT);
        assertEq(pending, 0);
        assertEq(share, 10000); // 100% of pool = 10000 bps
    }

    function test_ShareCalculation() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        _approveAndStake(user2, STAKE_AMOUNT);
        (,, uint256 share1) = staking.getStakeInfo(user1);
        (,, uint256 share2) = staking.getStakeInfo(user2);
        assertEq(share1, 5000); // 50%
        assertEq(share2, 5000); // 50%
    }

    function test_ReceiveFunctionDepositsReward() public {
        _approveAndStake(user1, STAKE_AMOUNT);
        vm.deal(owner, 1 ether);
        (bool ok,) = address(staking).call{value: 1 ether}("");
        assertTrue(ok);
        assertGt(staking.earned(user1), 0);
    }

    function testFuzz_StakeAndUnstake(uint256 amount) public {
        amount = bound(amount, MIN_STAKE, 5000 * 1e18);
        vm.prank(owner);
        pred.transfer(address(this), amount);
        pred.approve(address(staking), amount);
        staking.stake(amount);
        assertEq(staking.stakedBalance(address(this)), amount);
        staking.unstake(amount);
        assertEq(staking.stakedBalance(address(this)), 0);
    }
}
