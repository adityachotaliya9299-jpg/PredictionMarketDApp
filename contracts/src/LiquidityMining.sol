// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PREDToken.sol";

/// @title LiquidityMining - Distributes PRED tokens to market creators and traders
contract LiquidityMining is Ownable, ReentrancyGuard {
    PREDToken public immutable predToken;

    // Rewards per action
    uint256 public creatorReward = 100 * 1e18;   // 100 PRED per market created
    uint256 public traderReward  = 10 * 1e18;    // 10 PRED per trade

    // Tracking
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalClaimed;
    mapping(address => bool)    public authorizedCallers;

    error NotAuthorized();
    error NothingToClaim();

    event RewardEarned(address indexed user, uint256 amount, string reason);
    event RewardClaimed(address indexed user, uint256 amount);
    event CallerAuthorized(address indexed caller, bool authorized);

    modifier onlyAuthorized() {
        if (!authorizedCallers[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    constructor(address _predToken, address initialOwner) Ownable(initialOwner) {
        predToken = PREDToken(_predToken);
    }

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorized(caller, authorized);
    }

    function setRewards(uint256 _creatorReward, uint256 _traderReward) external onlyOwner {
        creatorReward = _creatorReward;
        traderReward = _traderReward;
    }

    function recordCreation(address creator) external onlyAuthorized {
        pendingRewards[creator] += creatorReward;
        emit RewardEarned(creator, creatorReward, "market_created");
    }

    function recordTrade(address trader) external onlyAuthorized {
        pendingRewards[trader] += traderReward;
        emit RewardEarned(trader, traderReward, "trade");
    }

    function claimRewards() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        if (amount == 0) revert NothingToClaim();
        pendingRewards[msg.sender] = 0;
        totalClaimed[msg.sender] += amount;
        predToken.mint(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }
}
