// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PREDToken.sol";
import "../src/LiquidityMining.sol";
import "../src/PREDStaking.sol";
import "../src/Governance.sol";
import "../src/PREDFaucet.sol";
import "../src/ReferralSystem.sol";

contract Phase3IntegrationTest is Test {
    PREDToken public pred;
    LiquidityMining public mining;
    PREDStaking public staking;
    Governance public gov;
    PREDFaucet public faucet;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);

    function setUp() public {
        vm.startPrank(owner);
        pred = new PREDToken(owner);
        mining = new LiquidityMining(address(pred), owner);
        pred.setMinter(address(mining));
        staking = new PREDStaking(address(pred), owner);
        gov = new Governance(address(staking), owner);
        faucet = new PREDFaucet(address(pred), owner);
        pred.approve(address(faucet), 10_000 * 1e18);
        faucet.deposit(10_000 * 1e18);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
        vm.stopPrank();
    }

    function _claimAndStake(address user, uint256 amount) internal {
        vm.prank(user);
        faucet.claim();
        vm.startPrank(user);
        pred.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();
    }

    function test_NewUserClaimsFaucet() public {
        vm.prank(user1);
        faucet.claim();
        assertEq(pred.balanceOf(user1), 100 * 1e18);
    }

    function test_UserStakesAfterFaucet() public {
        _claimAndStake(user1, 100 * 1e18);
        assertEq(staking.stakedBalance(user1), 100 * 1e18);
    }

    function test_UserCreatesProposalAfterStaking() public {
        _claimAndStake(user1, 100 * 1e18);
        vm.prank(user1);
        uint256 id = gov.propose("Reduce fees", "Reduce from 2% to 1%");
        assertEq(gov.proposalCount(), 1);
        assertEq(gov.getProposal(id).proposer, user1);
    }

    function test_MultipleUsersStake() public {
        _claimAndStake(user1, 100 * 1e18);
        _claimAndStake(user2, 100 * 1e18);
        _claimAndStake(user3, 100 * 1e18);
        assertEq(staking.totalStaked(), 300 * 1e18);
    }

    function test_MultipleUsersVote() public {
        _claimAndStake(user1, 100 * 1e18);
        _claimAndStake(user2, 100 * 1e18);
        _claimAndStake(user3, 100 * 1e18);
        vm.prank(user1);
        uint256 id = gov.propose("Add USDC markets", "Deploy USDC factory");
        vm.prank(user2);
        gov.vote(id, true);
        vm.prank(user3);
        gov.vote(id, false);
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.forVotes, 100 * 1e18);
        assertEq(p.againstVotes, 100 * 1e18);
    }

    function test_StakerEarnsFromProtocolFees() public {
        _claimAndStake(user1, 100 * 1e18);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        assertGt(staking.earned(user1), 0);
    }

    function test_StakerClaimsETHReward() public {
        _claimAndStake(user1, 100 * 1e18);
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        uint256 before = user1.balance;
        vm.prank(user1);
        staking.claimReward();
        assertGt(user1.balance, before);
    }

    function test_FaucetPreventsDoubleClaim() public {
        vm.prank(user1);
        faucet.claim();
        vm.prank(user1);
        vm.expectRevert();
        faucet.claim();
    }

    function test_UnstakeReturnsAllPRED() public {
        _claimAndStake(user1, 100 * 1e18);
        vm.prank(user1);
        staking.unstake(100 * 1e18);
        assertEq(pred.balanceOf(user1), 100 * 1e18);
    }

    function test_GovernanceRequiresActiveStake() public {
        vm.prank(user1);
        vm.expectRevert();
        gov.propose("Title", "Desc");
    }

    function test_TwoStakersShareRewardsEqually() public {
        _claimAndStake(user1, 100 * 1e18);
        _claimAndStake(user2, 100 * 1e18);
        vm.deal(owner, 2 ether);
        vm.prank(owner);
        staking.depositReward{value: 2 ether}();
        uint256 earned1 = staking.earned(user1);
        uint256 earned2 = staking.earned(user2);
        assertApproxEqAbs(earned1, earned2, 1e10);
    }

    function test_ProposalPassesWithMajority() public {
        // Give enough PRED to meet quorum (1000 PRED)
        vm.prank(owner);
        pred.transfer(user1, 500 * 1e18);
        vm.startPrank(user1);
        pred.approve(address(staking), 500 * 1e18);
        staking.stake(500 * 1e18);
        vm.stopPrank();
        vm.prank(owner);
        pred.transfer(user2, 800 * 1e18);
        vm.startPrank(user2);
        pred.approve(address(staking), 800 * 1e18);
        staking.stake(800 * 1e18);
        vm.stopPrank();
        vm.prank(user1);
        uint256 id = gov.propose("Title", "Desc");
        vm.prank(user2);
        gov.vote(id, true);
        uint256 endTime = gov.getProposal(id).endTime;
        vm.warp(endTime + 1);
        assertEq(uint256(gov.getProposalState(id)), 1); // Passed
    }

    function test_ProposalFailsWithMinority() public {
        _claimAndStake(user1, 100 * 1e18);
        vm.prank(owner);
        pred.transfer(user2, 200 * 1e18);
        vm.startPrank(user2);
        pred.approve(address(staking), 200 * 1e18);
        staking.stake(200 * 1e18);
        vm.stopPrank();
        vm.prank(user1);
        uint256 id = gov.propose("Title", "Desc");
        vm.prank(user1);
        gov.vote(id, true);
        vm.prank(user2);
        gov.vote(id, false);
        uint256 endTime = gov.getProposal(id).endTime;
        vm.warp(endTime + 1);
        assertEq(uint256(gov.getProposalState(id)), 2); // Failed
    }

    function test_OwnerCancelsProposal() public {
        _claimAndStake(user1, 100 * 1e18);
        vm.prank(user1);
        uint256 id = gov.propose("Title", "Desc");
        vm.prank(owner);
        gov.cancel(id);
        assertEq(uint256(gov.getProposalState(id)), 4); // Cancelled
    }

    function test_RewardPerTokenUpdatesOnDeposit() public {
        _claimAndStake(user1, 100 * 1e18);
        uint256 before = staking.rewardPerTokenStored();
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        assertGt(staking.rewardPerTokenStored(), before);
    }

    function test_FaucetBalanceDecreases() public {
        uint256 before = faucet.faucetBalance();
        vm.prank(user1);
        faucet.claim();
        assertEq(faucet.faucetBalance(), before - 100 * 1e18);
    }
}
