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

export type JettonWalletConfig = {
    balance: bigint;
    ownerAddress: Address;
    jettonMasterAddress: Address;
};

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
    return beginCell()
        .storeCoins(config.balance)
        .storeAddress(config.ownerAddress)
        .storeAddress(config.jettonMasterAddress)
        .endCell();
}

export class JettonWallet implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new JettonWallet(address);
    }

    static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
        const data = jettonWalletConfigToCell(config);
        const init = { code, data };
        return new JettonWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfer(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            amount: bigint;
            destination: Address;
            responseAddress?: Address;
            forwardTonAmount?: bigint;
            forwardPayload?: Cell;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xf8a7ea5, 32) // transfer op
                .storeUint(0, 64) // query_id
                .storeCoins(opts.amount)
                .storeAddress(opts.destination)
                .storeAddress(opts.responseAddress || via.address)
                .storeBit(false) // custom_payload
                .storeCoins(opts.forwardTonAmount || 0n)
                .storeBit(false) // forward_payload in this slice
                .endCell(),
        });
    }

    async sendBurn(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            amount: bigint;
            responseAddress?: Address;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x595f07bc, 32) // burn op
                .storeUint(0, 64) // query_id
                .storeCoins(opts.amount)
                .storeAddress(opts.responseAddress || via.address)
                .endCell(),
        });
    }

    async getWalletData(provider: ContractProvider): Promise<{
        balance: bigint;
        owner: Address;
        jettonMaster: Address;
    }> {
        const result = await provider.get('get_wallet_data', []);
        return {
            balance: result.stack.readBigNumber(),
            owner: result.stack.readAddress(),
            jettonMaster: result.stack.readAddress(),
        };
    }
}
