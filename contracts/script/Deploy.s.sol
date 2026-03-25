// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { MarketFactory } from "../src/MarketFactory.sol";
import { MockOracle } from "../src/mocks/MockOracle.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address feeCollector = vm.envOr("FEE_COLLECTOR", deployer);
        uint256 feeBps = vm.envOr("FEE_BPS", uint256(200)); // default 2%

        vm.startBroadcast(deployerKey);

        // Deploy MockOracle (replace with Chainlink oracle on mainnet)
        MockOracle oracle = new MockOracle(deployer);
        console2.log("MockOracle:", address(oracle));

        // Deploy Factory
        MarketFactory factory = new MarketFactory(
            address(oracle),
            feeCollector,
            feeBps,
            deployer
        );
        console2.log("MarketFactory:", address(factory));

        // Seed with a demo market
        (address market, bytes32 marketId) = factory.createMarket(
            "Will ETH reach $10,000 before Jan 1, 2026?",
            "Crypto",
            block.timestamp + 30 days
        );
        console2.log("Demo Market:", market);
        console2.log("Market ID:", vm.toString(marketId));

        vm.stopBroadcast();
    }
}
