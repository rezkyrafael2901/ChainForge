// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Placeholder.sol";

/**
 * @title DeployPlaceholder
 * @notice Example deploy script. Replace with generated deploy scripts.
 */
contract DeployPlaceholder is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        Placeholder placeholder = new Placeholder();
        
        console.log("Placeholder deployed at:", address(placeholder));
        
        vm.stopBroadcast();
    }
}
