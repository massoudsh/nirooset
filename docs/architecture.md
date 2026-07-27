# GRIDSET Protocol Architecture

## Overview

GRIDSET is a market-based energy and compute settlement system that operates on blockchain infrastructure. The protocol enables financial settlement of energy obligations through time-slot based accounting, batch auction price discovery, oracle-reported production data, and stake-backed penalty mechanisms.

## System Components

### 1. EnergyToken (IEnergyToken)

The EnergyToken represents fungible energy credits within the system. It provides:
- Standard token operations (transfer, approve, mint, burn)
- Lock/unlock mechanisms for escrow and settlement
- Balance tracking with separation of locked and available amounts

### 2. PanelNFT (IPanelNFT)

PanelNFT represents non-fungible tokens for solar panels or energy production assets. Each NFT:
- Contains metadata about panel capacity and installation details
- Can be transferred between owners
- Supports retirement mechanisms
- Links to production data in the registry

### 3. PanelRegistry (IPanelRegistry)

The PanelRegistry maintains a registry of all registered energy production panels:
- Tracks panel ownership and capacity
- Records production data per time slot
- Provides historical production queries
- Manages panel registration and deregistration

### 4. StakingVault (IStakingVault)

The StakingVault manages economic security through staking:
- Participants deposit stake to participate in the system
- Stake can be locked for specific durations
- Penalties and slashing mechanisms for misbehavior
- Stake-backed guarantees for settlement obligations

### 5. EnergyOracle (IEnergyOracle)

The EnergyOracle provides authoritative production data:
- Reports energy production from panels
- Finalizes time slot data after verification
- Maintains historical production records
- Supports oracle operator updates

### 6. EnergyMarket (IEnergyMarket)

The EnergyMarket facilitates price discovery through batch auctions:
- Order book management for bids and asks
- Time-slot based auction periods
- Clearing price determination
- Order matching and execution

### 7. SettlementEngine (ISettlementEngine)

The SettlementEngine executes financial settlements:
- Processes settlements for completed time slots
- Calculates net energy positions per participant
- Applies penalties for non-performance
- Handles dispute resolution
- Finalizes time slot settlements

### 8. GovernanceDAO (IGovernanceDAO)

The GovernanceDAO enables decentralized governance:
- Proposal creation and voting
- Voting power based on stake or token holdings
- Proposal execution after successful votes
- Cancellation mechanisms for invalid proposals

## Time-Slot Based Energy Accounting

The protocol operates on discrete time slots (e.g., hourly or 15-minute intervals). Each time slot:
- Has a defined start and end time
- Accumulates production reports from all panels
- Requires finalization before settlement
- Maintains immutable historical records

Time slots enable:
- Clear temporal boundaries for accounting
- Batch processing of settlements
- Historical audit trails
- Predictable settlement schedules

## Batch Auction Price Discovery

The EnergyMarket uses batch auctions for price discovery:
- Orders are collected during an auction period
- All orders for a time slot are cleared at once
- Clearing price is determined by matching supply and demand
- Uniform clearing price for all matched orders

This mechanism:
- Reduces front-running opportunities
- Provides fair price discovery
- Enables efficient batch settlement
- Supports predictable pricing

## Oracle-Reported Production

Energy production is reported by oracles:
- Oracles submit production data for panels
- Data is verified before acceptance
- Time slots are finalized after verification period
- Historical data is immutable once finalized

Oracle design considerations:
- Multiple oracle support for redundancy
- Verification mechanisms for data integrity
- Economic incentives for accurate reporting
- Penalties for misreporting

## Stake-Backed Penalties

The system uses stake-backed penalties to ensure compliance:
- Participants must stake tokens to participate
- Penalties are assessed for non-performance or misbehavior
- Slashing can occur for severe violations
- Stake provides economic security for the system

Penalty mechanisms:
- Automatic penalties for missed obligations
- Governance-controlled slashing for major violations
- Dispute resolution for contested penalties
- Stake lock periods for critical operations

## Financial Settlement vs Physical Delivery

**IMPORTANT**: GRIDSET settles financial obligations, not physical energy delivery. The protocol:
- Tracks energy production and consumption as financial claims
- Settles payments based on net energy positions
- Does not guarantee physical energy delivery
- Operates as a financial settlement layer on top of physical infrastructure

## System Flow

1. **Registration**: Panels are registered as NFTs and added to the registry
2. **Production Reporting**: Oracles report production data for each time slot
3. **Auction**: Market participants place bids and asks for energy in upcoming time slots
4. **Clearing**: Auctions are cleared, determining prices and matched orders
5. **Settlement**: Settlement engine calculates net positions and executes payments
6. **Penalties**: Non-performance results in stake penalties
7. **Governance**: DAO manages protocol parameters and upgrades

## Security Considerations

- All contracts use Solidity ^0.8.20 for safety features
- Stake-backed security model for economic guarantees
- Oracle verification for production data integrity
- Time-locked operations for critical functions
- Dispute mechanisms for contested settlements
