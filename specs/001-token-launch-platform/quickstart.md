# Quickstart: Token Launch Platform Demo

**Feature**: Token Launch Platform with Bonding Curve
**Date**: 2025-10-01
**Duration**: 2 minutes
**Audience**: Hackathon judges, investors, technical reviewers

## Demo Script

This demonstrates the complete token launch lifecycle from creation through bonding curve to automatic DEX graduation with locked liquidity.

---

## Prerequisites

- TON testnet wallet with 600+ TON (for buying tokens)
- LaunchpadFactory deployed at known address
- 3 test wallets: Factory Owner, Token Creator, Buyer1, Buyer2

---

## Scene 1: Deploy Factory (15 seconds)

**Action**: Deploy LaunchpadFactory contract

```bash
$ npm run deploy:factory

Deploying LaunchpadFactory...
✓ Factory deployed at: EQAbc123...def
✓ Owner set to: EQAxyz789...
✓ Hard cap tiers: [50, 200, 500, 1000, 5000] TON
✓ Time limits: [30, 60, 90] days
✓ Gas used: 0.3 TON
```

**Show**:
- Factory address
- Configuration (tiers, time limits)
- Initial platform balance: 0 TON

---

## Scene 2: Create Token Launch (10 seconds)

**Action**: Creator launches "DemoToken" with 500 TON hard cap

```bash
$ npm run create:launch -- \
  --name "DemoToken" \
  --symbol "DEMO" \
  --description "Hackathon demo token with bonding curve" \
  --image "https://example.com/demo.png" \
  --hard-cap-tier 2 \  # Index 2 = 500 TON
  --time-limit 0 \      # Index 0 = 30 days
  --total-supply 1000000000  # 1B tokens

Creating token launch...
✓ BondingCurve deployed: EQBond456...
✓ JettonMinter deployed: EQJett789...
✓ Launch ID: 1
✓ Hard cap: 500 TON
✓ Soft cap: 100 TON (20%)
✓ Deadline: 2025-11-01 (30 days)
✓ Gas used: 0.5 TON
```

**Show**:
- Contract addresses
- Launch parameters
- Soft cap threshold (100 TON)
- Time remaining: 30 days

---

## Scene 3: First Buy - Small Purchase (10 seconds)

**Action**: Buyer1 purchases tokens with 10 TON

```bash
$ npm run buy -- \
  --launch 1 \
  --amount 10 \
  --buyer Buyer1

Buying tokens...
✓ Sent 10 TON to bonding curve
✓ Price at start: 0.000001 TON/token
✓ Tokens received: ~3,162,000 DEMO
✓ Price at end: 0.000001778 TON/token
✓ Price impact: +77.8%
✓ Funds allocated:
  - Reserve: 5 TON
  - Liquidity pool: 4 TON
  - Creator: 0.5 TON
  - Platform: 0.5 TON
✓ Progress: 10 / 500 TON (2%)
✓ Soft cap progress: 10 / 100 TON (10%)
✓ Gas used: 0.15 TON
```

**Show**:
- Token amount received
- Price progression (before/after)
- Fund split visualization
- Soft cap progress bar: [██░░░░░░░░] 10%

---

## Scene 4: Second Buy - Medium Purchase (10 seconds)

**Action**: Buyer2 purchases with 50 TON

```bash
$ npm run buy -- \
  --launch 1 \
  --amount 50 \
  --buyer Buyer2

Buying tokens...
✓ Sent 50 TON to bonding curve
✓ Price at start: 0.000001778 TON/token
✓ Tokens received: ~7,071,000 DEMO
✓ Price at end: 0.000003466 TON/token
✓ Price impact: +94.9%
✓ Progress: 60 / 500 TON (12%)
✓ Soft cap progress: 60 / 100 TON (60%)
✓ Gas used: 0.15 TON
```

**Show**:
- Bonding curve in action (price accelerates)
- Soft cap progress: [██████░░░░] 60%
- Buyer1 vs Buyer2 tokens (early advantage visible)

---

## Scene 5: Reach Soft Cap (15 seconds)

**Action**: Continue buying until 100 TON raised

```bash
$ npm run buy -- --launch 1 --amount 40 --buyer Buyer3

✓ Soft cap reached! 🎉
✓ Progress: 100 / 500 TON (20%)
✓ Soft cap timestamp: 2025-10-01 10:30:00
✓ Time limit removed - unlimited time to hard cap
✓ Total buyers: 3
✓ Tokens sold: ~10,233,000 DEMO (1.02% of supply)
```

**Show**:
- "Soft Cap Reached" event
- 30-day deadline removed
- Can now take unlimited time to reach hard cap
- Launch status: Pre-Soft-Cap → Post-Soft-Cap

---

## Scene 6: Continue to Hard Cap (30 seconds)

**Action**: Accelerated buying to reach 500 TON

```bash
$ npm run buy:batch -- \
  --launch 1 \
  --amounts 50,50,50,50,50,50,50,50,50  # 400 TON more

Executing batch buys...
[██████████████████████] 100% (9/9 transactions)

✓ All buys complete
✓ Progress: 500 / 500 TON (100%) ✓
✓ Hard cap reached! 🎊
✓ Total tokens sold: ~22,360,000 DEMO (2.24% of supply)
✓ Reserve balance: 250 TON
✓ Liquidity accumulated: 200 TON
✓ Creator fees: 25 TON
✓ Platform fees: 25 TON
```

**Show**:
- Progress bar: [██████████] 100%
- Fund breakdown pie chart:
  - 250 TON reserves (50%)
  - 200 TON liquidity (40%)
  - 25 TON creator (5%)
  - 25 TON platform (5%)

---

## Scene 7: Automatic Graduation (20 seconds)

**Action**: Graduation triggered automatically by last buy

```bash
Graduation in progress...

[1/5] Deploying DeDust pool...
✓ Pool created: EQPool123...
✓ Pool type: Volatile (x*y=k)
✓ Assets: DEMO ↔ TON

[2/5] Adding liquidity...
✓ Deposited 200 TON
✓ Deposited 977,640,000 DEMO (remaining supply)
✓ Initial price: 0.000000205 TON/token

[3/5] Receiving LP tokens...
✓ LP tokens received: 4,472,135 LP-DEMO-TON

[4/5] Locking liquidity...
✓ LP tokens sent to null address: EQAAA...M9c
✓ Liquidity permanently locked ✓

[5/5] Finalizing graduation...
✓ Bonding curve closed
✓ DEX pool address stored
✓ Trading now available on DeDust

🎉 Graduation complete!
```

**Show**:
- Step-by-step graduation process
- LP token burn transaction (prove locked)
- DeDust pool link
- Launch status: Post-Soft-Cap → Graduated

---

## Scene 8: Verify DEX Liquidity (10 seconds)

**Action**: Query DeDust pool to confirm liquidity

```bash
$ npm run query:pool -- EQPool123...

Querying DeDust pool...
✓ Pool address: EQPool123...
✓ Token A: DEMO (EQJett789...)
✓ Token B: TON (native)
✓ Reserve A: 977,640,000 DEMO
✓ Reserve B: 200 TON
✓ LP total supply: 4,472,135
✓ LP burned: 4,472,135 (100%) ✓
✓ Liquidity lock: PERMANENT ✓
✓ Pool status: ACTIVE
```

**Show**:
- DeDust pool reserves
- LP tokens 100% burned (trustless proof)
- Pool ready for trading

---

## Scene 9: Bonding Curve Closed (5 seconds)

**Action**: Attempt buy on bonding curve (should fail)

```bash
$ npm run buy -- --launch 1 --amount 10 --buyer Buyer4

Error: Transaction failed
✗ Exit code: 400 (Already graduated)
✗ Message: "Bonding curve closed - trade on DEX"
✗ DEX link: https://dedust.io/swap/DEMO-TON
```

**Show**:
- Buy rejected (curve closed)
- Users redirected to DEX
- Platform enforces single liquidity source

---

## Scene 10: Trade on DEX (5 seconds)

**Action**: Execute swap on DeDust

```bash
$ npm run dex:swap -- \
  --pool EQPool123... \
  --from TON \
  --to DEMO \
  --amount 5

Swapping 5 TON for DEMO...
✓ Swap executed
✓ Received: ~24,390 DEMO
✓ Price: 0.000000205 TON/token
✓ Slippage: 0.1%
✓ Gas: 0.08 TON

✓ Trading successful on DEX!
```

**Show**:
- DEX trade works
- Normal AMM swap (no bonding curve)
- Liquidity available for all users

---

## Demo Summary

**Total Time**: ~2 minutes

**Demonstrated**:
1. ✅ Factory deployment & configuration
2. ✅ Token launch creation
3. ✅ Bonding curve pricing (early buyer advantage)
4. ✅ Fund allocation (50/40/5/5 split)
5. ✅ Soft cap validation (20% threshold + 30-day deadline)
6. ✅ Hard cap graduation trigger
7. ✅ Automatic DEX pool deployment
8. ✅ LP token permanent locking (rug pull prevention)
9. ✅ Bonding curve closure
10. ✅ DEX trading enabled

**Key Metrics**:
- Launched: DemoToken (1B supply)
- Raised: 500 TON in bonding curve
- DEX Liquidity: 200 TON + 977M tokens (locked forever)
- Creator earned: 25 TON
- Platform earned: 25 TON
- Investors: Protected by locked liquidity

---

## Validation Checklist

### Constitutional Requirements Met

- [x] **Hackathon Speed**: Demo runs in 2 minutes
- [x] **Simplicity**: Clear linear flow (launch → buy → graduate)
- [x] **Best Practices**: Clear error messages, transparent pricing
- [x] **Follow Directions**: All spec requirements demonstrated
- [x] **MVP Focus**: Core value prop visible (bonding curve → locked DEX liquidity)

### Technical Validation

- [x] Price curve works (square root progression)
- [x] Fund splits correct (50/40/5/5)
- [x] Soft cap enforced (20%, 30 days)
- [x] Hard cap graduation automatic
- [x] LP tokens burned (verifiable on-chain)
- [x] Bonding curve closes after graduation
- [x] DEX trading enabled

### User Experience

- [x] Clear progress indicators
- [x] Transparent pricing (before/after shown)
- [x] Immediate feedback (transaction confirmations)
- [x] Error handling (rejected transactions explained)
- [x] Success signals (checkmarks, celebrations)

---

## Alternative Scenarios (Time Permitting)

### Scenario A: Soft Cap Failure (30 seconds)

```bash
# Create launch with 500 TON hard cap (100 TON soft cap)
# Buy only 80 TON over 30 days
# Time passes...

$ npm run trigger:failure -- --launch 2

✓ Soft cap deadline passed
✓ Soft cap not reached (80 / 100 TON)
✓ Launch marked as failed
✓ Refunds calculated for 5 buyers
✓ Total refunds available: 72 TON
  (80 TON spent - 8 TON fees)

$ npm run claim:refund -- --launch 2 --buyer Buyer1

✓ Refund claimed: 9 TON
✓ Tokens burned
✓ Launch status: Failed
```

### Scenario B: Sell Tokens (15 seconds)

```bash
# Before graduation, sell tokens back to curve

$ npm run sell -- \
  --launch 1 \
  --amount 1000000 \
  --seller Buyer1

✓ Selling 1,000,000 DEMO
✓ Calculated return: 3.16 TON
✓ Sell fee (1%): 0.0316 TON
✓ Net return: 3.13 TON
✓ Tokens burned
✓ Reserve balance updated
```

---

## Technical Notes

### Gas Costs Summary

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Deploy Factory | 0.3 TON | One-time |
| Create Launch | 0.5 TON | 3 contracts |
| Buy | 0.15 TON | Per transaction |
| Sell | 0.12 TON | Per transaction |
| Graduation | 0.5 TON | Automatic (included in final buy) |
| Claim Refund | 0.08 TON | If launch fails |

**Total Demo Cost**: ~7 TON (6 TON for buys + 1 TON for gas)

### Performance Characteristics

- **Transaction Finality**: 5 seconds (TON blockchain)
- **Price Calculation**: <10ms (integer math, Newton's method)
- **Storage Access**: Single cell read/write (optimal)
- **Graduation Time**: ~15 seconds (multi-contract interaction)

### Error Codes Reference

| Code | Operation | Meaning |
|------|-----------|---------|
| 400 | buy | Already graduated |
| 401 | buy | Launch failed |
| 402 | buy | Minimum buy not met |
| 403 | buy | Deadline passed (pre-soft-cap) |
| 404 | buy | Max buy limit exceeded |
| 410 | sell | Already graduated |
| 411 | sell | Launch failed |
| 412 | sell | Insufficient reserve |
| 420 | refund | Launch not failed |
| 421 | refund | No refund available |

---

**Status**: ✅ Quickstart Complete - Ready for Demo Execution

**Next**: Run `/tasks` to generate implementation tasks
