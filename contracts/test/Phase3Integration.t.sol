// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PREDToken.sol";
import "../src/LiquidityMining.sol";
import "../src/PREDStaking.sol";
import "../src/Governance.sol";
import "../src/PREDFaucet.sol";
import "../src/ReferralSystem.sol";
import "../src/MarketFactory.sol";
import "../src/mocks/MockOracle.sol";

contract Phase3IntegrationTest is Test {
    PREDToken public pred;
    LiquidityMining public mining;
    PREDStaking public staking;
    Governance public gov;
    PREDFaucet public faucet;
    ReferralSystem public referral;
    MarketFactory public factory;
    MockOracle public oracle;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);
    address public feeCollector = address(5);

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
        referral = new ReferralSystem(owner);
        oracle = new MockOracle(owner);
        factory = new MarketFactory(address(oracle), feeCollector, 200, owner);
        mining.setAuthorizedCaller(address(factory), true);
        referral.setAuthorizedCaller(address(factory), true);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
        vm.stopPrank();
    }

    // ─── Full User Journey ────────────────────────────────────────────────────
    function test_NewUserClaimsFaucet() public {
        vm.prank(user1);
        faucet.claim();
        assertEq(pred.balanceOf(user1), 100 * 1e18);
    }

    function test_UserStakesAfterFaucet() public {
        vm.prank(user1);
        faucet.claim();
        vm.startPrank(user1);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        vm.stopPrank();
        assertEq(staking.stakedBalance(user1), 100 * 1e18);
    }

    function test_UserCreatesProposalAfterStaking() public {
        vm.prank(user1);
        faucet.claim();
        vm.startPrank(user1);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        uint256 id = gov.propose("Reduce fees", "Reduce from 2% to 1%");
        vm.stopPrank();
        assertEq(gov.proposalCount(), 1);
        assertEq(gov.getProposal(id).proposer, user1);
    }

    function test_MultipleUsersVote() public {
        // Setup: all stake
        for (address u : [user1, user2, user3]) {
            vm.prank(u);
            faucet.claim();
            vm.startPrank(u);
            pred.approve(address(staking), 100 * 1e18);
            staking.stake(100 * 1e18);
            vm.stopPrank();
        }
        // User1 proposes
        vm.prank(user1);
        uint256 id = gov.propose("Add USDC markets", "Deploy USDC factory");
        // User2 votes for, User3 against
        vm.prank(user2);
        gov.vote(id, true);
        vm.prank(user3);
        gov.vote(id, false);
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.forVotes, 100 * 1e18);
        assertEq(p.againstVotes, 100 * 1e18);
    }

    function test_StakerEarnsFromProtocolFees() public {
        vm.prank(user1);
        faucet.claim();
        vm.startPrank(user1);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        vm.stopPrank();
        // Simulate protocol fee deposit
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        staking.depositReward{value: 1 ether}();
        assertGt(staking.earned(user1), 0);
        vm.prank(user1);
        staking.claimReward();
        assertEq(staking.earned(user1), 0);
    }

    function test_FaucetPreventsDoubleCliam() public {
        vm.prank(user1);
        faucet.claim();
        vm.prank(user1);
        vm.expectRevert();
        faucet.claim();
    }

    function test_UnstakeReturnsAllPRED() public {
        vm.prank(user1);
        faucet.claim();
        vm.startPrank(user1);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        staking.unstake(100 * 1e18);
        vm.stopPrank();
        assertEq(pred.balanceOf(user1), 100 * 1e18);
    }

    function test_GovernanceRequiresActiveStake() public {
        // User never staked
        vm.prank(user1);
        vm.expectRevert();
        gov.propose("Title", "Desc");
    }

    function test_VotingPowerMatchesStake() public {
        vm.prank(user1);
        faucet.claim();
        vm.startPrank(user1);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        vm.stopPrank();

        // Owner stakes more
        vm.startPrank(owner);
        pred.approve(address(staking), 900 * 1e18);
        staking.stake(900 * 1e18);
        uint256 id = gov.propose("Title", "Desc");
        gov.vote(id, true);
        vm.stopPrank();

        vm.prank(user1);
        gov.vote(id, true);

        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.forVotes, 1000 * 1e18);
    }

    // ─── Referral + Mining Integration ────────────────────────────────────────
    function test_CreateMarketEarnsRewards() public {
        vm.prank(user1);
        factory.createMarket{gas: 3000000}(
            "Will ETH hit $5000?",
            "Crypto",
            block.timestamp + 1 days
        );
        assertGt(mining.getPendingRewards(user1), 0);
    }

    function test_TwoStakersShareRewards() public {
        // Both claim faucet and stake
        vm.prank(user1); faucet.claim();
        vm.prank(user2); faucet.claim();

        vm.startPrank(user1);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        vm.stopPrank();

        vm.startPrank(user2);
        pred.approve(address(staking), 100 * 1e18);
        staking.stake(100 * 1e18);
        vm.stopPrank();

        vm.deal(owner, 2 ether);
        vm.prank(owner);
        staking.depositReward{value: 2 ether}();

        uint256 earned1 = staking.earned(user1);
        uint256 earned2 = staking.earned(user2);
        assertApproxEqAbs(earned1, earned2, 1e10);
    }
}
