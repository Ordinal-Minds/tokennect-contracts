import { Address, toNano, Cell, beginCell } from '@ton/core';
import { TonClient } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { BondingCurve, BondingCurveConfig, bondingCurveConfigToCell } from '../wrappers/BondingCurve';
import { JettonMinter, JettonMinterConfig, buildJettonContent } from '../wrappers/JettonMinter';

dotenv.config();

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const config: any = {
        name: 'DemoToken',
        symbol: 'DEMO',
        description: 'Token launched on bonding curve',
        image: 'https://example.com/token.png',
        hardCapTier: 2, // Default: 500 TON
        timeLimit: 0, // Default: 30 days
        totalSupply: '1000000000', // 1B tokens
    };

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        if (key in config) {
            config[key] = key === 'hardCapTier' || key === 'timeLimit' ? parseInt(value) : value;
        }
    }

    return config;
}

async function createLaunch() {
    console.log('🚀 Creating Token Launch on Bonding Curve\n');

    const config = parseArgs();
    
    // Load environment
    const mnemonic = process.env.DEPLOYER_MNEMONIC;
    if (!mnemonic) {
        throw new Error('DEPLOYER_MNEMONIC not found in .env file');
    }

    const factoryAddress = process.env.FACTORY_ADDRESS;
    if (!factoryAddress) {
        console.log('⚠️  FACTORY_ADDRESS not set in .env');
        console.log('   You need to deploy the factory first using: npm run deploy:factory\n');
        return;
    }

    // Initialize client
    const endpoint = process.env.TON_NETWORK === 'mainnet'
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';

    const client = new TonClient({
        endpoint,
        apiKey: process.env.TON_API_KEY,
    });

    const keys = await mnemonicToPrivateKey(mnemonic.split(' '));

    // Hard cap tiers and time limits
    const hardCapTiers = [50, 200, 500, 1000, 5000]; // TON
    const timeLimits = [30, 60, 90]; // days

    const hardCap = toNano(hardCapTiers[config.hardCapTier]);
    const softCap = (hardCap * 20n) / 100n; // 20% of hard cap
    const timeLimit = timeLimits[config.timeLimit] * 24 * 60 * 60; // Convert to seconds

    console.log('📝 Launch Configuration:');
    console.log('   Token Name:', config.name);
    console.log('   Symbol:', config.symbol);
    console.log('   Total Supply:', config.totalSupply, 'tokens');
    console.log('   Hard Cap:', hardCapTiers[config.hardCapTier], 'TON');
    console.log('   Soft Cap:', Number(softCap) / 1e9, 'TON (20%)');
    console.log('   Time Limit:', timeLimits[config.timeLimit], 'days');
    console.log('   Network:', process.env.TON_NETWORK || 'testnet');
    console.log('\n');

    // Load contract codes (you need to have these compiled)
    // For now, we'll show the deployment structure
    console.log('📦 Contract Deployment Plan:');
    console.log('   1. Deploy JettonMinter contract');
    console.log('   2. Deploy BondingCurve contract');
    console.log('   3. Link contracts together');
    console.log('   4. Register launch in Factory\n');

    // Build Jetton metadata
    const content = buildJettonContent({
        name: config.name,
        symbol: config.symbol,
        description: config.description,
        image: config.image,
        decimals: '9',
    });

    console.log('✅ Token metadata prepared');
    console.log('   Content cell hash:', content.hash().toString('hex'), '\n');

    // Build BondingCurve config
    const launchTimestamp = Math.floor(Date.now() / 1000);
    
    // Note: In a real deployment, you would:
    // 1. Load compiled contract codes from build/ directory
    // 2. Deploy JettonMinter with proper wallet code
    // 3. Deploy BondingCurve with JettonMinter address
    // 4. Initialize both contracts
    
    console.log('⚠️  To complete deployment:');
    console.log('   1. Compile contracts using TON compiler');
    console.log('   2. Load contract codes as Cell objects');
    console.log('   3. Deploy JettonMinter:');
    console.log('      - Admin: BondingCurve address (deploy first)');
    console.log('      - Content:', config.name);
    console.log('      - Total Supply:', config.totalSupply);
    console.log('   4. Deploy BondingCurve:');
    console.log('      - JettonMinter: <address from step 3>');
    console.log('      - Creator:', '<your wallet>');
    console.log('      - Hard Cap:', hardCapTiers[config.hardCapTier], 'TON');
    console.log('      - Soft Cap:', Number(softCap) / 1e9, 'TON');
    console.log('      - Time Limit:', timeLimit, 'seconds');
    console.log('      - Total Supply:', config.totalSupply, '\n');

    // Save launch info to file
    const launchInfo = {
        name: config.name,
        symbol: config.symbol,
        description: config.description,
        image: config.image,
        hardCap: hardCapTiers[config.hardCapTier],
        softCap: Number(softCap) / 1e9,
        timeLimit: timeLimits[config.timeLimit],
        totalSupply: config.totalSupply,
        launchTimestamp,
        network: process.env.TON_NETWORK || 'testnet',
    };

    const launchFile = `launch-${config.symbol}-${Date.now()}.json`;
    fs.writeFileSync(launchFile, JSON.stringify(launchInfo, null, 2));
    
    console.log('💾 Launch configuration saved to:', launchFile);
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy contracts using the configuration above');
    console.log('   2. Save contract addresses to .env:');
    console.log('      BONDING_CURVE_ADDRESS=<address>');
    console.log('      JETTON_MINTER_ADDRESS=<address>');
    console.log('   3. Run: npm run buy -- --amount 10');
}

createLaunch().catch(console.error);