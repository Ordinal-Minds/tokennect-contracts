# Feature Specification: Token Launch Platform with Bonding Curve

**Feature Branch**: `001-token-launch-platform`
**Created**: 2025-10-01
**Status**: Ready for Planning
**Input**: User description: "Token Launch Platform - Smart contract infrastructure for token launches on TON blockchain with bonding curve pricing and auto-graduation to DEX"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## Clarifications

### Session 2025-10-01

**All 6 critical design decisions resolved:**

1. **Cooldown Period**: 0 seconds (no cooldown) - Bonding curve price increases provide natural anti-manipulation; transaction fees prevent spam
2. **Maximum Buy Limit**: 2% of remaining supply with absolute cap of 50M tokens (5% of 1B total supply)
3. **Hard Cap Tiers**: 5 preset tiers - 50 / 200 / 500 / 1,000 / 5,000 TON (default: 500 TON)
4. **Graduation Failure Fallback**: 20% soft cap with 30-day deadline; full refunds if soft cap not reached
5. **Launch Parameters**:
   - **Configurable**: Token name/symbol/image/description, hard cap tier, time limit (30/60/90 days, default 30), total supply (default 1B)
   - **Fixed**: Fee structure (50/40/5/5 split), sell fee (1%), curve type (square root)
6. **Time Limit**: Two-phase - 30 days to reach 20% soft cap (refund if failed), unlimited time after soft cap reached to complete graduation

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A project creator wants to launch a new token on the Tokenect platform. They create a token launch which enters a bonding curve phase where early investors can purchase tokens at algorithmically-determined prices that increase as more tokens are sold. The launch has 30 days to reach a 20% soft cap (proving viability) or funds are refunded. Once soft cap is reached, the launch can continue indefinitely until reaching the hard cap, at which point the system automatically creates a liquidity pool on a decentralized exchange with permanently locked liquidity, preventing rug pulls and enabling free market trading.

### Acceptance Scenarios

1. **Given** a new token launch is created with 500 TON hard cap tier, **When** an investor purchases tokens during the bonding curve phase, **Then** the system calculates the price using the square root bonding curve formula, allocates 50% to reserves, 40% to liquidity pool, 5% to creator, and 5% to platform

2. **Given** a token launch is in bonding curve phase, **When** an investor attempts to sell tokens back, **Then** the system calculates sell price from reserves, deducts 1% sell fee, and returns remaining funds to the investor

3. **Given** a token launch reaches the hard cap threshold (e.g., 500 TON), **When** the graduation trigger executes, **Then** the system deploys a liquidity pool with accumulated 40% funds, locks LP tokens permanently, and enables free market trading

4. **Given** a token is in bonding curve phase with 100M tokens remaining, **When** a whale attempts to purchase 5M tokens (exceeding 2% limit of 2M), **Then** the transaction is rejected with an error message

5. **Given** a launch has been live for 30 days, **When** it has only raised 15 TON (15% of 100 TON soft cap for 500 TON tier), **Then** the system automatically triggers refunds to all investors

6. **Given** a launch reaches 20% soft cap (100 TON of 500 TON tier) on day 25, **When** the soft cap is hit, **Then** the 30-day deadline is removed and the launch can continue indefinitely until hard cap is reached

### Edge Cases
- What happens when an investor tries to purchase tokens with insufficient funds? (Transaction reverts with clear error)
- How does the system handle the final purchase that would exceed the hard cap? (Partial fill up to exact hard cap, remainder refunded)
- What happens if graduation to DEX fails due to external factors? (Launch remains in bonding curve state; manual graduation retry mechanism available)
- How are prices calculated when supply is at zero? (Initial purchase uses base price from curve parameters)
- What happens to pending transactions during the graduation process? (Transactions queue and process after graduation completes or revert if graduation fails)
- Can a creator withdraw their 5% fees before graduation? (Yes, creator fees are withdrawable immediately as they accumulate)
- What happens if someone tries to buy exactly 50M tokens when 100M remain? (Transaction succeeds - hits absolute cap exactly at 2% limit)

## Requirements *(mandatory)*

### Functional Requirements

**Phase 1: Bonding Curve Launch**

- **FR-001**: System MUST calculate token purchase price using square root bonding curve formula: Price = Initial_Price × √(S / k), where S is current supply and k is curve constant
- **FR-002**: System MUST allocate each purchase as follows: 50% to reserves backing token value, 40% to liquidity pool accumulation, 5% to project creator, 5% to platform fees
- **FR-003**: System MUST enable investors to sell tokens back to the bonding curve before graduation, calculating sell price from available reserves
- **FR-004**: System MUST apply 1% sell fee on all sell-back transactions to discourage quick flips
- **FR-005**: System MUST NOT enforce cooldown period between purchases (0 seconds) - price increases provide natural rate limiting
- **FR-006**: System MUST enforce maximum buy limit of 2% of remaining supply OR 50M tokens (5% of 1B total), whichever is smaller
- **FR-007**: System MUST track real-time progress toward hard cap and soft cap, displaying percentage sold and funds raised
- **FR-008**: System MUST provide real-time price query capability showing current buy/sell prices

**Phase 2: Soft Cap & Graduation**

- **FR-009**: System MUST enforce 20% soft cap threshold (calculated as 20% of selected hard cap tier)
- **FR-010**: System MUST enforce 30-day deadline to reach soft cap from launch creation
- **FR-011**: System MUST automatically trigger full refunds if soft cap not reached within 30 days
- **FR-012**: System MUST remove time deadline once soft cap is reached, allowing unlimited time to reach hard cap
- **FR-013**: System MUST automatically trigger graduation when bonding curve reaches hard cap (50 / 200 / 500 / 1,000 / 5,000 TON based on tier selection)
- **FR-014**: System MUST deploy liquidity pool using accumulated 40% funds from all purchases
- **FR-015**: System MUST permanently lock LP tokens to prevent creator from removing liquidity
- **FR-016**: System MUST transition trading from bonding curve to decentralized exchange after successful graduation
- **FR-017**: System MUST maintain bonding curve state if graduation fails, with manual retry capability

**Anti-Manipulation & Protection**

- **FR-018**: System MUST reject transactions that would exceed maximum buy limit (2% remaining OR 50M absolute cap)
- **FR-019**: System MUST validate all fund allocations match specified percentages (50/40/5/5)
- **FR-020**: System MUST emit transaction events for transparency and audit trail
- **FR-021**: System MUST prevent creator from withdrawing or manipulating locked LP tokens post-graduation
- **FR-022**: System MUST handle partial fills when purchase would exceed hard cap (fill to exact cap, refund excess)

**Token Launch Management**

- **FR-023**: System MUST allow project creators to configure: token name, symbol, image, description, hard cap tier (50/200/500/1K/5K TON), time limit option (30/60/90 days, default 30), and total supply (default 1B tokens)
- **FR-024**: System MUST fix the following parameters (non-configurable): 50% reserve ratio, 40% liquidity ratio, 5% creator fee, 5% platform fee, 1% sell fee, square root curve type
- **FR-025**: System MUST track all active token launches and their current state (pre-soft-cap, post-soft-cap, graduated, failed)
- **FR-026**: System MUST display key metrics for each launch: total raised, tokens sold, current price, soft cap progress, time remaining (if pre-soft-cap), hard cap tier
- **FR-027**: System MUST allow creators to withdraw accumulated 5% fees at any time during bonding curve phase

**Non-Functional Requirements**

- **NFR-001**: Transactions MUST complete with near-instant finality leveraging network capabilities
- **NFR-002**: Price calculations MUST be deterministic and verifiable on-chain
- **NFR-003**: System MUST maintain accurate fund accounting with zero loss or gain (conservation of value)
- **NFR-004**: Refund mechanism MUST return 100% of invested funds if soft cap deadline is missed (no fees deducted)
- **NFR-005**: [HACKATHON CONSTRAINT: Full bonding curve + soft cap + graduation flow must be implementable and testable within 5 hours - focus on happy path, defer advanced edge cases]

### Key Entities *(include if feature involves data)*

- **TokenLaunch**: Represents a token launch campaign with bonding curve parameters, hard cap tier (50/200/500/1K/5K TON), soft cap threshold (20% of hard cap), current state (pre-soft-cap, post-soft-cap, graduated, failed), funds raised, tokens sold, creator address, creation timestamp, soft cap deadline, and graduation status

- **BondingCurve**: Mathematical pricing model with initial price, curve constant k, current supply, total supply (default 1B), and formulas for buy/sell price calculation using square root function

- **Reserves**: Fund pool backing token value, receives 50% of purchases, sources sell-back transactions (minus 1% fee), tracked per token launch

- **LiquidityPool**: Accumulated funds (40% of purchases) held until graduation, then deployed as DEX liquidity with locked LP tokens

- **SoftCap**: Validation threshold set at 20% of hard cap tier, with 30-day deadline; triggers refund if missed or removes time limit if reached

- **HardCapTier**: Preset graduation target selected from [50, 200, 500, 1000, 5000] TON; default 500 TON

- **Purchase**: Individual buy transaction with buyer address, amount paid (in TON), tokens received, timestamp, price at execution, and buy limit validation (2% remaining OR 50M absolute)

- **SellTransaction**: Sell-back transaction with seller address, tokens sold, funds returned (minus 1% fee from sell amount), timestamp

- **Graduation**: Event triggered at hard cap with liquidity pool deployment details, LP token lock confirmation, and transition to DEX trading

- **FeeAllocation**: Distribution record showing creator fees (5%), platform fees (5%), and their real-time accumulation with withdrawal tracking

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain (all 6 items resolved)
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

**All Clarifications Resolved:**
1. ✅ Cooldown period: 0 seconds (no cooldown)
2. ✅ Maximum buy limit: 2% remaining OR 50M absolute cap
3. ✅ Hard cap: 5 preset tiers (50/200/500/1K/5K TON)
4. ✅ Graduation fallback: 20% soft cap + 30-day deadline + refunds
5. ✅ Launch parameters: Configurable (name/tier/time/supply) vs Fixed (fees/curve)
6. ✅ Time limit: Two-phase (30 days for soft cap, unlimited after)

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (6 items)
- [x] All ambiguities resolved via clarification session
- [x] User scenarios defined and updated with soft cap logic
- [x] Requirements generated (27 functional, 5 non-functional)
- [x] Entities identified (10 entities including SoftCap and HardCapTier)
- [x] Review checklist passed

**Status**: ✅ READY FOR PLANNING

---
