// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/USDCMarketFactory.sol";
import "../src/ScalarMarketFactory.sol";
import "../src/LiquidityMining.sol";

contract DeployPhase4 is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address oracle          = 0x4cb12c69E85A280C41815805C1446b121E8c5462;
        address multiOracle     = 0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619;
        address chainlinkOracle = 0x4cb12c69E85A280C41815805C1446b121E8c5462;
        address liquidityMining = 0xAC8e774dd8218D716F455AB7872E7c0843985981;

        vm.startBroadcast(deployerKey);

        // Deploy USDC Market Factory
        USDCMarketFactory usdcFactory = new USDCMarketFactory(
            oracle, deployer, 200, deployer
        );
        usdcFactory.setLiquidityMining(liquidityMining);
        LiquidityMining(liquidityMining).setAuthorizedCaller(address(usdcFactory), true);
        console.log("USDCMarketFactory:", address(usdcFactory));

        // Deploy Scalar Market Factory
        ScalarMarketFactory scalarFactory = new ScalarMarketFactory(
            multiOracle, chainlinkOracle, deployer, 200, deployer
        );
        scalarFactory.setLiquidityMining(liquidityMining);
        LiquidityMining(liquidityMining).setAuthorizedCaller(address(scalarFactory), true);
        console.log("ScalarMarketFactory:", address(scalarFactory));

        vm.stopBroadcast();

        console.log("\n=== PHASE 4 DEPLOYMENT ===");
        console.log("USDCMarketFactory:  ", address(usdcFactory));
        console.log("ScalarMarketFactory:", address(scalarFactory));
    }
}
