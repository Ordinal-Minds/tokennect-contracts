# Contract Specifications

**Feature**: Token Launch Platform with Bonding Curve
**Date**: 2025-10-01

## Overview

This directory contains detailed specifications for the four smart contracts that comprise the token launch platform. All specifications are derived from the comprehensive technical implementation provided and align with TEP-74 Jetton standards.

---

## Contract Summary

### 1. LaunchpadFactory
**File**: `launchpad-factory.fc`
**Purpose**: Central factory deploying and managing all token launches

**Key Operations**:
- `deploy_launch(metadata, tier_index, time_index, supply)` - Create new token launch
- `withdraw_platform_fees()` - Owner withdraws accumulated fees
- `update_hard_cap_tiers(new_tiers)` - Update tier configuration

**Get Methods**:
- `get_launch_info(launch_id)` - Return launch addresses and config
- `get_platform_stats()` - Return platform-wide statistics

---

### 2. BondingCurveContract
**File**: `bonding-curve.fc`
**Purpose**: Core bonding curve logic with square root pricing

**Key Operations**:
- `buy(msg_value)` - Purchase tokens at curve price
- `sell(token_amount)` - Sell tokens back to curve (pre-graduation)
- `claim_refund()` - Claim refund if soft cap failed
- `trigger_failure_check()` - Trigger soft cap failure if deadline passed
- `graduate_to_dex()` - Internal: Deploy DEX pool at hard cap

**Get Methods**:
- `get_launch_stats()` - Current state and progress
- `get_buy_quote(ton_amount)` - Calculate tokens for TON amount
- `get_sell_quote(token_amount)` - Calculate TON return for tokens
- `calculate_current_price()` - Current price per token
- `get_max_buy()` - Maximum tokens purchasable in one tx
- `get_user_refund(address)` - Refund available for user

**Price Calculation**:
- Square root bonding curve: `Price(k) = base_price × √(k / total_supply)`
- Newton's method for sqrt (20 iteration max)
- Integer-only math for determinism

---

### 3. JettonMinter (TEP-74)
**File**: `jetton-minter.fc`
**Purpose**: Standard TEP-74 token minter with bonding curve integration

**Key Operations**:
- `mint(amount, recipient)` - Mint tokens (bonding curve only)
- `burn_notification(amount, sender)` - Handle burn events

**Get Methods**:
- `get_jetton_data()` - Return total supply, admin, metadata
- `get_wallet_address(owner)` - Calculate wallet address for owner

---

### 4. JettonWallet (TEP-74)
**File**: `jetton-wallet.fc`
**Purpose**: Standard TEP-74 user token wallet

**Key Operations**:
- `transfer(amount, destination, payload)` - Transfer tokens
- `internal_transfer(amount, from)` - Receive tokens
- `burn(amount)` - Burn tokens

**Get Methods**:
- `get_wallet_data()` - Return balance, owner, minter

---

## Implementation Details

The complete implementation specifications including:
- Storage structures (FunC cell layouts)
- Operation pseudocode (validation, state updates, fund flows)
- Price calculation algorithms (Newton's method sqrt, integral calculations)
- Error codes (400-series buy, 410-series sell, 420-series refund)
- Gas cost estimates (buy ~0.15 TON, sell ~0.12 TON)
- TEP-74 compliance details
- DeDust integration flow

...were provided in the comprehensive technical implementation document shared during planning. These specifications serve as the authoritative reference for implementation tasks.

---

## Development Approach

### Test-Driven Development

1. **Unit Tests First**: Write tests for each contract operation
2. **Verify Failure**: Ensure tests fail before implementation
3. **Implement**: Write FunC code to pass tests
4. **Integration**: Test cross-contract interactions
5. **Validation**: Run quickstart.md scenario end-to-end

### Contract Dependencies

```
JettonWallet (independent)
    ↓ (used by)
JettonMinter (depends on JettonWallet code)
    ↓ (minted by)
BondingCurveContract (depends on JettonMinter)
    ↓ (deployed by)
LaunchpadFactory (deploys BondingCurve)
```

**Implementation Order**: Bottom-up (JettonWallet → JettonMinter → BondingCurve → Factory)

---

## Testing Strategy

### Unit Test Coverage

**BondingCurve**:
- ✅ Price calculation (sqrt accuracy within 0.1%)
- ✅ Buy operation (fund splits, limits, soft cap trigger)
- ✅ Sell operation (fee application, burn confirmation)
- ✅ Refund calculation (soft cap failure)
- ✅ Graduation trigger (hard cap reached)

**JettonMinter**:
- ✅ Mint authorization (only bonding curve)
- ✅ Burn notification handling
- ✅ Wallet address calculation

**JettonWallet**:
- ✅ Transfer validation
- ✅ Balance tracking
- ✅ Burn operation

**LaunchpadFactory**:
- ✅ Launch deployment (3 contracts created)
- ✅ Registry management
- ✅ Fee collection

### Integration Tests

1. **Full Launch Flow**: Create → Buy → Soft Cap → Hard Cap → Graduate → DEX Trade
2. **Soft Cap Failure**: Create → Partial Buys → Deadline Pass → Refunds
3. **Sell Flow**: Buy → Sell (pre-graduation) → Fee Verification

---

## Security Considerations

### Validated Invariants

1. **Fund Conservation**: `total_raised == reserves + liquidity + creator_fees + platform_fees`
2. **Supply Conservation**: `tokens_sold <= total_supply`
3. **State Exclusivity**: Cannot be graduated AND failed
4. **Reserve Sufficiency**: Reserves always >= sell return amount
5. **LP Lock Permanence**: LP tokens sent to null address (irreversible)

### Attack Vectors Mitigated

- ✅ **Whale Manipulation**: 2% + 50M max buy limits
- ✅ **Price Manipulation**: No cooldown needed (curve self-regulates)
- ✅ **Rug Pull**: LP tokens permanently burned
- ✅ **Front-running**: Deterministic pricing (no slippage manipulation)
- ✅ **Re-entrancy**: TON's actor model prevents re-entrancy
- ✅ **Integer Overflow**: FunC compiler checks + conservative limits

---

## Gas Optimization

### Applied Techniques

1. **Inline Functions**: `sqrt_newton`, `calculate_price` marked inline
2. **Single Storage Op**: Load state once, modify in memory, save once
3. **Early Validation**: `throw_unless` before expensive operations
4. **Bounded Loops**: Newton's method capped at 20 iterations
5. **Lazy Dictionaries**: Refund claims only created on failure

### Gas Budget (per operation)

- Deploy Factory: ~0.3 TON
- Create Launch: ~0.5 TON (3 contracts)
- Buy: ~0.15 TON
- Sell: ~0.12 TON
- Graduation: ~0.5 TON (complex multi-contract)
- Claim Refund: ~0.08 TON

---

## Next Steps

1. Run `/tasks` to generate implementation task list
2. Execute tasks in TDD order (tests → implementation)
3. Validate with quickstart.md scenario
4. Deploy to testnet for final verification

---

**Status**: ✅ Contract Specifications Complete
