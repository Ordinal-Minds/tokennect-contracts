# Smart Contract Commands Reference

Complete guide to all available commands for testing, deploying, and interacting with the TON Bonding Curve smart contracts.

---

## 📋 Table of Contents

1. [Testing Commands](#testing-commands)
2. [Compilation Commands](#compilation-commands)
3. [Deployment Commands](#deployment-commands)
4. [Interaction Commands](#interaction-commands)
5. [Available Scripts](#available-scripts)
6. [Environment Setup](#environment-setup)
7. [Important Notes](#important-notes)

---

## Testing Commands

### Run All Tests
```bash
npm test
```
Runs all unit and integration tests using Jest + TON Sandbox.

**Expected Output:**
```
PASS tests/unit/BondingCurve.Price.spec.ts
PASS tests/unit/BondingCurve.Buy.spec.ts
PASS tests/unit/BondingCurve.Sell.spec.ts
PASS tests/unit/BondingCurve.Graduation.spec.ts
PASS tests/unit/BondingCurve.Refund.spec.ts
PASS tests/unit/JettonMinter.spec.ts
PASS tests/unit/JettonWallet.spec.ts

Test Suites: 7 passed, 7 total
Tests:       47 passed, 47 total
```

### Run Unit Tests Only
```bash
npm run test:unit
```
Runs only unit tests (price calculations, buy/sell operations, etc.).

### Run Integration Tests
```bash
npm run test:integration
```
Runs end-to-end integration tests (full launch flows).

### Watch Mode
```bash
npm test -- --watch
```
Runs tests in watch mode, automatically re-running when files change.

### Run Specific Test File
```bash
npm test -- tests/unit/BondingCurve.Buy.spec.ts
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

---

## Compilation Commands

### Compile All Contracts
```bash
npm run build
```
or
```bash
npm run compile
```

Compiles all FunC contracts using available compiler (func-js, Blueprint, or Docker).

**Outputs:**
- `build/bonding-curve.boc`
- `build/jetton-minter.boc`
- `build/jetton-wallet.boc`

**Note:** Requires func compiler to be installed. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for installation instructions.

---

## Deployment Commands

### 1. Deploy Factory Contract
```bash
npm run deploy:factory
```

Deploys the LaunchpadFactory contract to TON blockchain.

**Configuration:**
- Hard cap tiers: [50, 200, 500, 1000, 5000] TON
- Time limits: [30, 60, 90] days

**Environment Variables Required:**
- `DEPLOYER_MNEMONIC` - Your 24-word wallet mnemonic
- `TON_NETWORK` - "testnet" or "mainnet"
- `TON_API_KEY` - TonCenter API key (optional but recommended)

**After Deployment:**
1. Copy the factory address from output
2. Add to `.env`:
   ```
   FACTORY_ADDRESS=EQAbc123...def
   ```

---

### 2. Create Token Launch
```bash
npm run create:launch -- --name "MyToken" --symbol "MTK" --hard-cap-tier 2
```

Creates a new token launch with bonding curve.

**Full Parameters:**
```bash
npm run create:launch -- \
  --name "DemoToken" \
  --symbol "DEMO" \
  --description "My token on bonding curve" \
  --image "https://example.com/logo.png" \
  --hard-cap-tier 2 \
  --time-limit 0 \
  --total-supply 1000000000
```

**Parameter Reference:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--name` | string | "DemoToken" | Token name |
| `--symbol` | string | "DEMO" | Token symbol/ticker |
| `--description` | string | "Token launched..." | Token description |
| `--image` | string | URL | Token logo image URL |
| `--hard-cap-tier` | 0-4 | 2 | Hard cap tier (see table below) |
| `--time-limit` | 0-2 | 0 | Time limit index (see table below) |
| `--total-supply` | number | 1000000000 | Total token supply |

**Hard Cap Tiers:**
| Index | Hard Cap | Soft Cap (20%) |
|-------|----------|----------------|
| 0 | 50 TON | 10 TON |
| 1 | 200 TON | 40 TON |
| 2 | 500 TON | 100 TON |
| 3 | 1,000 TON | 200 TON |
| 4 | 5,000 TON | 1,000 TON |

**Time Limits:**
| Index | Days |
|-------|------|
| 0 | 30 days |
| 1 | 60 days |
| 2 | 90 days |

**After Creation:**
1. Copy the BondingCurve address from output
2. Copy the JettonMinter address from output
3. Add to `.env`:
   ```
   BONDING_CURVE_ADDRESS=EQBond456...
   JETTON_MINTER_ADDRESS=EQJett789...
   ```

---

## Interaction Commands

### Buy Tokens
```bash
npm run buy -- --amount 10
```

Purchases tokens from the bonding curve.

**Parameters:**
- `--amount` - TON amount to spend (e.g., 10 for 10 TON)
- `--launch` - (Optional) Bonding curve address (uses `BONDING_CURVE_ADDRESS` from .env if not specified)

**Examples:**

Small buy (1 TON):
```bash
npm run buy -- --amount 1
```

Medium buy (10 TON):
```bash
npm run buy -- --amount 10
```

Large buy (100 TON):
```bash
npm run buy -- --amount 100
```

Buy from specific launch:
```bash
npm run buy -- --launch EQBond456... --amount 50
```

**Output Shows:**
- Current launch stats (total raised, tokens sold, soft cap status)
- Price quote (estimated tokens to receive)
- Transaction confirmation
- Updated stats after purchase
- Fund allocation breakdown (50/40/5/5 split)
- Soft cap/graduation events (if triggered)

**Special Events:**
- 🎉 **Soft Cap Reached** - When 20% of hard cap is reached
- 🎊 **Graduation Triggered** - When hard cap is reached

---

## Available Scripts

### Complete Script List

| Command | Description | Usage |
|---------|-------------|-------|
| `npm test` | Run all tests | Testing |
| `npm run test:unit` | Run unit tests only | Testing |
| `npm run test:integration` | Run integration tests | Testing |
| `npm run build` | Compile contracts | Pre-deployment |
| `npm run compile` | Compile contracts (alias) | Pre-deployment |
| `npm run deploy:factory` | Deploy factory contract | Deployment |
| `npm run create:launch` | Create token launch | Deployment |
| `npm run buy` | Buy tokens | Interaction |

---

## Environment Setup

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Configure .env File

**Required Variables:**
```env
# Your TON wallet mnemonic (24 words)
DEPLOYER_MNEMONIC="word1 word2 word3 ... word24"

# Network configuration
TON_NETWORK=testnet  # or "mainnet"

# TonCenter API key (get from https://toncenter.com)
TON_API_KEY=your_api_key_here
```

**Filled After Deployment:**
```env
# Filled after factory deployment
FACTORY_ADDRESS=

# Filled after launch creation
BONDING_CURVE_ADDRESS=
JETTON_MINTER_ADDRESS=
```

### 3. Get Testnet TON
Visit: https://t.me/testgiver_ton_bot

Request at least 10 TON for deployment and testing.

---

## Important Notes

### ⚠️ Before Deploying

1. **Tests Must Pass**
   ```bash
   npm test
   ```
   All 47 tests should pass before deployment.

2. **Contracts Must Be Compiled**
   ```bash
   npm run build
   ```
   Check that `build/` directory contains `.boc` files.

3. **Environment Must Be Configured**
   - `.env` file created from `.env.example`
   - `DEPLOYER_MNEMONIC` filled in
   - Wallet funded with testnet TON

### 🔐 Security

- **NEVER commit `.env` file to git** - It contains your wallet mnemonic
- **Use testnet first** - Test everything before mainnet deployment
- **Backup your mnemonic** - Loss means loss of funds
- **Check addresses** - Always verify contract addresses before large transactions

### 📊 Gas Costs (Testnet/Mainnet)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Deploy Factory | ~0.3 TON | One-time cost |
| Create Launch | ~0.5 TON | Deploys 3 contracts |
| Buy Tokens | ~0.15 TON | Per transaction |
| Sell Tokens | ~0.12 TON | Per transaction |
| Claim Refund | ~0.08 TON | If launch fails |
| Graduation | ~0.5 TON | Automatic with last buy |

**Budget for Testing:** 10 TON minimum
- 0.3 TON factory
- 0.5 TON launch
- 5 TON for token purchases
- 1.5 TON for gas fees
- 2.7 TON buffer

### 🎯 Smart Contract Behavior

#### Buy Limits
- **2% of remaining supply** OR **50M tokens**, whichever is smaller
- Prevents whale manipulation
- Enforced per transaction

#### Fund Allocation (Every Buy)
- **50%** → Reserve (backs token value, enables sells)
- **40%** → Liquidity Pool (for DEX graduation)
- **5%** → Creator (immediately withdrawable)
- **5%** → Platform (protocol fees)

#### Sell Fee
- **1% fee** on sell transactions
- Discourages quick flips
- Protects long-term holders

#### Soft Cap Rules
- **20% of hard cap** must be reached
- **30-day deadline** to reach soft cap
- **Full refunds** if soft cap missed
- **Unlimited time** after soft cap reached

#### Graduation
- **Automatic** when hard cap reached
- **Deploys DeDust pool** with 40% accumulated liquidity
- **Burns LP tokens** permanently (prevents rug pulls)
- **Closes bonding curve** (all trading moves to DEX)

### 🐛 Troubleshooting

#### "Transaction failed" Error
**Causes:**
- Insufficient balance (buy amount + 0.15 TON gas)
- Max buy limit exceeded (2% or 50M tokens)
- Deadline passed (if soft cap not reached)
- Launch already graduated or failed

**Solution:** Check launch stats first:
```bash
# View current stats in buy command output
npm run buy -- --amount 1
```

#### "func: command not found"
**Cause:** FunC compiler not installed

**Solutions:**
1. Install func-js: `npm install @ton-community/func-js`
2. Install Blueprint: `npm install -g @ton/blueprint`
3. Use Docker: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

#### "DEPLOYER_MNEMONIC not found"
**Cause:** `.env` file not configured

**Solution:**
```bash
cp .env.example .env
# Edit .env and add your mnemonic
```

#### "Insufficient balance"
**Cause:** Wallet doesn't have enough TON

**Solution:** Get testnet TON from https://t.me/testgiver_ton_bot

### 📚 Additional Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment walkthrough
- **[TEST_RESULTS.md](./TEST_RESULTS.md)** - Test coverage details
- **[specs/](./specs/001-token-launch-platform/)** - Feature specifications

### 🔗 External Resources

- [TON Documentation](https://docs.ton.org)
- [TON SDK](https://github.com/ton-org/ton)
- [TonCenter API](https://toncenter.com)
- [DeDust DEX](https://dedust.io)
- [TEP-74 Jetton Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [TON Blueprint](https://github.com/ton-org/blueprint)

### 💬 Development Tips

1. **Always run tests before deploying**
   ```bash
   npm test
   ```

2. **Use testnet for all experiments**
   - Set `TON_NETWORK=testnet` in `.env`
   - Free test TON available

3. **Start with small amounts**
   - Test buy with 1 TON first
   - Verify stats update correctly
   - Then try larger amounts

4. **Monitor soft cap progress**
   - 20% threshold is critical
   - 30-day deadline enforced
   - Plan accordingly

5. **Track graduation carefully**
   - Last buy that hits hard cap triggers graduation
   - DEX deployment takes ~15 seconds
   - Bonding curve closes permanently

6. **Save all addresses**
   - Factory address (one per network)
   - Launch addresses (one per token)
   - Keep organized in `.env` or separate file

### 📝 Example Workflow

**Complete Launch Flow:**
```bash
# 1. Setup
cp .env.example .env
# Edit .env with mnemonic

# 2. Run tests
npm test

# 3. Compile contracts
npm run build

# 4. Deploy factory
npm run deploy:factory
# → Copy FACTORY_ADDRESS to .env

# 5. Create launch
npm run create:launch -- --name "GameToken" --symbol "GAME" --hard-cap-tier 2
# → Copy BONDING_CURVE_ADDRESS to .env

# 6. Buy tokens (multiple times)
npm run buy -- --amount 10    # First buy
npm run buy -- --amount 20    # Second buy
npm run buy -- --amount 30    # Third buy
# ... continue until soft cap (100 TON)

# 7. Continue to hard cap (500 TON)
npm run buy -- --amount 50    # Multiple buys
# ... watch for graduation event

# 8. Verify graduation
# Check output shows "🎊 GRADUATION TRIGGERED!"
```

---

## 🚀 Quick Command Reference Card

```bash
# Testing
npm test                          # All tests
npm run test:unit                 # Unit tests only

# Compilation
npm run build                     # Compile contracts

# Deployment
npm run deploy:factory            # Deploy factory
npm run create:launch -- --name "Token" --symbol "TKN"  # Create launch

# Interaction
npm run buy -- --amount 10        # Buy 10 TON worth
npm run buy -- --launch <addr> --amount 50  # Buy from specific launch

# Environment
cp .env.example .env              # Setup environment
```

---

**Status**: ✅ All commands tested and documented  
**Last Updated**: 2025-10-01  
**Version**: 1.0.0