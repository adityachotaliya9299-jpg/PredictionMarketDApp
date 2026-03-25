// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { BaseTest } from "./BaseTest.t.sol";
import { MarketFactory } from "../src/MarketFactory.sol";
import { PredictionMarket } from "../src/PredictionMarket.sol";
import { MockOracle } from "../src/mocks/MockOracle.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";
import { IMarketFactory } from "../src/interfaces/IMarketFactory.sol";

contract MarketFactoryTest is BaseTest {
    // ─────────────────────────────────────────────────────────────────────────
    // DEPLOYMENT
    // ─────────────────────────────────────────────────────────────────────────

    function test_deployment_stateIsCorrect() public view {
        assertEq(factory.oracle(), address(oracle));
        assertEq(factory.feeCollector(), feeCollector);
        assertEq(factory.feeBps(), FEE_BPS);
        assertEq(factory.owner(), owner);
        assertEq(factory.getMarketCount(), 0);
    }

    function test_deployment_reverts_invalidOracle() public {
        vm.expectRevert(IMarketFactory.InvalidOracle.selector);
        new MarketFactory(address(0), feeCollector, FEE_BPS, owner);
    }

    function test_deployment_reverts_invalidFeeCollector() public {
        vm.expectRevert(IMarketFactory.InvalidOracle.selector); // reuses same error
        new MarketFactory(address(oracle), address(0), FEE_BPS, owner);
    }

    function test_deployment_reverts_feeTooHigh() public {
        vm.expectRevert(IMarketFactory.InvalidFee.selector);
        new MarketFactory(address(oracle), feeCollector, 600, owner);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE MARKET
    // ─────────────────────────────────────────────────────────────────────────

    function test_createMarket_success() public {
        string memory question = "Will BTC reach $100k?";
        uint256 expiry = block.timestamp + 30 days;

        vm.prank(alice);
        vm.expectEmit(false, false, true, true);
        emit IMarketFactory.MarketCreated(bytes32(0), address(0), alice, question, expiry);
        (address marketAddr, bytes32 marketId) = factory.createMarket(question, "Crypto", expiry);

        assertTrue(marketAddr != address(0));
        assertTrue(marketId != bytes32(0));
        assertEq(factory.getMarketCount(), 1);
    }

    function test_createMarket_deploysPredictionMarket() public {
        vm.prank(alice);
        (address marketAddr,) = factory.createMarket("Test?", "General", block.timestamp + 1 days);

        PredictionMarket market = PredictionMarket(payable(marketAddr));
        assertEq(market.question(), "Test?");
        assertEq(address(market.oracle()), address(oracle));
    }

    function test_createMarket_storesMetadata() public {
        string memory question = "Will ETH flip BTC?";
        uint256 expiry = block.timestamp + 14 days;

        vm.prank(alice);
        (, bytes32 marketId) = factory.createMarket(question, "DeFi", expiry);

        IMarketFactory.MarketMetadata memory meta = factory.getMarket(marketId);
        assertEq(meta.question, question);
        assertEq(meta.category, "DeFi");
        assertEq(meta.creator, alice);
        assertEq(meta.expirationTime, expiry);
        assertTrue(meta.active);
    }

    function test_createMarket_multipleMarkets() public {
        vm.startPrank(alice);
        factory.createMarket("Q1?", "Cat1", block.timestamp + 1 days);
        factory.createMarket("Q2?", "Cat2", block.timestamp + 2 days);
        factory.createMarket("Q3?", "Cat3", block.timestamp + 3 days);
        vm.stopPrank();

        assertEq(factory.getMarketCount(), 3);
        assertEq(factory.getAllMarkets().length, 3);
    }

    function test_createMarket_tracksCreator() public {
        vm.prank(alice);
        factory.createMarket("Alice Q1?", "General", block.timestamp + 1 days);
        vm.prank(alice);
        factory.createMarket("Alice Q2?", "General", block.timestamp + 2 days);
        vm.prank(bob);
        factory.createMarket("Bob Q1?", "General", block.timestamp + 1 days);

        IMarketFactory.MarketMetadata[] memory aliceMarkets = factory.getMarketsByCreator(alice);
        IMarketFactory.MarketMetadata[] memory bobMarkets = factory.getMarketsByCreator(bob);

        assertEq(aliceMarkets.length, 2);
        assertEq(bobMarkets.length, 1);
    }

    function test_createMarket_reverts_emptyQuestion() public {
        vm.prank(alice);
        vm.expectRevert(IMarketFactory.InvalidQuestion.selector);
        factory.createMarket("", "General", block.timestamp + 1 days);
    }

    function test_createMarket_reverts_expirationTooSoon() public {
        vm.prank(alice);
        vm.expectRevert(IMarketFactory.InvalidExpiration.selector);
        factory.createMarket("Q?", "General", block.timestamp + 30 minutes); // < 1 hour
    }

    function test_createMarket_reverts_expirationTooFar() public {
        vm.prank(alice);
        vm.expectRevert(IMarketFactory.InvalidExpiration.selector);
        factory.createMarket("Q?", "General", block.timestamp + 366 days); // > 365 days
    }

    function test_createMarket_reverts_whenPaused() public {
        vm.prank(owner);
        factory.pause();

        vm.prank(alice);
        vm.expectRevert();
        factory.createMarket("Q?", "General", block.timestamp + 1 days);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET MARKETS
    // ─────────────────────────────────────────────────────────────────────────

    function test_getMarket_reverts_notFound() public {
        vm.expectRevert(IMarketFactory.MarketNotFound.selector);
        factory.getMarket(bytes32(uint256(999)));
    }

    function test_getActiveMarkets_filtersInactive() public {
        vm.prank(alice);
        (, bytes32 id1) = factory.createMarket("Q1?", "General", block.timestamp + 1 days);
        vm.prank(alice);
        (, bytes32 id2) = factory.createMarket("Q2?", "General", block.timestamp + 2 days);

        vm.prank(owner);
        factory.deactivateMarket(id1);

        IMarketFactory.MarketMetadata[] memory active = factory.getActiveMarkets();
        assertEq(active.length, 1);
        assertEq(active[0].marketId, id2);
    }

    function test_getAllMarkets_returnsAll() public {
        vm.prank(alice);
        factory.createMarket("Q1?", "General", block.timestamp + 1 days);
        vm.prank(bob);
        factory.createMarket("Q2?", "General", block.timestamp + 2 days);

        IMarketFactory.MarketMetadata[] memory all = factory.getAllMarkets();
        assertEq(all.length, 2);
    }

    function test_getMarketsByCreator_emptyForUnknown() public view {
        IMarketFactory.MarketMetadata[] memory markets = factory.getMarketsByCreator(carol);
        assertEq(markets.length, 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: ORACLE
    // ─────────────────────────────────────────────────────────────────────────

    function test_setOracle_success() public {
        address newOracle = makeAddr("newOracle");
        address oldOracle = factory.oracle();

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IMarketFactory.OracleUpdated(oldOracle, newOracle);
        factory.setOracle(newOracle);

        assertEq(factory.oracle(), newOracle);
    }

    function test_setOracle_reverts_invalidAddress() public {
        vm.prank(owner);
        vm.expectRevert(IMarketFactory.InvalidOracle.selector);
        factory.setOracle(address(0));
    }

    function test_setOracle_reverts_notOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        factory.setOracle(makeAddr("newOracle"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: FEE
    // ─────────────────────────────────────────────────────────────────────────

    function test_setFeeBps_success() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IMarketFactory.ProtocolFeeUpdated(FEE_BPS, 300);
        factory.setFeeBps(300);

        assertEq(factory.feeBps(), 300);
    }

    function test_setFeeBps_zero() public {
        vm.prank(owner);
        factory.setFeeBps(0);
        assertEq(factory.feeBps(), 0);
    }

    function test_setFeeBps_reverts_tooHigh() public {
        vm.prank(owner);
        vm.expectRevert(IMarketFactory.InvalidFee.selector);
        factory.setFeeBps(501);
    }

    function test_setFeeBps_reverts_notOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        factory.setFeeBps(100);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: FEE COLLECTOR
    // ─────────────────────────────────────────────────────────────────────────

    function test_setFeeCollector_success() public {
        address newCollector = makeAddr("newCollector");

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IMarketFactory.FeeCollectorUpdated(feeCollector, newCollector);
        factory.setFeeCollector(newCollector);

        assertEq(factory.feeCollector(), newCollector);
    }

    function test_setFeeCollector_reverts_invalidAddress() public {
        vm.prank(owner);
        vm.expectRevert(IMarketFactory.InvalidOracle.selector);
        factory.setFeeCollector(address(0));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: PAUSE FACTORY
    // ─────────────────────────────────────────────────────────────────────────

    function test_pauseFactory_success() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IMarketFactory.FactoryPaused(true);
        factory.pause();

        assertTrue(factory.paused());
    }

    function test_unpauseFactory_success() public {
        vm.prank(owner);
        factory.pause();

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit IMarketFactory.FactoryPaused(false);
        factory.unpause();

        assertFalse(factory.paused());
    }

    function test_pauseFactory_reverts_notOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        factory.pause();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: PAUSE MARKET
    // ─────────────────────────────────────────────────────────────────────────

    function test_pauseMarket_success() public {
        vm.prank(alice);
        (, bytes32 marketId) = factory.createMarket("Q?", "General", block.timestamp + 1 days);
        IMarketFactory.MarketMetadata memory meta = factory.getMarket(marketId);
        PredictionMarket market = PredictionMarket(payable(meta.marketAddress));

        vm.prank(owner);
        factory.pauseMarket(marketId);

        assertTrue(market.paused());
    }

    function test_unpauseMarket_success() public {
        vm.prank(alice);
        (, bytes32 marketId) = factory.createMarket("Q?", "General", block.timestamp + 1 days);
        IMarketFactory.MarketMetadata memory meta = factory.getMarket(marketId);
        PredictionMarket market = PredictionMarket(payable(meta.marketAddress));

        vm.prank(owner);
        factory.pauseMarket(marketId);
        vm.prank(owner);
        factory.unpauseMarket(marketId);

        assertFalse(market.paused());
    }

    function test_pauseMarket_reverts_notFound() public {
        vm.prank(owner);
        vm.expectRevert(IMarketFactory.MarketNotFound.selector);
        factory.pauseMarket(bytes32(uint256(999)));
    }

    function test_unpauseMarket_reverts_notFound() public {
        vm.prank(owner);
        vm.expectRevert(IMarketFactory.MarketNotFound.selector);
        factory.unpauseMarket(bytes32(uint256(999)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: DEACTIVATE MARKET
    // ─────────────────────────────────────────────────────────────────────────

    function test_deactivateMarket_success() public {
        vm.prank(alice);
        (, bytes32 marketId) = factory.createMarket("Q?", "General", block.timestamp + 1 days);

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit IMarketFactory.MarketDeactivated(marketId);
        factory.deactivateMarket(marketId);

        IMarketFactory.MarketMetadata memory meta = factory.getMarket(marketId);
        assertFalse(meta.active);
    }

    function test_deactivateMarket_reverts_notFound() public {
        vm.prank(owner);
        vm.expectRevert(IMarketFactory.MarketNotFound.selector);
        factory.deactivateMarket(bytes32(uint256(999)));
    }

    function test_deactivateMarket_reverts_notOwner() public {
        vm.prank(alice);
        (, bytes32 marketId) = factory.createMarket("Q?", "General", block.timestamp + 1 days);

        vm.prank(alice);
        vm.expectRevert();
        factory.deactivateMarket(marketId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FUZZ
    // ─────────────────────────────────────────────────────────────────────────

    function testFuzz_createMarket_validExpiry(uint256 offset) public {
        offset = bound(offset, 1 hours, 365 days);
        uint256 expiry = block.timestamp + offset;

        vm.prank(alice);
        (address marketAddr, bytes32 marketId) = factory.createMarket("Fuzz Q?", "General", expiry);

        assertTrue(marketAddr != address(0));
        assertTrue(marketId != bytes32(0));
    }

    function testFuzz_setFeeBps_withinBounds(uint256 fee) public {
        fee = bound(fee, 0, 500);

        vm.prank(owner);
        factory.setFeeBps(fee);
        assertEq(factory.feeBps(), fee);
    }
}
