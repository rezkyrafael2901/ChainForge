import { ProjectSpec } from '@/types'

export function generateDeployableERC20(spec: ProjectSpec): string {
  const name = sanitizeString(spec.name || 'BlockPilotToken')
  const symbol = sanitizeString(spec.symbol || symbolFromName(name))
  const supply = sanitizeNumber(String(spec.params?.supply || '1000000'))
  const features = spec.features || []
  const mintable = features.includes('mintable')
  const burnable = features.includes('burnable')
  const capped = features.includes('capped')
  const pausable = features.includes('pausable')

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${name}
 * @author BlockPilot
 * @notice Self-contained ERC-20 contract generated for one-click deployment.
 * @dev No external imports required. Audit before mainnet use.
 */
contract ${safeContractName(name)} {
    string public name = "${name}";
    string public symbol = "${symbol}";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public owner;
    ${capped ? `uint256 public maxSupply = ${supply} * 10 ** uint256(decimals);` : ''}
    ${pausable ? 'bool public paused;' : ''}

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    ${pausable ? 'event Paused(address account);\n    event Unpaused(address account);' : ''}

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    ${pausable ? `modifier whenNotPaused() {
        require(!paused, "Token paused");
        _;
    }` : ''}

    constructor() {
        owner = msg.sender;
        uint256 initialSupply = ${supply} * 10 ** uint256(decimals);
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transfer(address to, uint256 amount) public ${pausable ? 'whenNotPaused ' : ''}returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public ${pausable ? 'whenNotPaused ' : ''}returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public ${pausable ? 'whenNotPaused ' : ''}returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        unchecked {
            allowance[from][msg.sender] = currentAllowance - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public ${pausable ? 'whenNotPaused ' : ''}returns (bool) {
        allowance[msg.sender][spender] += addedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public ${pausable ? 'whenNotPaused ' : ''}returns (bool) {
        uint256 currentAllowance = allowance[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            allowance[msg.sender][spender] = currentAllowance - subtractedValue;
        }
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }

    ${mintable ? `function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "ERC20: mint to zero address");
        ${capped ? 'require(totalSupply + amount <= maxSupply, "ERC20: cap exceeded");' : ''}
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }` : ''}

    ${burnable ? `function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            balanceOf[msg.sender] -= amount;
            totalSupply -= amount;
        }
        emit Transfer(msg.sender, address(0), amount);
    }` : ''}

    ${pausable ? `function pause() public onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }` : ''}

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}
`
}

function sanitizeString(value: string): string {
  return value.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'BlockPilotToken'
}

function sanitizeNumber(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, '')
  return cleaned || '1000000'
}

function safeContractName(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '') || 'BlockPilotToken'
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `Token${cleaned}`
}

function symbolFromName(value: string): string {
  return value
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .slice(0, 5)
    .toUpperCase() || 'CFT'
}
