import { Address, toNano, Cell, beginCell } from '@ton/core';
import { TonClient } from '@ton/ton';
import * as fs from 'fs';
import * as path from 'path';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// Factory contract storage structure
function buildFactoryData(): Cell {
    // Hard cap tiers: [50, 200, 500, 1000, 5000] TON
    const hardCapTiers = beginCell()
        .storeCoins(toNano(50))
        .storeCoins(toNano(200))
        .storeCoins(toNano(500))
        .storeCoins(toNano(1000))
        .storeCoins(toNano(5000))
        .endCell();

    // Time limits: [30, 60, 90] days in seconds
    const timeLimits = beginCell()
        .storeUint(30 * 24 * 60 * 60, 32) // 30 days
        .storeUint(60 * 24 * 60 * 60, 32) // 60 days
        .storeUint(90 * 24 * 60 * 60, 32) // 90 days
        .endCell();

    return beginCell()
        .storeAddress(null) // owner (will be set to deployer)
        .storeUint(0, 32) // launch_count
        .storeCoins(0) // platform_balance
        .storeRef(beginCell().endCell()) // launch_registry (empty dict)
        .storeRef(hardCapTiers)
        .storeRef(timeLimits)
        .endCell();
}

async function deployFactory() {
    console.log('🚀 Deploying LaunchpadFactory to TON Testnet...\n');

    // Load environment variables
    const mnemonic = process.env.DEPLOYER_MNEMONIC;
    if (!mnemonic) {
        throw new Error('DEPLOYER_MNEMONIC not found in .env file');
    }

    // Initialize TON client
    const endpoint = process.env.TON_NETWORK === 'mainnet' 
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    
    const client = new TonClient({
        endpoint,
        apiKey: process.env.TON_API_KEY,
    });

    // Get wallet keys
    const keys = await mnemonicToPrivateKey(mnemonic.split(' '));
    
    console.log('📝 Configuration:');
    console.log('   Network:', process.env.TON_NETWORK || 'testnet');
    console.log('   Hard cap tiers: [50, 200, 500, 1000, 5000] TON');
    console.log('   Time limits: [30, 60, 90] days');
    console.log('\n');

    // For now, we'll create a placeholder since we need the actual compiled code
    // In a real deployment, you would compile the FunC code here
    console.log('⚠️  NOTE: This is a deployment script template.');
    console.log('   To complete deployment, you need to:');
    console.log('   1. Compile the factory contract code');
    console.log('   2. Deploy using TON Blueprint or similar tool');
    console.log('   3. Save the factory address to .env\n');

    // Build initial data
    const initialData = buildFactoryData();
    
    console.log('✅ Factory data structure prepared');
    console.log('   Initial state cell hash:', initialData.hash().toString('hex'));
    
    // TODO: Deploy contract here when you have compiled code
    // const contract = client.open(Factory.createFromConfig(config, code));
    // await contract.sendDeploy(deployer, toNano('0.5'));
    
    console.log('\n📋 Next steps:');
    console.log('   1. Add factory address to .env as FACTORY_ADDRESS');
    console.log('   2. Run: npm run create:launch');
}

deployFactory().catch(console.error);