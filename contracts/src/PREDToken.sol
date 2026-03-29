// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title PRED - PredictX Governance Token
contract PREDToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18; // 100M PRED
    address public minter;

    error NotMinter();
    error ExceedsMaxSupply();

    event MinterUpdated(address indexed newMinter);

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotMinter();
        _;
    }

    constructor(address initialOwner) ERC20("PredictX", "PRED") Ownable(initialOwner) {
        // Mint 10M to owner for liquidity/team
        _mint(initialOwner, 10_000_000 * 1e18);
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();
        _mint(to, amount);
    }
}
