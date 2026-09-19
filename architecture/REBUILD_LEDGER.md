# Skeleton Rebuild Ledger

## Status

- `state`: implemented
- `mode`: parallel rebuild
- `target`: ownership-governed composition host
- `legacy_policy`: reference and migration source only

## Reading This Historical Ledger

This ledger records the parallel rebuild in its original source workspace.
Legacy paths below describe that workspace, not additional folders shipped in
this repository. The current checkout contains the TypeScript rebuild at its
root. The audit log retains historical observations; it is not a claim that the
earlier workspace or its imported data is included.

The governing [seven ownerships document](../docs/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md)
and [capability-platform description](../docs/OWNERS/CAPABILITY-PLATFORM/WHAT-IT-IS.md)
are included here. No separate repository is needed to read them.

## Target Architecture

### Host Law

The host shell is Framework-owned substrate only.

It may own:

- startup and shutdown
- lifecycle bootstrapping
- composition and registration
- host navigation state
- native bridge boundaries
- health and diagnostics
- shell-level layout and mounting

It may not own:

- capability meaning
- agent meaning
- environment meaning
- publish or rollback meaning
- coordination semantics
- storage meaning

### Composition Model

- `subsystem container`: bounded UX grouping for an ownership area
- `operating surface`: focused workbench or observability/admin area inside a container
- `embedded operating context`: local mounted experience with its own interaction rules
- `embedded environment`: special embedded operating context that is a true bounded place

### True Environment Rule

Create a true environment object only when the context has:

- identity
- rules
- state
- lifecycle
- readiness

If one of those is missing, it is not an environment; it is a surface or embedded context.

### Primary Owners

- `framework`
- `integration`
- `capability-platform`
- `agents`
- `execution-environment`
- `coordination`
- `storage`

## Anti-Deformation Rules

1. No new feature work lands in the legacy shell/runtime path unless required for safety.
2. No new central package may absorb domain meaning from multiple owners.
3. No compatibility layer becomes a hidden permanent architecture.
4. No owner reads another owner's storage directly.
5. Cross-owner contracts must be narrow and explicitly owned.
6. The host may register containers and surfaces, but never define their semantics.
7. Legacy routes, nav labels, and API shapes are not preservation targets.
8. New inventory must be added as data or owner-owned registration, not by host rewrites.
9. True environments require identity, rules, state, lifecycle, and readiness.
10. "Just keep the old path" is not a valid architectural justification.

## Execution Checklist

- [x] Audit current repo into preserve/adapt/reference/discard categories
- [x] Establish new workspace structure for owner-aligned rebuild
- [x] Implement Framework host runtime and composition contracts
- [x] Implement Storage substrate with owner-scoped custody
- [x] Implement Coordination handoff layer
- [x] Implement Integration owner with provider/admin behavior
- [x] Implement Execution Environment owner for true bounded contexts
- [x] Implement Capability Platform owner with workbench and observability surfaces
- [x] Implement desktop host shell against the new runtime
- [x] Re-home reusable behavior from legacy code under correct owners
- [x] Verify new runtime works without legacy host shell
- [x] Audit architecture against governing rules

## Current Repo Classification

### Preserve Mostly As-Is

- `packages/repo-analysis`
- path-guard logic from `packages/tools/src/filesystem.ts`
- selected packaging and runtime bootstrap knowledge from current desktop scripts

### Refactor And Adapt

- `packages/agent-platform`
- `packages/model-gateway`
- `packages/operations-plane`
- `packages/database`
- safe portions of `packages/tools`

### Reference / Behavioral Source

- `packages/contracts`
- `packages/core-host`
- `packages/domain-runtime`
- `apps/api`
- `apps/web`
- `apps/worker`
- `apps/desktop`

### Discard As Future Architecture

- the current top-level `core-host -> domain-runtime -> operations-plane` system center
- the current flat multi-surface web shell as the platform shape
- the current app split as the final runtime topology

## Migration Policy

- preserve behavior, not legacy shape
- re-home behavior under the true owner
- allow short-lived adapters only when they are explicit, isolated, and removable
- prefer clean rebuild over in-place mutation when boundaries would otherwise deform

## Audit Log

### 2026-04-09

- initialized ledger
- locked target architecture as ownership-governed composition host
- classified current repo at high level for preservation and rebuild policy
- created a parallel `rebuild/` architecture root instead of mutating the legacy shell/runtime
- implemented Framework-owned desktop host shell, runtime bootstrap, composition contracts, and native bridge
- implemented owner-aligned containers for framework, capability-platform, agents, integration, coordination, execution-environment, and storage
- implemented Capability Platform package workbench with draft truth, validation, publish, rollback, forms, and observability
- implemented Integration provider control and catalog observability with legacy provider/model inventory import
- implemented Agents workbench and observability with legacy definition/instance/memory import and package export
- implemented Coordination change-session workbench and observability with legacy workflow/session import
- implemented Execution Environment lifecycle surface with two true environment projections: `capability-platform` and `change-session-workspace`
- implemented Storage custody observability over owner namespaces, collections, and event streams
- verified clean rebuild compile and build via `npm.cmd run check` and `npm.cmd run build` in `rebuild/`
- verified runtime bootstrap with 7 mounted containers and owner-local import flows from legacy data roots
