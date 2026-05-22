// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainForgeToken
 * @notice A parameterized ERC-20 token with minting, burning, pausing, and optional snapshot capabilities.
 * @dev Uses OpenZeppelin v5 patterns. Owner can mint up to the max supply cap (if set).
 */
contract ChainForgeToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, Ownable {
    uint8 private immutable _tokenDecimals;
    uint256 public maxSupply; // 0 means no cap

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event MaxSupplyUpdated(uint256 oldMaxSupply, uint256 newMaxSupply);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    /**
     * @param name_          Token name
     * @param symbol_        Token symbol
     * @param decimals_      Token decimals (usually 18)
     * @param initialSupply  Amount minted to owner at deployment (in base units)
     * @param maxSupplyCap_  Maximum total supply (0 = unlimited)
     * @param owner_         Initial owner address
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 maxSupplyCap_,
        address owner_
    ) ERC20(name_, symbol_) ERC20Permit(name_) Ownable(owner_) {
        require(decimals_ <= 18, "ChainForgeToken: decimals > 18");
        if (maxSupplyCap_ > 0) {
            require(initialSupply <= maxSupplyCap_, "ChainForgeToken: initial supply exceeds cap");
        }
        _tokenDecimals = decimals_;
        maxSupply = maxSupplyCap_;

        if (initialSupply > 0) {
            _mint(owner_, initialSupply);
        }
    }

    // ──────────────────────────────────────────────
    //  ERC-20 overrides
    // ──────────────────────────────────────────────
    function decimals() public view virtual override returns (uint8) {
        return _tokenDecimals;
    }

    /**
     * @dev Allows the owner to pause all token transfers in case of emergency.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ──────────────────────────────────────────────
    //  Minting
    // ──────────────────────────────────────────────
    /**
     * @notice Mint new tokens to `to`. Only callable by the owner.
     * @param to    Recipient address
     * @param amount Amount to mint (in base units)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (maxSupply > 0) {
            require(totalSupply() + amount <= maxSupply, "ChainForgeToken: would exceed max supply");
        }
        _mint(to, amount);
    }

    // ──────────────────────────────────────────────
    //  Supply cap management
    // ──────────────────────────────────────────────
    /**
     * @notice Update the max supply cap. Set to 0 to remove the cap entirely.
     * @dev New cap must be >= current total supply.
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        if (newMaxSupply > 0) {
            require(newMaxSupply >= totalSupply(), "ChainForgeToken: cap below current supply");
        }
        emit MaxSupplyUpdated(maxSupply, newMaxSupply);
        maxSupply = newMaxSupply;
    }

    // ──────────────────────────────────────────────
    //  Internal overrides
    // ──────────────────────────────────────────────
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
