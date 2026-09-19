# Capability Platform: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - cutover-pending
  - reference-only
  - hardening-pending
- `confidence`: high
- `last reviewed`: 2026-04-11
- `evidence anchors`:
  - `The Ultimate Design/Capability Platform.txt`
  - `architecture/BEHAVIOR_LEDGER.md`
  - `rebuild/owners/capability-platform/src/service.ts`
  - `rebuild/owners/capability-platform/src/container.ts`

## Current Shape

Capability Platform exists in the legacy product mainly through prompt-truth and prompt-package reality, and in the rebuild through a more explicit capability-package owner.

The rebuild gives Capability Platform a workbench-heavy container, an environment projection, package listing/detail, draft editing, validation, publish, rollback, observability, and legacy import of prompt packages. It now also carries owner-local lifecycle records for drafts, draft items, live records, publication candidates, publication records, package events, published forms, source registrations, and surface policies.

Publish now creates evidence-backed release, publication, live-record, form, artifact, and event records. Rollback republishes from a historical release snapshot instead of only flipping a pointer.

Governed package actions now authorize against package live/published state, release validation, surface policy, and optional grant evidence before entering the bounded executor. Package action execution records and package events retain complete/failed/denied runtime evidence.

## Major Parts

- `legacy prompt-truth families`
  - what it does: stores and presents prompt package truth and related artifacts
  - where it lives: legacy storage roots and legacy product surfaces
- `rebuild capability service`
  - what it does: package inventory, lifecycle normalization, draft save, draft items, validate, publish, rollback-by-publication, live records, publication history, published forms, package events, surface policy, source registrations, package action authorization, executor-backed package action evidence, detail, import
  - where it lives: `rebuild/owners/capability-platform/src/service.ts`
- `rebuild container`
  - what it does: defines package workbench, lifecycle ledger, policy/admin, and platform observability surfaces
  - where it lives: `rebuild/owners/capability-platform/src/container.ts`

## What Appears Correctly Placed

- The rebuild treats packages as first-class governed objects rather than generic prompt records.
- The rebuild separates workbench and observability surfaces.
- Capability Platform is one of the few places where a true environment projection already exists in the rebuild.
- Package lifecycle truth is now owner-local rather than only implied by the workbench UI.
- Published forms are now stored as Storage-custodied artifacts while Capability Platform keeps semantic ownership.
- Package runtime access is governed by live state, validation, surface policy, and grant evidence before bounded executor handoff.

## What Appears Drifted Or Fused

- Legacy package reality is still prompt-shaped rather than fully generalized capability-package-shaped.
- Some consumer-facing package contract depth is still adapter-level rather than fully extracted into owner-local modules.
- The embodied environment is richer but still not final; station behavior and policy mutation surfaces remain early.
- Package action execution is intentionally limited to registered bounded handlers; arbitrary authored code execution remains rejected.

## What Is Missing Or Partial

- fuller package-surface policy mutation and admin operations
- richer gate editor and publish pipeline controls
- broader bounded package action handlers
- fuller extraction of Capability Platform UI modules out of the central shell
- deeper use of capability packages as the platform's own reusable governed implementation units

## What Is Intentionally Deferred Or Blocked

- broader internal package absorption is reasonably deferred until other owners are ready to consume packages more cleanly
- richer embodiment is deferred until more of the underlying package behavior is stabilized

## Storage / Artifacts / Handoffs

Legacy package truth still lives in prompt-truth-shaped records and artifacts.

The rebuild re-homes package records under the Capability Platform owner namespace and records coordination events around changes. Durable custody now includes package artifacts and migration metadata through Storage. It is clearer than legacy, but not yet fully production-hardened.

## Pressure Signals

- `signal`: shape-pressure
  - `strength`: medium
  - `where`: legacy prompt-shaped inheritance
  - `why`: current behavior is richer than the old "prompt package" label, but some structure still reflects that past
  - `what it threatens`: full realization of capability-package identity

- `signal`: contract-ambiguity
  - `strength`: medium
  - `where`: package-surface and consumer contract depth
  - `why`: core lifecycle exists, but some contract and gating richness is still implicit
  - `what it threatens`: future scale and consumer decoupling

## Open Audit Questions

- Which future package surfaces should become explicit next?
- How much of the platform's internal reusable logic should eventually resolve through governed capability packages?
