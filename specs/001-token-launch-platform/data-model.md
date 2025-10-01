# Data Model: Token Launch Platform

**Feature**: Token Launch Platform with Bonding Curve
**Date**: 2025-10-01
**Status**: Complete

## Overview

This document defines the data structures for all smart contracts in the token launch platform. All structures are optimized for TON blockchain's cell-based storage model.

---

## Contract Storage Structures

### 1. LaunchpadFactory Storage

```func
storage#_
  owner:MsgAddress              ;; Platform owner (267 bits)
  launch_count:uint64           ;; Total launches created
  platform_fee_percent:uint8    ;; Platform fee (5%)
  launch_registry:HashmapE 64 MsgAddress  ;; launch_id -> BondingCurve address
  platform_balance:Coins        ;; Accumulated platform fees
  hard_cap_tiers:Cell           ;; [50, 200, 500, 1000, 5000] TON
  time_limits:Cell              ;; [30, 60, 90] days in seconds
  = Storage;
```

**Size**: Fits in single root cell (~700 bits + 2 child cells for dictionaries)

---

### 2. BondingCurveContract Storage

```func
storage#_
  jetton_minter:MsgAddress          ;; Associated jetton minter (267 bits)
  creator:MsgAddress                ;; Token creator (267 bits)
  launch_timestamp:uint32           ;; Launch time
  hard_cap:Coins                    ;; Target raise amount (128 bits)
  soft_cap:Coins                    ;; 20% of hard_cap (128 bits)
  time_limit:uint32                 ;; Seconds until deadline
  total_supply:Coins                ;; Max token supply (128 bits)
  tokens_sold:Coins                 ;; Tokens sold so far (128 bits)
  reserve_balance:Coins             ;; TON held in reserve (128 bits)
  total_raised:Coins                ;; Total TON raised (128 bits)
  is_graduated:uint1                ;; Whether reached hard cap
  is_failed:uint1                   ;; Whether failed soft cap
  soft_cap_reached:uint1            ;; Whether soft cap achieved
  soft_cap_timestamp:uint32         ;; When soft cap was reached
  dex_pool_address:MsgAddress       ;; DEX pool after graduation (267 bits, null before)
  liquidity_accumulated:Coins       ;; 40% pool for graduation (128 bits)
  buyer_contributions:HashmapE 267 Coins  ;; address -> total_spent (separate cell)
  refund_claims:HashmapE 267 Coins  ;; address -> refund_amount (separate cell, if failed)
  = Storage;
```

**Size**: Main state ~900 bits (single cell), buyer/refund dictionaries in separate cells

**State Machine**:
```
[Launch Created] → [Pre-Soft-Cap] → [Failed] (if 30 days pass)
                         ↓ (reach 20%)
                   [Post-Soft-Cap] → [Graduated] (reach hard cap)
```

---

### 3. JettonMinter Storage (TEP-74)

```func
storage#_
  total_supply:Coins                ;; Current total supply (128 bits)
  admin_address:MsgAddress          ;; The BondingCurveContract (267 bits)
  content:Cell                      ;; Token metadata (TEP-64)
  jetton_wallet_code:Cell           ;; Code for jetton wallets
  = Storage;
```

**Metadata Structure (TEP-64)**:
```json
{
  "name": "DemoToken",
  "description": "Community token launched via bonding curve",
  "image": "https://example.com/token-image.png",
  "symbol": "DEMO",
  "decimals": "9"
}
```

---

### 4. JettonWallet Storage (TEP-74)

```func
storage#_
  balance:Coins                     ;; User token balance (128 bits)
  owner_address:MsgAddress          ;; Wallet owner (267 bits)
  jetton_master_address:MsgAddress  ;; JettonMinter address (267 bits)
  = Storage;
```

**Size**: ~600 bits (single cell)

---

## Key Entities & Relationships

### TokenLaunch
- **Represented by**: BondingCurveContract instance
- **Attributes**:
  - Hard cap tier: 50 / 200 / 500 / 1,000 / 5,000 TON
  - Soft cap: 20% of hard cap
  - Time limit: 30 / 60 / 90 days
  - Total supply: Default 1B tokens (configurable)
  - Current state: pre-soft-cap | post-soft-cap | graduated | failed
- **Relationships**:
  - 1:1 with JettonMinter
  - 1:N with JettonWallets (via minter)
  - N:1 with LaunchpadFactory (deployed by)
  - 0:1 with DEX Pool (after graduation)

### BondingCurve (Mathematical Model)
- **Formula**: Price(k) = base_price × √(k / total_supply)
- **Constants**:
  - base_price = 0.000001 TON
  - k = tokens_sold
  - total_supply = configurable (default 1B)
- **Buy Cost Integration**: ∫ Price(k) dk = base_price × (2/3) × (k^1.5 / √total_supply)
- **Stored in**: BondingCurveContract (calculation functions, not stored values)

### Reserves
- **Stored as**: reserve_balance field in BondingCurveContract
- **Source**: 50% of all buy transactions
- **Use**: Backs sell transactions (returns TON to sellers)
- **Formula**: reserve_balance = Σ(buy_amount × 0.50) - Σ(sell_return)

### LiquidityPool (Pre-Graduation)
- **Stored as**: liquidity_accumulated field in BondingCurveContract
- **Source**: 40% of all buy transactions
- **Accumulation**: liquidity_accumulated += buy_amount × 0.40
- **Use**: Deployed to DeDust at graduation
- **Post-Graduation**: Becomes locked LP tokens in DEX

### SoftCap
- **Value**: hard_cap × 0.20
- **Deadline**: launch_timestamp + time_limit
- **State**: soft_cap_reached flag + soft_cap_timestamp
- **Failure Behavior**: Triggers refund process if not reached in time

### HardCapTier
- **Values**: [50, 200, 500, 1000, 5000] TON
- **Stored in**: hard_cap_tiers cell in LaunchpadFactory
- **Selection**: Creator chooses tier_index (0-4) at launch creation
- **Immutable**: Cannot be changed after launch created

### Purchase (Ephemeral)
- **Not stored permanently**: Only in buyer_contributions dictionary
- **Tracked for**: Refund calculation if launch fails
- **Accumulation**: buyer_contributions[address] += buy_amount
- **Event Log**: Emitted as event for off-chain indexing

### SellTransaction (Ephemeral)
- **Not stored**: Events only
- **Immediate**: Tokens burned, TON returned in same transaction
- **Fee**: 1% deducted from return amount
- **Event Log**: Emitted for analytics

### Graduation (Event)
- **Trigger**: total_raised >= hard_cap
- **Actions**:
  1. Set is_graduated = 1
  2. Deploy DeDust pool with accumulated liquidity
  3. Transfer tokens + TON to pool
  4. Receive LP tokens
  5. Burn LP tokens (send to null address)
  6. Store dex_pool_address
- **Irreversible**: Once graduated, bonding curve closed

### FeeAllocation
- **Platform Fees**:
  - **Percentage**: 5% of buy amount
  - **Destination**: LaunchpadFactory.platform_balance
  - **Withdrawal**: owner-only, anytime
- **Creator Fees**:
  - **Percentage**: 5% of buy amount
  - **Destination**: Sent directly to creator address
  - **Timing**: Immediate on each buy
  - **No accumulation**: Creator receives funds in real-time

---

## Storage Size Analysis

### Gas Implications

| Contract | Root Cell | Child Cells | Storage Cost |
|----------|-----------|-------------|--------------|
| LaunchpadFactory | ~700 bits | 2 dicts | ~0.001 TON/year |
| BondingCurve | ~900 bits | 2 dicts | ~0.002 TON/year |
| JettonMinter | ~600 bits | 1 dict | ~0.001 TON/year |
| JettonWallet | ~600 bits | 0 | ~0.0005 TON/year |

**Note**: Dictionaries (HashmapE) grow with usage but TON storage is cheap (~$0.001/MB/year)

---

## Validation Rules

### BondingCurveContract Invariants

1. **Fund Conservation**:
   ```
   total_raised == reserve_balance + liquidity_accumulated
                   + creator_fees_sent + platform_fees_sent
   ```

2. **Supply Conservation**:
   ```
   tokens_sold <= total_supply
   ```

3. **Soft Cap Relation**:
   ```
   soft_cap == hard_cap * 20 / 100
   ```

4. **State Exclusivity**:
   ```
   !(is_graduated && is_failed)  // Cannot be both
   ```

5. **Reserve Sufficiency** (for sells):
   ```
   reserve_balance >= sell_return_amount
   ```

6. **Time Limit Enforcement** (pre-soft-cap):
   ```
   if (!soft_cap_reached && now() > launch_timestamp + time_limit):
       must_trigger_failure()
   ```

---

## Dictionary Key Design

### buyer_contributions (BondingCurveContract)
- **Key**: MsgAddress (267 bits)
- **Value**: Coins (total TON spent by this address)
- **Purpose**: Track contributions for refund calculation
- **Lifecycle**: Cleared after graduation or all refunds claimed

### refund_claims (BondingCurveContract)
- **Key**: MsgAddress (267 bits)
- **Value**: Coins (refund amount available)
- **Purpose**: Pull-based refund system (users claim)
- **Lifecycle**: Created on failure, entries removed as claimed

### launch_registry (LaunchpadFactory)
- **Key**: uint64 (launch_id)
- **Value**: MsgAddress (BondingCurveContract address)
- **Purpose**: Enumerate all launches, lookup by ID
- **Lifecycle**: Permanent (never cleared)

---

## Data Flow Diagrams

### Buy Transaction Flow

```
User → BondingCurve.buy(value: 100 TON)
    ↓
[Calculate tokens from price curve]
    ↓
[Split funds]:
  → reserve_balance += 50 TON
  → liquidity_accumulated += 40 TON
  → creator receives 5 TON
  → factory receives 5 TON
    ↓
[Update state]:
  → tokens_sold += calculated_tokens
  → total_raised += 100 TON
  → buyer_contributions[user] += 100 TON
    ↓
JettonMinter.mint(user, calculated_tokens)
    ↓
JettonWallet (user) balance += calculated_tokens
```

### Graduation Flow

```
BondingCurve (total_raised >= hard_cap)
    ↓
[Set is_graduated = 1]
    ↓
[Deploy DeDust Pool]:
  → Send pool creation to DeDust Factory
  → Assets: [JettonMinter, Native TON]
    ↓
[Add Liquidity]:
  → Transfer liquidity_accumulated TON to pool
  → Transfer remaining tokens to pool
    ↓
[Receive LP Tokens]
    ↓
[Burn LP Tokens]:
  → Transfer LP to null address (EQAAA...M9c)
  → LP permanently locked
    ↓
[Store dex_pool_address]
    ↓
Emit graduation event
```

### Refund Flow (Soft Cap Failure)

```
BondingCurve (30 days passed, !soft_cap_reached)
    ↓
trigger_failure_check()
    ↓
[Set is_failed = 1]
    ↓
[Calculate refunds]:
  for each buyer in buyer_contributions:
    refund = buyer_total - platform_fee - creator_fee
    refund_claims[buyer] = refund
    ↓
User → BondingCurve.claim_refund()
    ↓
[Look up refund_claims[user]]
    ↓
[Transfer refund to user]
    ↓
[Remove from refund_claims]
    ↓
JettonWallet.burn(user tokens)
```

---

**Status**: ✅ Data Model Complete - Ready for Contract Implementation
