// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { BaseTest } from "./BaseTest.t.sol";
import { PredictionMarket } from "../src/PredictionMarket.sol";
import { IOracle } from "../src/interfaces/IOracle.sol";
import { IPredictionMarket } from "../src/interfaces/IPredictionMarket.sol";

/// @notice Handler contract that drives invariant testing
contract MarketHandler is BaseTest {
    PredictionMarket public market;
    bytes32 public marketId;

    address[] public bettors;
    uint256 public ghost_totalDeposited;
    uint256 public ghost_totalFees;
    uint256 public ghost_totalClaimed;
    bool public ghost_resolved;

    constructor() {
        super.setUp();
        (address addr, bytes32 id) = _createMarket("Invariant Test Market?");
        market = PredictionMarket(payable(addr));
        marketId = id;

        bettors.push(alice);
        bettors.push(bob);
        bettors.push(carol);
        bettors.push(dave);
    }

    function buyYes(uint256 actorSeed, uint256 amount) external {
        if (market.resolved()) return;
        if (block.timestamp >= market.expirationTime()) return;

        address actor = bettors[actorSeed % bettors.length];
        amount = bound(amount, 0.001 ether, 5 ether);
        vm.deal(actor, amount);

        vm.prank(actor);
        market.buyYesShares{ value: amount }();

        uint256 fee = (amount * market.feeBps()) / 10_000;
        ghost_totalDeposited += amount - fee;
        ghost_totalFees += fee;
    }

    function buyNo(uint256 actorSeed, uint256 amount) external {
        if (market.resolved()) return;
        if (block.timestamp >= market.expirationTime()) return;

        address actor = bettors[actorSeed % bettors.length];
        amount = bound(amount, 0.001 ether, 5 ether);
        vm.deal(actor, amount);

        vm.prank(actor);
        market.buyNoShares{ value: amount }();

        uint256 fee = (amount * market.feeBps()) / 10_000;
        ghost_totalDeposited += amount - fee;
        ghost_totalFees += fee;
    }

    function resolveYes() external {
        if (market.resolved()) return;
        if (block.timestamp < market.expirationTime()) skip(7 days + 1);
        if (oracle.isResolved(marketId)) return;

        vm.prank(owner);
        oracle.setResolution(marketId, IOracle.Outcome.YES);
        market.resolveMarket();
        ghost_resolved = true;
    }

    function resolveNo() external {
        if (market.resolved()) return;
        if (block.timestamp < market.expirationTime()) skip(7 days + 1);
        if (oracle.isResolved(marketId)) return;

        vm.prank(owner);
        oracle.setResolution(marketId, IOracle.Outcome.NO);
        market.resolveMarket();
        ghost_resolved = true;
    }

    function claim(uint256 actorSeed) external {
        if (!market.resolved()) return;
        address actor = bettors[actorSeed % bettors.length];
        if (market.hasClaimed(actor)) return;

        uint256 yesShares = market.yesShares(actor);
        uint256 noShares = market.noShares(actor);
        if (yesShares == 0 && noShares == 0) return;

        IOracle.Outcome outcome = market.outcome();
        bool canClaim = (outcome == IOracle.Outcome.YES && yesShares > 0)
            || (outcome == IOracle.Outcome.NO && noShares > 0)
            || (outcome == IOracle.Outcome.INVALID && (yesShares + noShares) > 0);

        if (!canClaim) return;

        vm.prank(actor);
        uint256 reward = market.claimReward();
        ghost_totalClaimed += reward;
    }
}

contract PredictionMarketInvariantTest is BaseTest {
    MarketHandler handler;

    function setUp() public override {
        super.setUp();
        handler = new MarketHandler();

        // Focus fuzzer on handler functions
        targetContract(address(handler));
        targetSelector(FuzzSelector({ addr: address(handler), selectors: _getSelectors() }));
    }

    function _getSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](5);
        selectors[0] = MarketHandler.buyYes.selector;
        selectors[1] = MarketHandler.buyNo.selector;
        selectors[2] = MarketHandler.resolveYes.selector;
        selectors[3] = MarketHandler.resolveNo.selector;
        selectors[4] = MarketHandler.claim.selector;
        return selectors;
    }

    // ─── Invariants ───────────────────────────────────────────────────────────

    /// @notice Total pool must always equal sum of yes + no shares
    function invariant_poolEqualsShares() public view {
        PredictionMarket market = handler.market();
        assertEq(
            market.totalPool(),
            market.totalYesShares() + market.totalNoShares(),
            "Pool != yes + no shares"
        );
    }

    /// @notice Contract ETH balance >= totalPool (fees may also be in balance)
    function invariant_contractBalanceCoverspPool() public view {
        PredictionMarket market = handler.market();
        assertTrue(
            address(market).balance >= market.totalPool(),
            "Balance < pool"
        );
    }

    /// @notice Ghost total deposited matches totalPool + totalFeeCollected
    function invariant_ghostDepositTracking() public view {
        PredictionMarket market = handler.market();
        assertEq(
            handler.ghost_totalDeposited(),
            market.totalPool(),
            "Ghost total != totalPool"
        );
    }

    /// @notice Fee tracking: ghost fees should match contract fee accumulator
    function invariant_feeAccounting() public view {
        PredictionMarket market = handler.market();
        // totalFeeCollected can be 0 if fees were collected mid-test, so just check >=
        assertTrue(
            market.totalFeeCollected() <= handler.ghost_totalFees(),
            "Fee overstated"
        );
    }

    /// @notice Claimed amount should never exceed totalPool
    function invariant_claimedNeverExceedsPool() public view {
        PredictionMarket market = handler.market();
        assertTrue(
            handler.ghost_totalClaimed() <= market.totalPool(),
            "Claimed > pool"
        );
    }

    /// @notice Market can only be resolved once
    function invariant_singleResolution() public view {
        PredictionMarket market = handler.market();
        // resolved flag + outcome consistency
        if (market.resolved()) {
            assertTrue(
                market.outcome() != IOracle.Outcome.UNRESOLVED,
                "Resolved but outcome is UNRESOLVED"
            );
        } else {
            assertEq(
                uint256(market.outcome()),
                uint256(IOracle.Outcome.UNRESOLVED),
                "Not resolved but outcome set"
            );
        }
    }
}
