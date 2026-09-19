# Coordination: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - uncertain
  - cutover-pending
- `confidence`: medium
- `last reviewed`: 2026-04-09
- `evidence anchors`:
  - `packages/domain-runtime/src/service.ts`
  - `packages/operations-plane/src/service.ts`
  - `rebuild/owners/coordination/src/service.ts`
  - `rebuild/owners/coordination/src/container.ts`
  - `architecture/BEHAVIOR_LEDGER.md`

## Current Shape

Coordination exists in both the legacy runtime and the rebuild, but it is under architectural pressure.

In the legacy system, domain-runtime mutation publication and reaction handling, plus operations-plane visibility, place a lot of connective power in central layers.

In the rebuild, Coordination owns handoff observability and also currently carries imported workflow and change-session truth for a change-session workbench. That is useful and coherent enough to operate, but it creates a live question about whether Coordination is staying thin enough.

## Major Parts

- `legacy connection layer`
  - what it does: publishes mutations, queues reactions, records connection-layer events
  - where it lives: `packages/domain-runtime/src/service.ts`
- `legacy operations visibility`
  - what it does: aggregates runtime and process evidence around the connection layer
  - where it lives: `packages/operations-plane/src/service.ts`
- `rebuild coordination service`
  - what it does: records owner events, imports workflows and sessions, exposes recent handoffs and observability
  - where it lives: `rebuild/owners/coordination/src/service.ts`

## What Appears Correctly Placed

- Cross-owner event visibility and routing posture belong here more than in Framework.
- The rebuild explicitly names Coordination as a bounded owner instead of hiding it inside the center.

## What Appears Drifted Or Fused

- Legacy coordination behavior is too entangled with central runtime packages.
- The rebuild's imported workflow and change-session truth may be broader than a thin bridge should ultimately hold.

## What Is Missing Or Partial

- clearer semantic boundary for change-session and workflow truth
- clearer distinction between routing evidence and owned business/state meaning
- fuller cutover away from legacy connection-layer behavior

## What Is Intentionally Deferred Or Blocked

- final boundary decisions are deferred until the rest of the owner model is richer and more of the legacy path is retired

## Storage / Artifacts / Handoffs

Coordination currently records handoff-like events and, in the rebuild, retains workflow/session imports under owner-local custody.

That makes coordination visible, but it also means this owner needs close audit attention so transport records do not quietly become sovereign domain truth.

## Pressure Signals

- `signal`: owner-drift
  - `strength`: high
  - `where`: coordination workflow and change-session holdings
  - `why`: this owner currently carries more than pure routing metadata
  - `what it threatens`: the law that coordination remain thin and non-sovereign

- `signal`: strategy-hotspot
  - `strength`: high
  - `where`: coordination as a whole
  - `why`: repeated architecture questions cluster here because it is easy for orchestration to become hidden ownership
  - `what it threatens`: long-term system truth

## Open Audit Questions

- Are governed change sessions ultimately true coordination objects, or only temporarily housed there?
- Should any workflow or session semantics be split into a more specific owner if they continue to deepen?
