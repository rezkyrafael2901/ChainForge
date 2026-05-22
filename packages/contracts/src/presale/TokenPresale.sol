// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TokenPresale
 * @notice A configurable presale contract for ERC-20 tokens with soft/hard caps,
 *         per-wallet limits, time bounds, and refund capability if the soft cap is not met.
 */
contract TokenPresale is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    IERC20 public immutable token;

    uint256 public rate; // tokens per 1 ETH (in wei denomination)
    uint256 public softCap; // minimum ETH to raise (in wei)
    uint256 public hardCap; // maximum ETH to raise (in wei)
    uint256 public minContribution; // per-wallet min
    uint256 public maxContribution; // per-wallet max (0 = unlimited)
    uint256 public startTime;
    uint256 public endTime;

    uint256 public totalRaised;
    uint256 public finalized;
    bool public saleFinalized;

    mapping(address => uint256) public contributions;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event Contributed(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event Refunded(address indexed buyer, uint256 amount);
    event SaleFinalized(uint256 totalRaised, bool softCapMet);
    event FundsWithdrawn(address indexed to, uint256 amount);

    // ──────────────────────────────────────────────
    //  Errors
    // ──────────────────────────────────────────────
    error SaleNotActive();
    error BelowMinContribution();
    error AboveMaxContribution();
    error HardCapExceeded();
    error InvalidRate();
    error InvalidCaps();
    error InvalidTimes();
    error SaleNotEnded();
    error SaleAlreadyFinalized();
    error SoftCapNotMet();
    error NothingToRefund();
    error TransferFailed();

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────
    modifier saleActive() {
        if (block.timestamp < startTime || block.timestamp > endTime) revert SaleNotActive();
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    /**
     * @param token_         ERC-20 token address being sold
     * @param rate_          Tokens per 1 ETH
     * @param softCap_       Minimum ETH to raise
     * @param hardCap_       Maximum ETH to raise
     * @param minContrib_    Minimum ETH per wallet
     * @param maxContrib_    Maximum ETH per wallet (0 = unlimited)
     * @param startTime_     Sale start timestamp
     * @param endTime_       Sale end timestamp
     * @param owner_         Contract owner
     */
    constructor(
        IERC20 token_,
        uint256 rate_,
        uint256 softCap_,
        uint256 hardCap_,
        uint256 minContrib_,
        uint256 maxContrib_,
        uint256 startTime_,
        uint256 endTime_,
        address owner_
    ) Ownable(owner_) {
        if (rate_ == 0) revert InvalidRate();
        if (softCap_ > hardCap_) revert InvalidCaps();
        if (startTime_ >= endTime_) revert InvalidTimes();

        token = token_;
        rate = rate_;
        softCap = softCap_;
        hardCap = hardCap_;
        minContribution = minContrib_;
        maxContribution = maxContrib_;
        startTime = startTime_;
        endTime = endTime_;
    }

    // ──────────────────────────────────────────────
    //  External functions
    // ──────────────────────────────────────────────

    /**
     * @notice Contribute ETH to the presale. Tokens are credited immediately.
     */
    function contribute() external payable nonReentrant saleActive whenNotPaused {
        uint256 ethAmount = msg.value;
        if (ethAmount < minContribution) revert BelowMinContribution();

        uint256 newTotal = contributions[msg.sender] + ethAmount;
        if (maxContribution > 0 && newTotal > maxContribution) revert AboveMaxContribution();
        if (totalRaised + ethAmount > hardCap) revert HardCapExceeded();

        contributions[msg.sender] = newTotal;
        totalRaised += ethAmount;

        uint256 tokenAmount = (ethAmount * rate) / 1e18;
        // Transfer tokens from owner (who must approve this contract beforehand)
        token.safeTransferFrom(owner(), msg.sender, tokenAmount);

        emit Contributed(msg.sender, ethAmount, tokenAmount);
    }

    /**
     * @notice Claim a refund if the soft cap was not met after the sale ends.
     */
    function claimRefund() external nonReentrant {
        if (!saleFinalized) revert SaleAlreadyFinalized(); // must be finalized first
        if (totalRaised >= softCap) revert SoftCapNotMet();

        uint256 amount = contributions[msg.sender];
        if (amount == 0) revert NothingToRefund();

        contributions[msg.sender] = 0;
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Refunded(msg.sender, amount);
    }

    /**
     * @notice Finalize the sale. Only callable by the owner after end time.
     * @dev If soft cap not met, users can claim refunds.
     */
    function finalize() external onlyOwner {
        if (saleFinalized) revert SaleAlreadyFinalized();
        if (block.timestamp <= endTime) revert SaleNotEnded();

        saleFinalized = true;
        bool softCapMet = totalRaised >= softCap;

        emit SaleFinalized(totalRaised, softCapMet);
    }

    /**
     * @notice Withdraw raised ETH to the owner. Only after finalization AND soft cap met.
     */
    function withdraw() external onlyOwner nonReentrant {
        if (!saleFinalized) revert SaleAlreadyFinalized();
        if (totalRaised < softCap) revert SoftCapNotMet();

        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(owner(), balance);
    }

    /**
     * @notice Withdraw unsold tokens back to owner. Only after finalization.
     */
    function withdrawUnsoldTokens() external onlyOwner nonReentrant {
        if (!saleFinalized) revert SaleAlreadyFinalized();

        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.safeTransfer(owner(), balance);
        }
    }

    // ──────────────────────────────────────────────
    //  Pause
    // ──────────────────────────────────────────────
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ──────────────────────────────────────────────
    //  View helpers
    // ──────────────────────────────────────────────
    function isActive() external view returns (bool) {
        return block.timestamp >= startTime && block.timestamp <= endTime && !saleFinalized;
    }

    function remainingCap() external view returns (uint256) {
        return hardCap - totalRaised;
    }

    receive() external payable {}
}
