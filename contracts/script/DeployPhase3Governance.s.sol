// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PREDStaking.sol";
import "../src/Governance.sol";
import "../src/PREDToken.sol";

contract DeployPhase3 is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address predToken = 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49;

        vm.startBroadcast(deployerKey);

        PREDStaking staking = new PREDStaking(predToken, deployer);
        console.log("PREDStaking:", address(staking));

        Governance governance = new Governance(address(staking), deployer);
        console.log("Governance:", address(governance));

        vm.stopBroadcast();

        console.log("\n=== PHASE 3 DEPLOYMENT ===");
        console.log("PREDStaking: ", address(staking));
        console.log("Governance:  ", address(governance));
    }
}
