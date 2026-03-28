// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { BaseTest } from "./BaseTest.t.sol";
import { PredictionMarket } from "../src/PredictionMarket.sol";
import { MarketFactory } from "../src/MarketFactory.sol";
import { MockOracle } from "../src/mocks/MockOracle.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";
import { IPredictionMarket } from "../src/interfaces/IPredictionMarket.sol";

/// @notice Edge cases and gas snapshot tests
contract EdgeCaseTest is BaseTest {
    // ─── Zero-fee market ──────────────────────────────────────────────────────

    function test_zeroFee_sharesEqualDeposit() public {
        vm.prank(owner);
        factory.setFeeBps(0);

        vm.prank(alice);
        (address marketAddr,) = factory.createMarket("Zero fee?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        uint256 shares = market.buyYesShares{ value: 1 ether }();
        assertEq(shares, 1 ether);
        assertEq(market.totalFeeCollected(), 0);
        assertEq(market.totalPool(), 1 ether);
    }

    // ─── Max fee (5%) ─────────────────────────────────────────────────────────

    function test_maxFee_5percent() public {
        vm.prank(owner);
        factory.setFeeBps(500);

        vm.prank(alice);
        (address marketAddr,) = factory.createMarket("Max fee?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        assertEq(market.totalFeeCollected(), 0.05 ether);
        assertEq(market.totalPool(), 0.95 ether);
    }

    // ─── Very small amounts ───────────────────────────────────────────────────

    function test_smallAmount_1wei() public {
        vm.prank(alice);
        (address marketAddr,) = factory.createMarket("Tiny?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        // With 2% fee on 1 wei, fee = 0 (integer division), shares = 1
        vm.prank(alice);
        uint256 shares = market.buyYesShares{ value: 1 }();
        assertEq(shares, 1);
        assertEq(market.totalFeeCollected(), 0);
    }

    // ─── Only YES bets, YES wins — full pool to sole bettor ──────────────────

    function test_onlyYesBets_yesWins_claimsAll() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Solo?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        assertEq(market.totalNoShares(), 0);

        uint256 pool = market.totalPool();
        skip(1 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        uint256 reward = market.claimReward();
        assertEq(reward, pool);
    }

    // ─── Only NO bets, NO wins ────────────────────────────────────────────────

    function test_onlyNoBets_noWins_claimsAll() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Solo NO?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(bob);
        market.buyNoShares{ value: 2 ether }();
        assertEq(market.totalYesShares(), 0);

        uint256 pool = market.totalPool();
        skip(1 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.NO);
        market.resolveMarket();

        vm.prank(bob);
        uint256 reward = market.claimReward();
        assertEq(reward, pool);
    }

    // ─── INVALID outcome: both sides refunded ────────────────────────────────

    function test_invalid_equalBets_equalRefunds() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Invalid?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        vm.prank(bob);
        market.buyNoShares{ value: 1 ether }();

        skip(1 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.INVALID);
        market.resolveMarket();

        vm.prank(alice);
        uint256 r1 = market.claimReward();
        vm.prank(bob);
        uint256 r2 = market.claimReward();

        // Both had equal shares, so roughly equal refunds
        assertApproxEqAbs(r1, r2, 1);
    }

    // ─── Cannot buy after resolution ─────────────────────────────────────────

    function test_cannotBuyAfterResolve() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Post resolve?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        skip(1 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(bob);
        vm.expectRevert(IPredictionMarket.MarketAlreadyResolved.selector);
        market.buyYesShares{ value: 1 ether }();

        vm.prank(bob);
        vm.expectRevert(IPredictionMarket.MarketAlreadyResolved.selector);
        market.buyNoShares{ value: 1 ether }();
    }

    // ─── Resolution time is set on resolve ───────────────────────────────────

    function test_resolutionTimeSetOnResolve() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Time?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        assertEq(market.resolutionTime(), 0);

        skip(1 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        assertEq(market.resolutionTime(), block.timestamp);
    }

    // ─── Multiple claim attempts ──────────────────────────────────────────────

    function test_doubleClaimReverts() public {
        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Double claim?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(marketAddr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();

        skip(1 days + 1);
        _resolveOracle(marketId, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        market.claimReward();
        vm.prank(alice);
        vm.expectRevert(IPredictionMarket.AlreadyClaimed.selector);
        market.claimReward();
    }

    // ─── Market min expiration boundary ──────────────────────────────────────

    function test_createMarket_atMinExpiry() public {
        uint256 minExpiry = block.timestamp + 1 hours;
        vm.prank(alice);
        (address addr,) = factory.createMarket("Min expiry?", "General", minExpiry);
        assertTrue(addr != address(0));
    }

    function test_createMarket_belowMinExpiry_reverts() public {
        vm.prank(alice);
        vm.expectRevert();
        factory.createMarket("Below min?", "General", block.timestamp + 59 minutes);
    }

    // ─── Factory: many markets don't break getActiveMarkets ──────────────────

    function test_manyMarkets_getPagination() public {
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(alice);
            factory.createMarket(
                string(abi.encodePacked("Market ", vm.toString(i), "?")),
                "General",
                block.timestamp + 1 days
            );
        }
        assertEq(factory.getMarketCount(), 10);
        assertEq(factory.getAllMarkets().length, 10);
        assertEq(factory.getActiveMarkets().length, 10);
    }

    // ─── Deterministic market IDs differ across creators ─────────────────────

    function test_uniqueMarketIds_differentCreators() public {
        string memory sameQuestion = "Same question?";
        uint256 sameExpiry = block.timestamp + 1 days;

        vm.prank(alice);
        (, bytes32 id1) = factory.createMarket(sameQuestion, "General", sameExpiry);
        vm.warp(block.timestamp + 1); // different timestamp
        vm.prank(bob);
        (, bytes32 id2) = factory.createMarket(sameQuestion, "General", sameExpiry + 1);

        assertTrue(id1 != id2, "IDs should differ");
    }

    // ─── Gas snapshots (informational) ───────────────────────────────────────

    function test_gas_buyYesShares() public {
        vm.prank(alice);
        (address addr,) = factory.createMarket("Gas test?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(addr));

        vm.prank(alice);
        uint256 gasBefore = gasleft();
        market.buyYesShares{ value: 0.1 ether }();
        uint256 gasUsed = gasBefore - gasleft();
        emit log_named_uint("buyYesShares gas", gasUsed);
        assertTrue(gasUsed < 150_000, "buyYes uses too much gas");
    }

    function test_gas_createMarket() public {
        vm.prank(alice);
        uint256 gasBefore = gasleft();
        factory.createMarket("Gas market?", "General", block.timestamp + 1 days);
        uint256 gasUsed = gasBefore - gasleft();
        emit log_named_uint("createMarket gas", gasUsed);
        // Gas is inflated ~2x under coverage instrumentation; use a generous bound
        assertTrue(gasUsed < 5_000_000, "createMarket uses too much gas");
    }

    function test_gas_claimReward() public {
        vm.prank(alice);
        (address addr, bytes32 id) = factory.createMarket("Claim gas?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(addr));

        vm.prank(alice);
        market.buyYesShares{ value: 1 ether }();
        skip(1 days + 1);
        _resolveOracle(id, IOracle.Outcome.YES);
        market.resolveMarket();

        vm.prank(alice);
        uint256 gasBefore = gasleft();
        market.claimReward();
        uint256 gasUsed = gasBefore - gasleft();
        emit log_named_uint("claimReward gas", gasUsed);
        assertTrue(gasUsed < 80_000, "claimReward uses too much gas");
    }

    // ─── Reentrancy protection ────────────────────────────────────────────────

    function test_reentrancy_protection() public {
        // Deploy a malicious receiver that tries to re-enter claimReward
        ReentrantAttacker attacker = new ReentrantAttacker();
        vm.deal(address(attacker), 2 ether);

        vm.prank(alice);
        (address addr, bytes32 id) = factory.createMarket("Reentrant?", "General", block.timestamp + 1 days);
        PredictionMarket market = PredictionMarket(payable(addr));

        attacker.setMarket(address(market));

        // Attacker buys YES shares
        attacker.buyShares{ value: 1 ether }();

        skip(1 days + 1);
        _resolveOracle(id, IOracle.Outcome.YES);
        market.resolveMarket();

        // Reentrancy attack should fail
        vm.expectRevert();
        attacker.attack();
    }
}

/// @notice Malicious contract that tries to re-enter claimReward
contract ReentrantAttacker {
    PredictionMarket public market;
    bool public attacking;

    function setMarket(address _market) external {
        market = PredictionMarket(payable(_market));
    }

    function buyShares() external payable {
        market.buyYesShares{ value: msg.value }();
    }

    function attack() external {
        attacking = true;
        market.claimReward();
    }

    receive() external payable {
        // Always attempt re-entry — hasClaimed is already true so inner call
        // gets AlreadyClaimed() revert, which causes the ETH transfer to fail,
        // which causes the outer claimReward to revert with TransferFailed().
        if (attacking) {
            attacking = false; // prevent infinite loop
            market.claimReward();
        }
    }
}
