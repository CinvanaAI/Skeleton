# Host Shell: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - wrong-shaped
  - cutover-pending
  - productization-pending
- `confidence`: high
- `last reviewed`: 2026-04-09
- `evidence anchors`:
  - `apps/desktop/src/main.ts`
  - `apps/api/src/server.ts`
  - `apps/desktop/src/preload.ts`
  - `rebuild/apps/desktop/src/main.ts`
  - `rebuild/apps/desktop/src/preload.ts`
  - `rebuild/apps/runtime/src/server.ts`
  - `rebuild/apps/shell/src/App.tsx`

## Current Shape

The host shell currently exists in two forms.

The legacy host is an Electron shell that boots a local API, worker, and UI target, then loads either a dev URL or static product build. It still treats the shell largely as a launcher for the old app split.

The rebuild host is much closer to the intended substrate shape. It boots a runtime process, exposes a small preload bridge, loads the rebuild shell, and uses typed container and surface descriptors. Even so, some host composition is still centralized by hand.

## Major Parts

- `legacy desktop main`
  - what it does: boots local product processes and loads the old UI
  - where it lives: `apps/desktop/src/main.ts`
- `legacy process manager topology`
  - what it does: keeps API, worker, and UI boot tied to one desktop startup path
  - where it lives: `apps/desktop/src/service-manager.ts`
- `legacy bridge`
  - what it does: essentially nothing
  - where it lives: `apps/desktop/src/preload.ts`
- `rebuild desktop main`
  - what it does: starts the rebuild runtime and loads the new shell
  - where it lives: `rebuild/apps/desktop/src/main.ts`
- `rebuild bridge`
  - what it does: exposes platform roots and open-path behavior to the renderer
  - where it lives: `rebuild/apps/desktop/src/preload.ts`
- `rebuild shell renderer`
  - what it does: renders the container rail and all current surfaces
  - where it lives: `rebuild/apps/shell/src/App.tsx`
- `rebuild runtime bootstrap`
  - what it does: instantiates owners and mounts owner routes
  - where it lives: `rebuild/apps/runtime/src/server.ts`

## What Appears Correctly Placed

- The rebuild has explicit Framework contracts for containers, surfaces, environments, and diagnostics.
- The rebuild preload bridge is minimal and host-appropriate.
- The rebuild host no longer depends on the legacy flat surface taxonomy.

## What Appears Drifted Or Fused

- The legacy host still exists primarily as a launcher around the old API/worker/web split.
- The rebuild runtime server still manually instantiates all owners and route mounts in one file.
- The rebuild shell renderer still contains hand-coded rendering for all current surfaces in a single very large file.

## What Is Missing Or Partial

- no dedicated job/runtime executor tier
- no lazy or plugin-like container mounting system yet
- limited native bridge scope
- no full layout/session persistence model
- no final authoritative cutover to the rebuild shell

## What Is Intentionally Deferred Or Blocked

- richer shell modularization is deferred until more subsystem surfaces stabilize
- full cutover is deferred until enough owner-local behavior replaces the legacy path

## Storage / Artifacts / Handoffs

The legacy host delegates most reality outward to the legacy API and worker.

The rebuild host still depends on a single Express runtime entry file to mount all owners. That keeps the host workable, but it creates a seam-dense bootstrap point that should shrink over time.

## Pressure Signals

- `signal`: seam-density
  - `strength`: high
  - `where`: `rebuild/apps/runtime/src/server.ts`
  - `why`: one runtime file instantiates owners, registers environments, and mounts many routes
  - `what it threatens`: clean owner extension and host purity

- `signal`: bloat
  - `strength`: high
  - `where`: `rebuild/apps/shell/src/App.tsx`
  - `why`: the shell renderer currently hand-wires all surfaces in one large file
  - `what it threatens`: container composability and UI maintainability

- `signal`: cutover-pressure
  - `strength`: high
  - `where`: host level
  - `why`: the rebuild host exists, but the legacy host topology still defines much of the active repo shape
  - `what it threatens`: finishing the architectural transition

## Open Audit Questions

- Should the final host load owner-provided surface modules directly rather than hard-coding surface rendering in one shell file?
- What is the right boundary between host runtime, owner runtime registration, and a future dedicated job-runtime tier?
