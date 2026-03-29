// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PREDToken.sol";
import "../src/LiquidityMining.sol";
import "../src/ReferralSystem.sol";
import "../src/ChainlinkOracle.sol";

contract DeployPhase3 is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        vm.startBroadcast(deployerKey);

        // 1. Deploy PRED Token
        PREDToken pred = new PREDToken(deployer);
        console.log("PREDToken:", address(pred));

        // 2. Deploy Liquidity Mining
        LiquidityMining mining = new LiquidityMining(address(pred), deployer);
        console.log("LiquidityMining:", address(mining));

        // 3. Set mining contract as PRED minter
        pred.setMinter(address(mining));
        console.log("Minter set to LiquidityMining");

        // 4. Deploy Referral System
        ReferralSystem referral = new ReferralSystem(deployer);
        console.log("ReferralSystem:", address(referral));

        // 5. Deploy Chainlink Oracle
        ChainlinkOracle oracle = new ChainlinkOracle(deployer);
        console.log("ChainlinkOracle:", address(oracle));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("PRED Token:        ", address(pred));
        console.log("Liquidity Mining:  ", address(mining));
        console.log("Referral System:   ", address(referral));
        console.log("Chainlink Oracle:  ", address(oracle));
    }
}
