// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MultiOracle.sol";
import "../src/MultiMarketFactory.sol";
import "../src/LiquidityMining.sol";

contract DeployMulti is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address liquidityMining = 0xAC8e774dd8218D716F455AB7872E7c0843985981;

        vm.startBroadcast(deployerKey);

        MultiOracle oracle = new MultiOracle(deployer);
        console.log("MultiOracle:", address(oracle));

        MultiMarketFactory factory = new MultiMarketFactory(
            address(oracle), deployer, 200, deployer
        );
        console.log("MultiMarketFactory:", address(factory));

        factory.setLiquidityMining(liquidityMining);
        LiquidityMining(liquidityMining).setAuthorizedCaller(address(factory), true);
        console.log("LiquidityMining wired");

        vm.stopBroadcast();

        console.log("\n=== MULTI-OUTCOME DEPLOYMENT ===");
        console.log("MultiOracle:       ", address(oracle));
        console.log("MultiMarketFactory:", address(factory));
    }
}
