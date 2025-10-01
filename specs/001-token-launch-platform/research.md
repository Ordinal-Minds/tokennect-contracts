# Research: Token Launch Platform Technology Decisions

**Feature**: Token Launch Platform with Bonding Curve
**Date**: 2025-10-01
**Status**: Complete

## Overview

This document captures all technology research and decision rationale for the TON token launch platform implementation. All decisions optimize for the 5-hour hackathon constraint while maintaining production-quality smart contract security.

---

## 1. Blockchain Platform Selection

### Decision: TON (The Open Network)

### Rationale:
- **Telegram Integration**: Native fit with Tokenect's Telegram mini app platform
- **Transaction Costs**: ~0.01-0.05 TON per transaction (~$0.02-0.10) vs Ethereum's $5-50
- **Speed**: 5-second finality vs Ethereum's 12-15 seconds
- **Developer Tools**: Mature SDK (@ton/core, @ton/sandbox) with TypeScript support
- **DEX Availability**: DeDust provides production-ready DEX infrastructure

### Alternatives Considered:
- **Ethereum**: Rejected due to prohibitive gas costs for frequent buy/sell transactions
- **Solana**: Rejected due to no Telegram integration, less proven smart contract security
- **Binance Smart Chain**: Rejected due to centralization concerns, no Telegram integration

### References:
- TON Documentation: https://docs.ton.org
- Transaction costs comparison: https://ton.org/analysis/six-unique-aspects-of-ton-blockchain-that-will-surprise-solidity-developers

---

## 2. Smart Contract Language

### Decision: FunC

### Rationale:
- **Only viable option**: TON smart contracts must be written in FunC or Fift
- **Mature tooling**: func compiler, fift assembler, stdlib.fc included
- **Type safety**: Strongly typed with explicit storage structures
- **Documentation**: Comprehensive guides and examples available

### Alternatives:
- **Fift**: Too low-level (assembly-like), slower development
- **Tact** (new high-level language): Too immature for hackathon risk tolerance

### Learning Resources:
- FunC Documentation: https://docs.ton.org/develop/func/overview
- FunC Cookbook: https://docs.ton.org/develop/func/cookbook
- TEP-74 Jetton Implementation Examples: https://github.com/ton-blockchain/token-contract

---

## 3. Testing Framework

### Decision: @ton/sandbox + Jest + TypeScript

### Rationale:
- **@ton/sandbox**: Official TON testing framework, local blockchain emulator
- **Jest**: Industry-standard test runner, familiar syntax, excellent TypeScript integration
- **TypeScript**: Type safety catches errors before runtime, better IDE support
- **Speed**: Local tests run in milliseconds, no testnet deployment needed for iteration

### Alternatives Considered:
- **Blueprint framework**: Too heavyweight for hackathon, adds unnecessary abstraction
- **Python tests (toncli)**: Less type safety, slower iteration
- **Manual testnet testing**: Too slow for rapid iteration, costs real TON

### Test Structure:
```typescript
import { Blockchain } from '@ton/sandbox';
import { toNano } from '@ton/core';

describe('BondingCurve', () => {
  let blockchain: Blockchain;
  let bondingCurve: SandboxContract<BondingCurve>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    bondingCurve = blockchain.openContract(await BondingCurve.fromInit());
  });

  it('should calculate correct price', async () => {
    const price = await bondingCurve.getPrice();
    expect(price).toBe(toNano('0.000001'));
  });
});
```

### Setup Time:
- npm install: ~2 minutes
- Test infrastructure setup: ~5 minutes
- Total: **7 minutes** (well within 15-minute setup budget)

---

## 4. Token Standard

### Decision: TEP-74 Jetton (Fungible Token Standard)

### Rationale:
- **Industry Standard**: All TON wallets support TEP-74
- **Battle-tested**: Used by USDT, Tether, and major TON tokens
- **DEX Compatible**: DeDust and all TON DEXs expect TEP-74
- **Wallet Architecture**: Distributed wallet model (each user has own contract) provides gas efficiency

### Key Components:
- **JettonMinter**: Central contract managing total supply, mints to user wallets
- **JettonWallet**: Per-user contract holding balance, enables transfers
- **Metadata (TEP-64)**: Standard format for name, symbol, image, decimals

### Implementation References:
- TEP-74 Specification: https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
- Reference Implementation: https://github.com/ton-blockchain/token-contract/tree/main/ft

### Development Time Estimate:
- JettonWallet: 15 minutes (copy reference, minor modifications)
- JettonMinter: 15 minutes (copy reference, add bonding curve hooks)
- Total: **30 minutes**

---

## 5. DEX Integration

### Decision: DeDust

### Rationale:
- **Market Leader**: Largest liquidity on TON (~60% market share)
- **Volatile Pools**: Supports constant product (x*y=k) pools for new tokens
- **LP Token Locking**: Can send LP tokens to null address for permanent lock
- **Documentation**: Well-documented pool creation and liquidity addition
- **Gas Costs**: ~0.3-0.5 TON for pool creation + liquidity add

### Integration Approach:
1. When hard cap reached, send pool creation message to DeDust factory
2. DeDust returns pool address
3. Transfer tokens and TON to pool address
4. Receive LP tokens at BondingCurve contract
5. Burn LP tokens (send to EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c - null address)

### Alternatives Considered:
- **STON.fi**: Less liquidity, similar API
- **Custom AMM**: No time for custom DEX in hackathon
- **Liquidity locked but not burned**: Less trustless (contract could be upgraded)

### References:
- DeDust Docs: https://docs.dedust.io/
- Pool Creation: https://docs.dedust.io/reference/factory#create-pool
- LP Token Burning: https://github.com/dedust-io/docs/blob/main/contracts/pool.md

---

## 6. Price Curve Algorithm

### Decision: Square Root Bonding Curve

### Formula:
```
Price(k) = base_price × √(k / total_supply)
```
Where:
- k = tokens already sold
- total_supply = maximum tokens (default 1B)
- base_price = 0.000001 TON (1 nanoton)

### Rationale:
- **Balanced Growth**: Not too steep (linear) or too gentle (logarithmic)
- **Early Advantage**: Early buyers get significantly better prices
- **Price Discovery**: Market naturally finds equilibrium
- **Gas Efficient**: Simple sqrt calculation via Newton's method

### Price Progression Example (1B supply, 500 TON hard cap):
| Tokens Sold | % Sold | Price | TON Raised |
|-------------|--------|-------|------------|
| 0 | 0% | $0.00001 | 0 TON |
| 250M | 25% | $0.00447 | ~125 TON |
| 500M | 50% | $0.00632 | ~250 TON |
| 750M | 75% | $0.00775 | ~375 TON |
| 1B | 100% | $0.00894 | ~500 TON |

### Buy Cost Integration:
For square root curve, the integral from k1 to k2 is:
```
Cost = base_price × (2/3) × (k2^1.5 - k1^1.5) / √total_supply
```

### Alternatives Considered:
- **Linear**: Too steep price increase, discourages later buyers
- **Logarithmic**: Too gentle, not enough early buyer advantage
- **Exponential**: Prohibitively steep, unsustainable
- **Sigmoid**: Complex calculation, gas expensive

---

## 7. Integer Square Root Implementation

### Decision: Newton's Method

### Algorithm:
```func
int sqrt_newton(int x) inline {
    if (x == 0) { return 0; }

    int z = (x + 1) / 2;  ;; Initial guess
    int y = x;

    int iterations = 0;
    while ((z < y) & (iterations < 20)) {
        y = z;
        z = (x / z + z) / 2;  ;; Newton iteration: z_{n+1} = (x/z_n + z_n) / 2
        iterations += 1;
    }

    return y;
}
```

### Rationale:
- **Fast Convergence**: Typically 5-10 iterations for TON numbers (64-bit)
- **Integer-Only**: Works with FunC's integer math (no floating point)
- **Gas Efficient**: ~10-20 gas units per iteration
- **Proven**: Used in Uniswap V2, Compound, and major DeFi protocols

### Convergence Analysis:
- Numbers up to 2^64: Max 20 iterations
- Typical TON amounts (1-10,000 TON): 8-12 iterations
- Total gas cost: negligible compared to storage operations

### Alternatives:
- **Binary Search**: Slower (log n iterations vs log log n for Newton)
- **Lookup Table**: Too much storage (would need 10,000+ entries)
- **Babylonian Method**: Same as Newton's method (different name)

---

## 8. Fund Allocation Strategy

### Decision: Inline Calculation During Buy

### Implementation:
```func
;; On each buy transaction:
reserve_amount = msg_value * 50 / 100;       ;; 50%
liquidity_amount = msg_value * 40 / 100;     ;; 40%
creator_fee = msg_value * 5 / 100;           ;; 5%
platform_fee = msg_value * 5 / 100;          ;; 5%

;; Update state:
reserve_balance += reserve_amount;
total_raised += msg_value;

;; Send fees immediately:
send_ton(creator, creator_fee);
send_ton(platform_factory, platform_fee);

;; Liquidity accumulated in contract until graduation
```

### Rationale:
- **Simplicity**: No separate pool contracts
- **Gas Efficiency**: Single transaction handles all allocations
- **Transparency**: All logic in one place, easy to audit
- **Real-time**: Fees paid immediately, no withdrawal delays

### Alternatives Considered:
- **Separate Pool Contracts**: Unnecessary complexity, higher gas costs
- **Batch Processing**: Delayed fee payments, worse UX
- **Percentage Variables**: Unnecessary flexibility, more attack surface

---

## 9. Soft Cap & Refund Mechanism

### Decision: 20% Soft Cap with 30-Day Deadline, Full Refunds

### Storage Approach:
```func
;; Track each buyer's total contribution
buyer_contributions: HashmapE 267 Coins;  ;; address -> total_spent

;; On soft cap failure:
refund_claims: HashmapE 267 Coins;  ;; address -> refund_amount

;; Calculate refunds:
refund = buyer_total_spent - platform_fees_paid - creator_fees_paid
```

### Rationale:
- **Investor Protection**: No risk of backing failed projects
- **Storage Trade-off**: Need to track buyers for refunds, but only until graduation/failure
- **Gas Consideration**: Refund claiming is pull-based (users claim), not push-based (cheaper)
- **Fee Treatment**: Platform/creator don't refund their earned fees (operational costs covered)

### Refund Calculation Example:
- Buyer spent 100 TON
- Platform fee (5%): 5 TON
- Creator fee (5%): 5 TON
- Refund: 100 - 5 - 5 = **90 TON**

### Alternatives Considered:
- **No refunds**: Too risky for investors, would kill adoption
- **Partial refunds (e.g., 80%)**: Arbitrary, less attractive
- **100% refunds including fees**: Platform loses money on failed launches (unsustainable)
- **Push refunds**: Gas prohibitive (would need to iterate all buyers)

---

## 10. Anti-Manipulation Mechanisms

### Decision: 2% Remaining Supply + 50M Absolute Cap, No Cooldown

### Max Buy Calculation:
```func
remaining = total_supply - tokens_sold;
percent_limit = remaining * 2 / 100;           ;; 2% of what's left
absolute_limit = 50000000 * 1000000000;       ;; 50M tokens (with 9 decimals)

max_buy = min(percent_limit, absolute_limit);
```

### Rationale:
- **Percentage Limit**: Prevents late-stage whale accumulation
- **Absolute Cap**: Prevents gaming via repeated 2% buys
- **No Cooldown**: Bonding curve itself provides manipulation resistance (price increases)
- **Fair Distribution**: Early believers can buy meaningfully, but no single entity dominates

### Example Scenarios:
| Remaining | 2% Limit | Absolute Cap | Actual Max |
|-----------|----------|--------------|------------|
| 1B tokens | 20M | 50M | 20M ✓ |
| 500M | 10M | 50M | 10M ✓ |
| 100M | 2M | 50M | 2M ✓ |
| 5B (large supply) | 100M | 50M | 50M ✓ |

### Alternatives Considered:
- **Fixed % only**: Fails for large supply tokens (whale risk)
- **Absolute only**: Fails for small supply tokens (can buy 100%)
- **Cooldown**: Frustrates legitimate users, whales use multiple wallets anyway
- **KYC/Whitelist**: Too complex for hackathon, friction for users

---

## 11. Storage & State Management

### Decision: Cell-Based Storage with Explicit State Flags

### Storage Structure:
```func
;; BondingCurve storage (fits in single cell):
(
  slice jetton_minter,      ;; 267 bits
  slice creator,            ;; 267 bits
  int launch_timestamp,     ;; 32 bits
  int hard_cap,             ;; 128 bits (nanoTON)
  int soft_cap,             ;; 128 bits
  int time_limit,           ;; 32 bits (seconds)
  int total_supply,         ;; 128 bits (tokens)
  int tokens_sold,          ;; 128 bits
  int reserve_balance,      ;; 128 bits
  int total_raised,         ;; 128 bits
  int is_graduated,         ;; 1 bit
  int is_failed,            ;; 1 bit
  int soft_cap_reached,     ;; 1 bit
  int soft_cap_timestamp,   ;; 32 bits
  slice dex_pool_address,   ;; 267 bits (null if not graduated)
  cell refund_claims        ;; separate cell (dictionary)
)
```

### Rationale:
- **Single Cell**: Main state fits in one cell (~1023 bits available)
- **Separate Dictionary**: Refund claims in separate cell (unbounded size)
- **Explicit Flags**: Boolean states (is_graduated, is_failed) prevent ambiguous states
- **Gas Efficiency**: Single cell read/write for most operations

### State Machine:
```
Launch Created
    ↓
[Pre-Soft-Cap] → (30 days) → [Failed] → Refunds Available
    ↓ (reach 20%)
[Post-Soft-Cap] → (unlimited time) → [Graduated] → DEX Trading
```

---

## 12. Gas Optimization Strategies

### Decision: Inline Functions + Minimal Storage Reads

### Optimizations Applied:
1. **Inline Math Functions**: sqrt_newton, calculate_price marked inline
2. **Single Storage Read**: Load all state once, modify in memory, save once
3. **Early Validation**: Fail fast with throw_unless before expensive operations
4. **Minimal Loops**: Newton's method capped at 20 iterations
5. **Dictionary Only When Needed**: Refund claims only created on failure

### Gas Cost Estimates:
| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Buy (typical) | ~0.15 TON | Includes mint, transfers, storage |
| Sell | ~0.12 TON | Includes burn, transfer |
| Graduation | ~0.5 TON | Complex multi-contract interaction |
| Claim Refund | ~0.08 TON | Dictionary lookup + transfer |
| Deploy Launch | ~0.3 TON | 3 contracts deployed |

### Alternatives Considered:
- **External Functions**: Higher gas (inter-contract calls)
- **Cached Calculations**: More storage, stale data risk
- **Batch Operations**: Complex, doesn't fit hackathon timeline

---

## 13. Testing Strategy

### Decision: Happy Path Focus with Critical Edge Cases

### Test Coverage (within 45-minute testing budget):

**Unit Tests** (30 minutes):
- ✅ Price calculation (sqrt, integral) - 5 test cases
- ✅ Buy operation (allocations, limits) - 8 test cases
- ✅ Sell operation (fees, burns) - 5 test cases
- ✅ Soft cap trigger - 3 test cases
- ✅ Graduation trigger - 3 test cases

**Integration Tests** (15 minutes):
- ✅ Full launch flow (buy → soft cap → graduation)
- ✅ Soft cap failure (refunds work)
- ✅ Graduation (DEX pool created, LP locked)

**Deferred** (post-hackathon):
- ⏸️ Complex refund scenarios (partial refunds, multiple buyers)
- ⏸️ Graduation retry on failure
- ⏸️ Concurrent transaction edge cases
- ⏸️ Extreme values (very large/small amounts)

### Rationale:
- **Time Constraint**: 45 minutes for testing phase
- **Risk Priority**: Critical paths (money flow) tested first
- **Demonstrability**: Tests validate demo script works

---

## 14. Deployment Strategy

### Decision: Single Factory Deployment, Launches via Factory

### Deployment Flow:
1. Deploy LaunchpadFactory to testnet (~30 seconds)
2. Users call factory.deploy_launch() to create bonding curves
3. Each deploy_launch creates 3 contracts:
   - BondingCurveContract
   - JettonMinter (child of curve)
   - JettonWallet code (stored in minter)

### Rationale:
- **Centralization**: Factory provides single entry point, easier discovery
- **Upgrade Path**: Can deploy new factory version without touching existing launches
- **Fee Collection**: Platform fees flow to single factory contract
- **Registry**: Factory maintains list of all launches

### Testnet Strategy:
- Use testnet.toncenter.com for initial testing
- Get testnet TON from https://t.me/testgiver_ton_bot
- Deploy factory with 5 TON balance (covers gas for ~15 test launches)

---

## Summary & Validation

### All Technical Unknowns Resolved:
- [x] Blockchain: TON
- [x] Language: FunC
- [x] Testing: @ton/sandbox + Jest + TypeScript
- [x] Token: TEP-74 Jetton
- [x] DEX: DeDust
- [x] Curve: Square root with Newton's method
- [x] Allocations: Inline 50/40/5/5 split
- [x] Soft Cap: 20% + 30 days + full refunds
- [x] Anti-Manipulation: 2% + 50M limits, no cooldown
- [x] Storage: Cell-based with explicit state flags
- [x] Gas: Inline functions, single storage read/write
- [x] Testing: Happy path focus (45m budget)
- [x] Deployment: Factory pattern

### Time Budget Validation:
- Setup: 15 minutes ✓
- JettonWallet + JettonMinter: 30 minutes ✓
- BondingCurve (price math): 20 minutes ✓
- BondingCurve (buy/sell): 40 minutes ✓
- BondingCurve (soft cap/graduation): 30 minutes ✓
- LaunchpadFactory: 25 minutes ✓
- Testing: 45 minutes ✓
- Deployment scripts: 15 minutes ✓

**Total: 4 hours 20 minutes** (40 minutes buffer within 5-hour limit)

---

**Status**: ✅ Research Complete - Ready for Phase 1 Design
