import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
} from '@ton/core';

export type JettonMinterConfig = {
    totalSupply: bigint;
    adminAddress: Address;
    content: Cell;
    walletCode: Cell;
};

export function jettonMinterConfigToCell(config: JettonMinterConfig): Cell {
    return beginCell()
        .storeCoins(config.totalSupply)
        .storeAddress(config.adminAddress)
        .storeRef(config.content)
        .storeRef(config.walletCode)
        .endCell();
}

export function buildJettonContent(metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    decimals: string;
}): Cell {
    // TEP-64 off-chain metadata format
    const contentDict = beginCell()
        .storeUint(0x01, 8) // off-chain tag
        .storeStringTail(
            JSON.stringify({
                name: metadata.name,
                symbol: metadata.symbol,
                description: metadata.description,
                image: metadata.image,
                decimals: metadata.decimals,
            })
        )
        .endCell();
    return contentDict;
}

export class JettonMinter implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new JettonMinter(address);
    }

    static createFromConfig(config: JettonMinterConfig, code: Cell, workchain = 0) {
        const data = jettonMinterConfigToCell(config);
        const init = { code, data };
        return new JettonMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            toAddress: Address;
            amount: bigint;
            forwardTonAmount?: bigint;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x15, 32) // mint op
                .storeUint(0, 64) // query_id
                .storeAddress(opts.toAddress)
                .storeCoins(opts.amount)
                .storeCoins(opts.forwardTonAmount || 0n)
                .endCell(),
        });
    }

    async getJettonData(provider: ContractProvider): Promise<{
        totalSupply: bigint;
        admin: Address;
        content: Cell;
        walletCode: Cell;
    }> {
        const result = await provider.get('get_jetton_data', []);
        return {
            totalSupply: result.stack.readBigNumber(),
            admin: result.stack.readAddress(),
            content: result.stack.readCell(),
            walletCode: result.stack.readCell(),
        };
    }

    async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
        const result = await provider.get('get_wallet_address', [
            {
                type: 'slice',
                cell: beginCell().storeAddress(owner).endCell(),
            },
        ]);
        return result.stack.readAddress();
    }
}
