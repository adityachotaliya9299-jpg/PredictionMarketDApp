// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PREDToken.sol";
import "../src/PREDStaking.sol";
import "../src/Governance.sol";

contract GovernanceTest is Test {
    PREDToken public pred;
    PREDStaking public staking;
    Governance public gov;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);

    uint256 constant STAKE_AMOUNT = 1000 * 1e18;
    uint256 constant MIN_PROPOSAL_STAKE = 100 * 1e18;

    function setUp() public {
        vm.startPrank(owner);
        pred = new PREDToken(owner);
        staking = new PREDStaking(address(pred), owner);
        gov = new Governance(address(staking), owner);
        pred.transfer(user1, 5000 * 1e18);
        pred.transfer(user2, 5000 * 1e18);
        pred.transfer(user3, 5000 * 1e18);
        vm.stopPrank();
    }

    function _stake(address user, uint256 amount) internal {
        vm.startPrank(user);
        pred.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();
    }

    function _propose(address user, string memory title, string memory desc) internal returns (uint256) {
        vm.prank(user);
        return gov.propose(title, desc);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    function test_StakingAddressSet() public view {
        assertEq(address(gov.staking()), address(staking));
    }

    function test_InitialProposalCount() public view {
        assertEq(gov.proposalCount(), 0);
    }

    function test_DefaultVotingPeriod() public view {
        assertEq(gov.votingPeriod(), 3 days);
    }

    function test_DefaultQuorum() public view {
        assertEq(gov.quorum(), 1000 * 1e18);
    }

    // ─── Proposals ────────────────────────────────────────────────────────────
    function test_CreateProposal() public {
        _stake(user1, STAKE_AMOUNT);
        _propose(user1, "Test Proposal", "Test Description");
        assertEq(gov.proposalCount(), 1);
    }

    function test_ProposalData() public {
        _stake(user1, STAKE_AMOUNT);
        vm.prank(user1);
        uint256 id = gov.propose("Title", "Desc");
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.title, "Title");
        assertEq(p.description, "Desc");
        assertEq(p.proposer, user1);
        assertEq(p.forVotes, 0);
        assertEq(p.againstVotes, 0);
    }

    function test_ProposalEndTime() public {
        _stake(user1, STAKE_AMOUNT);
        uint256 before = block.timestamp;
        vm.prank(user1);
        uint256 id = gov.propose("Title", "Desc");
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.endTime, before + gov.votingPeriod());
    }

    function test_RevertProposeInsufficientStake() public {
        _stake(user1, MIN_PROPOSAL_STAKE - 1);
        vm.prank(user1);
        vm.expectRevert();
        gov.propose("Title", "Desc");
    }

    function test_RevertProposeNoStake() public {
        vm.prank(user1);
        vm.expectRevert();
        gov.propose("Title", "Desc");
    }

    function test_GetAllProposals() public {
        _stake(user1, STAKE_AMOUNT);
        _propose(user1, "P1", "D1");
        _propose(user1, "P2", "D2");
        _propose(user1, "P3", "D3");
        Governance.Proposal[] memory all = gov.getAllProposals();
        assertEq(all.length, 3);
    }

    // ─── Voting ───────────────────────────────────────────────────────────────
    function test_VoteFor() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        gov.vote(id, true);
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.forVotes, STAKE_AMOUNT);
    }

    function test_VoteAgainst() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        gov.vote(id, false);
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.againstVotes, STAKE_AMOUNT);
    }

    function test_VoteWeightEqualsStake() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT * 2);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user1);
        gov.vote(id, true);
        vm.prank(user2);
        gov.vote(id, true);
        Governance.Proposal memory p = gov.getProposal(id);
        assertEq(p.forVotes, STAKE_AMOUNT * 3);
    }

    function test_HasVotedAfterVote() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        gov.vote(id, true);
        assertTrue(gov.hasVoted(id, user2));
    }

    function test_RevertDoubleVote() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        gov.vote(id, true);
        vm.prank(user2);
        vm.expectRevert();
        gov.vote(id, true);
    }

    function test_RevertVoteNoStake() public {
        _stake(user1, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user3);
        vm.expectRevert();
        gov.vote(id, true);
    }

    function test_RevertVoteAfterEnd() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.warp(gov.getProposal(id).endTime + 1);
        vm.prank(user2);
        vm.expectRevert();
        gov.vote(id, true);
    }

    // ─── State ────────────────────────────────────────────────────────────────
    function test_StateActive() public {
        _stake(user1, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        assertEq(uint256(gov.getProposalState(id)), 0); // Active
    }

    function test_StateFailedInsufficientQuorum() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, 100 * 1e18); // less than quorum
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        gov.vote(id, true);
        vm.warp(gov.getProposal(id).endTime + 1);
        assertEq(uint256(gov.getProposalState(id)), 2); // Failed
    }

    function test_StatePassed() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        gov.vote(id, true);
        vm.warp(gov.getProposal(id).endTime + 1);
        assertEq(uint256(gov.getProposalState(id)), 1); // Passed
    }

    function test_StateFailed_AgainstWins() public {
        _stake(user1, STAKE_AMOUNT);
        _stake(user2, STAKE_AMOUNT * 2);
        _stake(user3, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user1);
        gov.vote(id, true);
        vm.prank(user2);
        gov.vote(id, false);
        vm.warp(gov.getProposal(id).endTime + 1);
        assertEq(uint256(gov.getProposalState(id)), 2); // Failed
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────
    function test_ProposerCanCancel() public {
        _stake(user1, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user1);
        gov.cancel(id);
        assertEq(uint256(gov.getProposalState(id)), 4); // Cancelled
    }

    function test_OwnerCanCancel() public {
        _stake(user1, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(owner);
        gov.cancel(id);
        assertEq(uint256(gov.getProposalState(id)), 4); // Cancelled
    }

    function test_RevertCancelUnauthorized() public {
        _stake(user1, STAKE_AMOUNT);
        uint256 id = _propose(user1, "Title", "Desc");
        vm.prank(user2);
        vm.expectRevert();
        gov.cancel(id);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function test_SetVotingPeriod() public {
        vm.prank(owner);
        gov.setVotingPeriod(7 days);
        assertEq(gov.votingPeriod(), 7 days);
    }

    function test_SetQuorum() public {
        vm.prank(owner);
        gov.setQuorum(5000 * 1e18);
        assertEq(gov.quorum(), 5000 * 1e18);
    }
}
