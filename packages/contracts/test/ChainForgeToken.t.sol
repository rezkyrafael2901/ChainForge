// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/tokens/ChainForgeToken.sol";

contract ChainForgeTokenTest is Test {
    ChainForgeToken public token;

    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    string constant NAME = "ChainForge Token";
    string constant SYMBOL = "CFT";
    uint8 constant DECIMALS = 18;
    uint256 constant INITIAL_SUPPLY = 1_000_000 * 1e18;
    uint256 constant MAX_SUPPLY = 10_000_000 * 1e18;

    function setUp() public {
        vm.prank(owner);
        token = new ChainForgeToken(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, MAX_SUPPLY, owner);
    }

    // ──────────────────────────────────────────────
    //  Deployment tests
    // ──────────────────────────────────────────────
    function test_deployment() public view {
        assertEq(token.name(), NAME);
        assertEq(token.symbol(), SYMBOL);
        assertEq(token.decimals(), DECIMALS);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(token.maxSupply(), MAX_SUPPLY);
        assertEq(token.owner(), owner);
    }

    function test_deployment_zero_initial_supply() public {
        ChainForgeToken t = new ChainForgeToken(NAME, SYMBOL, DECIMALS, 0, MAX_SUPPLY, owner);
        assertEq(t.totalSupply(), 0);
    }

    function test_deployment_no_max_supply_cap() public {
        ChainForgeToken t = new ChainForgeToken(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, 0, owner);
        assertEq(t.maxSupply(), 0);
    }

    function test_revert_initial_supply_exceeds_cap() public {
        vm.expectRevert("ChainForgeToken: initial supply exceeds cap");
        new ChainForgeToken(NAME, SYMBOL, DECIMALS, 100e18, 50e18, owner);
    }

    function test_revert_decimals_over_18() public {
        vm.expectRevert("ChainForgeToken: decimals > 18");
        new ChainForgeToken(NAME, SYMBOL, 19, INITIAL_SUPPLY, MAX_SUPPLY, owner);
    }

    // ──────────────────────────────────────────────
    //  Minting tests
    // ──────────────────────────────────────────────
    function test_mint() public {
        uint256 mintAmount = 1000 * 1e18;

        vm.prank(owner);
        token.mint(alice, mintAmount);

        assertEq(token.balanceOf(alice), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }

    function test_mint_up_to_max_supply() public {
        uint256 remaining = MAX_SUPPLY - INITIAL_SUPPLY;

        vm.prank(owner);
        token.mint(alice, remaining);

        assertEq(token.totalSupply(), MAX_SUPPLY);
    }

    function test_revert_mint_exceeds_max_supply() public {
        uint256 overAmount = MAX_SUPPLY - INITIAL_SUPPLY + 1;

        vm.prank(owner);
        vm.expectRevert("ChainForgeToken: would exceed max supply");
        token.mint(alice, overAmount);
    }

    function test_revert_mint_not_owner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice));
        token.mint(alice, 100e18);
    }

    // ──────────────────────────────────────────────
    //  Burning tests
    // ──────────────────────────────────────────────
    function test_burn() public {
        uint256 burnAmount = 500 * 1e18;

        vm.prank(owner);
        token.burn(burnAmount);

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - burnAmount);
    }

    function test_burn_from_with_allowance() public {
        uint256 allowance_ = 200 * 1e18;

        vm.prank(owner);
        token.approve(alice, allowance_);

        vm.prank(alice);
        token.burnFrom(owner, allowance_);

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - allowance_);
    }

    function test_revert_burn_more_than_balance() public {
        uint256 tooMuch = INITIAL_SUPPLY + 1;

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("ERC20InsufficientBalance(address,uint256,uint256)", owner, INITIAL_SUPPLY, tooMuch));
        token.burn(tooMuch);
    }

    // ──────────────────────────────────────────────
    //  Pause / Unpause tests
    // ──────────────────────────────────────────────
    function test_pause_and_unpause() public {
        // Transfer some tokens to alice first
        vm.prank(owner);
        token.transfer(alice, 1000 * 1e18);

        // Pause
        vm.prank(owner);
        token.pause();

        // Transfers should revert when paused
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        token.transfer(bob, 100 * 1e18);

        // Unpause
        vm.prank(owner);
        token.unpause();

        // Should work now
        vm.prank(alice);
        token.transfer(bob, 100 * 1e18);
        assertEq(token.balanceOf(bob), 100 * 1e18);
    }

    function test_revert_pause_not_owner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice));
        token.pause();
    }

    function test_revert_unpause_not_owner() public {
        vm.prank(owner);
        token.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice));
        token.unpause();
    }

    // ──────────────────────────────────────────────
    //  Max supply management
    // ──────────────────────────────────────────────
    function test_set_max_supply() public {
        uint256 newCap = 20_000_000 * 1e18;

        vm.prank(owner);
        token.setMaxSupply(newCap);

        assertEq(token.maxSupply(), newCap);
    }

    function test_set_max_supply_zero_removes_cap() public {
        vm.prank(owner);
        token.setMaxSupply(0);

        assertEq(token.maxSupply(), 0);
    }

    function test_revert_set_max_supply_below_total_supply() public {
        vm.prank(owner);
        vm.expectRevert("ChainForgeToken: cap below current supply");
        token.setMaxSupply(INITIAL_SUPPLY - 1);
    }

    function test_revert_set_max_supply_not_owner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice));
        token.setMaxSupply(20_000_000 * 1e18);
    }

    // ──────────────────────────────────────────────
    //  Access control summary
    // ──────────────────────────────────────────────
    function test_only_owner_can_mint() public {
        address[] memory callers = new address[](3);
        callers[0] = alice;
        callers[1] = bob;
        callers[2] = address(0xdead);

        for (uint256 i = 0; i < callers.length; i++) {
            vm.prank(callers[i]);
            vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", callers[i]));
            token.mint(callers[i], 1e18);
        }
    }

    // ──────────────────────────────────────────────
    //  Fuzz tests
    // ──────────────────────────────────────────────
    function testFuzz_mint_within_cap(uint256 amount) public {
        amount = bound(amount, 1, MAX_SUPPLY - INITIAL_SUPPLY);

        vm.prank(owner);
        token.mint(alice, amount);

        assertEq(token.balanceOf(alice), amount);
        assertLe(token.totalSupply(), MAX_SUPPLY);
    }
}
