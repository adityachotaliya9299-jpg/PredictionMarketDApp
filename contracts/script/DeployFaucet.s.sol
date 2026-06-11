// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PREDFaucet.sol";
import "../src/PREDToken.sol";

contract DeployFaucet is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address predToken = 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49;

        vm.startBroadcast(deployerKey);

        PREDFaucet faucet = new PREDFaucet(predToken, deployer);
        console.log("PREDFaucet:", address(faucet));

        // Deposit 10,000 PRED into faucet (100 users * 100 PRED)
        PREDToken(predToken).approve(address(faucet), 10000 * 1e18);
        faucet.deposit(10000 * 1e18);
        console.log("Deposited 10,000 PRED into faucet");

        vm.stopBroadcast();
    }
}
