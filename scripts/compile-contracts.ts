import * as fs from 'fs';
import * as path from 'path';
import { Cell } from '@ton/core';

/**
 * Contract Compilation Script
 * 
 * This script provides instructions for compiling FunC contracts.
 * 
 * TON contracts need to be compiled using the func compiler.
 * There are several methods to compile:
 * 
 * Method 1: Using TON Blueprint (Recommended)
 * -------------------------------------------
 * Install TON Blueprint globally:
 *   npm install -g @ton/blueprint
 * 
 * Initialize blueprint in project:
 *   blueprint init
 * 
 * Compile contracts:
 *   blueprint build
 * 
 * 
 * Method 2: Using func-js (JavaScript wrapper)
 * --------------------------------------------
 * Install func-js:
 *   npm install @ton-community/func-js
 * 
 * Then use this script to compile:
 *   npm install @ton-community/func-js
 *   ts-node scripts/compile-contracts.ts
 * 
 * 
 * Method 3: Using Docker
 * ----------------------
 * Pull TON build image:
 *   docker pull tonlabs/compilers
 * 
 * Compile contracts:
 *   docker run --rm -v $(pwd):/contracts tonlabs/compilers \
 *     func -o /contracts/build/bonding-curve.fif -SPA /contracts/contracts/bonding-curve.fc
 * 
 * 
 * Method 4: Manual Installation (Advanced)
 * ----------------------------------------
 * Install TON toolchain from source:
 *   git clone https://github.com/ton-blockchain/ton.git
 *   cd ton
 *   mkdir build && cd build
 *   cmake .. -DCMAKE_BUILD_TYPE=Release
 *   cmake --build . --target func fift
 * 
 * Add to PATH and compile:
 *   func -o build/bonding-curve.fif -SPA contracts/bonding-curve.fc
 */

async function compileContracts() {
    console.log('📦 FunC Contract Compilation Guide\n');
    
    // Check if build directory exists
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
        console.log('✅ Created build/ directory\n');
    }

    console.log('🔧 Available Compilation Methods:\n');
    console.log('1. TON Blueprint (Recommended for development)');
    console.log('   npm install -g @ton/blueprint');
    console.log('   blueprint init');
    console.log('   blueprint build\n');

    console.log('2. func-js (Pure JavaScript)');
    console.log('   npm install @ton-community/func-js');
    console.log('   Use this script with func-js imported\n');

    console.log('3. Docker (Consistent environment)');
    console.log('   docker run --rm -v $(pwd):/contracts tonlabs/compilers \\');
    console.log('     func -o /contracts/build/bonding-curve.fif -SPA /contracts/contracts/bonding-curve.fc\n');

    console.log('4. Native func compiler (Best performance)');
    console.log('   Install from: https://github.com/ton-blockchain/ton');
    console.log('   func -o build/bonding-curve.fif -SPA contracts/bonding-curve.fc\n');

    console.log('📋 Contracts to compile:');
    console.log('   ✓ contracts/bonding-curve.fc');
    console.log('   ✓ contracts/jetton-minter.fc');
    console.log('   ✓ contracts/jetton-wallet.fc\n');

    console.log('📝 After compilation, you will have:');
    console.log('   build/bonding-curve.fif (or .boc)');
    console.log('   build/jetton-minter.fif (or .boc)');
    console.log('   build/jetton-wallet.fif (or .boc)\n');

    console.log('🚀 Next steps after compilation:');
    console.log('   1. Load compiled code in deployment scripts');
    console.log('   2. Run: npm run deploy:factory');
    console.log('   3. Run: npm run create:launch');
    console.log('   4. Run: npm run buy -- --amount 10\n');

    // Try to use func-js if available
    try {
        const { compileFunc } = require('@ton-community/func-js');
        console.log('🎉 func-js detected! Attempting compilation...\n');

        const contracts = [
            'bonding-curve.fc',
            'jetton-minter.fc',
            'jetton-wallet.fc'
        ];

        for (const contract of contracts) {
            const contractPath = path.join(__dirname, '..', 'contracts', contract);
            const stdlibPath = path.join(__dirname, '..', 'contracts', 'imports', 'stdlib.fc');
            
            console.log(`📄 Compiling ${contract}...`);
            
            const source = fs.readFileSync(contractPath, 'utf-8');
            const stdlib = fs.readFileSync(stdlibPath, 'utf-8');

            try {
                const result = await compileFunc({
                    targets: [contractPath],
                    sources: {
                        [contractPath]: source,
                        [stdlibPath]: stdlib
                    }
                });

                if (result.status === 'error') {
                    console.log(`   ❌ Compilation failed: ${result.message}\n`);
                } else {
                    const outputPath = path.join(buildDir, contract.replace('.fc', '.boc'));
                    fs.writeFileSync(outputPath, result.codeBoc, 'base64');
                    console.log(`   ✅ Compiled to ${outputPath}\n`);
                }
            } catch (error: any) {
                console.log(`   ⚠️  Error: ${error.message}\n`);
            }
        }

    } catch (error) {
        console.log('ℹ️  func-js not installed. Install with:');
        console.log('   npm install @ton-community/func-js\n');
    }

    console.log('📖 Documentation:');
    console.log('   TON Docs: https://docs.ton.org/develop/func/cookbook');
    console.log('   Blueprint: https://github.com/ton-org/blueprint');
    console.log('   func-js: https://github.com/ton-community/func-js\n');
}

compileContracts().catch(console.error);