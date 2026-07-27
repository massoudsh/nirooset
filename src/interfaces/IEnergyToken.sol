// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEnergyToken {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    struct EnergyBalance {
        uint256 total;
        uint256 locked;
        uint256 available;
    }

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function lock(address account, uint256 amount) external;
    function unlock(address account, uint256 amount) external;
    /// @notice Move locked amount from one account to another (as available). Only callable by locker (e.g. EnergyMarket).
    function transferLocked(address from, address to, uint256 amount) external;
    function getEnergyBalance(address account) external view returns (EnergyBalance memory);
}
