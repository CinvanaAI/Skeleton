# Execution Environment: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - hardening-pending
  - cutover-pending
- `confidence`: medium-high
- `last reviewed`: 2026-04-11
- `evidence anchors`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `rebuild/owners/execution-environment/src/service.ts`
  - `rebuild/owners/execution-environment/src/container.ts`
  - `rebuild/apps/runtime/src/server.ts`

## Current Shape

Execution Environment is thin but real in the rebuild and largely absent as a first-class owner in the legacy product.

The rebuild has an explicit environment registry, lifecycle observability, and registered environment projections including `capability-platform`, `agent-hall`, and `change-session-workspace`. That is an important structural correction.

The environment contract now includes lifecycle class, readiness checks, owner refs, stations, rules, skins, bounded executor runs, and richer observability counts. It is still a staged implementation, but no longer just label/status projection.

The rebuild now includes a bounded executor under Execution Environment. The executor owns generic runtime run state, events, outputs, failures, and permission-denial evidence. It executes only registered bounded action kinds and relies on true domain owners to provide authorization decisions.

## Major Parts

- `legacy implicit places`
  - what it does: mostly collapses real operating places into screens and routes
  - where it lives: legacy UI and runtime structure
- `rebuild environment service`
  - what it does: registers environments, persists lifecycle/readiness state, stations, rules, skins, owner refs, and manages readiness/degraded posture
  - where it lives: `rebuild/owners/execution-environment/src/service.ts`
- `bounded executor service`
  - what it does: receives owner-authorized bounded action submissions, records run state/events/outputs/failures/denials, and executes only registered safe action handlers
  - where it lives: `rebuild/owners/execution-environment/src/executor.ts`
- `rebuild environment surface`
  - what it does: shows registered environments, readiness posture, and bounded executor evidence
  - where it lives: `rebuild/owners/execution-environment/src/container.ts`

## What Appears Correctly Placed

- The rebuild has an explicit true-environment rule.
- Capability Platform and change-session workspace are treated as actual bounded contexts rather than generic UI labels.
- Agent Hall is now registered as a bounded operating context for agent selection, bay readiness, permissions, workflows, and appearance posture.
- Capability Platform and Agent Hall carry explicit stations and blocking rules tied back to their owning domains.
- The bounded executor records runtime evidence while leaving workflow meaning, package meaning, and permission decisions in their owners.

## What Appears Drifted Or Fused

- The legacy path largely lacks a first-class environment owner.
- The rebuild now models first-pass rules, stations, and bounded action execution, but the executor's action registry is intentionally narrow.

## What Is Missing Or Partial

- stronger readiness/degraded semantics
- more owner-facing APIs for environment-specific behavior
- deeper station action enforcement and recovery behavior
- broader registered action handlers once owner contracts justify them

## What Is Intentionally Deferred Or Blocked

- more environments are rightly deferred until there is evidence that a bounded place is truly real
- richer environment semantics depend on more subsystem contexts being rebuilt owner-first

## Storage / Artifacts / Handoffs

Current environment state is owner-local and projected through the rebuild runtime. It includes richer station/rule/skin/readiness metadata and bounded executor evidence while continuing to reference owner truth rather than owning package or agent semantics.

## Pressure Signals

- `signal`: contract-ambiguity
  - `strength`: medium
  - `where`: environment depth
  - `why`: lifecycle and readiness exist, but deeper operating-context contracts remain sparse
  - `what it threatens`: consistent future environment growth

- `signal`: strategy-hotspot
  - `strength`: medium
  - `where`: environment scope decisions
  - `why`: this area is prone to confusion between rich UX and real environment truth
  - `what it threatens`: honest architecture decisions

## Open Audit Questions

- Which future workspaces, editors, or review areas actually qualify as environments?
- What minimum rule/state/readiness contract should every future true environment expose?
