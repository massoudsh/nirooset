# GRIDSET Protocol - Architecture Diagrams

## Table of Contents
1. [High-Level System Overview](#1-high-level-system-overview)
2. [Mid-Level Component Architecture](#2-mid-level-component-architecture)
3. [Low-Level Flow Diagrams](#3-low-level-flow-diagrams)
4. [Data Lineage](#4-data-lineage)
5. [Contract Structure](#5-contract-structure)
6. [Sequence Diagrams](#6-sequence-diagrams)

---

## 1. High-Level System Overview

### 1.1 Complete Protocol Architecture

```mermaid
graph TD
    subgraph "Asset Layer"
        PANEL_NFT[PanelNFT]
        ENERGY_TOKEN[EnergyToken]
    end

    subgraph "Registry Layer"
        PANEL_REG[PanelRegistry]
        STAKING[StakingVault]
    end

    subgraph "Oracle Layer"
        ORACLE[EnergyOracle]
        PRICE_FEED[Price Feeds]
    end

    subgraph "Market Layer"
        MARKET[EnergyMarket]
        AUCTION[Batch Auctions]
    end

    subgraph "Settlement Layer"
        SETTLEMENT[SettlementEngine]
        PENALTIES[Penalty System]
    end

    subgraph "Governance Layer"
        DAO[GovernanceDAO]
        TREASURY[Treasury]
    end

    PANEL_NFT --> PANEL_REG
    ENERGY_TOKEN --> MARKET
    ENERGY_TOKEN --> SETTLEMENT
    
    PANEL_REG --> ORACLE
    STAKING --> PENALTIES
    
    ORACLE --> SETTLEMENT
    PRICE_FEED --> MARKET
    
    MARKET --> AUCTION
    AUCTION --> SETTLEMENT
    
    SETTLEMENT --> PENALTIES
    DAO --> TREASURY
    DAO --> SETTLEMENT

    classDef asset fill:#e1f5fe
    classDef registry fill:#fff3e0
    classDef oracle fill:#e8f5e9
    classDef market fill:#fce4ec
    classDef settlement fill:#f3e5f5
    classDef governance fill:#fff9c4
    
    class PANEL_NFT,ENERGY_TOKEN asset
    class PANEL_REG,STAKING registry
    class ORACLE,PRICE_FEED oracle
    class MARKET,AUCTION market
    class SETTLEMENT,PENALTIES settlement
    class DAO,TREASURY governance
```

### 1.2 Simplified Protocol Map

```mermaid
graph LR
    PRODUCER[Energy Producer] --> NFT[Panel NFT]
    NFT --> ORACLE[Oracle Reports]
    ORACLE --> MARKET[Energy Market]
    MARKET --> SETTLE[Settlement]
    SETTLE --> CONSUMER[Energy Consumer]
```

---

## 2. Mid-Level Component Architecture

### 2.1 Smart Contract Hierarchy

```mermaid
flowchart TB
    subgraph "Core Contracts"
        TOKEN[EnergyToken ERC20]
        NFT[PanelNFT ERC721]
    end

    subgraph "Infrastructure Contracts"
        REGISTRY[PanelRegistry]
        VAULT[StakingVault]
        ORACLE[EnergyOracle]
    end

    subgraph "Market Contracts"
        MARKET[EnergyMarket]
        ORDERBOOK[OrderBook]
        BATCH[BatchAuction]
    end

    subgraph "Settlement Contracts"
        ENGINE[SettlementEngine]
        PENALTY[PenaltyManager]
        ESCROW[Escrow]
    end

    subgraph "Governance Contracts"
        DAO[GovernanceDAO]
        TIMELOCK[TimelockController]
        TREASURY[Treasury]
    end

    TOKEN --> MARKET
    TOKEN --> ENGINE
    NFT --> REGISTRY
    
    REGISTRY --> ORACLE
    VAULT --> PENALTY
    
    ORACLE --> ENGINE
    MARKET --> ORDERBOOK
    ORDERBOOK --> BATCH
    BATCH --> ENGINE
    
    ENGINE --> PENALTY
    ENGINE --> ESCROW
    
    DAO --> TIMELOCK
    TIMELOCK --> ENGINE
    TIMELOCK --> TREASURY
```

### 2.2 Time Slot System

```mermaid
flowchart TB
    subgraph "Slot Lifecycle"
        FUTURE[Future Slot]
        TRADING[Trading Window]
        LOCKED[Locked]
        PRODUCTION[Production Period]
        REPORTING[Oracle Reporting]
        SETTLEMENT[Settlement]
        FINALIZED[Finalized]
    end

    FUTURE -->|T-24h| TRADING
    TRADING -->|T-1h| LOCKED
    LOCKED -->|T-0| PRODUCTION
    PRODUCTION -->|T+1h| REPORTING
    REPORTING -->|T+2h| SETTLEMENT
    SETTLEMENT --> FINALIZED
```

### 2.3 Batch Auction Mechanism

```mermaid
flowchart TB
    subgraph "Order Collection"
        BUY_ORDERS[Buy Orders]
        SELL_ORDERS[Sell Orders]
        ORDER_BOOK[Order Book]
    end

    subgraph "Price Discovery"
        AGGREGATE[Aggregate Demand/Supply]
        CLEAR_PRICE[Clearing Price Calculation]
        UNIFORM[Uniform Price]
    end

    subgraph "Execution"
        MATCH[Match Orders]
        FILL[Fill Orders]
        PARTIAL[Handle Partial Fills]
    end

    subgraph "Settlement"
        TRANSFER[Transfer Tokens]
        UPDATE[Update Positions]
        EMIT[Emit Events]
    end

    BUY_ORDERS --> ORDER_BOOK
    SELL_ORDERS --> ORDER_BOOK
    
    ORDER_BOOK --> AGGREGATE
    AGGREGATE --> CLEAR_PRICE
    CLEAR_PRICE --> UNIFORM
    
    UNIFORM --> MATCH
    MATCH --> FILL
    FILL --> PARTIAL
    
    FILL --> TRANSFER
    TRANSFER --> UPDATE
    UPDATE --> EMIT
```

---

## 3. Low-Level Flow Diagrams

### 3.1 Panel Registration Flow

```mermaid
flowchart TD
    PRODUCER[Producer] --> MINT[Mint PanelNFT]
    MINT --> METADATA[Set Panel Metadata]
    
    METADATA --> CAPACITY[Rated Capacity kW]
    METADATA --> LOCATION[Geographic Location]
    METADATA --> TYPE[Panel Type]
    
    CAPACITY --> REGISTER[Register in PanelRegistry]
    LOCATION --> REGISTER
    TYPE --> REGISTER
    
    REGISTER --> STAKE[Stake Collateral]
    STAKE --> VAULT[StakingVault]
    
    VAULT --> ACTIVE[Panel Active]
    ACTIVE --> ORACLE_LINK[Link to Oracle]
    ORACLE_LINK --> READY[Ready for Production]
```

### 3.2 Energy Settlement Flow

```mermaid
flowchart TD
    SLOT_END[Time Slot Ends] --> ORACLE_REPORT[Oracle Reports Production]
    
    ORACLE_REPORT --> VALIDATE{Validate Report}
    VALIDATE -->|Invalid| DISPUTE[Initiate Dispute]
    VALIDATE -->|Valid| CALC_ACTUAL[Calculate Actual Production]
    
    CALC_ACTUAL --> COMPARE[Compare to Obligations]
    
    COMPARE --> DIFF{Difference?}
    
    DIFF -->|Excess| CREDIT[Credit Producer]
    DIFF -->|Deficit| DEBIT[Debit Producer]
    DIFF -->|Match| SETTLE[Direct Settlement]
    
    CREDIT --> MINT_TOKEN[Mint Energy Tokens]
    DEBIT --> PENALTY[Apply Penalty]
    
    PENALTY --> SLASH[Slash Stake if Needed]
    SLASH --> COMPENSATE[Compensate Affected Parties]
    
    MINT_TOKEN --> FINALIZE[Finalize Settlement]
    COMPENSATE --> FINALIZE
    SETTLE --> FINALIZE
    
    FINALIZE --> EMIT_EVENT[Emit SettlementComplete]
```

### 3.3 Governance Proposal Flow

```mermaid
flowchart TD
    MEMBER[DAO Member] --> PROPOSE[Create Proposal]
    PROPOSE --> VALIDATE{Valid Proposal?}
    
    VALIDATE -->|No| REJECT[Reject]
    VALIDATE -->|Yes| QUEUE[Queue for Voting]
    
    QUEUE --> DELAY[Voting Delay Period]
    DELAY --> VOTING[Voting Period Opens]
    
    VOTING --> VOTE_FOR[Vote For]
    VOTING --> VOTE_AGAINST[Vote Against]
    VOTING --> ABSTAIN[Abstain]
    
    VOTE_FOR --> TALLY[Tally Votes]
    VOTE_AGAINST --> TALLY
    ABSTAIN --> TALLY
    
    TALLY --> QUORUM{Quorum Met?}
    
    QUORUM -->|No| FAIL[Proposal Failed]
    QUORUM -->|Yes| MAJORITY{Majority For?}
    
    MAJORITY -->|No| FAIL
    MAJORITY -->|Yes| TIMELOCK[Queue in Timelock]
    
    TIMELOCK --> DELAY_EXEC[Execution Delay]
    DELAY_EXEC --> EXECUTE[Execute Proposal]
    EXECUTE --> COMPLETE[Proposal Executed]
```

---

## 4. Data Lineage

### 4.1 Energy Production Data Lineage

```mermaid
flowchart TB
    subgraph "Physical Layer"
        SENSOR[Panel Sensors]
        METER[Energy Meter]
    end

    subgraph "Oracle Layer"
        REPORT[Oracle Report]
        SIGNATURE[Oracle Signature]
        TIMESTAMP[Block Timestamp]
    end

    subgraph "On-Chain Storage"
        PRODUCTION_LOG[(Production Log)]
        PANEL_STATE[(Panel State)]
    end

    subgraph "Settlement"
        OBLIGATION[Energy Obligations]
        ACTUAL[Actual Production]
        NET_POSITION[Net Position]
    end

    subgraph "Financial"
        CREDITS[Energy Credits]
        PENALTIES[Penalties Applied]
        FINAL_BALANCE[Final Balance]
    end

    SENSOR --> METER
    METER --> REPORT
    REPORT --> SIGNATURE
    SIGNATURE --> TIMESTAMP
    
    TIMESTAMP --> PRODUCTION_LOG
    PRODUCTION_LOG --> PANEL_STATE
    
    PANEL_STATE --> ACTUAL
    OBLIGATION --> NET_POSITION
    ACTUAL --> NET_POSITION
    
    NET_POSITION --> CREDITS
    NET_POSITION --> PENALTIES
    CREDITS --> FINAL_BALANCE
    PENALTIES --> FINAL_BALANCE
```

### 4.2 Token Flow Lineage

```mermaid
flowchart TB
    subgraph "Minting"
        ORACLE_VERIFIED[Verified Production]
        MINT[Mint Energy Tokens]
    end

    subgraph "Market"
        SELLER[Seller Account]
        BUYER[Buyer Account]
        ESCROW[Market Escrow]
    end

    subgraph "Settlement"
        SETTLEMENT_POOL[Settlement Pool]
        PENALTY_POOL[Penalty Pool]
    end

    subgraph "Redemption"
        REDEEM[Redeem Tokens]
        BURN[Burn Tokens]
        PAYOUT[Financial Payout]
    end

    ORACLE_VERIFIED --> MINT
    MINT --> SELLER
    
    SELLER --> ESCROW
    BUYER --> ESCROW
    ESCROW --> SETTLEMENT_POOL
    
    SETTLEMENT_POOL --> BUYER
    SETTLEMENT_POOL --> PENALTY_POOL
    
    BUYER --> REDEEM
    REDEEM --> BURN
    BURN --> PAYOUT
```

---

## 5. Contract Structure

### 5.1 Core Contract Inheritance

```mermaid
classDiagram
    class ERC20 {
        +totalSupply()
        +balanceOf(address)
        +transfer(to, amount)
        +approve(spender, amount)
        +transferFrom(from, to, amount)
    }

    class ERC721 {
        +balanceOf(owner)
        +ownerOf(tokenId)
        +transferFrom(from, to, tokenId)
        +approve(to, tokenId)
    }

    class Ownable {
        +owner()
        +transferOwnership(newOwner)
        +renounceOwnership()
    }

    class AccessControl {
        +hasRole(role, account)
        +grantRole(role, account)
        +revokeRole(role, account)
    }

    class EnergyToken {
        +mint(to, amount)
        +burn(from, amount)
        +pause()
        +unpause()
    }

    class PanelNFT {
        +mint(to, metadata)
        +burn(tokenId)
        +updateMetadata(tokenId, metadata)
        +getPanelInfo(tokenId)
    }

    ERC20 <|-- EnergyToken
    Ownable <|-- EnergyToken
    ERC721 <|-- PanelNFT
    AccessControl <|-- PanelNFT
```

### 5.2 Settlement Contract Structure

```mermaid
classDiagram
    class ISettlement {
        <<interface>>
        +settle(slotId)*
        +getObligation(account, slotId)*
        +getNetPosition(account, slotId)*
    }

    class SettlementEngine {
        +mapping obligations
        +mapping productions
        +Oracle oracle
        +PenaltyManager penalty
        +settle(slotId)
        +recordObligation(account, amount, slotId)
        +calculateNetPosition(account, slotId)
        +applyPenalties(account, deficit)
    }

    class PenaltyManager {
        +StakingVault vault
        +uint256 penaltyRate
        +calculatePenalty(deficit)
        +slashStake(account, amount)
        +distributeCompensation(victims, amount)
    }

    class StakingVault {
        +mapping stakes
        +uint256 minStake
        +stake(amount)
        +unstake(amount)
        +slash(account, amount)
        +getStake(account)
    }

    ISettlement <|.. SettlementEngine
    SettlementEngine --> PenaltyManager
    PenaltyManager --> StakingVault
```

### 5.3 Market Contract Structure

```mermaid
classDiagram
    class IMarket {
        <<interface>>
        +placeBuyOrder(slotId, amount, price)*
        +placeSellOrder(slotId, amount, price)*
        +cancelOrder(orderId)*
        +settleBatch(slotId)*
    }

    class EnergyMarket {
        +mapping orders
        +mapping slots
        +EnergyToken token
        +placeBuyOrder(slotId, amount, price)
        +placeSellOrder(slotId, amount, price)
        +cancelOrder(orderId)
        +settleBatch(slotId)
        +getClearingPrice(slotId)
    }

    class OrderBook {
        +Order[] buyOrders
        +Order[] sellOrders
        +addOrder(order)
        +removeOrder(orderId)
        +matchOrders()
        +getClearingPrice()
    }

    class Order {
        +uint256 id
        +address trader
        +uint256 amount
        +uint256 price
        +OrderType type
        +OrderStatus status
    }

    IMarket <|.. EnergyMarket
    EnergyMarket --> OrderBook
    OrderBook --> Order
```

---

## 6. Sequence Diagrams

### 6.1 Panel Registration Sequence

```mermaid
sequenceDiagram
    participant P as Producer
    participant NFT as PanelNFT
    participant REG as PanelRegistry
    participant VAULT as StakingVault
    participant ORACLE as EnergyOracle

    P->>NFT: mint(metadata)
    NFT->>NFT: _safeMint(producer, tokenId)
    NFT-->>P: tokenId

    P->>REG: registerPanel(tokenId, capacity, location)
    REG->>NFT: ownerOf(tokenId)
    NFT-->>REG: producer address
    REG->>REG: validateMetadata()
    
    REG->>VAULT: requireStake(producer, minStake)
    VAULT->>VAULT: checkBalance(producer)
    VAULT-->>REG: Stake verified
    
    REG->>ORACLE: registerDataFeed(tokenId)
    ORACLE-->>REG: Feed registered
    
    REG-->>P: Panel registered
```

### 6.2 Energy Trading Sequence

```mermaid
sequenceDiagram
    participant S as Seller
    participant B as Buyer
    participant M as EnergyMarket
    participant OB as OrderBook
    participant T as EnergyToken

    Note over S,T: Order Placement Phase
    
    S->>T: approve(market, amount)
    S->>M: placeSellOrder(slotId, amount, price)
    M->>OB: addSellOrder(order)
    
    B->>T: approve(market, amount * price)
    B->>M: placeBuyOrder(slotId, amount, price)
    M->>OB: addBuyOrder(order)
    
    Note over S,T: Batch Settlement Phase
    
    M->>OB: calculateClearingPrice(slotId)
    OB-->>M: clearingPrice
    
    M->>OB: matchOrders(clearingPrice)
    OB-->>M: matchedOrders[]
    
    loop For each match
        M->>T: transferFrom(seller, buyer, amount)
        M->>T: transferFrom(buyer, seller, payment)
    end
    
    M-->>S: Order filled
    M-->>B: Order filled
```

### 6.3 Settlement Sequence

```mermaid
sequenceDiagram
    participant O as Oracle
    participant SE as SettlementEngine
    participant PM as PenaltyManager
    participant SV as StakingVault
    participant T as EnergyToken

    Note over O,T: Production Reporting
    
    O->>SE: reportProduction(panelId, slotId, amount)
    SE->>SE: validateOracleSignature()
    SE->>SE: recordProduction(panelId, slotId, amount)
    
    Note over O,T: Settlement Calculation
    
    SE->>SE: getObligation(producer, slotId)
    SE->>SE: getProduction(producer, slotId)
    SE->>SE: calculateNetPosition()
    
    alt Surplus Production
        SE->>T: mint(producer, surplus)
    else Deficit Production
        SE->>PM: calculatePenalty(deficit)
        PM->>SV: slashStake(producer, penalty)
        SV-->>PM: Stake slashed
        PM->>PM: distributeCompensation()
    end
    
    SE->>SE: finalizeSlot(slotId)
    SE-->>O: Settlement complete
```

### 6.4 Governance Sequence

```mermaid
sequenceDiagram
    participant M as Member
    participant DAO as GovernanceDAO
    participant TL as Timelock
    participant SE as SettlementEngine

    M->>DAO: propose(targets, values, calldatas, description)
    DAO->>DAO: hashProposal()
    DAO-->>M: proposalId
    
    Note over M,SE: Voting Period
    
    M->>DAO: castVote(proposalId, support)
    DAO->>DAO: recordVote()
    
    Note over M,SE: After Voting Ends
    
    M->>DAO: queue(proposalId)
    DAO->>DAO: checkQuorum()
    DAO->>DAO: checkMajority()
    DAO->>TL: schedule(operation, delay)
    TL-->>DAO: Queued
    
    Note over M,SE: After Timelock Delay
    
    M->>DAO: execute(proposalId)
    DAO->>TL: execute(operation)
    TL->>SE: updateParameter(newValue)
    SE-->>TL: Updated
    TL-->>DAO: Executed
    DAO-->>M: Proposal executed
```

---

## 7. Unified System Map

```mermaid
graph TB
    subgraph "GRIDSET Protocol"
        subgraph "Assets"
            NFT[Panel NFT]
            TOKEN[Energy Token]
        end

        subgraph "Infrastructure"
            REGISTRY[Panel Registry]
            VAULT[Staking Vault]
            ORACLE[Energy Oracle]
        end

        subgraph "Market"
            MARKET[Energy Market]
            AUCTION[Batch Auction]
        end

        subgraph "Settlement"
            ENGINE[Settlement Engine]
            PENALTY[Penalty System]
        end

        subgraph "Governance"
            DAO[Governance DAO]
            TREASURY[Treasury]
        end
    end

    NFT --> REGISTRY
    TOKEN --> MARKET
    
    REGISTRY --> ORACLE
    VAULT --> PENALTY
    
    ORACLE --> ENGINE
    MARKET --> AUCTION
    AUCTION --> ENGINE
    
    ENGINE --> PENALTY
    ENGINE --> TOKEN
    
    DAO --> ENGINE
    DAO --> TREASURY

    classDef asset fill:#e1f5fe
    classDef infra fill:#c8e6c9
    classDef market fill:#fff3e0
    classDef settle fill:#fce4ec
    classDef gov fill:#f3e5f5

    class NFT,TOKEN asset
    class REGISTRY,VAULT,ORACLE infra
    class MARKET,AUCTION market
    class ENGINE,PENALTY settle
    class DAO,TREASURY gov
```

---

## Usage

View these diagrams in:
- GitHub/GitLab markdown preview
- VS Code with Mermaid extension
- [Mermaid Live Editor](https://mermaid.live/)
