// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PREDToken.sol";

/// @title PREDStaking - Stake PRED tokens to earn protocol fee share
/// @author Aditya Chotaliya
contract PREDStaking is ReentrancyGuard, Ownable {

    PREDToken public immutable predToken;

    uint256 public totalStaked;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 public constant MIN_STAKE_AMOUNT = 1 * 1e18; // 1 PRED minimum
    uint256 public constant PRECISION = 1e18;

    error InsufficientAmount();
    error InsufficientStake();
    error NothingToClaim();
    error TransferFailed();

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardDeposited(uint256 amount);

    constructor(address _predToken, address initialOwner) Ownable(initialOwner) {
        predToken = PREDToken(_predToken);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        return rewardPerTokenStored;
    }

    function earned(address account) public view returns (uint256) {
        return (stakedBalance[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account])) /
            PRECISION +
            rewards[account];
    }

    function getStakeInfo(address user) external view returns (
        uint256 staked, uint256 pendingReward, uint256 share
    ) {
        staked = stakedBalance[user];
        pendingReward = earned(user);
        share = totalStaked > 0 ? (staked * 10000) / totalStaked : 0; // bps
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount < MIN_STAKE_AMOUNT) revert InsufficientAmount();
        predToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount > stakedBalance[msg.sender]) revert InsufficientStake();
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        predToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward == 0) revert NothingToClaim();
        rewards[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: reward}("");
        if (!ok) revert TransferFailed();
        emit RewardClaimed(msg.sender, reward);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Called by protocol to deposit ETH fee share for stakers
    function depositReward() external payable updateReward(address(0)) {
        if (msg.value == 0) revert InsufficientAmount();
        if (totalStaked > 0) {
            rewardPerTokenStored += (msg.value * PRECISION) / totalStaked;
        }
        emit RewardDeposited(msg.value);
    }

    receive() external payable {
        if (totalStaked > 0) {
            rewardPerTokenStored += (msg.value * PRECISION) / totalStaked;
        }
        emit RewardDeposited(msg.value);
    }
}
