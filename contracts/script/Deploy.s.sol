// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { MarketFactory } from "../src/MarketFactory.sol";
import { MockOracle } from "../src/mocks/MockOracle.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Default fee collector to deployer if env var is missing or set to zero address
        address feeCollector = vm.envOr("FEE_COLLECTOR", deployer);
        if (feeCollector == address(0)) feeCollector = deployer;
        uint256 feeBps = vm.envOr("FEE_BPS", uint256(200)); // default 2%

        require(deployer != address(0), "Invalid deployer");
        require(feeBps <= 500, "FEE_BPS exceeds 5%");

        console2.log("Deployer:     ", deployer);
        console2.log("Fee Collector:", feeCollector);
        console2.log("Fee BPS:      ", feeBps);

        vm.startBroadcast(deployerKey);

        // 1. Deploy MockOracle (replace with Chainlink oracle on mainnet)
        MockOracle oracle = new MockOracle(deployer);
        console2.log("MockOracle:   ", address(oracle));

        // 2. Deploy Factory
        MarketFactory factory = new MarketFactory(
            address(oracle),
            feeCollector,
            feeBps,
            deployer
        );
        console2.log("MarketFactory:", address(factory));

        // 3. Seed with a demo market
        (address market, bytes32 marketId) = factory.createMarket(
            "Will ETH reach $10,000 before Jan 1, 2026?",
            "Crypto",
            block.timestamp + 30 days
        );
        console2.log("Demo Market:  ", market);
        console2.log("Market ID:    ", vm.toString(marketId));

        vm.stopBroadcast();
    }
}
