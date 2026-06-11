// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PREDStaking.sol";

/// @title Governance - On-chain voting using staked PRED
/// @author Aditya Chotaliya
contract Governance is Ownable, ReentrancyGuard {

    PREDStaking public immutable staking;

    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorum = 1000 * 1e18; // 1000 PRED minimum participation

    enum ProposalState { Active, Passed, Failed, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        ProposalState state;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voteWeight;

    uint256 public constant MIN_PROPOSAL_STAKE = 100 * 1e18; // 100 PRED to propose

    error InsufficientStakeToPropose();
    error ProposalNotActive();
    error AlreadyVoted();
    error NoVotingPower();
    error ProposalNotPassed();
    error VotingPeriodNotEnded();

    event ProposalCreated(uint256 indexed id, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);

    constructor(address _staking, address initialOwner) Ownable(initialOwner) {
        staking = PREDStaking(payable(_staking));
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getProposal(uint256 id) external view returns (Proposal memory) {
        return proposals[id];
    }

    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory all = new Proposal[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            all[i - 1] = proposals[i];
        }
        return all;
    }

    function getProposalState(uint256 id) public view returns (ProposalState) {
        Proposal storage p = proposals[id];
        if (p.state == ProposalState.Cancelled) return ProposalState.Cancelled;
        if (p.state == ProposalState.Executed) return ProposalState.Executed;
        if (block.timestamp < p.endTime) return ProposalState.Active;
        uint256 totalVotes = p.forVotes + p.againstVotes;
        if (totalVotes < quorum) return ProposalState.Failed;
        if (p.forVotes > p.againstVotes) return ProposalState.Passed;
        return ProposalState.Failed;
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    function propose(string calldata title, string calldata description) external returns (uint256) {
        (uint256 staked,,) = staking.getStakeInfo(msg.sender);
        if (staked < MIN_PROPOSAL_STAKE) revert InsufficientStakeToPropose();

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            state: ProposalState.Active,
            executed: false
        });

        emit ProposalCreated(proposalCount, msg.sender, title);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        if (block.timestamp > p.endTime) revert ProposalNotActive();
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();

        (uint256 weight,,) = staking.getStakeInfo(msg.sender);
        if (weight == 0) revert NoVotingPower();

        hasVoted[proposalId][msg.sender] = true;
        voteWeight[proposalId][msg.sender] = weight;

        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function execute(uint256 proposalId) external onlyOwner {
        if (getProposalState(proposalId) != ProposalState.Passed) revert ProposalNotPassed();
        if (block.timestamp <= proposals[proposalId].endTime) revert VotingPeriodNotEnded();
        proposals[proposalId].state = ProposalState.Executed;
        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external {
        require(msg.sender == proposals[proposalId].proposer || msg.sender == owner(), "Not authorized");
        proposals[proposalId].state = ProposalState.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setVotingPeriod(uint256 _period) external onlyOwner {
        votingPeriod = _period;
    }

    function setQuorum(uint256 _quorum) external onlyOwner {
        quorum = _quorum;
    }
}
