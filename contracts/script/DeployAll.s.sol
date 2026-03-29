// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PREDToken.sol";
import "../src/LiquidityMining.sol";
import "../src/ReferralSystem.sol";
import "../src/ChainlinkOracle.sol";
import "../src/MarketFactory.sol";
import "../src/mocks/MockOracle.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Existing Phase 3 addresses
        address predToken      = 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49;
        address liquidityMining = 0xAC8e774dd8218D716F455AB7872E7c0843985981;
        address referralSystem  = 0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A;
        address chainlinkOracle = 0x4cb12c69E85A280C41815805C1446b121E8c5462;

        vm.startBroadcast(deployerKey);

        // Deploy new MarketFactory with Phase 3 support
        MarketFactory factory = new MarketFactory(
            chainlinkOracle,  // _oracle
            deployer,         // _feeCollector
            200,              // _feeBps
            deployer          // _owner
        );
        console.log("New MarketFactory:", address(factory));

        // Wire LiquidityMining + Referral into factory
        factory.setLiquidityMining(liquidityMining);
        factory.setReferralSystem(referralSystem);
        console.log("LiquidityMining wired to factory");

        // Authorize factory to call LiquidityMining
        LiquidityMining(liquidityMining).setAuthorizedCaller(address(factory), true);
        console.log("Factory authorized in LiquidityMining");

        // Authorize factory to call ReferralSystem
        ReferralSystem(payable(referralSystem)).setAuthorizedCaller(address(factory), true);
        console.log("Factory authorized in ReferralSystem");

        vm.stopBroadcast();

        console.log("\n=== NEW ADDRESSES ===");
        console.log("MarketFactory:", address(factory));
        console.log("ChainlinkOracle:", chainlinkOracle);
        console.log("PREDToken:", predToken);
        console.log("LiquidityMining:", liquidityMining);
        console.log("ReferralSystem:", referralSystem);
    }
}
