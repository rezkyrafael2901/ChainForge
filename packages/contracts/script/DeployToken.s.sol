// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/tokens/ChainForgeToken.sol";

/**
 * @title DeployToken
 * @notice Foundry deploy script for ChainForgeToken.
 * @dev Reads configuration from environment variables:
 *      TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_INITIAL_SUPPLY,
 *      TOKEN_MAX_SUPPLY, TOKEN_OWNER (optional, defaults to deployer)
 *
 *      Usage:
 *        PRIVATE_KEY=0x... forge script DeployToken --broadcast --verify --rpc-url sepolia
 */
contract DeployToken is Script {
    function run() external {
        // ── Read env vars ──────────────────────────
        string memory name = vm.envOr("TOKEN_NAME", string("ChainForge Token"));
        string memory symbol = vm.envOr("TOKEN_SYMBOL", string("CFT"));
        uint8 decimals = uint8(vm.envOr("TOKEN_DECIMALS", uint256(18)));
        uint256 initialSupply = vm.envOr("TOKEN_INITIAL_SUPPLY", uint256(1_000_000_000 * 1e18));
        uint256 maxSupply = vm.envOr("TOKEN_MAX_SUPPLY", uint256(0));
        address tokenOwner = vm.envOr("TOKEN_OWNER", vm.addr(vm.envUint("PRIVATE_KEY")));

        // ── Broadcast deploy ──────────────────────
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("Deploying ChainForgeToken...");
        console.log("  Name:          ", name);
        console.log("  Symbol:        ", symbol);
        console.log("  Decimals:      ", decimals);
        console.log("  Initial Supply:", initialSupply);
        console.log("  Max Supply:    ", maxSupply);
        console.log("  Owner:         ", tokenOwner);

        vm.startBroadcast(deployerPrivateKey);

        ChainForgeToken token = new ChainForgeToken(
            name,
            symbol,
            decimals,
            initialSupply,
            maxSupply,
            tokenOwner
        );

        vm.stopBroadcast();

        // ── Log results ──────────────────────────
        console.log("----------------------------------------");
        console.log("ChainForgeToken deployed at:", address(token));
        console.log("----------------------------------------");

        // Note: To verify on Etherscan, run with --verify flag:
        //   forge script DeployToken --broadcast --verify --rpc-url sepolia
        if (block.chainid != 31337) {
            console.log("Run with --verify flag to verify on Etherscan.");
            console.log("Or manually: forge verify-contract", address(token), "ChainForgeToken");
        }
    }
}
