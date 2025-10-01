# Tasks: Token Launch Platform with Bonding Curve

**Input**: Design documents from `/Users/konradgnat/dev/hackathons/token2049/tokennect/tknt-tma/tokenect/specs/001-token-launch-platform/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ COMPLETE: Plan loaded, tech stack identified (FunC + TypeScript)
2. Load optional design documents:
   → data-model.md: ✅ Entities extracted (4 contracts, 10 entities)
   → contracts/: ✅ 4 contracts identified (Factory, BondingCurve, JettonMinter, JettonWallet)
   → research.md: ✅ Decisions loaded (TON, FunC, TEP-74, DeDust, Newton's method)
   → quickstart.md: ✅ Test scenarios identified (full flow, soft cap, graduation)
3. Generate tasks by category:
   → Setup: 3 tasks (project init, dependencies, test infrastructure)
   → Tests: 13 tasks (contract tests for 4 contracts)
   → Core: 9 tasks (4 contract implementations + helpers)
   → Integration: 3 tasks (end-to-end scenarios)
   → Polish: 2 tasks (deployment scripts, validation)
4. Apply task rules:
   → Different files marked [P] for parallel (14 tasks)
   → Same file sequential (16 tasks)
   → Tests before implementation (TDD order enforced)
5. Number tasks sequentially (T001-T030)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? ✅
   → All entities have models? ✅ (embedded in contracts)
   → All quickstart scenarios tested? ✅
9. Return: SUCCESS (30 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `contracts/`, `tests/`, `scripts/` at repository root
- This is pure smart contract infrastructure (no frontend/backend)

---

## Phase 3.1: Setup (15 minutes)

- [ ] **T001** Initialize project structure
  - Create `package.json` with TON dependencies (@ton/core ^0.56.0, @ton/crypto ^3.2.0, @ton/ton ^13.11.0, @ton/sandbox ^0.16.0, @ton/test-utils ^0.4.2)
  - Create `tsconfig.json` with strict TypeScript settings
  - Create `jest.config.js` for Jest test runner
  - Create directories: `contracts/`, `tests/unit/`, `tests/integration/`, `tests/helpers/`, `scripts/`
  - Estimated time: 5 minutes

- [ ] **T002** Install dependencies
  - Run `npm install` to install all packages
  - Verify FunC compiler available (func --version)
  - Verify fift available (fift --version)
  - Download stdlib.fc to `contracts/stdlib.fc`
  - Estimated time: 5 minutes

- [ ] **T003** [P] Setup test infrastructure
  - Create `tests/helpers/blockchain-setup.ts` with Blockchain.create() wrapper
  - Create `tests/helpers/contract-deployers.ts` with deployment utilities
  - Create `tests/helpers/assertion-utils.ts` with custom Jest matchers (toBeCloseTo for bigints)
  - Add test fixtures in `tests/fixtures/token-metadata.ts` (sample token configs)
  - Estimated time: 5 minutes

---

## Phase 3.2: Tests First - Jetton Foundation (30 minutes)

**HACKATHON MODE: Focus on happy path tests only. Write tests, verify they fail, then implement.**

- [ ] **T004** [P] JettonWallet contract tests
  - File: `tests/unit/JettonWallet.spec.ts`
  - Test suite: JettonWalletContract
  - Tests to implement:
    * `should deploy with zero balance`
    * `should transfer tokens to another wallet` (happy path)
    * `should receive tokens via internal_transfer`
    * `should burn tokens and notify minter`
    * `should return correct wallet data via get method`
  - Use @ton/sandbox for local blockchain
  - Mark as expected to FAIL (no implementation yet)
  - Estimated time: 10 minutes

- [ ] **T005** [P] JettonMinter contract tests
  - File: `tests/unit/JettonMinter.spec.ts`
  - Test suite: JettonMinterContract
  - Tests to implement:
    * `should deploy with zero total supply`
    * `should mint tokens to user (admin only)` (happy path)
    * `should fail to mint if not admin`
    * `should handle burn notification from wallet`
    * `should calculate wallet address correctly`
    * `should return jetton data via get method` (supply, admin, content)
  - Reference TEP-74 standard for expected behavior
  - Mark as expected to FAIL
  - Estimated time: 10 minutes

- [ ] **T006** Verify Jetton tests fail
  - Run `npm test tests/unit/JettonWallet.spec.ts tests/unit/JettonMinter.spec.ts`
  - Expected: All tests should FAIL (contracts not implemented)
  - Document failure output in console
  - If any tests pass unexpectedly, investigate
  - Estimated time: 2 minutes

---

## Phase 3.3: Jetton Implementation (30 minutes)

- [ ] **T007** [P] Implement JettonWallet.fc
  - File: `contracts/jetton-wallet.fc`
  - Reference TEP-74 standard implementation
  - Storage structure: `(balance:Coins, owner:MsgAddress, jetton_master:MsgAddress)`
  - Operations to implement:
    * `op::transfer (0xf8a7ea5)`: Transfer tokens to another wallet
    * `op::internal_transfer (0x178d4519)`: Receive tokens from another wallet
    * `op::burn (0x595f07bc)`: Burn tokens and notify minter
  - Get methods:
    * `get_wallet_data()`: Return (balance, owner, jetton_master)
  - Use inline functions for gas efficiency
  - Estimated time: 15 minutes

- [ ] **T008** [P] Implement JettonMinter.fc
  - File: `contracts/jetton-minter.fc`
  - Reference TEP-74 standard implementation
  - Storage structure: `(total_supply:Coins, admin:MsgAddress, content:Cell, jetton_wallet_code:Cell)`
  - Operations to implement:
    * `op::mint (21)`: Mint tokens to recipient (admin-only)
    * `op::burn_notification (0x595f07bc)`: Handle burn from wallet, decrease supply
  - Get methods:
    * `get_jetton_data()`: Return (total_supply, mintable=true, admin, content, wallet_code)
    * `get_wallet_address(owner)`: Calculate wallet address for owner
  - Store JettonWallet code in `jetton_wallet_code` cell
  - Estimated time: 15 minutes

- [ ] **T009** Verify Jetton tests pass
  - Run `npm test tests/unit/JettonWallet.spec.ts tests/unit/JettonMinter.spec.ts`
  - Expected: All tests should PASS
  - Fix any failures before proceeding
  - Document any deviations from expected behavior
  - Estimated time: 5 minutes

---

## Phase 3.4: Bonding Curve Tests (40 minutes)

**CRITICAL: These tests define the core platform logic. Must be comprehensive for happy path.**

- [ ] **T010** [P] Price calculation tests
  - File: `tests/unit/BondingCurve-Price.spec.ts`
  - Test suite: BondingCurveContract - Price Calculations
  - Tests to implement:
    * `should return base price (0.000001 TON) for first token`
    * `should calculate sqrt correctly using Newton's method` (test with known values)
    * `should follow square root curve progression` (25%=0.5x, 50%=0.707x, 100%=1x multiplier)
    * `should calculate buy cost via integration` (verify against manual calculation)
    * `should calculate tokens for TON amount` (inverse function)
    * `should converge within 20 Newton iterations`
  - Reference: research.md Section 6-7 for formulas
  - Mark as expected to FAIL
  - Estimated time: 10 minutes

- [ ] **T011** [P] Buy operation tests
  - File: `tests/unit/BondingCurve-Buy.spec.ts`
  - Test suite: BondingCurveContract - Buy Operations
  - Tests to implement:
    * `should mint correct tokens for TON amount` (happy path)
    * `should split funds 50/40/5/5 (reserve/liquidity/creator/platform)`
    * `should enforce 2% max buy limit`
    * `should enforce 50M absolute max buy limit`
    * `should track buyer contributions for refunds`
    * `should trigger soft cap when 20% reached`
    * `should trigger graduation at hard cap`
    * `should reject buys after graduation`
  - Verify all fund allocations match spec (FR-002)
  - Mark as expected to FAIL
  - Estimated time: 10 minutes

- [ ] **T012** [P] Sell operation tests
  - File: `tests/unit/BondingCurve-Sell.spec.ts`
  - Test suite: BondingCurveContract - Sell Operations
  - Tests to implement:
    * `should return correct TON for sold tokens` (happy path)
    * `should apply 1% sell fee`
    * `should burn tokens on sell`
    * `should update reserve balance correctly`
    * `should reject sells after graduation`
    * `should reject sells if insufficient reserve`
  - Reference: FR-003, FR-004 from spec
  - Mark as expected to FAIL
  - Estimated time: 8 minutes

- [ ] **T013** [P] Soft cap tests
  - File: `tests/unit/BondingCurve-SoftCap.spec.ts`
  - Test suite: BondingCurveContract - Soft Cap Logic
  - Tests to implement:
    * `should set soft_cap_reached when 20% hit`
    * `should record soft_cap_timestamp`
    * `should remove time deadline after soft cap`
    * `should allow unlimited time after soft cap`
    * `should trigger failure if deadline passes (pre-soft-cap)`
  - Reference: FR-009, FR-010, FR-011, FR-012 from spec
  - Mark as expected to FAIL
  - Estimated time: 5 minutes

- [ ] **T014** [P] Graduation tests
  - File: `tests/unit/BondingCurve-Graduation.spec.ts`
  - Test suite: BondingCurveContract - Graduation to DEX
  - Tests to implement:
    * `should trigger graduation at hard cap` (happy path)
    * `should mark is_graduated flag`
    * `should store dex_pool_address`
    * `should transfer liquidity to DEX pool (40% of raised)`
    * `should burn LP tokens (send to null address)`
  - Note: Full DEX integration may be mocked for unit tests
  - Reference: FR-013, FR-014, FR-015, FR-016 from spec
  - Mark as expected to FAIL
  - Estimated time: 5 minutes

- [ ] **T015** [P] Refund tests
  - File: `tests/unit/BondingCurve-Refund.spec.ts`
  - Test suite: BondingCurveContract - Refund Logic
  - Tests to implement:
    * `should calculate refunds correctly` (total_spent - fees)
    * `should mark launch as failed on soft cap miss`
    * `should allow users to claim refunds`
    * `should remove refund after claimed`
    * `should burn user tokens on refund claim`
  - Reference: FR-011, NFR-004 from spec
  - Mark as expected to FAIL
  - Estimated time: 5 minutes

- [ ] **T016** Verify bonding curve tests fail
  - Run `npm test tests/unit/BondingCurve*.spec.ts`
  - Expected: All tests should FAIL (bonding curve not implemented)
  - Document total test count (should be ~35-40 tests)
  - Estimated time: 2 minutes

---

## Phase 3.5: Bonding Curve Implementation (90 minutes)

**LARGEST TASK BLOCK: Core platform logic. Break down into subtasks.**

- [ ] **T017** Implement price calculation functions
  - File: `contracts/bonding-curve.fc`
  - Functions to implement:
    * `sqrt_newton(x)`: Newton's method sqrt (20 iteration max) - inline
    * `power_3_2(k)`: Calculate k^1.5 = k × sqrt(k) - inline
    * `calculate_price(tokens_sold)`: Price = base_price × √(tokens_sold / total_supply)
    * `calculate_buy_cost(amount)`: Integral of price curve
    * `calculate_tokens_for_ton(ton_amount)`: Inverse calculation (iterative)
    * `calculate_sell_return(token_amount)`: Return TON for tokens
  - Reference: Plan Section "Price Curve Implementation" (detailed pseudocode)
  - Integer-only math, no floating point
  - Estimated time: 20 minutes

- [ ] **T018** Implement buy operation
  - File: `contracts/bonding-curve.fc` (continue)
  - Operation: `op::buy (0x10)`
  - Implementation steps:
    1. Validate: not graduated, not failed, minimum buy, not expired
    2. Calculate tokens: `tokens = calculate_tokens_for_ton(msg_value)`
    3. Check max buy: `min(remaining * 2%, 50M tokens)`
    4. Split funds: 50% reserve, 40% liquidity, 5% creator, 5% platform
    5. Update state: tokens_sold, reserve_balance, total_raised, buyer_contributions
    6. Check soft cap: if `total_raised >= soft_cap` set flags
    7. Check graduation: if `total_raised >= hard_cap` call graduate_to_dex()
    8. Send fees immediately
    9. Mint tokens via JettonMinter
    10. Emit buy event
  - Reference: Detailed pseudocode in plan.md
  - Estimated time: 40 minutes

- [ ] **T019** Implement sell operation
  - File: `contracts/bonding-curve.fc` (continue)
  - Operation: `op::sell (0x11)`
  - Implementation steps:
    1. Validate: not graduated, not failed, sender has tokens
    2. Calculate return: `ton_return = calculate_sell_return(token_amount)`
    3. Apply 1% fee: `fee = ton_return * 1 / 100`
    4. Net return: `net_return = ton_return - fee`
    5. Validate reserve: `net_return <= reserve_balance`
    6. Update state: tokens_sold, reserve_balance
    7. Add fee to platform
    8. Burn tokens via JettonMinter
    9. Send TON to seller
    10. Emit sell event
  - Reference: Plan op::sell pseudocode
  - Estimated time: 15 minutes

- [ ] **T020** Implement soft cap + refund logic
  - File: `contracts/bonding-curve.fc` (continue)
  - Operations to implement:
    * `op::trigger_failure_check (0x13)`: Check if soft cap deadline passed
    * `op::claim_refund (0x12)`: User claims refund after failure
  - trigger_failure_check implementation:
    1. Validate: deadline passed, soft cap not reached, not already failed/graduated
    2. Set `is_failed = 1`
    3. Calculate refunds: For each buyer, `refund = spent - platform_fee - creator_fee`
    4. Store in `refund_claims` dictionary
    5. Emit failure event
  - claim_refund implementation:
    1. Validate: launch failed, user has refund
    2. Look up refund_claims[sender]
    3. Transfer refund to user
    4. Remove from refund_claims
    5. Burn user tokens
  - Reference: Plan op::claim_refund and op::trigger_failure_check
  - Estimated time: 20 minutes

- [ ] **T021** Implement graduation + DEX integration
  - File: `contracts/bonding-curve.fc` (continue)
  - Internal function: `graduate_to_dex()`
  - Implementation steps:
    1. Set `is_graduated = 1`
    2. Calculate liquidity: accumulated 40% from all buys
    3. Calculate tokens for liquidity: remaining unsold supply
    4. Send pool creation message to DeDust factory
    5. Parse pool address from response
    6. Transfer TON + tokens to pool
    7. Receive LP tokens
    8. Burn LP tokens: send to null address (EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c)
    9. Store `dex_pool_address`
    10. Emit graduation event
  - Reference: Plan graduate_to_dex() + research.md Section 5 (DeDust integration)
  - Note: May need DeDust contract interfaces
  - Estimated time: 30 minutes

---

## Phase 3.6: Factory Tests & Implementation (30 minutes)

- [ ] **T022** [P] LaunchpadFactory tests
  - File: `tests/unit/LaunchpadFactory.spec.ts`
  - Test suite: LaunchpadFactoryContract
  - Tests to implement:
    * `should deploy with correct configuration` (tiers, time limits)
    * `should deploy new token launch` (happy path - creates 3 contracts)
    * `should register launch in launch_registry`
    * `should increment launch_count`
    * `should return launch info via get method`
    * `should allow owner to withdraw platform fees`
    * `should reject non-owner fee withdrawal`
    * `should return platform stats via get method`
  - Reference: FR-023, FR-024, FR-025, FR-026 from spec
  - Mark as expected to FAIL
  - Estimated time: 10 minutes

- [ ] **T023** Implement LaunchpadFactory.fc
  - File: `contracts/launchpad-factory.fc`
  - Storage structure: `(owner, launch_count, platform_fee_percent, launch_registry, platform_balance, hard_cap_tiers, time_limits)`
  - Operations to implement:
    * `op::deploy_launch (0x01)`: Deploy BondingCurve + JettonMinter + JettonWallet code
    * `op::withdraw_platform_fees (0x02)`: Owner withdraws fees (owner-only)
    * `op::update_hard_cap_tiers (0x03)`: Update tier configuration (owner-only)
  - Get methods:
    * `get_launch_info(launch_id)`: Return (curve_addr, minter_addr, creator, timestamp, hard_cap, time_limit)
    * `get_platform_stats()`: Return (total_launches, total_graduated, total_failed, platform_balance)
  - Hard cap tiers: [50, 200, 500, 1000, 5000] TON
  - Time limits: [30, 60, 90] days (in seconds: [2592000, 5184000, 7776000])
  - Reference: Plan LaunchpadFactory section
  - Estimated time: 25 minutes

- [ ] **T024** Verify factory tests pass
  - Run `npm test tests/unit/LaunchpadFactory.spec.ts`
  - Expected: All tests should PASS
  - Verify launch deployment creates all 3 contracts
  - Estimated time: 5 minutes

---

## Phase 3.7: Integration Tests (30 minutes)

**These tests follow quickstart.md scenarios exactly.**

- [ ] **T025** Full launch flow integration test
  - File: `tests/integration/FullLaunchFlow.spec.ts`
  - Test suite: Full Token Launch Lifecycle
  - Scenario: Create → Buy → Soft Cap → Hard Cap → Graduate → DEX Trade
  - Test implementation:
    1. Deploy LaunchpadFactory
    2. Create DemoToken launch (500 TON hard cap tier)
    3. Buyer1 buys 10 TON worth (verify price, allocations)
    4. Buyer2 buys 50 TON worth (verify curve progression)
    5. Continue buying until 100 TON (soft cap reached, verify flag set)
    6. Continue buying until 500 TON (hard cap reached)
    7. Verify graduation: is_graduated=true, dex_pool_address set
    8. Verify LP tokens burned (check null address balance)
    9. Attempt buy on curve (should fail: exit code 400)
    10. Verify DEX trading enabled (query pool reserves)
  - Reference: quickstart.md Scene 1-10
  - Estimated time: 15 minutes

- [ ] **T026** Soft cap failure integration test
  - File: `tests/integration/SoftCapFailure.spec.ts`
  - Test suite: Soft Cap Failure & Refunds
  - Scenario: Create → Partial Buys → Deadline Pass → Refunds
  - Test implementation:
    1. Create launch with 500 TON hard cap (100 TON soft cap)
    2. Buy only 80 TON over multiple transactions
    3. Fast-forward time by 30 days (blockchain.now += 2592000)
    4. Call trigger_failure_check()
    5. Verify is_failed=true
    6. Verify refunds calculated (80 TON - 8 TON fees = 72 TON available)
    7. Buyer1 claims refund
    8. Verify refund received (correct amount)
    9. Verify tokens burned
    10. Verify refund removed from refund_claims
  - Reference: quickstart.md Alternative Scenario A
  - Estimated time: 10 minutes

- [ ] **T027** Graduation flow integration test
  - File: `tests/integration/GraduationFlow.spec.ts`
  - Test suite: DEX Graduation & LP Locking
  - Scenario: Buy to Hard Cap → Auto-Graduation → Verify LP Lock
  - Test implementation:
    1. Create launch and buy to just under hard cap (e.g., 499 TON)
    2. Execute final buy that hits hard cap exactly
    3. Verify graduation triggered in same transaction
    4. Capture graduation event
    5. Verify DeDust pool created (pool_address returned)
    6. Query pool: verify 200 TON + tokens deposited
    7. Verify LP tokens received (calculate expected amount)
    8. Verify LP tokens sent to null address (EQAAA...M9c)
    9. Query null address balance (should have LP tokens)
    10. Verify bonding curve closed (is_graduated=true)
  - Reference: quickstart.md Scene 7
  - Estimated time: 10 minutes

---

## Phase 3.8: Deployment Scripts (15 minutes)

**Deployment scripts for testnet.**

- [ ] **T028** [P] Deploy script for LaunchpadFactory
  - File: `scripts/deploy-factory.ts`
  - Script implementation:
    * Load deployer wallet from environment (mnemonic or key file)
    * Compile LaunchpadFactory.fc to BoC (Bag of Cells)
    * Create deployment message with initial storage
    * Send to testnet (testnet.toncenter.com)
    * Wait for deployment confirmation
    * Log factory address
    * Verify get methods work (call get_platform_stats)
  - Configuration:
    * Hard cap tiers: [50, 200, 500, 1000, 5000] TON
    * Time limits: [30, 60, 90] days
    * Owner: deployer address
  - Output: Factory address, initial state
  - Estimated time: 10 minutes

- [ ] **T029** [P] Create launch CLI script
  - File: `scripts/create-launch.ts`
  - CLI arguments: `--name, --symbol, --description, --image, --hard-cap-tier, --time-limit, --total-supply`
  - Script implementation:
    * Load user wallet (creator)
    * Build token metadata (TEP-64 format)
    * Call factory.deploy_launch() with parameters
    * Wait for 3 contract deployments
    * Parse launch_id, BondingCurve address, JettonMinter address from response
    * Log all addresses
    * Query launch info to verify
  - Example usage:
    ```bash
    npm run create:launch -- \
      --name "DemoToken" \
      --symbol "DEMO" \
      --hard-cap-tier 2 \
      --time-limit 0 \
      --total-supply 1000000000
    ```
  - Output: Launch ID, contract addresses, configuration summary
  - Estimated time: 10 minutes

---

## Phase 3.9: Validation (15 minutes)

- [ ] **T030** Run full test suite and manual quickstart validation
  - Steps:
    1. Run all unit tests: `npm test tests/unit/`
       - Expected: All pass (70+ tests)
    2. Run all integration tests: `npm test tests/integration/`
       - Expected: All pass (3 test suites)
    3. Check test coverage: `npm run test:coverage`
       - Target: >80% line coverage on contracts (focus on happy paths)
    4. Manual quickstart validation:
       - Deploy factory to testnet (T028)
       - Create demo launch (T029)
       - Execute quickstart.md Scene 1-10 manually
       - Verify 2-minute demo completes successfully
    5. Document any failures or deviations
    6. Create summary report:
       - Total tests: X passed / Y total
       - Coverage: Z%
       - Gas costs measured vs estimated
       - Demo completion time
       - Known issues (if any)
  - Success criteria:
    * All tests pass
    * Demo completes in <2 minutes
    * No critical bugs found
  - Estimated time: 15 minutes

---

## Dependencies

**Setup Phase**:
- T001 → T002 → T003 (sequential setup)

**Jetton Foundation** (T002 blocks all):
- T004, T005 can run in parallel [P]
- T006 requires T004 + T005
- T007, T008 can run in parallel [P] (require T006)
- T009 requires T007 + T008

**Bonding Curve** (T009 blocks all):
- T010-T015 can run in parallel [P] (test files)
- T016 requires T010-T015
- T017 requires T016 (first implementation task)
- T018 requires T017 (buy needs price functions)
- T019 can parallel with T018 [P] if different functions, but safer sequential
- T020 requires T018 (refunds depend on buy logic)
- T021 requires T018 (graduation triggered by buy)

**Factory** (T021 blocks T022):
- T022 [P] can run after T021
- T023 requires T022
- T024 requires T023

**Integration** (T024 blocks all):
- T025, T026, T027 can run in parallel [P] (different test files)

**Deployment** (T024 blocks all):
- T028, T029 can run in parallel [P]

**Validation** (all above block T030):
- T030 requires everything else complete

**Critical Path** (longest dependency chain):
T001 → T002 → T003 → T006 → T009 → T016 → T017 → T018 → T020 → T021 → T024 → T030

**Total Estimated Time**: 4 hours 20 minutes (40 minutes buffer within 5-hour hackathon limit)

---

## Parallel Execution Examples

### Parallel Batch 1: Jetton Tests (after T003)
```bash
# Launch T004 and T005 together:
npm test tests/unit/JettonWallet.spec.ts &
npm test tests/unit/JettonMinter.spec.ts &
wait
```

### Parallel Batch 2: Jetton Implementation (after T006)
```bash
# Implement both contracts simultaneously (different files):
# Terminal 1: Edit contracts/jetton-wallet.fc
# Terminal 2: Edit contracts/jetton-minter.fc
```

### Parallel Batch 3: Bonding Curve Tests (after T009)
```bash
# Launch all 6 test file creations:
touch tests/unit/BondingCurve-{Price,Buy,Sell,SoftCap,Graduation,Refund}.spec.ts

# Edit tests in parallel (6 different files):
# Terminal 1: BondingCurve-Price.spec.ts
# Terminal 2: BondingCurve-Buy.spec.ts
# Terminal 3: BondingCurve-Sell.spec.ts
# Terminal 4: BondingCurve-SoftCap.spec.ts
# Terminal 5: BondingCurve-Graduation.spec.ts
# Terminal 6: BondingCurve-Refund.spec.ts
```

### Parallel Batch 4: Integration Tests (after T024)
```bash
# All integration tests can run concurrently:
npm test tests/integration/FullLaunchFlow.spec.ts &
npm test tests/integration/SoftCapFailure.spec.ts &
npm test tests/integration/GraduationFlow.spec.ts &
wait
```

### Parallel Batch 5: Deployment Scripts (after T024)
```bash
# Both scripts can be written simultaneously:
# Terminal 1: scripts/deploy-factory.ts
# Terminal 2: scripts/create-launch.ts
```

---

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD discipline)
- Commit after each logical group (e.g., after T009, T016, T024)
- Track time: No task should exceed 45 minutes (constitution limit)
- If stuck for 15 minutes, pivot or ask for help
- Focus on happy paths (defer edge cases for post-hackathon)
- Gas costs will be measured in T030 validation

## Task Generation Rules Applied

1. **From contracts/** (4 contracts):
   - JettonWallet → T004 (test) + T007 (impl) ✓
   - JettonMinter → T005 (test) + T008 (impl) ✓
   - BondingCurve → T010-T015 (tests) + T017-T021 (impl, split into 5 subtasks) ✓
   - LaunchpadFactory → T022 (test) + T023 (impl) ✓

2. **From data-model.md** (entities):
   - All entities embedded in contract storage (no separate model tasks) ✓

3. **From quickstart.md** (scenarios):
   - Full launch flow → T025 ✓
   - Soft cap failure → T026 ✓
   - Graduation flow → T027 ✓

4. **Setup & Polish**:
   - Setup → T001-T003 ✓
   - Deployment → T028-T029 ✓
   - Validation → T030 ✓

**Total Tasks**: 30 (matches estimate in plan.md)

---

## Validation Checklist

*GATE: Checked before execution*

- [x] All contracts have test tasks (4/4)
- [x] All tests come before implementation (TDD order enforced)
- [x] Parallel tasks truly independent (different files verified)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly documented
- [x] Time estimates sum to <5 hours (4h 20m + 40m buffer)
- [x] Critical path identified (T001→T002→...→T030)
- [x] Hackathon constraints respected (happy path focus, 45min max per task)

---

**Status**: ✅ READY FOR EXECUTION

**Next**: Execute tasks T001-T030 in dependency order, mark complete as you go

**Command**: Start with `T001` or run setup batch `T001 && T002 && T003`
