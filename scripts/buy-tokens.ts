import { Address, toNano, Cell, beginCell } from '@ton/core';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey, KeyPair } from '@ton/crypto';
import * as dotenv from 'dotenv';
import { BondingCurve } from '../wrappers/BondingCurve';

dotenv.config();

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const config: any = {
        amount: '10', // Default 10 TON
        launch: process.env.BONDING_CURVE_ADDRESS,
    };

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        if (key === 'amount') {
            config.amount = value;
        } else if (key === 'launch') {
            config.launch = value;
        }
    }

    return config;
}

async function buyTokens() {
    console.log('💰 Buying Tokens from Bonding Curve\n');

    const config = parseArgs();

    // Validate
    if (!config.launch) {
        console.log('❌ Error: No launch address specified');
        console.log('   Use: npm run buy -- --launch <address> --amount <TON>\n');
        console.log('   Or set BONDING_CURVE_ADDRESS in .env file\n');
        return;
    }

    const mnemonic = process.env.DEPLOYER_MNEMONIC;
    if (!mnemonic) {
        throw new Error('DEPLOYER_MNEMONIC not found in .env file');
    }

    // Initialize client
    const endpoint = process.env.TON_NETWORK === 'mainnet'
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';

    const client = new TonClient({
        endpoint,
        apiKey: process.env.TON_API_KEY,
    });

    // Get wallet
    const keys = await mnemonicToPrivateKey(mnemonic.split(' '));
    const workchain = 0;
    const wallet = WalletContractV4.create({ workchain, publicKey: keys.publicKey });
    const walletContract = client.open(wallet);

    // Get bonding curve contract
    const bondingCurveAddress = Address.parse(config.launch);
    const bondingCurve = client.open(BondingCurve.createFromAddress(bondingCurveAddress));

    console.log('📝 Transaction Details:');
    console.log('   Bonding Curve:', bondingCurveAddress.toString());
    console.log('   Buyer:', wallet.address.toString());
    console.log('   Amount:', config.amount, 'TON');
    console.log('   Network:', process.env.TON_NETWORK || 'testnet');
    console.log('\n');

    try {
        // Get current stats before buy
        console.log('📊 Fetching current launch stats...');
        const statsBefore = await bondingCurve.getLaunchStats();
        
        console.log('   Total Raised:', Number(statsBefore.totalRaised) / 1e9, 'TON');
        console.log('   Tokens Sold:', Number(statsBefore.tokensSold) / 1e9, 'tokens');
        console.log('   Reserve Balance:', Number(statsBefore.reserveBalance) / 1e9, 'TON');
        console.log('   Liquidity Pool:', Number(statsBefore.liquidityAccumulated) / 1e9, 'TON');
        console.log('   Soft Cap Reached:', statsBefore.softCapReached ? '✅' : '❌');
        console.log('   Graduated:', statsBefore.isGraduated ? '✅' : '❌');
        console.log('   Failed:', statsBefore.isFailed ? '✅' : '❌');
        console.log('\n');

        if (statsBefore.isGraduated) {
            console.log('❌ Error: Launch already graduated to DEX');
            console.log('   Tokens can no longer be purchased from bonding curve\n');
            return;
        }

        if (statsBefore.isFailed) {
            console.log('❌ Error: Launch has failed');
            console.log('   You can claim refund instead\n');
            return;
        }

        // Get price quote
        const buyAmount = toNano(config.amount);
        console.log('💱 Getting price quote...');
        const tokensEstimate = await bondingCurve.getBuyQuote(buyAmount);
        console.log('   Estimated tokens:', Number(tokensEstimate) / 1e9, 'tokens\n');

        // Send buy transaction
        console.log('📤 Sending buy transaction...');
        console.log('   (This may take 5-10 seconds on TON blockchain)\n');

        await bondingCurve.sendBuy(
            walletContract.sender(keys.secretKey),
            toNano(config.amount) + toNano('0.15') // amount + gas
        );

        console.log('✅ Transaction sent!');
        console.log('   Waiting for confirmation...\n');

        // Wait a bit for transaction to process
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Get stats after buy
        console.log('📊 Fetching updated launch stats...');
        const statsAfter = await bondingCurve.getLaunchStats();
        
        const raisedIncrease = Number(statsAfter.totalRaised - statsBefore.totalRaised) / 1e9;
        const tokensBought = Number(statsAfter.tokensSold - statsBefore.tokensSold) / 1e9;
        
        console.log('   Total Raised:', Number(statsAfter.totalRaised) / 1e9, 'TON', 
                    `(+${raisedIncrease.toFixed(2)})`);
        console.log('   Tokens Sold:', Number(statsAfter.tokensSold) / 1e9, 'tokens',
                    `(+${tokensBought.toFixed(0)})`);
        console.log('   Reserve Balance:', Number(statsAfter.reserveBalance) / 1e9, 'TON');
        console.log('   Liquidity Pool:', Number(statsAfter.liquidityAccumulated) / 1e9, 'TON');
        console.log('   Soft Cap Reached:', statsAfter.softCapReached ? '✅' : '❌');
        console.log('   Graduated:', statsAfter.isGraduated ? '✅ 🎉' : '❌');
        console.log('\n');

        // Calculate fund allocation
        const reserveAllocation = raisedIncrease * 0.5;
        const liquidityAllocation = raisedIncrease * 0.4;
        const creatorFee = raisedIncrease * 0.05;
        const platformFee = raisedIncrease * 0.05;

        console.log('💸 Fund Allocation:');
        console.log('   Reserve (50%):', reserveAllocation.toFixed(2), 'TON');
        console.log('   Liquidity Pool (40%):', liquidityAllocation.toFixed(2), 'TON');
        console.log('   Creator Fee (5%):', creatorFee.toFixed(2), 'TON');
        console.log('   Platform Fee (5%):', platformFee.toFixed(2), 'TON');
        console.log('\n');

        if (statsAfter.isGraduated && !statsBefore.isGraduated) {
            console.log('🎊 GRADUATION TRIGGERED! 🎊');
            console.log('   Hard cap reached!');
            console.log('   DEX pool deployment in progress...');
            console.log('   Liquidity will be permanently locked\n');
        } else if (statsAfter.softCapReached && !statsBefore.softCapReached) {
            console.log('🎉 SOFT CAP REACHED! 🎉');
            console.log('   30-day deadline removed');
            console.log('   Launch can now continue indefinitely\n');
        }

        console.log('✅ Purchase successful!');
        console.log('   You received:', tokensBought.toFixed(0), 'tokens\n');

    } catch (error: any) {
        console.log('❌ Transaction failed');
        console.log('   Error:', error.message);
        console.log('\n   Common issues:');
        console.log('   - Insufficient balance for purchase + gas');
        console.log('   - Max buy limit exceeded (2% or 50M tokens)');
        console.log('   - Deadline passed (if soft cap not reached)');
        console.log('   - Launch already graduated or failed\n');
    }
}

buyTokens().catch(console.error);