import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, Address } from '@ton/core';

export async function setupBlockchain() {
    const blockchain = await Blockchain.create();

    const deployer = await blockchain.treasury('deployer');
    const creator = await blockchain.treasury('creator');
    const buyer1 = await blockchain.treasury('buyer1');
    const buyer2 = await blockchain.treasury('buyer2');
    const buyer3 = await blockchain.treasury('buyer3');

    return {
        blockchain,
        deployer,
        creator,
        buyer1,
        buyer2,
        buyer3
    };
}

export function toNano(amount: number): bigint {
    return BigInt(amount * 1_000_000_000);
}

export function fromNano(amount: bigint): number {
    return Number(amount) / 1_000_000_000;
}
