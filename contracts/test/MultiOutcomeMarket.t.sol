// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MultiOutcomeMarket.sol";
import "../src/MultiOracle.sol";
import "../src/MultiMarketFactory.sol";

contract MultiOutcomeMarketTest is Test {
    MultiOracle public oracle;
    MultiMarketFactory public factory;
    MultiOutcomeMarket public market;

    address public owner = address(1);
    address public creator = address(2);
    address public trader1 = address(3);
    address public trader2 = address(4);
    address public feeCollector = address(5);

    bytes32 public marketId;
    string[] public outcomes;
    uint256 public expiry;

    function setUp() public {
        vm.startPrank(owner);
        oracle = new MultiOracle(owner);
        factory = new MultiMarketFactory(address(oracle), feeCollector, 200, owner);
        vm.stopPrank();

        outcomes = new string[](3);
        outcomes[0] = "Option A";
        outcomes[1] = "Option B";
        outcomes[2] = "Option C";
        expiry = block.timestamp + 7 days;

        vm.prank(creator);
        (address mAddr, bytes32 mId) = factory.createMarket("Which option wins?", outcomes, expiry);
        market = MultiOutcomeMarket(payable(mAddr));
        marketId = mId;

        vm.deal(trader1, 10 ether);
        vm.deal(trader2, 10 ether);
    }

    // ─── Deployment ───────────────────────────────────────────────────────────
    function test_QuestionSet() public view {
        assertEq(market.question(), "Which option wins?");
    }

    function test_OutcomeCount() public view {
        assertEq(market.getOutcomeCount(), 3);
    }

    function test_OutcomesSet() public view {
        string[] memory o = market.getOutcomes();
        assertEq(o[0], "Option A");
        assertEq(o[1], "Option B");
        assertEq(o[2], "Option C");
    }

    function test_NotResolved() public view {
        assertFalse(market.resolved());
    }

    function test_TotalPoolZero() public view {
        assertEq(market.totalPool(), 0);
    }

    function test_ExpirySet() public view {
        assertEq(market.expirationTime(), expiry);
    }

    // ─── Buying Shares ────────────────────────────────────────────────────────
    function test_BuyShares() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        assertGt(market.getOutcomePool(0), 0);
    }

    function test_BuySharesUpdatesTotalPool() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        assertGt(market.totalPool(), 0);
    }

    function test_BuySharesDifferentOutcomes() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(trader2);
        market.buyShares{value: 1 ether}(1);
        assertGt(market.getOutcomePool(0), 0);
        assertGt(market.getOutcomePool(1), 0);
    }

    function test_UserSharesTracked() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        assertGt(market.getUserShares(trader1, 0), 0);
    }

    function test_FeeDeducted() public {
        uint256 before = feeCollector.balance;
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        assertGt(feeCollector.balance, before);
    }

    function test_RevertBuyInvalidOutcome() public {
        vm.prank(trader1);
        vm.expectRevert();
        market.buyShares{value: 1 ether}(99);
    }

    function test_RevertBuyZeroValue() public {
        vm.prank(trader1);
        vm.expectRevert();
        market.buyShares{value: 0}(0);
    }

    function test_RevertBuyAfterExpiry() public {
        vm.warp(expiry + 1);
        vm.prank(trader1);
        vm.expectRevert();
        market.buyShares{value: 1 ether}(0);
    }

    // ─── Resolution ───────────────────────────────────────────────────────────
    function test_Resolve() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.warp(expiry + 1);
        market.resolve();
        assertTrue(market.resolved());
    }

    function test_WinningOutcomeSet() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(1);
        vm.prank(owner);
        oracle.resolve(marketId, 1);
        vm.warp(expiry + 1);
        market.resolve();
        assertEq(market.winningOutcome(), 1);
    }

    function test_RevertResolveBeforeExpiry() public {
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.expectRevert();
        market.resolve();
    }

    function test_RevertResolveOracleNotSet() public {
        vm.warp(expiry + 1);
        vm.expectRevert();
        market.resolve();
    }

    function test_RevertDoubleResolve() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.warp(expiry + 1);
        market.resolve();
        vm.expectRevert();
        market.resolve();
    }

    // ─── Claims ───────────────────────────────────────────────────────────────
    function test_WinnerCanClaim() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.warp(expiry + 1);
        market.resolve();
        uint256 before = trader1.balance;
        vm.prank(trader1);
        market.claimReward();
        assertGt(trader1.balance, before);
    }

    function test_RevertLoserClaim() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(trader2);
        market.buyShares{value: 1 ether}(1);
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.warp(expiry + 1);
        market.resolve();
        vm.prank(trader2);
        vm.expectRevert();
        market.claimReward();
    }

    function test_RevertDoubleClaim() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.warp(expiry + 1);
        market.resolve();
        vm.prank(trader1);
        market.claimReward();
        vm.prank(trader1);
        vm.expectRevert();
        market.claimReward();
    }

    function test_ExpectedPayout() public {
        vm.prank(trader1);
        market.buyShares{value: 1 ether}(0);
        vm.prank(trader2);
        market.buyShares{value: 1 ether}(1);
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.warp(expiry + 1);
        market.resolve();
        assertGt(market.getExpectedPayout(trader1), 0);
        assertEq(market.getExpectedPayout(trader2), 0);
    }

    // ─── MultiOracle ──────────────────────────────────────────────────────────
    function test_OracleIsResolved() public {
        vm.prank(owner);
        oracle.resolve(marketId, 1);
        assertTrue(oracle.isResolved(marketId));
    }

    function test_OracleWinningOutcome() public {
        vm.prank(owner);
        oracle.resolve(marketId, 2);
        assertEq(oracle.getWinningOutcome(marketId), 2);
    }

    function test_RevertOracleDoubleResolve() public {
        vm.prank(owner);
        oracle.resolve(marketId, 0);
        vm.prank(owner);
        vm.expectRevert();
        oracle.resolve(marketId, 1);
    }

    function test_RevertOracleUnauthorized() public {
        vm.prank(trader1);
        vm.expectRevert();
        oracle.resolve(marketId, 0);
    }

    function test_SetResolver() public {
        vm.prank(owner);
        oracle.setResolver(trader1, true);
        vm.prank(trader1);
        oracle.resolve(marketId, 0);
        assertTrue(oracle.isResolved(marketId));
    }

    // ─── Factory ──────────────────────────────────────────────────────────────
    function test_FactoryMarketCount() public view {
        assertEq(factory.getMarketCount(), 1);
    }

    function test_FactoryGetAllMarkets() public view {
        assertEq(factory.getAllMarkets().length, 1);
    }

    function test_RevertFactoryTooFewOutcomes() public {
        string[] memory o = new string[](1);
        o[0] = "Only one";
        vm.prank(creator);
        vm.expectRevert();
        factory.createMarket("Q", o, expiry);
    }

    function test_RevertFactoryTooManyOutcomes() public {
        string[] memory o = new string[](11);
        for (uint i = 0; i < 11; i++) o[i] = "X";
        vm.prank(creator);
        vm.expectRevert();
        factory.createMarket("Q", o, expiry);
    }

    function test_RevertFactoryPastExpiry() public {
        vm.prank(creator);
        vm.expectRevert();
        factory.createMarket("Q", outcomes, block.timestamp - 1);
    }

    function testFuzz_BuyMultipleOutcomes(uint256 a, uint256 b, uint256 c) public {
        a = bound(a, 0.001 ether, 1 ether);
        b = bound(b, 0.001 ether, 1 ether);
        c = bound(c, 0.001 ether, 1 ether);
        vm.deal(trader1, a + b + c);
        vm.startPrank(trader1);
        market.buyShares{value: a}(0);
        market.buyShares{value: b}(1);
        market.buyShares{value: c}(2);
        vm.stopPrank();
        assertGt(market.totalPool(), 0);
    }
}
