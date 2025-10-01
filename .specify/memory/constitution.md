<!--
Sync Impact Report:
- Version: 0.0.0 → 1.0.0 (Initial constitution creation)
- Principles defined: 5 core hackathon principles
  1. Hackathon Speed (< 5 Hours)
  2. Simplicity First (YAGNI)
  3. Best Code Practices (Within Constraints)
  4. Follow Directions Exactly
  5. MVP Focus
- Sections added: Core Principles, Development Constraints, Quality Gates, Governance
- Templates updated:
  ✅ .specify/templates/plan-template.md (Constitution Check section expanded with all 5 principles)
  ✅ .specify/templates/spec-template.md (Added hackathon time constraint reminder)
  ✅ .specify/templates/tasks-template.md (Updated testing focus and time tracking notes)
  ✅ .claude/commands/analyze.md (Already references constitution correctly)
- Deferred items: None
- Rationale: MAJOR version (1.0.0) chosen as this is the initial constitution establishment
-->

# Tokenect Constitution

## Core Principles

### I. Hackathon Speed (< 5 Hours)
Every feature and implementation MUST be completable within a 5-hour hackathon timeframe.
Time budget per phase: Planning (30 min), Setup (15 min), Core Implementation (3 hours),
Testing (45 min), Polish (30 min). If any task exceeds these windows, simplify immediately.

**Rationale**: Hackathon success depends on demonstrable progress within severe time
constraints. Features that cannot be completed provide zero value.

### II. Simplicity First (YAGNI)
Always choose the simplest implementation that solves the immediate problem. No abstractions,
patterns, or architectures unless absolutely required for the current feature. Direct
solutions over clever ones. Inline code over separate files when scope is small.

**Rationale**: Premature abstraction wastes hackathon time and creates maintenance burden.
Simple code ships faster and debugs easier under pressure.

### III. Best Code Practices (Within Constraints)
MUST maintain: Clear naming, type safety where available, error handling for user-facing
flows, and basic input validation. MAY skip: Comprehensive tests (focus on happy path),
extensive documentation, optimization, and edge case handling beyond MVP requirements.

**Rationale**: Balance between code quality and speed. Ship working, maintainable code
without gold-plating features that won't be judged.

### IV. Follow Directions Exactly
Implementation MUST match specifications precisely. When spec says "create X", create X—not
Y because it seems better. Clarify ambiguities before coding, not during. Spec-driven
development prevents scope creep and rework.

**Rationale**: In time-constrained environments, deviating from requirements burns hours on
features that weren't requested and may not be valued.

### V. MVP Focus
Build the minimum feature set that demonstrates the core value proposition. Cut everything
else ruthlessly. One working flow beats three half-finished flows. Prioritize visible
functionality over internal architecture.

**Rationale**: Hackathon judging rewards working demonstrations. Incomplete features are
invisible and create illusion of less progress than reality.

## Development Constraints

### Time Management
- No task should exceed 45 minutes without re-evaluation
- If stuck for 15 minutes, ask for help or pivot approach
- Track time spent per task; abort if approaching time budget
- Pre-built libraries and templates are encouraged over custom solutions

### Technology Stack
- Use familiar technologies unless required otherwise
- Prefer managed services over self-hosted (less setup time)
- Copy-paste working code over writing from scratch when appropriate
- Leverage AI assistance for boilerplate and repetitive tasks

### Scope Control
- New requirements during implementation require explicit approval
- "Nice to have" features are documented but not implemented
- If running behind schedule, cut features—never cut testing of core paths
- Demo script defines minimum viable feature set

## Quality Gates

### Pre-Implementation Gate
- [ ] Feature spec completed and approved
- [ ] Time estimate under 5 hours total
- [ ] All dependencies identified and available
- [ ] Success criteria defined and measurable

### Mid-Implementation Gate (at 2.5 hour mark)
- [ ] Core functionality demonstrable (even if buggy)
- [ ] No blockers requiring external help
- [ ] On track to meet time budget
- [ ] If not: simplify scope or pivot approach

### Pre-Demo Gate
- [ ] Happy path works end-to-end
- [ ] No obvious crashes or errors in demo flow
- [ ] Core value proposition is visible
- [ ] 2-minute demo script prepared and tested

## Governance

### Amendment Procedure
Constitution changes require:
1. Identified problem with current principles
2. Proposed change with rationale
3. Impact assessment on in-flight work
4. Update of dependent templates and documentation

### Compliance Review
- Every feature spec MUST reference applicable principles
- Implementation plan MUST justify any principle violations
- Post-implementation review checks: Did we follow the constitution? Did it help or hinder?

### Versioning Policy
- MAJOR: Principle addition, removal, or redefinition
- MINOR: Constraint changes, new quality gates
- PATCH: Clarifications, typo fixes, formatting

**Version**: 1.0.0 | **Ratified**: 2025-10-01 | **Last Amended**: 2025-10-01
