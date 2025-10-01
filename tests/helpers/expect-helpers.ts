export function expectWithinPercent(actual: bigint, expected: bigint, percent: number) {
    const diff = actual > expected ? actual - expected : expected - actual;
    const maxDiff = (expected * BigInt(percent * 100)) / 10000n;

    expect(diff).toBeLessThanOrEqual(maxDiff);
}

export function expectSuccess(result: any) {
    expect(result.transactions).toHaveTransaction({
        success: true
    });
}

export function expectFailure(result: any, exitCode: number) {
    expect(result.transactions).toHaveTransaction({
        success: false,
        exitCode
    });
}
