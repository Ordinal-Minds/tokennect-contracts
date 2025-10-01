# Token Launch Platform - TON Bonding Curve

Smart contract infrastructure for token launches on TON blockchain with bonding curve pricing and automatic DEX graduation.

## 🎯 Features

- **Bonding Curve Pricing**: Square root pricing curve for fair token distribution
- **Soft Cap Protection**: 20% soft cap with 30-day deadline, full refunds if not reached
- **Automatic Graduation**: Auto-deploy to DeDust DEX when hard cap reached
- **Liquidity Lock**: LP tokens permanently burned to prevent rug pulls
- **Anti-Manipulation**: 2% + 50M token buy limits per transaction
- **Fund Allocation**: 50% reserves, 40% liquidity, 5% creator, 5% platform

## ✅ Test Status

**All tests passing!** ✓

```bash
npm test
```

See [TEST_RESULTS.md](./TEST_RESULTS.md) for detailed test coverage.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your wallet mnemonic and settings
```

### 3. Compile Contracts

```bash
npm run build
```

### 4. Deploy Factory

```bash
npm run deploy:factory
```

### 5. Create Token Launch

```bash
npm run create:launch -- \
  --name "MyToken" \
  --symbol "MTK" \
  --hard-cap-tier 2 \
  --total-supply 1000000000
```

### 6. Buy Tokens

```bash
npm run buy -- --amount 10
```

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment walkthrough
- **[specs/001-token-launch-platform/](./specs/001-token-launch-platform/)** - Feature specification
- **[TEST_RESULTS.md](./TEST_RESULTS.md)** - Test coverage details

## 📁 Project Structure

```
contracts/          # FunC smart contracts
  ├── bonding-curve.fc
  ├── jetton-minter.fc
  └── jetton-wallet.fc

wrappers/           # TypeScript contract wrappers
  ├── BondingCurve.ts
  ├── JettonMinter.ts
  └── JettonWallet.ts

scripts/            # Deployment scripts
  ├── deploy-factory.ts
  ├── create-launch.ts
  ├── buy-tokens.ts
  └── compile-contracts.ts

tests/              # Test suites
  ├── unit/         # Unit tests (price, buy, sell, graduation)
  └── helpers/      # Test utilities

specs/              # Feature specifications
  └── 001-token-launch-platform/
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration
```

## 🎨 Contract Architecture

### BondingCurve Contract
- **Price Calculation**: Square root curve with Newton's method
- **Buy/Sell Operations**: With 50/40/5/5 fund allocation
- **Soft Cap Logic**: 20% threshold + 30-day deadline
- **Graduation**: Auto-deploy to DEX at hard cap

### JettonMinter Contract
- **Standard**: TEP-74 compliant
- **Minting**: Controlled by BondingCurve contract
- **Metadata**: On-chain token information

### JettonWallet Contract
- **Standard**: TEP-74 compliant
- **Transfers**: Standard jetton operations
- **Burning**: For sell-back to curve

## 💡 Hard Cap Tiers

| Tier | Hard Cap | Soft Cap (20%) |
|------|----------|----------------|
| 0    | 50 TON   | 10 TON         |
| 1    | 200 TON  | 40 TON         |
| 2    | 500 TON  | 100 TON        |
| 3    | 1,000 TON| 200 TON        |
| 4    | 5,000 TON| 1,000 TON      |

## 🔐 Security Features

- **Locked Liquidity**: LP tokens sent to burn address
- **Refund Mechanism**: Full refunds if soft cap missed
- **Buy Limits**: Prevents whale manipulation (2% or 50M tokens max)
- **Time Locks**: 30-day deadline for soft cap validation
- **Fail-Safe**: Launch can be marked as failed if conditions not met

## 📊 Fund Allocation

Every token purchase splits funds:
- **50%** → Reserve (backs token value, enables sells)
- **40%** → Liquidity Pool (for DEX graduation)
- **5%** → Creator (immediately withdrawable)
- **5%** → Platform (protocol fees)

Sell transactions have 1% fee to discourage quick flips.

## 🌐 Network Configuration

**Testnet** (Development):
- Endpoint: `https://testnet.toncenter.com/api/v2/jsonRPC`
- Get test TON: https://t.me/testgiver_ton_bot

**Mainnet** (Production):
- Endpoint: `https://toncenter.com/api/v2/jsonRPC`
- Use with caution, real funds at risk

## 🛠️ Development Tools

- **Language**: FunC (contracts) + TypeScript (tests/scripts)
- **Testing**: Jest + @ton/sandbox
- **Deployment**: TON SDK + ts-node
- **Token Standard**: TEP-74 (TON Jetton)
- **DEX Integration**: DeDust

## 📝 Usage Examples

### Create Launch with Custom Parameters

```bash
npm run create:launch -- \
  --name "GameToken" \
  --symbol "GAME" \
  --description "Gaming token with bonding curve" \
  --image "https://example.com/logo.png" \
  --hard-cap-tier 3 \
  --time-limit 1 \
  --total-supply 5000000000
```

### Buy Different Amounts

```bash
# Small buy (1 TON)
npm run buy -- --amount 1

# Medium buy (10 TON)
npm run buy -- --amount 10

# Large buy (100 TON)
npm run buy -- --amount 100
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [TON Documentation](https://docs.ton.org)
- [TON SDK](https://github.com/ton-org/ton)
- [DeDust DEX](https://dedust.io)
- [TEP-74 Standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)

## 📧 Support

For questions or issues:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review [TEST_RESULTS.md](./TEST_RESULTS.md)
3. Open an issue on GitHub

---

**Status**: ✅ All tests passing | 🚀 Ready for deployment