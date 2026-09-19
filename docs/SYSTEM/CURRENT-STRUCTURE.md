# Skeleton System: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - wrong-shaped
  - reference-only
  - cutover-pending
  - hardening-pending
- `confidence`: high
- `last reviewed`: 2026-04-10
- `evidence anchors`:
  - `README.md`
  - `apps/*`
  - `packages/*`
  - `rebuild/*`
  - `architecture/BEHAVIOR_LEDGER.md`
  - `architecture/REBUILD_LEDGER.md`

## Current Shape

Skeleton currently has two meaningful architectural realities at once.

The first is the legacy product path at the repo root. It still presents the product as a governed multi-surface workbench with flat top-level surfaces such as `Changes`, `Prompts`, `Models`, `Runs`, `Views`, and `Settings`. That path still carries a central runtime chain through `core-host`, `domain-runtime`, and `operations-plane`.

The second is the parallel rebuild under `rebuild/`. That path re-forms the system as an ownership-governed composition host with owner-aligned containers for Framework, Capability Platform, Agents, Integration, Coordination, Execution Environment, and Storage.

## Major Parts

- `legacy product shell`
  - what it does: runs the current Electron + API + worker + web product path
  - where it lives: `apps/desktop`, `apps/api`, `apps/web`, `apps/worker`
- `legacy shared runtime center`
  - what it does: fuses host environment, connected domains, and operations visibility
  - where it lives: `packages/core-host`, `packages/domain-runtime`, `packages/operations-plane`, `packages/contracts`
- `governing design references`
  - what it does: defines the ownership-law target and the strongest subsystem example
  - where it lives: `The Ultimate Design/*`
- `parallel rebuild`
  - what it does: implements the new host/container/owner model
  - where it lives: `rebuild/*`
- `behavior and rebuild ledgers`
  - what it does: records re-homed behaviors and rebuild policy
  - where it lives: `architecture/BEHAVIOR_LEDGER.md`, `architecture/REBUILD_LEDGER.md`

## What Appears Correctly Placed

- The law set is explicit and strong enough to act as a real architecture constraint.
- The rebuild has real owner-aligned containers instead of one flat product shell.
- The rebuild already distinguishes host substrate, owner containers, and true environment projections.
- The behavior ledger distinguishes rebuilt, imported, and reference-only families rather than flattening them into one vague state.

## What Appears Drifted Or Fused

- The legacy system still presents a flat surface taxonomy that does not match the ownership model.
- `core-host -> domain-runtime -> operations-plane` remains a central chain that carries too much cross-owner reality.
- The legacy repo shape still encourages shared-contract and shared-runtime thinking.
- The product currently exists in a dual-shape state: the rebuild is real, but the legacy path still defines much of the repo's visible center of gravity.

## What Is Missing Or Partial

- no authoritative cutover from the legacy shell/runtime to the rebuild
- no dedicated job-runtime layer in the rebuild
- derived views, cache, and intake remain reference-only
- deep legacy contracts and shared-runtime records remain reference material, not fully re-homed owner contracts
- productization and hardened storage/secret handling are incomplete

## What Is Intentionally Deferred Or Blocked

- full decommission of the legacy path is deferred until the remaining reference-only behavior families are either re-homed or explicitly retired
- adjacent subsystem absorption is deferred until those systems can be placed cleanly under a true owner

## Storage / Artifacts / Handoffs

The legacy product still describes runtime data in storage-role terms under `.data/database/`, including prompt truth, model truth, intake, cache, and views.

The rebuild instead stores owner-scoped records and event streams under `.rebuild-data/owners/...`, which is closer to the intended custody model but still file-backed and not yet hardened.

Cross-owner handoff is still split:

- legacy: domain-runtime mutation publication and operations-plane inspection
- rebuild: owner-local coordination event recording and import flows

## Pressure Signals

- `signal`: shape-pressure
  - `strength`: high
  - `where`: whole-platform top-level structure
  - `why`: the repo contains both a legacy flat-shell architecture and a parallel owner-governed rebuild
  - `what it threatens`: clean cutover and honest reasoning about what Skeleton currently is

- `signal`: responsibility-fusion
  - `strength`: high
  - `where`: legacy shared runtime center
  - `why`: core host, connected domains, and operations visibility are still clustered around central packages
  - `what it threatens`: owner purity and future subsystem absorption

- `signal`: cutover-pressure
  - `strength`: high
  - `where`: whole system
  - `why`: the replacement path exists, but the authoritative product path is still split
  - `what it threatens`: decision clarity and long-term maintenance cost

- `signal`: strategy-hotspot
  - `strength`: high
  - `where`: top-level product shape
  - `why`: repeated questions about host form, subsystem form, and environment scope are signs of genuine platform-shape pressure
  - `what it threatens`: coherent evolution if left unaudited

## Open Audit Questions

- Which remaining legacy behavior families deserve full owner re-homing versus retirement?
- Does governed change-session truth ultimately remain inside Coordination, or does it grow into a more specific owner over time?
- What should the final job-runtime and secret-custody story be before full cutover?
