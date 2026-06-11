// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PREDToken.sol";

/// @title PREDFaucet - One-time PRED token claim for new users
/// @author Aditya Chotaliya
contract PREDFaucet is Ownable {

    PREDToken public immutable predToken;
    uint256 public claimAmount = 100 * 1e18; // 100 PRED
    mapping(address => bool) public hasClaimed;

    error AlreadyClaimed();
    error FaucetEmpty();

    event Claimed(address indexed user, uint256 amount);

    constructor(address _predToken, address initialOwner) Ownable(initialOwner) {
        predToken = PREDToken(_predToken);
    }

    function claim() external {
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (predToken.balanceOf(address(this)) < claimAmount) revert FaucetEmpty();
        hasClaimed[msg.sender] = true;
        predToken.transfer(msg.sender, claimAmount);
        emit Claimed(msg.sender, claimAmount);
    }

    function setClaimAmount(uint256 _amount) external onlyOwner {
        claimAmount = _amount;
    }

    /// @notice Owner deposits PRED into faucet
    function deposit(uint256 amount) external onlyOwner {
        predToken.transferFrom(msg.sender, address(this), amount);
    }

    function faucetBalance() external view returns (uint256) {
        return predToken.balanceOf(address(this));
    }
}
