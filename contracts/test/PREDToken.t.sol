// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PREDToken.sol";

contract PREDTokenTest is Test {
    PREDToken public pred;
    address public owner = address(1);
    address public minter = address(2);
    address public user1 = address(3);
    address public user2 = address(4);

    function setUp() public {
        vm.prank(owner);
        pred = new PREDToken(owner);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    function test_InitialSupply() public view {
        assertEq(pred.totalSupply(), 10_000_000 * 1e18);
    }

    function test_OwnerReceivesInitialSupply() public view {
        assertEq(pred.balanceOf(owner), 10_000_000 * 1e18);
    }

    function test_Name() public view {
        assertEq(pred.name(), "PredictX");
    }

    function test_Symbol() public view {
        assertEq(pred.symbol(), "PRED");
    }

    function test_MaxSupply() public view {
        assertEq(pred.MAX_SUPPLY(), 100_000_000 * 1e18);
    }

    function test_Decimals() public view {
        assertEq(pred.decimals(), 18);
    }

    function test_MinterZeroOnDeploy() public view {
        assertEq(pred.minter(), address(0));
    }

    // ─── Minter ───────────────────────────────────────────────────────────────
    function test_SetMinter() public {
        vm.prank(owner);
        pred.setMinter(minter);
        assertEq(pred.minter(), minter);
    }

    function test_RevertSetMinterNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        pred.setMinter(minter);
    }

    function test_MinterCanMint() public {
        vm.prank(owner);
        pred.setMinter(minter);
        vm.prank(minter);
        pred.mint(user1, 1000 * 1e18);
        assertEq(pred.balanceOf(user1), 1000 * 1e18);
    }

    function test_RevertMintNotMinter() public {
        vm.prank(user1);
        vm.expectRevert();
        pred.mint(user1, 1000 * 1e18);
    }

    function test_RevertMintExceedsMaxSupply() public {
        vm.prank(owner);
        pred.setMinter(minter);
        uint256 remaining = pred.MAX_SUPPLY() - pred.totalSupply();
        vm.prank(minter);
        vm.expectRevert();
        pred.mint(user1, remaining + 1);
    }

    function test_MintUpToMaxSupply() public {
        vm.prank(owner);
        pred.setMinter(minter);
        uint256 remaining = pred.MAX_SUPPLY() - pred.totalSupply();
        vm.prank(minter);
        pred.mint(user1, remaining);
        assertEq(pred.totalSupply(), pred.MAX_SUPPLY());
    }

    function test_MintIncreasesTotalSupply() public {
        vm.prank(owner);
        pred.setMinter(minter);
        vm.prank(minter);
        pred.mint(user1, 500 * 1e18);
        assertEq(pred.totalSupply(), 10_000_000 * 1e18 + 500 * 1e18);
    }

    // ─── Transfer ─────────────────────────────────────────────────────────────
    function test_Transfer() public {
        vm.prank(owner);
        pred.transfer(user1, 500 * 1e18);
        assertEq(pred.balanceOf(user1), 500 * 1e18);
    }

    function test_TransferReducesSenderBalance() public {
        vm.prank(owner);
        pred.transfer(user1, 500 * 1e18);
        assertEq(pred.balanceOf(owner), 10_000_000 * 1e18 - 500 * 1e18);
    }

    function test_ApproveAndTransferFrom() public {
        vm.prank(owner);
        pred.approve(user1, 100 * 1e18);
        vm.prank(user1);
        pred.transferFrom(owner, user2, 100 * 1e18);
        assertEq(pred.balanceOf(user2), 100 * 1e18);
    }

    function test_AllowanceDecremented() public {
        vm.prank(owner);
        pred.approve(user1, 100 * 1e18);
        vm.prank(user1);
        pred.transferFrom(owner, user2, 60 * 1e18);
        assertEq(pred.allowance(owner, user1), 40 * 1e18);
    }

    function test_RevertTransferInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert();
        pred.transfer(user2, 1);
    }

    function test_RevertTransferFromInsufficientAllowance() public {
        vm.prank(owner);
        pred.approve(user1, 50 * 1e18);
        vm.prank(user1);
        vm.expectRevert();
        pred.transferFrom(owner, user2, 100 * 1e18);
    }

    function test_RevertMintToZeroAddress() public {
        vm.prank(owner);
        pred.setMinter(minter);
        vm.prank(minter);
        vm.expectRevert();
        pred.mint(address(0), 100 * 1e18);
    }

    function testFuzz_MintWithinMaxSupply(uint256 amount) public {
        uint256 remaining = pred.MAX_SUPPLY() - pred.totalSupply();
        amount = bound(amount, 1, remaining);
        vm.prank(owner);
        pred.setMinter(minter);
        vm.prank(minter);
        pred.mint(user1, amount);
        assertEq(pred.balanceOf(user1), amount);
    }

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 1, 10_000_000 * 1e18);
        vm.prank(owner);
        pred.transfer(user1, amount);
        assertEq(pred.balanceOf(user1), amount);
    }
}
