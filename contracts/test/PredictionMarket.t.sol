// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { BaseTest } from "./BaseTest.t.sol";
import { PredictionMarket } from "../src/PredictionMarket.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";
import { IPredictionMarket } from "../src/interfaces/IPredictionMarket.sol";

contract PredictionMarketTest is BaseTest {
    PredictionMarket internal market;
    bytes32 internal marketId;
    address internal marketAddr;

    string constant QUESTION = "Will ETH reach $10,000 in 2025?";

    function setUp() public override {
        super.setUp();
        (marketAddr, marketId) = _createMarket(QUESTION);
        market = PredictionMarket(payable(marketAddr));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEPLOYMENT TESTS
    // ─────────────────────────────────────────────────────────────────────────

    function test_deployment_stateIsCorrect() public view {
        assertEq(market.question(), QUESTION);
        assertEq(market.marketId(), marketId);
        assertEq(address(market.oracle()), address(oracle));
        assertEq(market.feeCollector(), feeCollector);
        assertEq(market.feeBps(), FEE_BPS);
        assertEq(market.totalYesShares(), 0);
        assertEq(market.totalNoShares(), 0);
        assertEq(market.totalPool(), 0);
        assertFalse(market.resolved());
    }

    function test_deployment_reverts_invalidOracle() public {
        vm.expectRevert("Invalid oracle");
        new PredictionMarket(
            marketId,
            QUESTION,
            block.timestamp + 1 days,
            address(0),
            feeCollector,
            FEE_BPS,
            owner
        );
    }

    function test_deployment_reverts_invalidFeeCollector() public {
        vm.expectRevert("Invalid fee collector");
        new PredictionMarket(
            marketId,
            QUESTION,
            block.timestamp + 1 days,
            address(oracle),
            address(0),
            FEE_BPS,
            owner
        );
    }

    function test_deployment_reverts_expirationInPast() public {
        vm.expectRevert("Expiration in past");
        new PredictionMarket(
            marketId,
            QUESTION,
            block.timestamp - 1,
            address(oracle),
            feeCollector,
            FEE_BPS,
            owner
        );
    }

    function test_deployment_reverts_feeTooHigh() public {
        vm.expectRevert("Fee too high");
        new PredictionMarket(
            marketId,
            QUESTION,
            block.timestamp + 1 days,
            address(oracle),
            feeCollector,
            600, // >5%
            owner
        );
    }

    function test_deployment_reverts_emptyQuestion() public {
        vm.expectRevert("Empty question");
        new PredictionMarket(
            marketId,
            "",
            block.timestamp + 1 days,
            address(oracle),
            feeCollector,
            FEE_BPS,
            owner
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BUY YES SHARES
    // ─────────────────────────────────────────────────────────────────────────

    function test_buyYesShares_basic() public {
        uint256 amount = 1 ether;
        uint256 expectedFee = (amount * FEE_BPS) / 10_000;
        uint256 expectedShares = amount - expectedFee;

        vm.prank(alice);
        uint256 shares = market.buyYesShares{ value: amount }();

        assertEq(shares, expectedShares);
        assertEq(market.totalYesShares(), expectedShares);
        assertEq(market.totalPool(), expectedShares);
        assertEq(market.totalFeeCollected(), expectedFee);
        (uint256 yesShares,) = market.getUserShares(alice);
        assertEq(yesShares, expectedShares);
    }

    function test_buyYesShares_emitsEvent() public {
        uint256 amount = 1 ether;
        uint256 expectedShares = amount - (amount * FEE_BPS) / 10_000;

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.SharesPurchased(alice, true, amount, expectedShares);
        market.buyYesShares{ value: amount }();
    }

    function test_buyYesShares_multipleUsers() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyYesShares{ value: 2 ether }();

        uint256 fee1 = (1 ether * FEE_BPS) / 10_000;
        uint256 fee2 = (2 ether * FEE_BPS) / 10_000;
        uint256 net1 = 1 ether - fee1;
        uint256 net2 = 2 ether - fee2;

        assertEq(market.totalYesShares(), net1 + net2);
        (uint256 aliceYes,) = market.getUserShares(alice);
        (uint256 bobYes,) = market.getUserShares(bob);
        assertEq(aliceYes, net1);
        assertEq(bobYes, net2);
    }

    function test_buyYesShares_reverts_zeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(IPredictionMarket.InvalidAmount.selector);
        market.buyYesShares{ value: 0 }();
    }

    function test_buyYesShares_reverts_whenExpired() public {
        _skipToExpiry();
        vm.prank(alice);
        vm.expectRevert(IPredictionMarket.MarketExpired.selector);
        market.buyYesShares{ value: 1 ether }();
    }

    function test_buyYesShares_reverts_whenResolved() public {
        // Set up and resolve
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(bob);
        vm.expectRevert(IPredictionMarket.MarketAlreadyResolved.selector);
        market.buyYesShares{ value: 1 ether }();
    }

    function test_buyYesShares_reverts_whenPaused() public {
        vm.prank(owner);
        factory.pauseMarket(marketId);

        vm.prank(alice);
        vm.expectRevert();
        market.buyYesShares{ value: 1 ether }();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BUY NO SHARES
    // ─────────────────────────────────────────────────────────────────────────

    function test_buyNoShares_basic() public {
        uint256 amount = 1 ether;
        uint256 expectedFee = (amount * FEE_BPS) / 10_000;
        uint256 expectedShares = amount - expectedFee;

        vm.prank(bob);
        uint256 shares = market.buyNoShares{ value: amount }();

        assertEq(shares, expectedShares);
        assertEq(market.totalNoShares(), expectedShares);
        (,uint256 noShares) = market.getUserShares(bob);
        assertEq(noShares, expectedShares);
    }

    function test_buyNoShares_emitsEvent() public {
        uint256 amount = 0.5 ether;
        uint256 expectedShares = amount - (amount * FEE_BPS) / 10_000;

        vm.prank(bob);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.SharesPurchased(bob, false, amount, expectedShares);
        market.buyNoShares{ value: amount }();
    }

    function test_buyNoShares_reverts_zeroAmount() public {
        vm.prank(bob);
        vm.expectRevert(IPredictionMarket.InvalidAmount.selector);
        market.buyNoShares{ value: 0 }();
    }

    function test_buyBoth_sameUser() public {
        vm.startPrank(alice);
        market.buyYesShares{ value: 1 ether }();
        market.buyNoShares{ value: 0.5 ether }();
        vm.stopPrank();

        uint256 yesFee = (1 ether * FEE_BPS) / 10_000;
        uint256 noFee = (0.5 ether * FEE_BPS) / 10_000;
        (uint256 yesShares, uint256 noShares) = market.getUserShares(alice);
        assertEq(yesShares, 1 ether - yesFee);
        assertEq(noShares, 0.5 ether - noFee);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROBABILITY CALCULATION
    // ─────────────────────────────────────────────────────────────────────────

    function test_calculateProbability_initialIs50_50() public view {
        (uint256 yes, uint256 no) = market.calculateProbability();
        assertEq(yes, 0.5e18);
        assertEq(no, 0.5e18);
    }

    function test_calculateProbability_afterYesBets() public {
        vm.prank(alice);
        market.buyYesShares{ value: 3 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 1 ether }();

        uint256 totalYes = market.totalYesShares();
        uint256 totalNo = market.totalNoShares();
        uint256 totalShares = totalYes + totalNo;

        (uint256 yesProbability, uint256 noProbability) = market.calculateProbability();
        assertEq(yesProbability, (totalYes * 1e18) / totalShares);
        assertEq(noProbability, 1e18 - yesProbability);
        assertTrue(yesProbability > noProbability);
    }

    function test_calculateProbability_sumsToOne() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1.337 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2.718 ether }();

        (uint256 yes, uint256 no) = market.calculateProbability();
        assertEq(yes + no, 1e18);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARKET RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────

    function test_resolveMarket_yes() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);

        vm.expectEmit(false, false, false, true);
        emit IPredictionMarket.MarketResolved(IOracle.Outcome.YES, market.totalPool());
        market.resolveMarket();

        assertTrue(market.resolved());
        assertEq(uint256(market.outcome()), uint256(IOracle.Outcome.YES));
    }

    function test_resolveMarket_no() public {
        vm.prank(bob);
        market.buyNoShares{ value: 1 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.NO);
        market.resolveMarket();

        assertEq(uint256(market.outcome()), uint256(IOracle.Outcome.NO));
    }

    function test_resolveMarket_invalid() public {
        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.INVALID);
        market.resolveMarket();

        assertEq(uint256(market.outcome()), uint256(IOracle.Outcome.INVALID));
    }

    function test_resolveMarket_reverts_alreadyResolved() public {
        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.expectRevert(IPredictionMarket.MarketAlreadyResolved.selector);
        market.resolveMarket();
    }

    function test_resolveMarket_reverts_notExpired() public {
        _resolveOracle(marketId, IOracle.Outcome.YES);
        vm.expectRevert(IPredictionMarket.MarketNotExpired.selector);
        market.resolveMarket();
    }

    function test_resolveMarket_reverts_oracleNotResolved() public {
        _skipToExpiry();
        vm.expectRevert(IPredictionMarket.OracleNotResolved.selector);
        market.resolveMarket();
    }

    function test_resolveMarket_anyoneCanCall() public {
        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);

        vm.prank(carol); // not owner
        market.resolveMarket();
        assertTrue(market.resolved());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLAIM REWARDS
    // ─────────────────────────────────────────────────────────────────────────

    function test_claimReward_yesOutcome_yesWinner() public {
        uint256 aliceDeposit = 1 ether;
        uint256 bobDeposit = 2 ether;

        vm.prank(alice);
        market.buyYesShares{ value: aliceDeposit }();
        vm.prank(bob);
        market.buyNoShares{ value: bobDeposit }();

        uint256 totalPool = market.totalPool();
        uint256 aliceYes = market.yesShares(alice);
        uint256 totalYes = market.totalYesShares();
        uint256 expectedReward = (aliceYes * totalPool) / totalYes;

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        uint256 balanceBefore = alice.balance;

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.RewardClaimed(alice, expectedReward);
        uint256 reward = market.claimReward();

        assertEq(reward, expectedReward);
        assertEq(alice.balance - balanceBefore, expectedReward);
        assertTrue(market.hasClaimed(alice));
    }

    function test_claimReward_noOutcome_noWinner() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();

        uint256 totalPool = market.totalPool();
        uint256 bobNo = market.noShares(bob);
        uint256 totalNo = market.totalNoShares();
        uint256 expectedReward = (bobNo * totalPool) / totalNo;

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.NO);
        market.resolveMarket();

        uint256 balanceBefore = bob.balance;
        vm.prank(bob);
        uint256 reward = market.claimReward();

        assertEq(reward, expectedReward);
        assertEq(bob.balance - balanceBefore, expectedReward);
    }

    function test_claimReward_invalidOutcome_refundsProportionally() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 1 ether }();

        uint256 totalPool = market.totalPool();
        uint256 aliceYes = market.yesShares(alice);
        uint256 totalShares = market.totalYesShares() + market.totalNoShares();
        uint256 expectedRefund = (aliceYes * totalPool) / totalShares;

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.INVALID);
        market.resolveMarket();

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        uint256 reward = market.claimReward();

        assertApproxEqAbs(reward, expectedRefund, 1); // allow 1 wei rounding
        assertEq(alice.balance - balanceBefore, reward);
    }

    function test_claimReward_reverts_notResolved() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        vm.prank(alice);
        vm.expectRevert(IPredictionMarket.MarketNotResolved.selector);
        market.claimReward();
    }

    function test_claimReward_reverts_alreadyClaimed() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        market.claimReward();

        vm.prank(alice);
        vm.expectRevert(IPredictionMarket.AlreadyClaimed.selector);
        market.claimReward();
    }

    function test_claimReward_reverts_noSharesToClaim_yesOutcome() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        // Bob has no YES shares
        vm.prank(bob);
        vm.expectRevert(IPredictionMarket.NoSharesToClaim.selector);
        market.claimReward();
    }

    function test_claimReward_reverts_noSharesToClaim_noOutcome() public {
        vm.prank(bob);
        market.buyNoShares{ value: 1 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.NO);
        market.resolveMarket();

        // Alice has no shares
        vm.prank(alice);
        vm.expectRevert(IPredictionMarket.NoSharesToClaim.selector);
        market.claimReward();
    }

    function test_claimReward_loser_gets_nothing() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        // Bob (NO) cannot claim in YES outcome
        vm.prank(bob);
        vm.expectRevert(IPredictionMarket.NoSharesToClaim.selector);
        market.claimReward();
    }

    function test_claimReward_multipleWinners_poolConserved() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(carol);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();

        uint256 totalPoolBefore = market.totalPool();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        uint256 aliceBefore = alice.balance;
        uint256 carolBefore = carol.balance;

        vm.prank(alice);
        uint256 aliceReward = market.claimReward();
        vm.prank(carol);
        uint256 carolReward = market.claimReward();

        // Rewards should sum to (approximately) total pool
        assertApproxEqAbs(aliceReward + carolReward, totalPoolBefore, 2); // allow rounding
        assertEq(alice.balance - aliceBefore, aliceReward);
        assertEq(carol.balance - carolBefore, carolReward);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEE COLLECTION
    // ─────────────────────────────────────────────────────────────────────────

    function test_collectFees_basic() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();

        uint256 expectedFees = market.totalFeeCollected();
        uint256 collectorBalanceBefore = feeCollector.balance;

        vm.prank(feeCollector);
        market.collectFees();

        assertEq(feeCollector.balance - collectorBalanceBefore, expectedFees);
        assertEq(market.totalFeeCollected(), 0);
    }

    function test_collectFees_reverts_notCollector() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        vm.prank(alice);
        vm.expectRevert("Not fee collector");
        market.collectFees();
    }

    function test_collectFees_reverts_noFees() public {
        vm.prank(feeCollector);
        vm.expectRevert("No fees");
        market.collectFees();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXPECTED PAYOUT
    // ─────────────────────────────────────────────────────────────────────────

    function test_getExpectedPayout_beforeResolution() public {
        vm.prank(alice);
        market.buyYesShares{ value: 2 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();

        uint256 payout = market.getExpectedPayout(alice);
        assertTrue(payout > 0);
    }

    function test_getExpectedPayout_afterClaim_returnsZero() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        market.claimReward();

        assertEq(market.getExpectedPayout(alice), 0);
    }

    function test_getExpectedPayout_noShares_returnsZero() public view {
        assertEq(market.getExpectedPayout(carol), 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARKET INFO
    // ─────────────────────────────────────────────────────────────────────────

    function test_getMarketInfo_correct() public {
        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        IPredictionMarket.MarketInfo memory info = market.getMarketInfo();
        assertEq(info.question, QUESTION);
        assertEq(info.marketId, marketId);
        assertFalse(info.paused);
        assertTrue(info.totalYesShares > 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAUSE / UNPAUSE
    // ─────────────────────────────────────────────────────────────────────────

    function test_pause_owner() public {
        // Market owner is the factory (address(this) in createMarket), so pause via factory
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IPredictionMarket.MarketPaused(true);
        factory.pauseMarket(marketId);
        assertTrue(market.paused());
    }

    function test_unpause_owner() public {
        vm.prank(owner);
        factory.pauseMarket(marketId);
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IPredictionMarket.MarketPaused(false);
        factory.unpauseMarket(marketId);
        assertFalse(market.paused());
    }

    function test_pause_reverts_notOwner() public {
        // Direct call to market.pause() always reverts now (owner is factory contract)
        vm.prank(alice);
        vm.expectRevert();
        market.pause();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FUZZ TESTS
    // ─────────────────────────────────────────────────────────────────────────

    function testFuzz_buyYesShares_sharesMatchNetAmount(uint256 amount) public {
        amount = bound(amount, 1, 50 ether);

        vm.prank(alice);
        uint256 shares = market.buyYesShares{ value: amount }();

        uint256 fee = (amount * FEE_BPS) / 10_000;
        assertEq(shares, amount - fee);
    }

    function testFuzz_buyNoShares_sharesMatchNetAmount(uint256 amount) public {
        amount = bound(amount, 1, 50 ether);

        vm.prank(bob);
        uint256 shares = market.buyNoShares{ value: amount }();

        uint256 fee = (amount * FEE_BPS) / 10_000;
        assertEq(shares, amount - fee);
    }

    function testFuzz_probability_alwaysSumsToOne(uint256 yesAmount, uint256 noAmount) public {
        yesAmount = bound(yesAmount, 1, 50 ether);
        noAmount = bound(noAmount, 1, 50 ether);

        vm.prank(alice);
        market.buyYesShares{ value: yesAmount }();
        vm.prank(bob);
        market.buyNoShares{ value: noAmount }();

        (uint256 yes, uint256 no) = market.calculateProbability();
        assertApproxEqAbs(yes + no, 1e18, 1); // 1 wei tolerance for division
    }

    function testFuzz_claimReward_neverExceedsPool(uint256 yesAmount, uint256 noAmount) public {
        yesAmount = bound(yesAmount, 0.001 ether, 20 ether);
        noAmount = bound(noAmount, 0.001 ether, 20 ether);

        vm.prank(alice);
        market.buyYesShares{ value: yesAmount }();
        vm.prank(bob);
        market.buyNoShares{ value: noAmount }();

        uint256 totalPool = market.totalPool();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        uint256 reward = market.claimReward();
        assertTrue(reward <= totalPool);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EDGE CASES
    // ─────────────────────────────────────────────────────────────────────────

    function test_singleBettor_claimsAll() public {
        vm.prank(alice);
        market.buyYesShares{ value: 5 ether }();

        uint256 totalPool = market.totalPool();

        _skipToExpiry();
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        uint256 reward = market.claimReward();
        assertEq(reward, totalPool);
    }

    function test_receive_directETH() public {
        // Market can receive ETH directly (for funding)
        uint256 before = address(market).balance;
        payable(address(market)).transfer(1 ether);
        assertEq(address(market).balance, before + 1 ether);
    }
}
