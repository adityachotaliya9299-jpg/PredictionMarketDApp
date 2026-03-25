// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { BaseTest } from "./BaseTest.t.sol";
import { PredictionMarket } from "../src/PredictionMarket.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";
import { IMarketFactory } from "../src/interfaces/IMarketFactory.sol";

/// @notice End-to-end integration tests simulating real user flows
contract IntegrationTest is BaseTest {
    // ─────────────────────────────────────────────────────────────────────────
    // FULL LIFECYCLE: YES WINS
    // ─────────────────────────────────────────────────────────────────────────

    function test_fullLifecycle_yesWins() public {
        // 1. Create market
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) =
            factory.createMarket("Will ETH reach $5k by end of 2025?", "Crypto", block.timestamp + 30 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        // 2. Users bet
        vm.prank(alice);
        market.buyYesShares{ value: 3 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();
        vm.prank(carol);
        market.buyYesShares{ value: 1 ether }();

        uint256 totalPool = market.totalPool();
        assertGt(totalPool, 0);

        // 3. Probability reflects bets
        (uint256 yesPct, uint256 noPct) = market.calculateProbability();
        assertGt(yesPct, noPct); // YES has more bets

        // 4. Skip to expiry & oracle resolves YES
        skip(30 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        // 5. YES winners claim
        uint256 aliceBefore = alice.balance;
        uint256 carolBefore = carol.balance;

        vm.prank(alice);
        uint256 aliceReward = market.claimReward();
        vm.prank(carol);
        uint256 carolReward = market.claimReward();

        // Bob (NO) cannot claim
        vm.prank(bob);
        vm.expectRevert();
        market.claimReward();

        // Winners got more than 1x (won pool)
        assertGt(aliceReward, 0);
        assertGt(carolReward, 0);
        assertGt(alice.balance, aliceBefore);
        assertGt(carol.balance, carolBefore);

        // Total claimed ≈ totalPool
        assertApproxEqAbs(aliceReward + carolReward, totalPool, 2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FULL LIFECYCLE: NO WINS
    // ─────────────────────────────────────────────────────────────────────────

    function test_fullLifecycle_noWins() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) =
            factory.createMarket("Will XRP flip ETH?", "Crypto", block.timestamp + 7 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 4 ether }();

        uint256 totalPool = market.totalPool();

        skip(7 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.NO);
        market.resolveMarket();

        uint256 bobBefore = bob.balance;
        vm.prank(bob);
        uint256 bobReward = market.claimReward();

        assertApproxEqAbs(bobReward, totalPool, 1);
        assertGt(bob.balance, bobBefore);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FULL LIFECYCLE: INVALID MARKET (REFUND)
    // ─────────────────────────────────────────────────────────────────────────

    function test_fullLifecycle_invalidRefund() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) =
            factory.createMarket("Ambiguous question?", "General", block.timestamp + 7 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 2 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();

        uint256 totalPool = market.totalPool();

        skip(7 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.INVALID);
        market.resolveMarket();

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;

        vm.prank(alice);
        uint256 aliceRefund = market.claimReward();
        vm.prank(bob);
        uint256 bobRefund = market.claimReward();

        // Both get proportional refund ≈ their original net deposit
        assertApproxEqAbs(aliceRefund + bobRefund, totalPool, 2);
        assertGt(alice.balance, aliceBefore);
        assertGt(bob.balance, bobBefore);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FULL LIFECYCLE: ADMIN EMERGENCY PAUSE
    // ─────────────────────────────────────────────────────────────────────────

    function test_emergencyPause_stopsBetting() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) =
            factory.createMarket("Emergency test?", "General", block.timestamp + 7 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        // Admin emergency pause
        vm.prank(owner);
        factory.pauseMarket(marketId);
        assertTrue(market.paused());

        // Bets rejected
        vm.prank(bob);
        vm.expectRevert();
        market.buyNoShares{ value: 1 ether }();

        // Admin unpauses
        vm.prank(owner);
        factory.unpauseMarket(marketId);
        assertFalse(market.paused());

        // Bets work again
        vm.prank(bob);
        market.buyNoShares{ value: 1 ether }();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEE FLOW
    // ─────────────────────────────────────────────────────────────────────────

    function test_feeFlow_endToEnd() public {
        vm.prank(alice);
        (address marketAddr,) =
            factory.createMarket("Fee test?", "General", block.timestamp + 7 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        uint256 aliceDeposit = 5 ether;
        uint256 bobDeposit = 3 ether;

        vm.prank(alice);
        market.buyYesShares{ value: aliceDeposit }();
        vm.prank(bob);
        market.buyNoShares{ value: bobDeposit }();

        uint256 totalDeposits = aliceDeposit + bobDeposit;
        uint256 expectedFees = (totalDeposits * FEE_BPS) / 10_000;
        uint256 expectedPool = totalDeposits - expectedFees;

        assertEq(market.totalFeeCollected(), expectedFees);
        assertEq(market.totalPool(), expectedPool);

        // Collect fees
        uint256 collectorBefore = feeCollector.balance;
        vm.prank(feeCollector);
        market.collectFees();
        assertEq(feeCollector.balance - collectorBefore, expectedFees);
        assertEq(market.totalFeeCollected(), 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MULTIPLE MARKETS SIMULTANEOUSLY
    // ─────────────────────────────────────────────────────────────────────────

    function test_multipleMarketsIndependent() public {
        // Create 2 markets
        vm.prank(alice);
        (address addr1, bytes32 id1) =
            factory.createMarket("Market 1?", "General", block.timestamp + 7 days);
        vm.prank(bob);
        (address addr2, bytes32 id2) =
            factory.createMarket("Market 2?", "General", block.timestamp + 14 days);

        PredictionMarket market1 = PredictionMarket(payable(addr1));
        PredictionMarket market2 = PredictionMarket(payable(addr2));

        // Alice bets YES on market1, NO on market2
        vm.startPrank(alice);
        market1.buyYesShares{ value: 2 ether }();
        market2.buyNoShares{ value: 2 ether }();
        vm.stopPrank();

        // Bob bets NO on market1, YES on market2
        vm.startPrank(bob);
        market1.buyNoShares{ value: 1 ether }();
        market2.buyYesShares{ value: 1 ether }();
        vm.stopPrank();

        // Expire and resolve both
        skip(14 days + 1);
        _resolveOracle(id1, IOracle.Outcome.YES);
        _resolveOracle(id2, IOracle.Outcome.NO);
        market1.resolveMarket();
        market2.resolveMarket();

        // Alice wins market1 (YES wins)
        vm.prank(alice);
        uint256 r1 = market1.claimReward();
        assertGt(r1, 0);

        // Alice wins market2 (NO wins)
        vm.prank(alice);
        uint256 r2 = market2.claimReward();
        assertGt(r2, 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRESS: MANY BETTORS
    // ─────────────────────────────────────────────────────────────────────────

    function test_manyBettors_allClaim() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) =
            factory.createMarket("Many bettors?", "General", block.timestamp + 7 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        // Create 10 YES bettors
        address[] memory yes_bettors = new address[](5);
        address[] memory no_bettors = new address[](5);

        for (uint256 i = 0; i < 5; i++) {
            yes_bettors[i] = makeAddr(string(abi.encodePacked("yesBettor", i)));
            no_bettors[i] = makeAddr(string(abi.encodePacked("noBettor", i)));
            vm.deal(yes_bettors[i], 10 ether);
            vm.deal(no_bettors[i], 10 ether);

            vm.prank(yes_bettors[i]);
            market.buyYesShares{ value: 1 ether }();
            vm.prank(no_bettors[i]);
            market.buyNoShares{ value: 1 ether }();
        }

        uint256 totalPool = market.totalPool();

        skip(7 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        uint256 totalClaimed = 0;
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(yes_bettors[i]);
            totalClaimed += market.claimReward();
        }

        assertApproxEqAbs(totalClaimed, totalPool, 5); // 1 wei per bettor rounding
    }
}
