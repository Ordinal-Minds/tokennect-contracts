# Smart Contract Deployment Guide

This guide walks you through deploying your TON smart contracts and connecting them with a frontend.

## Prerequisites

- Node.js 18+ installed
- TON wallet with testnet tokens (get from https://t.me/testgiver_ton_bot)
- All tests passing (run `npm test`)

---

## Step 1: Setup Environment

### 1.1 Copy environment template

```bash
cp .env.example .env
```

### 1.2 Configure .env file

Edit `.env` with your settings:

```env
# Your 24-word TON wallet mnemonic
DEPLOYER_MNEMONIC="word1 word2 word3 ... word24"

# Network (testnet for development)
TON_NETWORK=testnet

# Get API key from https://toncenter.com
TON_API_KEY=your_api_key_here

# These will be filled after deployment
FACTORY_ADDRESS=
BONDING_CURVE_ADDRESS=
JETTON_MINTER_ADDRESS=
```

### 1.3 Generate a new wallet (if needed)

```bash
npm install -g @ton/ton
ton-wallet create
# Save the mnemonic to .env as DEPLOYER_MNEMONIC
```

### 1.4 Fund your wallet

Get testnet TON from the Telegram bot:
https://t.me/testgiver_ton_bot

Minimum required: 10 TON for deployment + testing

---

## Step 2: Compile Contracts

### Option A: Using func-js (Recommended)

```bash
# Install func-js
npm install @ton-community/func-js

# Run compilation script
npm run build
```

### Option B: Using TON Blueprint

```bash
# Install blueprint
npm install -g @ton/blueprint

# Initialize (if not already)
blueprint init

# Build contracts
blueprint build
```

### Option C: Using Docker

```bash
docker run --rm -v $(pwd):/contracts tonlabs/compilers \
  func -o /contracts/build/bonding-curve.fif -SPA /contracts/contracts/bonding-curve.fc

docker run --rm -v $(pwd):/contracts tonlabs/compilers \
  func -o /contracts/build/jetton-minter.fif -SPA /contracts/contracts/jetton-minter.fc

docker run --rm -v $(pwd):/contracts tonlabs/compilers \
  func -o /contracts/build/jetton-wallet.fif -SPA /contracts/contracts/jetton-wallet.fc
```

**Expected output:**
```
build/
  ├── bonding-curve.boc
  ├── jetton-minter.boc
  └── jetton-wallet.boc
```

---

## Step 3: Deploy Factory Contract

```bash
npm run deploy:factory
```

**Expected output:**
```
🚀 Deploying LaunchpadFactory to TON Testnet...

📝 Configuration:
   Network: testnet
   Hard cap tiers: [50, 200, 500, 1000, 5000] TON
   Time limits: [30, 60, 90] days

✓ Factory deployed at: EQAbc123...def
✓ Owner set to: EQAxyz789...
✓ Gas used: 0.3 TON
```

**Action:** Copy the factory address to `.env`:
```env
FACTORY_ADDRESS=EQAbc123...def
```

---

## Step 4: Create Token Launch

```bash
npm run create:launch -- \
  --name "DemoToken" \
  --symbol "DEMO" \
  --description "Test token on bonding curve" \
  --image "https://example.com/logo.png" \
  --hard-cap-tier 2 \
  --time-limit 0 \
  --total-supply 1000000000
```

**Parameters:**
- `--name`: Token name
- `--symbol`: Token ticker symbol
- `--description`: Token description
- `--image`: Token logo URL
- `--hard-cap-tier`: 0=50 TON, 1=200 TON, 2=500 TON, 3=1000 TON, 4=5000 TON
- `--time-limit`: 0=30 days, 1=60 days, 2=90 days
- `--total-supply`: Total token supply (default: 1B)

**Expected output:**
```
🚀 Creating Token Launch on Bonding Curve

📝 Launch Configuration:
   Token Name: DemoToken
   Symbol: DEMO
   Total Supply: 1000000000 tokens
   Hard Cap: 500 TON
   Soft Cap: 100 TON (20%)
   Time Limit: 30 days

✓ BondingCurve deployed: EQBond456...
✓ JettonMinter deployed: EQJett789...
✓ Launch ID: 1
✓ Gas used: 0.5 TON
```

**Action:** Copy contract addresses to `.env`:
```env
BONDING_CURVE_ADDRESS=EQBond456...
JETTON_MINTER_ADDRESS=EQJett789...
```

---

## Step 5: Test Token Purchase

```bash
npm run buy -- --amount 10
```

**Expected output:**
```
💰 Buying Tokens from Bonding Curve

📝 Transaction Details:
   Bonding Curve: EQBond456...
   Buyer: EQAxyz789...
   Amount: 10 TON

📊 Fetching current launch stats...
   Total Raised: 0 TON
   Tokens Sold: 0 tokens
   Soft Cap Reached: ❌
   Graduated: ❌

💱 Getting price quote...
   Estimated tokens: 3,162,000 tokens

📤 Sending buy transaction...

✅ Transaction sent!
   Waiting for confirmation...

📊 Fetching updated launch stats...
   Total Raised: 10 TON (+10.00)
   Tokens Sold: 3,162,000 tokens (+3162000)
   Reserve Balance: 5 TON
   Liquidity Pool: 4 TON
   Soft Cap Reached: ❌
   Graduated: ❌

💸 Fund Allocation:
   Reserve (50%): 5.00 TON
   Liquidity Pool (40%): 4.00 TON
   Creator Fee (5%): 0.50 TON
   Platform Fee (5%): 0.50 TON

✅ Purchase successful!
   You received: 3162000 tokens
```

---

## Step 6: Test Full Launch Flow

### 6.1 Buy until soft cap (100 TON for tier 2)

```bash
npm run buy -- --amount 10  # Repeat 10 times
```

**Watch for:**
```
🎉 SOFT CAP REACHED! 🎉
   30-day deadline removed
   Launch can now continue indefinitely
```

### 6.2 Buy until hard cap (500 TON for tier 2)

```bash
npm run buy -- --amount 50  # Continue until 500 TON total
```

**Watch for:**
```
🎊 GRADUATION TRIGGERED! 🎊
   Hard cap reached!
   DEX pool deployment in progress...
   Liquidity will be permanently locked
```

---

## Step 7: Verify Deployment

### 7.1 Check launch stats

```bash
npm run query:stats -- --launch EQBond456...
```

### 7.2 Verify on TON Explorer

- Testnet: https://testnet.tonscan.org/address/EQBond456...
- Check transactions
- Verify liquidity pool created (if graduated)
- Confirm LP tokens burned

---

## Frontend Integration

### 8.1 Install TON Connect SDK

```bash
npm install @ton/ton @tonconnect/ui-react
```

### 8.2 Copy contract wrappers

```bash
cp -r wrappers/ frontend/src/contracts/
```

### 8.3 Create config file

`frontend/src/config/contracts.ts`:
```typescript
export const CONTRACTS = {
  FACTORY_ADDRESS: process.env.REACT_APP_FACTORY_ADDRESS,
  NETWORK: 'testnet',
  RPC_ENDPOINT: 'https://testnet.toncenter.com/api/v2/jsonRPC',
};
```

### 8.4 Setup TonConnect

```typescript
import { TonConnectUI } from '@tonconnect/ui-react';

const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://your-app.com/tonconnect-manifest.json'
});

// Connect wallet
await tonConnectUI.connectWallet();
```

### 8.5 Buy tokens from frontend

```typescript
import { BondingCurve } from './contracts/BondingCurve';
import { toNano } from '@ton/core';

async function buyTokens(amount: number) {
  const bonding = BondingCurve.createFromAddress(
    Address.parse(BONDING_CURVE_ADDRESS)
  );
  
  await bonding.sendBuy(
    wallet.sender(),
    toNano(amount) + toNano('0.15') // amount + gas
  );
}
```

---

## Troubleshooting

### Contract deployment fails
- Ensure wallet has sufficient balance (10+ TON)
- Check API key is valid
- Verify network setting (testnet vs mainnet)

### Buy transaction fails
- Check launch hasn't graduated or failed
- Verify amount doesn't exceed max buy limit (2% or 50M tokens)
- Ensure deadline hasn't passed (if soft cap not reached)

### Stats not updating
- Wait 10-15 seconds for TON blockchain confirmation
- Try querying again with `npm run query:stats`

### Compilation errors
- Ensure func compiler is installed correctly
- Check FunC syntax in contracts
- Try alternative compilation method (Docker/Blueprint)

---

## Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Use testnet for all development/testing
- [ ] Verify contract code before mainnet deployment
- [ ] Test full flow on testnet before mainnet
- [ ] Audit smart contracts before production use
- [ ] Use multi-sig wallet for factory owner on mainnet

---

## Next Steps

1. **Test soft cap failure:** Create launch, don't reach 20% in 30 days, test refunds
2. **Test sell functionality:** Sell tokens back to curve before graduation
3. **Monitor graduation:** Watch DEX pool creation and LP token locking
4. **Build frontend:** Create UI for launch creation, buying, and stats display
5. **Add analytics:** Track launch performance, user participation

---

## Additional Resources

- [TON Documentation](https://docs.ton.org)
- [TON Connect](https://github.com/ton-connect)
- [DeDust DEX](https://dedust.io/docs)
- [TON Blueprint](https://github.com/ton-org/blueprint)
- [FunC Language Guide](https://docs.ton.org/develop/func/overview)

---

## Support

For issues or questions:
1. Check test results: `npm test`
2. Review contract code in `contracts/`
3. Check deployment logs
4. Verify environment configuration

**All tests pass:** ✅ Your contracts are working correctly!