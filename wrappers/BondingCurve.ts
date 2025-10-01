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

export type BondingCurveConfig = {
    jettonMinter: Address;
    creator: Address;
    launchTimestamp: number;
    hardCap: bigint;
    softCap: bigint;
    timeLimit: number;
    totalSupply: bigint;
};

export function bondingCurveConfigToCell(config: BondingCurveConfig): Cell {
    return beginCell()
        .storeAddress(config.jettonMinter)
        .storeAddress(config.creator)
        .storeUint(config.launchTimestamp, 32)
        .storeCoins(config.hardCap)
        .storeCoins(config.softCap)
        .storeUint(config.timeLimit, 32)
        .storeCoins(config.totalSupply)
        .storeCoins(0) // tokens_sold
        .storeCoins(0) // reserve_balance
        .storeCoins(0) // total_raised
        .storeBit(false) // is_graduated
        .storeBit(false) // is_failed
        .storeBit(false) // soft_cap_reached
        .storeUint(0, 32) // soft_cap_timestamp
        .storeAddress(null) // dex_pool_address
        .storeCoins(0) // liquidity_accumulated
        .storeRef(beginCell().endCell()) // buyer_contributions dict
        .storeRef(beginCell().endCell()) // refund_claims dict
        .endCell();
}

export class BondingCurve implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new BondingCurve(address);
    }

    static createFromConfig(config: BondingCurveConfig, code: Cell, workchain = 0) {
        const data = bondingCurveConfigToCell(config);
        const init = { code, data };
        return new BondingCurve(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendBuy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x01, 32) // buy op
                .storeUint(0, 64) // query_id
                .endCell(),
        });
    }

    async sendSell(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        tokenAmount: bigint
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x02, 32) // sell op
                .storeUint(0, 64) // query_id
                .storeCoins(tokenAmount)
                .endCell(),
        });
    }

    async sendClaimRefund(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x03, 32) // claim_refund op
                .storeUint(0, 64) // query_id
                .endCell(),
        });
    }

    async sendTriggerFailure(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x04, 32) // trigger_failure op
                .storeUint(0, 64) // query_id
                .endCell(),
        });
    }

    async getLaunchStats(provider: ContractProvider): Promise<{
        totalRaised: bigint;
        tokensSold: bigint;
        reserveBalance: bigint;
        liquidityAccumulated: bigint;
        isGraduated: boolean;
        isFailed: boolean;
        softCapReached: boolean;
    }> {
        const result = await provider.get('get_launch_stats', []);
        return {
            totalRaised: result.stack.readBigNumber(),
            tokensSold: result.stack.readBigNumber(),
            reserveBalance: result.stack.readBigNumber(),
            liquidityAccumulated: result.stack.readBigNumber(),
            isGraduated: result.stack.readBoolean(),
            isFailed: result.stack.readBoolean(),
            softCapReached: result.stack.readBoolean(),
        };
    }

    async getBuyQuote(provider: ContractProvider, tonAmount: bigint): Promise<bigint> {
        const result = await provider.get('get_buy_quote', [
            { type: 'int', value: tonAmount },
        ]);
        return result.stack.readBigNumber();
    }

    async getSellQuote(provider: ContractProvider, tokenAmount: bigint): Promise<bigint> {
        const result = await provider.get('get_sell_quote', [
            { type: 'int', value: tokenAmount },
        ]);
        return result.stack.readBigNumber();
    }

    async getCurrentPrice(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('calculate_current_price', []);
        return result.stack.readBigNumber();
    }

    async getUserRefund(provider: ContractProvider, userAddress: Address): Promise<bigint> {
        const result = await provider.get('get_user_refund', [
            {
                type: 'slice',
                cell: beginCell().storeAddress(userAddress).endCell(),
            },
        ]);
        return result.stack.readBigNumber();
    }
}
