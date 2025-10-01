# Implementation Plan: Token Launch Platform with Bonding Curve

**Branch**: `001-token-launch-platform` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/konradgnat/dev/hackathons/token2049/tokennect/tknt-tma/tokenect/specs/001-token-launch-platform/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ COMPLETE: Spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ COMPLETE: All clarifications resolved in spec
3. Fill the Constitution Check section
   → ✅ COMPLETE: Hackathon constraints validated
4. Evaluate Constitution Check section
   → ✅ PASS: All constitutional requirements met
5. Execute Phase 0 → research.md
   → ✅ COMPLETE: Technology decisions documented
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
   → ✅ COMPLETE: Design artifacts generated
7. Re-evaluate Constitution Check
   → ✅ PASS: Design aligns with hackathon constraints
8. Plan Phase 2 → Describe task generation approach
   → ✅ COMPLETE: Task approach documented
9. STOP - Ready for /tasks command
   → ✅ Ready for task generation
```

**IMPORTANT**: The /plan command STOPS at step 8. Phase 2-4 execution:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution

## Summary

Building smart contract infrastructure for token launches on TON blockchain with bonding curve pricing mechanism and automatic DEX graduation. The system implements a two-phase launch lifecycle:

**Phase 1 (Bonding Curve)**: Projects launch tokens with square root pricing curve. Investors buy at algorithmically-determined prices. Must reach 20% soft cap within 30 days or trigger full refunds. After soft cap, unlimited time to reach hard cap.

**Phase 2 (Graduation)**: Upon reaching hard cap (50/200/500/1K/5K TON tiers), system automatically deploys liquidity pool on DeDust DEX with permanently locked LP tokens, preventing rug pulls.

**Technical Approach**: Four interconnected FunC smart contracts (LaunchpadFactory, BondingCurve, JettonMinter, JettonWallet) tested with TypeScript/@ton/sandbox. Square root bonding curve with Newton's method for price calculation. Fixed 50/40/5/5 fund allocation (reserves/liquidity/creator/platform). Anti-manipulation via 2% + 50M token buy limits per transaction.

## Technical Context

**Language/Version**: FunC (TON smart contract language) + TypeScript 5.3+ for tests
**Primary Dependencies**:
  - Smart Contracts: stdlib.fc, func compiler, fift assembler
  - Testing: @ton/sandbox ^0.16.0, @ton/core ^0.56.0, @ton/test-utils ^0.4.2, Jest ^29.7.0
  - Deployment: @ton/ton ^13.11.0, @ton/crypto ^3.2.0, ts-node

**Storage**: On-chain storage via TON blockchain (contract state cells)
**Testing**: Jest + @ton/sandbox (local TON blockchain emulator) + TypeScript
**Target Platform**: TON blockchain (testnet for development, mainnet for production)
**Project Type**: Single project (smart contracts + tests)
**Performance Goals**:
  - Transaction finality: <5 seconds (TON blockchain native)
  - Gas costs: Buy ~0.15 TON, Sell ~0.12 TON, Deploy ~0.3 TON
  - Price calculation: Deterministic integer math (no floating point)

**Constraints**:
  - Integer-only math (no floating point in FunC)
  - Square root via Newton's method (20 iteration max)
  - TEP-74 Jetton standard compliance required
  - DeDust DEX integration for graduation
  - 5-hour hackathon implementation window

**Scale/Scope**:
  - Support unlimited concurrent token launches
  - 1B tokens default supply per launch
  - Hard cap tiers: 50 - 5,000 TON per launch
  - Expected 100-1000 transactions per launch lifecycle

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Hackathon Speed Check
- [x] Total estimated time < 5 hours (Planning 30m, Setup 15m, Core 3h, Testing 45m, Polish 30m)
  - **Estimate**: Planning (30m), Setup (15m), Core Contracts (2h), Tests (1h), Integration (1h) = 4h 45m
- [x] No single task exceeds 45 minutes
  - Largest task: BondingCurve contract implementation (estimated 40m with provided pseudocode)
- [x] All dependencies pre-identified and available
  - TON SDK packages available on npm, DeDust integration documented

### Simplicity Check
- [x] Using simplest possible implementation for current requirements
  - Standard TEP-74 Jetton (battle-tested pattern)
  - Newton's method for sqrt (simple, proven algorithm)
  - No complex state machines—linear lifecycle (launch → soft cap → graduation)
- [x] No premature abstractions or patterns added
  - Direct FunC implementation, no unnecessary wrappers
  - Inline math functions where appropriate
- [x] Using familiar technologies (list below)
  - FunC: Standard for TON smart contracts
  - TypeScript/Jest: Industry-standard testing
  - TEP-74: Established jetton standard
- [x] Inline solutions preferred for small scope
  - Price calculations inline within BondingCurve contract
  - Simple validation logic not extracted

### Best Practices Check
- [x] Clear naming conventions defined
  - FunC: snake_case for functions/variables
  - TypeScript: camelCase for functions, PascalCase for classes
  - Operation codes: Descriptive names (op::buy, op::sell, op::claim_refund)
- [x] Type safety enabled where available
  - TypeScript strict mode enabled
  - FunC typed storage structures
- [x] Error handling planned for user-facing flows
  - Explicit throw_unless for all validation failures
  - Exit codes documented (400-series for buy, 410-series for sell, 420-series for refund)
- [x] Basic input validation included
  - Buy amount minimums, max buy limits
  - Tier index validation (0-4), time limit index (0-2)
  - Insufficient balance checks on sells
- [x] Happy path testing planned (comprehensive testing skipped for speed)
  - Focus: Buy → Soft Cap → Graduation flow
  - Defer: Complex refund scenarios, graduation retry logic, edge case interactions

### Follow Directions Check
- [x] Implementation matches spec exactly (no creative additions)
  - All 27 FRs + 5 NFRs directly implemented
  - No additional features beyond spec
- [x] All ambiguities clarified before coding begins
  - 6 critical decisions resolved in clarification session
  - Cooldown (0s), Max buy (2%/50M), Tiers (5 presets), Soft cap (20%/30d), Parameters (fixed vs configurable), Time limit (two-phase)
- [x] Spec-driven: requirements documented before implementation
  - This plan derived directly from spec.md functional requirements

### MVP Focus Check
- [x] Core value proposition clearly defined
  - **Core**: Buy tokens on curve → reach soft/hard cap → auto-graduate to DEX with locked liquidity
- [x] Feature set minimized to demonstrable essentials
  - INCLUDED: Buy, sell, soft cap, graduation, refunds
  - DEFERRED: Advanced analytics, complex failure recovery, admin controls beyond basics
- [x] Single working flow prioritized over multiple partial flows
  - Primary demo path: Create launch → multiple buys → hit soft cap → continue to hard cap → graduation → DEX trading
- [x] Demo script defines scope boundary
  - See quickstart.md for 2-minute demonstration flow

## Project Structure

### Documentation (this feature)
```
specs/001-token-launch-platform/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification (input)
├── research.md          # Phase 0 output: Technology decisions
├── data-model.md        # Phase 1 output: Contract storage structures
├── quickstart.md        # Phase 1 output: Demo script
└── contracts/           # Phase 1 output: Contract interfaces
    ├── LaunchpadFactory.md
    ├── BondingCurveContract.md
    ├── JettonMinter.md
    └── JettonWallet.md
```

### Source Code (repository root)
```
contracts/
├── launchpad-factory.fc        # Factory deploying launches
├── bonding-curve.fc            # Core bonding curve logic
├── jetton-minter.fc            # TEP-74 Jetton minter
├── jetton-wallet.fc            # TEP-74 Jetton wallet
└── stdlib.fc                   # TON standard library (imported)

tests/
├── unit/
│   ├── BondingCurve.spec.ts    # Price calculation, buy/sell operations
│   ├── JettonMinter.spec.ts    # Minting/burning logic
│   ├── JettonWallet.spec.ts    # Token transfers
│   └── LaunchpadFactory.spec.ts # Launch deployment
├── integration/
│   ├── FullLaunchFlow.spec.ts  # End-to-end: create → buy → graduate
│   ├── SoftCapFlow.spec.ts     # Soft cap success/failure scenarios
│   └── GraduationFlow.spec.ts  # DEX graduation + LP locking
└── helpers/
    ├── blockchain-setup.ts     # Sandbox initialization
    ├── contract-deployers.ts   # Contract deployment utilities
    └── assertion-utils.ts      # Custom matchers

scripts/
├── deploy-factory.ts           # Deploy LaunchpadFactory to testnet
└── create-launch.ts            # CLI to create new token launch

package.json                    # Dependencies
tsconfig.json                   # TypeScript configuration
jest.config.js                  # Jest test configuration
```

**Structure Decision**: Single project structure chosen. Smart contracts in `/contracts`, tests in `/tests`, deployment scripts in `/scripts`. No separate frontend/backend—this is pure smart contract infrastructure. Frontend integration is out of scope for this hackathon phase.

## Phase 0: Outline & Research

**Status**: ✅ COMPLETE

### Technology Decisions

All technical unknowns have been resolved through the provided implementation specifications:

1. **Blockchain Platform**: TON
   - **Decision**: TON blockchain
   - **Rationale**: Native Telegram integration, low transaction costs, fast finality (<5s), DeDust DEX available
   - **Alternatives considered**: Ethereum (too expensive), Solana (no Telegram integration)

2. **Smart Contract Language**: FunC
   - **Decision**: FunC (TON's native smart contract language)
   - **Rationale**: Only language for TON smart contracts, mature tooling, stdlib available
   - **Alternatives**: None viable for TON

3. **Testing Framework**: @ton/sandbox + Jest + TypeScript
   - **Decision**: @ton/sandbox for local blockchain emulation, Jest for test runner, TypeScript for type safety
   - **Rationale**: Official TON testing framework, familiar Jest syntax, TypeScript catches errors early
   - **Alternatives considered**: Python tests (less type safety), manual testing (not repeatable)

4. **Token Standard**: TEP-74 Jetton
   - **Decision**: TEP-74 (TON Enhancement Proposal 74)
   - **Rationale**: Standard fungible token format on TON, interoperable with wallets/exchanges
   - **Alternatives**: Custom token (no ecosystem compatibility)

5. **DEX Integration**: DeDust
   - **Decision**: DeDust (TON's leading DEX)
   - **Rationale**: Highest liquidity, battle-tested contracts, volatile pool support for new tokens
   - **Alternatives considered**: STON.fi (less liquidity), custom AMM (no time in hackathon)

6. **Price Curve Algorithm**: Square Root Bonding Curve
   - **Decision**: Price(k) = base_price × √(k / total_supply)
   - **Rationale**: Balanced price progression—not too steep (like linear) or too gentle (like logarithmic)
   - **Implementation**: Newton's method for integer square root (20 iteration max for convergence)

7. **Integer Square Root**: Newton's Method
   - **Decision**: Iterative Newton approximation
   - **Rationale**: Fast convergence (typically 5-10 iterations), works with integer-only FunC math
   - **Alternatives**: Binary search (slower), lookup tables (too much storage)

8. **Fund Allocation Storage**: Inline calculation
   - **Decision**: Calculate allocations on-the-fly during buy operations
   - **Rationale**: Simpler than tracking separate pools, gas cost similar
   - **Alternatives**: Separate pool contracts (unnecessary complexity)

**Output**: research.md created (see separate file)

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE

### Data Model

All entity structures have been defined based on spec requirements:

**Output**: data-model.md created (see separate file)

Key entities:
- TokenLaunch (contract state in BondingCurve)
- BondingCurve (mathematical model + state)
- Reserves (implicit in reserve_balance storage field)
- LiquidityPool (accumulated funds in bonding curve until graduation)
- SoftCap / HardCapTier (configuration values)
- Purchase / SellTransaction (ephemeral—event logs, not stored state)
- Graduation (event triggered when hard cap reached)
- FeeAllocation (tracked as platform_balance in Factory, creator_fees in BondingCurve)

### Contract Interfaces

Four smart contracts with defined storage structures, operations, and get methods:

**Output**: contracts/ directory created with 4 contract specification files

1. **LaunchpadFactory.md**: Central factory deploying bonding curve contracts
   - Operations: deploy_launch, withdraw_platform_fees, update_hard_cap_tiers
   - Get methods: get_launch_info, get_platform_stats
   - Storage: owner, launch_count, platform_balance, launch_registry, hard_cap_tiers, time_limits

2. **BondingCurveContract.md**: Core bonding curve logic
   - Operations: buy, sell, claim_refund, trigger_failure_check, graduate_to_dex (internal)
   - Get methods: get_launch_stats, get_buy_quote, get_sell_quote, calculate_current_price, get_max_buy, get_user_refund
   - Storage: jetton_minter, creator, hard_cap, soft_cap, time_limit, tokens_sold, reserve_balance, total_raised, is_graduated, is_failed, soft_cap_reached, dex_pool_address, refund_claims
   - **Price Curve**: Square root via Newton's method, integral calculation for buy cost

3. **JettonMinter.md**: TEP-74 compliant token minter
   - Operations: mint, burn_notification
   - Get methods: get_jetton_data, get_wallet_address
   - Storage: total_supply, admin_address (BondingCurve), content (metadata), jetton_wallet_code
   - Metadata: name, symbol, image, description, decimals (TEP-64 format)

4. **JettonWallet.md**: TEP-74 compliant user token wallet
   - Operations: transfer, internal_transfer, burn
   - Get methods: get_wallet_data
   - Storage: balance, owner_address, jetton_master_address

### Quickstart Demo Flow

**Output**: quickstart.md created

2-minute demonstration path:
1. Deploy LaunchpadFactory (15s)
2. Create token launch "DemoToken" with 500 TON hard cap tier (10s)
3. Buyer 1 purchases 10 TON worth (see price increase) (10s)
4. Buyer 2 purchases 50 TON worth (see price curve working) (10s)
5. Continue buying until 100 TON soft cap reached (show soft cap event) (15s)
6. Continue buying until 500 TON hard cap reached (30s)
7. Observe automatic graduation: DEX pool created, LP tokens locked (20s)
8. Query DEX to show liquidity available (10s)
9. Attempt buy on bonding curve (fails—graduated) (5s)
10. Show trade on DEX succeeds (5s)

Total: ~2 minutes

### Agent Context File

TON smart contract development requires Claude Code to understand FunC syntax and TON SDK patterns.

**Output**: Updated CLAUDE.md at repository root with:
- FunC syntax patterns (storage structures, operations, inline functions)
- @ton/sandbox testing patterns
- TEP-74 Jetton standard operations
- Newton's method square root implementation
- TON blockchain specifics (cells, messages, gas costs)

## Phase 2: Task Planning Approach

**Status**: ✅ PLANNED (execution by /tasks command)

### Task Generation Strategy

Load `.specify/templates/tasks-template.md` and generate tasks from Phase 1 design docs:

**From contracts/ specifications**:
- LaunchpadFactory → 1 contract task + tests
- BondingCurveContract → 1 contract task + tests (largest, split into subtasks)
- JettonMinter → 1 contract task + tests
- JettonWallet → 1 contract task + tests

**From data-model.md**:
- Storage structures already defined in contract specs (no separate tasks)

**From quickstart.md**:
- Integration test following exact quickstart flow
- Deployment scripts for testnet

**Test-Driven Development Order**:
1. Setup: Project init, dependencies, compile toolchain
2. Tests First: Write all contract tests (MUST fail initially)
3. Implementation: Implement contracts to make tests pass
4. Integration: End-to-end flow tests
5. Deployment: Scripts for testnet deployment

### Ordering Strategy

**Dependency order**:
- JettonWallet tests/implementation BEFORE JettonMinter (minter creates wallets)
- JettonMinter tests/implementation BEFORE BondingCurve (curve mints tokens)
- BondingCurve tests/implementation BEFORE LaunchpadFactory (factory deploys curves)
- Unit tests BEFORE integration tests
- All tests BEFORE deployment scripts

**Parallel opportunities [P]**:
- JettonWallet and helper utilities (different files)
- Unit test files for different contracts (independent)
- Documentation tasks (can write while tests run)

**Time-critical path**:
1. Setup (15m)
2. JettonWallet (30m contract + tests)
3. JettonMinter (30m contract + tests)
4. BondingCurve price math (20m)
5. BondingCurve buy/sell (40m)
6. BondingCurve soft cap/graduation (30m)
7. LaunchpadFactory (25m contract + tests)
8. Integration tests (30m)
9. Deployment scripts (15m)

Total: 4h 15m (35m buffer for issues)

### Estimated Output

Approximately 25-30 numbered tasks in tasks.md:

**Phase 3.1: Setup** (3 tasks, 15m total)
- T001: Initialize project (package.json, tsconfig, jest)
- T002: Install dependencies (@ton packages)
- T003: [P] Setup test helpers + blockchain sandbox

**Phase 3.2: Tests First - Jetton Foundation** (6 tasks, 30m total)
- T004: [P] JettonWallet contract tests
- T005: [P] JettonMinter contract tests
- T006: Verify tests fail (no implementation yet)

**Phase 3.3: Jetton Implementation** (4 tasks, 30m total)
- T007: [P] Implement JettonWallet.fc
- T008: [P] Implement JettonMinter.fc
- T009: Verify jetton tests pass

**Phase 3.4: Bonding Curve Tests** (7 tasks, 40m total)
- T010: [P] Price calculation tests (sqrt, integral)
- T011: [P] Buy operation tests
- T012: [P] Sell operation tests
- T013: [P] Soft cap tests
- T014: [P] Graduation tests
- T015: [P] Refund tests
- T016: Verify bonding curve tests fail

**Phase 3.5: Bonding Curve Implementation** (5 tasks, 90m total)
- T017: Implement price calculation functions (sqrt_newton, calculate_buy_cost, calculate_tokens_for_ton)
- T018: Implement buy operation
- T019: Implement sell operation
- T020: Implement soft cap + refund logic
- T021: Implement graduation + DEX integration

**Phase 3.6: Factory Tests & Implementation** (3 tasks, 30m total)
- T022: [P] LaunchpadFactory tests
- T023: Implement LaunchpadFactory.fc
- T024: Verify factory tests pass

**Phase 3.7: Integration Tests** (3 tasks, 30m total)
- T025: Full launch flow integration test (quickstart.md scenario)
- T026: Soft cap failure integration test
- T027: Graduation flow integration test

**Phase 3.8: Deployment** (2 tasks, 15m total)
- T028: [P] Deploy script for LaunchpadFactory
- T029: [P] Create launch CLI script

**Phase 3.9: Validation** (1 task, 15m total)
- T030: Run full test suite, verify all pass, manual quickstart validation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following TDD + constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, verify 2-min demo works)

## Complexity Tracking

*No constitutional violations requiring justification*

The implementation strictly adheres to all constitutional principles:
- **Hackathon Speed**: 4h 45m estimated (under 5h limit)
- **Simplicity First**: Standard patterns (TEP-74), proven algorithms (Newton's method), no unnecessary abstractions
- **Best Practices**: Clear naming, type safety via TypeScript, explicit error codes, happy path testing
- **Follow Directions**: All 27 FRs + 5 NFRs directly mapped to implementation
- **MVP Focus**: Core flow (buy → soft cap → graduation → DEX) fully functional; deferred nice-to-haves

No complexity exceptions needed.

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command - NEXT STEP)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (6/6 from spec clarification session)
- [x] Complexity deviations documented (none required)

---

**Status**: ✅ READY FOR /tasks

**Next Command**: `/tasks`

*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
