# Framework: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - wrong-shaped
  - cutover-pending
  - productization-pending
- `confidence`: high
- `last reviewed`: 2026-04-09
- `evidence anchors`:
  - `packages/core-host/src/service.ts`
  - `packages/operations-plane/src/service.ts`
  - `rebuild/owners/framework/src/contracts.ts`
  - `rebuild/owners/framework/src/service.ts`
  - `rebuild/owners/framework/src/container.ts`

## Current Shape

Framework currently exists in a split state.

In the legacy product, Framework-like responsibilities are mixed through `core-host`, parts of `operations-plane`, and desktop bootstrap code. That gives the center too much gravity.

In the rebuild, Framework is much closer to the intended role. It owns host contracts, bootstrap payloads, diagnostics, container registration, and native bridge projection.

## Major Parts

- `legacy core host`
  - what it does: resolves environment roots and creates connected domains
  - where it lives: `packages/core-host`
- `legacy operations plane`
  - what it does: central runtime visibility and process state aggregation
  - where it lives: `packages/operations-plane`
- `rebuild framework contracts`
  - what it does: defines containers, surfaces, environments, diagnostics, and bootstrap payloads
  - where it lives: `rebuild/owners/framework/src/contracts.ts`
- `rebuild framework runtime`
  - what it does: holds platform info and mounted container inventory
  - where it lives: `rebuild/owners/framework/src/service.ts`

## What Appears Correctly Placed

- Rebuild Framework contracts are narrow and host-oriented.
- Rebuild Framework diagnostics are clearly substrate-level rather than domain-semantic.

## What Appears Drifted Or Fused

- The legacy center still fuses Framework-shaped concerns with domain-runtime and operations visibility.
- The rebuild runtime bootstrap file still carries some composition work that will need to become cleaner and more declarative.

## What Is Missing Or Partial

- no dedicated jobs/runtime executor boundary yet
- limited bridge capability surface
- productized host supervision and packaging are incomplete

## What Is Intentionally Deferred Or Blocked

- deeper shell modularization is deferred until more owner surfaces settle
- full Framework cutover is blocked by the continued presence of the legacy product path

## Storage / Artifacts / Handoffs

Framework currently knows workspace/data roots and exposes host diagnostics.
It should not grow direct custody or cross-owner transport logic.

## Pressure Signals

- `signal`: responsibility-fusion
  - `strength`: high
  - `where`: legacy host center
  - `why`: Framework-like concerns are mixed with domain and observability concerns
  - `what it threatens`: central purity

- `signal`: cutover-pressure
  - `strength`: medium
  - `where`: Framework as platform substrate
  - `why`: the rebuild form exists but is not yet the only platform host
  - `what it threatens`: clean future reasoning about the center

## Open Audit Questions

- What is the final boundary between Framework diagnostics and owner-local observability?
- How should a future jobs/runtime executor integrate without turning Framework into a supervisor blob?
