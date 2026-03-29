// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ReferralSystem - On-chain referral tracking with ETH fee sharing
contract ReferralSystem is Ownable, ReentrancyGuard {
    uint256 public referralFeeBps = 50; // 0.5% of trade amount goes to referrer
    uint256 public constant MAX_REFERRAL_FEE = 500; // max 5%

    mapping(address => address) public referrerOf;      // user => referrer
    mapping(address => uint256) public referralCount;   // referrer => # referrals
    mapping(address => uint256) public pendingEarnings; // referrer => ETH earned
    mapping(address => uint256) public totalEarnings;
    mapping(address => bool)    public authorizedCallers;

    error AlreadyReferred();
    error CannotReferSelf();
    error NotAuthorized();
    error NothingToClaim();
    error FeeTooHigh();
    error TransferFailed();

    event Referred(address indexed user, address indexed referrer);
    event ReferralEarned(address indexed referrer, address indexed trader, uint256 amount);
    event ReferralClaimed(address indexed referrer, uint256 amount);

    modifier onlyAuthorized() {
        if (!authorizedCallers[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }

    function setReferralFee(uint256 _feeBps) external onlyOwner {
        if (_feeBps > MAX_REFERRAL_FEE) revert FeeTooHigh();
        referralFeeBps = _feeBps;
    }

    function registerReferral(address user, address referrer) external onlyAuthorized {
        if (referrerOf[user] != address(0)) revert AlreadyReferred();
        if (user == referrer) revert CannotReferSelf();
        referrerOf[user] = referrer;
        referralCount[referrer]++;
        emit Referred(user, referrer);
    }

    function recordTrade(address trader, uint256 tradeAmount) external payable onlyAuthorized {
        address referrer = referrerOf[trader];
        if (referrer == address(0)) return;
        uint256 fee = (tradeAmount * referralFeeBps) / 10000;
        if (fee > 0 && msg.value >= fee) {
            pendingEarnings[referrer] += fee;
            totalEarnings[referrer] += fee;
            emit ReferralEarned(referrer, trader, fee);
        }
    }

    function claimEarnings() external nonReentrant {
        uint256 amount = pendingEarnings[msg.sender];
        if (amount == 0) revert NothingToClaim();
        pendingEarnings[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit ReferralClaimed(msg.sender, amount);
    }

    function getReferralStats(address user) external view returns (
        address referrer, uint256 count, uint256 pending, uint256 total
    ) {
        return (referrerOf[user], referralCount[user], pendingEarnings[user], totalEarnings[user]);
    }

    receive() external payable {}
}
