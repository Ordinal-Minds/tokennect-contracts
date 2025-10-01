# TON Wallet Setup & Testnet Guide

Complete guide to creating a TON wallet, getting testnet tokens, and configuring your `.env` file for smart contract deployment.

---

## 📱 Step 1: Create a TON Wallet

You have several options for creating a TON wallet. Choose the method that works best for you.

### Option A: Tonkeeper Mobile App (Recommended - Easiest)

1. **Download Tonkeeper**
   - iOS: https://apps.apple.com/app/tonkeeper/id1587742107
   - Android: https://play.google.com/store/apps/details?id=com.ton_keeper

2. **Create New Wallet**
   - Open Tonkeeper
   - Tap "Create New Wallet"
   - You'll see 24 secret words

3. **IMPORTANT: Write Down Your Mnemonic**
   ```
   word1 word2 word3 word4 word5 word6 word7 word8
   word9 word10 word11 word12 word13 word14 word15 word16
   word17 word18 word19 word20 word21 word22 word23 word24
   ```
   - Write these words on paper
   - Store safely (this is your backup!)
   - Never share with anyone
   - Never store in cloud services

4. **Complete Setup**
   - Confirm you wrote down the words
   - Set up biometric authentication (optional)
   - Your wallet is ready!

5. **Get Your Mnemonic for .env**
   - In Tonkeeper, go to Settings → Wallet
   - Tap "Backup" or "Show Recovery Phrase"
   - Copy all 24 words
   - This is what you'll put in `.env`

### Option B: TON Wallet Browser Extension

1. **Install Extension**
   - Chrome: https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd
   - Firefox: Similar process

2. **Create Wallet**
   - Click "Create New Wallet"
   - Save your 24-word mnemonic phrase
   - Set a password

3. **Export Mnemonic**
   - Settings → Backup
   - Copy the 24 words

### Option C: Using TON SDK (Developer Method)

```bash
# Install TON tools
npm install -g @ton/ton

# Generate wallet (this creates random mnemonic)
node -e "
const { mnemonicNew } = require('@ton/crypto');
mnemonicNew(24).then(words => {
  console.log('Your 24-word mnemonic:');
  console.log(words.join(' '));
});
"
```

**Output:**
```
Your 24-word mnemonic:
abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual
```

Copy these 24 words for your `.env` file.

### Option D: MyTonWallet (Web-based)

1. Visit https://mytonwallet.io
2. Click "Create New Wallet"
3. Save your 24-word recovery phrase
4. Complete setup
5. Export mnemonic from Settings

---

## 💰 Step 2: Get Testnet TON Tokens

### Method 1: Telegram Testnet Giver Bot (Recommended)

1. **Open Telegram**
   - Download Telegram if you don't have it

2. **Find the Testnet Giver Bot**
   - Search for: `@testgiver_ton_bot`
   - Or visit: https://t.me/testgiver_ton_bot

3. **Start the Bot**
   - Click "Start"
   - Type `/start`

4. **Request Testnet TON**
   - The bot will ask for your testnet wallet address
   - You need to switch your wallet to testnet first!

### Switching to Testnet in Tonkeeper

1. **Open Tonkeeper**
2. **Go to Settings**
3. **Scroll to "Developer Settings"**
4. **Toggle "Testnet"** to ON
5. **Your wallet address changes** - This is your testnet address

6. **Copy Your Testnet Address**
   - Tap your wallet at the top
   - Tap "Receive"
   - Copy the address (starts with `0:` or `UQ`)

7. **Send Address to Bot**
   - Go back to `@testgiver_ton_bot` in Telegram
   - Send your testnet address
   - Bot will send you testnet TON

8. **Verify Receipt**
   - Check Tonkeeper (in testnet mode)
   - You should see ~5-10 testnet TON
   - Can request more if needed (wait 24h between requests)

### Method 2: TON Testnet Faucet (Alternative)

1. Visit https://t.me/tontestnetbot
2. Send your testnet address
3. Receive testnet tokens

### Important Notes About Testnet

⚠️ **Testnet tokens have NO real value**
- They are for testing only
- Cannot be converted to mainnet TON
- Free and unlimited (with rate limits)
- Safe to experiment with

✅ **Always test on testnet first before mainnet deployment**

---

## 🔧 Step 3: Configure Your .env File

Now that you have a wallet and testnet tokens, let's configure your `.env` file.

### 3.1 Copy the Template

```bash
cp .env.example .env
```

### 3.2 Fill in Your Mnemonic

Open `.env` in your text editor and replace the mnemonic:

**Before:**
```env
DEPLOYER_MNEMONIC="word1 word2 word3 ... word24"
```

**After (example - use YOUR 24 words):**
```env
DEPLOYER_MNEMONIC="abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual"
```

⚠️ **CRITICAL SECURITY NOTES:**
- Use your actual 24 words from Step 1
- Words must be in correct order
- Separate words with spaces
- Keep the double quotes
- NEVER commit this file to git (it's in .gitignore)
- NEVER share your mnemonic with anyone

### 3.3 Set Network to Testnet

Make sure this line is set correctly:

```env
TON_NETWORK=testnet
```

For production later, you would change to:
```env
TON_NETWORK=mainnet  # ONLY use after thorough testnet testing!
```

### 3.4 Get TonCenter API Key (Optional but Recommended)

An API key gives you higher rate limits and more reliable access.

**Steps:**

1. **Visit TonCenter**
   - Go to: https://toncenter.com

2. **Create Account**
   - Click "Sign Up" or "Get API Key"
   - Register with email

3. **Get API Key**
   - After login, go to dashboard
   - Copy your API key (long string like `abc123...xyz789`)

4. **Add to .env**
   ```env
   TON_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

**Without API Key:**
If you skip this step, the scripts will work but with rate limits. You can always add it later.

```env
TON_API_KEY=  # Leave empty if not using
```

### 3.5 Leave Contract Addresses Empty (For Now)

These will be filled after deployment:

```env
FACTORY_ADDRESS=
BONDING_CURVE_ADDRESS=
JETTON_MINTER_ADDRESS=
PLATFORM_FEE_ADDRESS=
```

You'll add these addresses after each deployment step.

### 3.6 Complete .env Example

Here's what your complete `.env` should look like:

```env
# TON Wallet Configuration
DEPLOYER_MNEMONIC="abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual"

# Network Configuration
TON_NETWORK=testnet
TON_API_KEY=abc123def456ghi789jkl012mno345pqr678

# Contract Addresses (filled after deployment)
FACTORY_ADDRESS=
BONDING_CURVE_ADDRESS=
JETTON_MINTER_ADDRESS=

# Optional: Platform Configuration
PLATFORM_FEE_ADDRESS=
```

---

## 🚀 Step 4: Verify Your Setup

Before deploying, let's verify everything is configured correctly.

### 4.1 Check Your Testnet Balance

In Tonkeeper (testnet mode), you should see:
- Balance: ~5-10 TON (or more)
- Network indicator: "Testnet" badge visible

### 4.2 Test Your Configuration

Create a simple test script to verify wallet connection:

```bash
node -e "
const dotenv = require('dotenv');
const { mnemonicToPrivateKey } = require('@ton/crypto');

dotenv.config();

(async () => {
  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) {
    console.log('❌ DEPLOYER_MNEMONIC not found in .env');
    return;
  }
  
  console.log('✅ Mnemonic found in .env');
  console.log('   Words:', mnemonic.split(' ').length);
  
  try {
    const keys = await mnemonicToPrivateKey(mnemonic.split(' '));
    console.log('✅ Mnemonic is valid');
    console.log('   Public key:', keys.publicKey.toString('hex').substring(0, 16) + '...');
  } catch (error) {
    console.log('❌ Invalid mnemonic:', error.message);
  }
})();
"
```

**Expected output:**
```
✅ Mnemonic found in .env
   Words: 24
✅ Mnemonic is valid
   Public key: 3b6a27bcceb6...
```

### 4.3 Run Tests

Verify all contracts work:

```bash
npm test
```

You should see all 47 tests pass.

---

## 📋 Step 5: Deploy Your First Token

Now you're ready to deploy!

### 5.1 Compile Contracts

```bash
npm run build
```

This compiles your FunC contracts.

### 5.2 Deploy Factory

```bash
npm run deploy:factory
```

**Expected output:**
```
🚀 Deploying LaunchpadFactory to TON Testnet...

✓ Factory deployed at: EQAbc123def456...
✓ Gas used: 0.3 TON
```

**Action:** Copy the factory address and add to `.env`:
```env
FACTORY_ADDRESS=EQAbc123def456...
```

### 5.3 Create Token Launch

```bash
npm run create:launch -- \
  --name "MyFirstToken" \
  --symbol "MFT" \
  --hard-cap-tier 0 \
  --total-supply 1000000000
```

Note: We use tier 0 (50 TON hard cap) for testing since you have limited testnet TON.

**Expected output:**
```
✓ BondingCurve deployed: EQBond789ghi012...
✓ JettonMinter deployed: EQJett345jkl678...
✓ Hard Cap: 50 TON
✓ Soft Cap: 10 TON (20%)
```

**Action:** Add addresses to `.env`:
```env
BONDING_CURVE_ADDRESS=EQBond789ghi012...
JETTON_MINTER_ADDRESS=EQJett345jkl678...
```

### 5.4 Buy Tokens

```bash
npm run buy -- --amount 1
```

Start with a small amount (1 TON) to test.

**Expected output:**
```
✅ Purchase successful!
   You received: 1,000,000 tokens
   
💸 Fund Allocation:
   Reserve (50%): 0.50 TON
   Liquidity Pool (40%): 0.40 TON
   Creator Fee (5%): 0.05 TON
   Platform Fee (5%): 0.05 TON
```

### 5.5 Continue Testing

Buy more tokens to test soft cap and graduation:

```bash
# Buy until soft cap (10 TON for tier 0)
npm run buy -- --amount 2  # Repeat 5 times = 10 TON

# Watch for soft cap event:
# 🎉 SOFT CAP REACHED! 🎉

# Continue to hard cap (50 TON total)
npm run buy -- --amount 5  # Continue buying

# Watch for graduation:
# 🎊 GRADUATION TRIGGERED! 🎊
```

---

## 🔒 Security Checklist

Before you start, review these security practices:

- [ ] ✅ Created new wallet specifically for development
- [ ] ✅ Wrote down 24-word mnemonic on paper
- [ ] ✅ Stored paper backup in secure location
- [ ] ✅ Using testnet first (NOT mainnet)
- [ ] ✅ Confirmed `.env` is in `.gitignore`
- [ ] ✅ NEVER shared mnemonic with anyone
- [ ] ✅ NEVER committed `.env` to git
- [ ] ✅ Have at least 5 TON testnet tokens
- [ ] ✅ Verified wallet is in testnet mode

---

## ❓ Troubleshooting

### "Invalid mnemonic" Error

**Problem:** Your mnemonic is not formatted correctly

**Solutions:**
- Check that you have exactly 24 words
- Ensure words are separated by single spaces
- Remove any extra spaces at start/end
- Make sure words are in English
- Verify words are in correct order

**Test your mnemonic:**
```bash
echo $DEPLOYER_MNEMONIC | wc -w
# Should output: 24
```

### "Insufficient balance" Error

**Problem:** Not enough testnet TON

**Solutions:**
- Request more from `@testgiver_ton_bot`
- Wait 24 hours if you recently requested
- Try alternative faucet: `@tontestnetbot`
- Reduce buy amount (use `--amount 1` instead of 10)

### Wallet Not Showing Testnet Balance

**Problem:** Wallet is in mainnet mode

**Solutions:**
- Open Tonkeeper
- Settings → Developer Settings
- Toggle "Testnet" to ON
- Verify "Testnet" badge appears
- Balance should now show testnet TON

### Can't Switch to Testnet in Tonkeeper

**Problem:** Option not available

**Solutions:**
- Update Tonkeeper to latest version
- Some wallet apps don't support testnet
- Use TON Wallet browser extension instead
- Or use MyTonWallet (supports testnet)

### API Rate Limit Errors

**Problem:** Too many requests to TonCenter

**Solutions:**
- Get API key from https://toncenter.com
- Add to `.env` as `TON_API_KEY`
- Wait a few minutes between requests

---

## 🎓 Quick Start Checklist

Complete these steps in order:

1. **Create Wallet**
   - [ ] Downloaded Tonkeeper
   - [ ] Created new wallet
   - [ ] Wrote down 24 words

2. **Get Testnet Tokens**
   - [ ] Switched wallet to testnet mode
   - [ ] Sent address to `@testgiver_ton_bot`
   - [ ] Received 5+ testnet TON

3. **Configure Environment**
   - [ ] Copied `.env.example` to `.env`
   - [ ] Added 24-word mnemonic
   - [ ] Set `TON_NETWORK=testnet`
   - [ ] Got API key (optional)

4. **Verify Setup**
   - [ ] Ran `npm test` (all pass)
   - [ ] Ran `npm run build` (compiled)
   - [ ] Checked `.env` has all required fields

5. **Deploy**
   - [ ] Ran `npm run deploy:factory`
   - [ ] Added `FACTORY_ADDRESS` to `.env`
   - [ ] Ran `npm run create:launch`
   - [ ] Added contract addresses to `.env`
   - [ ] Ran `npm run buy -- --amount 1`

---

## 🌐 Resources

- **Tonkeeper**: https://tonkeeper.com
- **Testnet Bot**: https://t.me/testgiver_ton_bot
- **TonCenter API**: https://toncenter.com
- **TON Docs**: https://docs.ton.org
- **MyTonWallet**: https://mytonwallet.io

---

## 💡 Pro Tips

1. **Create separate wallets for different purposes:**
   - Development/testing wallet (testnet)
   - Production wallet (mainnet)
   - Personal wallet (mainnet)

2. **Test everything on testnet first:**
   - Deploy contracts
   - Test all operations
   - Verify graduation works
   - Only then consider mainnet

3. **Keep multiple backups:**
   - Write mnemonic on paper (2 copies)
   - Store in different locations
   - Never store digitally on cloud

4. **Monitor your balance:**
   - Check before each deployment
   - Each operation costs gas
   - Request more testnet TON as needed

5. **Use descriptive token names when testing:**
   - "TestToken1", "TestToken2", etc.
   - Helps track which launch is which

---

**You're now ready to deploy your smart contracts! 🚀**

If you have any issues, check the [Troubleshooting](#-troubleshooting) section above or refer to [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md) for detailed command usage.