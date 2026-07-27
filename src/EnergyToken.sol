// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IEnergyToken.sol";

/**
 * @title EnergyToken
 * @notice ERC20-style fungible energy credits with lock/unlock for escrow and settlement.
 * @dev balanceOf returns total balance; transfer/transferFrom use only available (total - locked).
 */
contract EnergyToken is IEnergyToken {
    event Lock(address indexed account, uint256 amount);
    event Unlock(address indexed account, uint256 amount);

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _locked;
    mapping(address => mapping(address => uint256)) private _allowances;

    address public owner;
    mapping(address => bool) public minters;
    mapping(address => bool) public lockers;

    error Unauthorized();
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();
    error InsufficientLocked();
    error AmountZero();
    error LockExceedsBalance();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyMinter() {
        if (!minters[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyLocker() {
        if (!lockers[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMinter(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        minters[account] = granted;
    }

    function setLocker(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        lockers[account] = granted;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner_, address spender) external view override returns (uint256) {
        return _allowances[owner_][spender];
    }

    function getEnergyBalance(address account) external view override returns (EnergyBalance memory) {
        uint256 total = _balances[account];
        uint256 locked = _locked[account];
        uint256 available;
        unchecked { available = total - locked; }
        return EnergyBalance({ total: total, locked: locked, available: available });
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert AmountZero();
        uint256 available = _balances[msg.sender] - _locked[msg.sender];
        if (amount > available) revert InsufficientBalance();

        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        if (spender == address(0)) revert ZeroAddress();
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert AmountZero();

        uint256 currentAllowance = _allowances[from][msg.sender];
        if (currentAllowance != type(uint256).max && currentAllowance < amount) revert InsufficientAllowance();

        uint256 available = _balances[from] - _locked[from];
        if (amount > available) revert InsufficientBalance();

        unchecked {
            _allowances[from][msg.sender] = currentAllowance - amount;
            _balances[from] -= amount;
        }
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external override onlyMinter {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert AmountZero();

        _totalSupply += amount;
        _balances[to] += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external override {
        if (amount == 0) revert AmountZero();
        if (from != msg.sender && msg.sender != owner) revert Unauthorized();

        uint256 available = _balances[from] - _locked[from];
        if (amount > available) revert InsufficientBalance();

        unchecked {
            _balances[from] -= amount;
            _totalSupply -= amount;
        }
        emit Burn(from, amount);
        emit Transfer(from, address(0), amount);
    }

    function lock(address account, uint256 amount) external override onlyLocker {
        if (amount == 0) revert AmountZero();
        if (amount > _balances[account] - _locked[account]) revert LockExceedsBalance();

        unchecked { _locked[account] += amount; }
        emit Lock(account, amount);
    }

    function unlock(address account, uint256 amount) external override onlyLocker {
        if (amount == 0) revert AmountZero();
        if (amount > _locked[account]) revert InsufficientLocked();

        unchecked { _locked[account] -= amount; }
        emit Unlock(account, amount);
    }

    /// @notice Move locked amount from `from` to `to` as available balance. Used by EnergyMarket on auction clear.
    function transferLocked(address from, address to, uint256 amount) external override onlyLocker {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert AmountZero();
        if (amount > _locked[from]) revert InsufficientLocked();

        unchecked {
            _locked[from] -= amount;
            _balances[from] -= amount;
            _balances[to] += amount;
        }
        emit Unlock(from, amount);
        emit Transfer(from, to, amount);
    }
}
