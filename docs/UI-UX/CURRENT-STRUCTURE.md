# UI / UX: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - wrong-shaped
  - cutover-pending
  - uncertain
- `confidence`: medium-high
- `last reviewed`: 2026-04-11
- `evidence anchors`:
  - `README.md`
  - `apps/web/src/product/ProductApp.tsx`
  - `apps/web/src/product/types.ts`
  - `apps/web/src/product/hooks/useOperationsSnapshot.ts`
  - `rebuild/apps/shell/src/App.tsx`
  - `rebuild/owners/*/src/container.ts`

## Current Shape

The legacy UI is a flat product shell with top-level surfaces such as `Overview`, `Operations`, `Agents`, and `Settings`, backed by a broader README story of `Changes`, `Prompts`, `Models`, `Runs`, `Views`, and `Settings`. It is mostly a console-style interface over shared runtime state and polling-based observability.

The rebuild UI is more structurally honest. It presents owner-aligned containers with typed workbench, admin, and observability surfaces. It also projects registered environments separately from containers. The RevEng Capability/Agents migration implementation added concrete shell projections for Capability lifecycle ledger, Capability policy admin, Agent permissions, Agent workflows, Agent environment context, governed package action runs, workflow runtime evidence, and bounded executor evidence.

Even so, the current renderer still hand-codes all surface rendering in one shell file. The new projections are useful owner-facing surfaces, but they are not yet extracted into owner-local UI modules.

## Major Parts

- `legacy product shell`
  - what it does: renders flat product surfaces
  - where it lives: `apps/web/src/product/*`
- `legacy polling model`
  - what it does: refreshes operations/runtime state on a timer
  - where it lives: `apps/web/src/product/hooks/useOperationsSnapshot.ts`
- `rebuild shell UI`
  - what it does: renders container rail, environment cards, tabs, and owner surfaces
  - where it lives: `rebuild/apps/shell/src/App.tsx`
- `owner container descriptors`
  - what it does: define high-level UX groupings and surface categories
  - where it lives: `rebuild/owners/*/src/container.ts`
- `new rebuild owner projections`
  - what it does: projects Capability lifecycle/policy/package-action evidence, Agent permissions/workflow/environment/runtime evidence, and bounded executor runs
  - where it lives: `rebuild/apps/shell/src/App.tsx`

## What Appears Correctly Placed

- The rebuild distinguishes workbench-heavy, mixed, and admin-heavy containers.
- Capability Platform, Agents, Integration, Coordination, Execution Environment, Storage, and Framework each have visibly different surface roles.
- The rebuild already separates environment projection from generic container selection.
- Capability Platform and Agents now expose deeper owner records through concrete surfaces instead of descriptor-only tabs.
- Runtime evidence for governed package actions and agent workflows is now visible in the rebuild shell.

## What Appears Drifted Or Fused

- The legacy UI still collapses unlike concerns into one flat surface model.
- The rebuild shell renderer still fuses most current UI realization into one large file.
- Embedded operating contexts are not yet first-class enough; many interactions are still simple panels rather than richer local experiences.

## What Is Missing Or Partial

- richer embedded workbench contexts
- richer observability surfaces with clearer owner-local depth
- intentional visual language for subsystem difference
- skins, vskins, and more living interface behavior
- streaming or event-driven updates in place of older polling habits
- extraction of the new Capability and Agents projections into owner-local surface modules

## What Is Intentionally Deferred Or Blocked

- richer embodiment is reasonably deferred until more owner-local surfaces are stable
- some deeper UI differentiation is blocked by unfinished owner semantics and unfinished cutover

## Storage / Artifacts / Handoffs

The legacy UI is strongly tied to aggregate runtime snapshots and settings-like controls.

The rebuild UI is tied more directly to owner-local APIs and descriptors, but it still relies on centralized shell rendering and does not yet expose many owner-local embedded contexts.

## Pressure Signals

- `signal`: shape-pressure
  - `strength`: high
  - `where`: top-level UI model
  - `why`: the platform still contains both a flat console UX and an owner-container UX
  - `what it threatens`: coherent product identity

- `signal`: bloat
  - `strength`: high
  - `where`: `rebuild/apps/shell/src/App.tsx`
  - `why`: shell rendering and surface logic are concentrated in one file
  - `what it threatens`: clean UI modularity

- `signal`: contract-ambiguity
  - `strength`: medium
  - `where`: UI to owner-surface boundary
  - `why`: container descriptors are clean, but deeper surface contracts and embedded context contracts are still implicit
  - `what it threatens`: future UI growth and subsystem variation

## Open Audit Questions

- Which subsystem surfaces genuinely need richer embedded contexts next?
- Which contexts should remain surfaces and which should become true environments under Execution Environment?
