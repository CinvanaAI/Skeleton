# Integration: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - hardening-pending
  - cutover-pending
  - reference-only
- `confidence`: medium-high
- `last reviewed`: 2026-04-09
- `evidence anchors`:
  - `packages/model-gateway/*`
  - `apps/api/src/runtime-provider-routes.ts`
  - `apps/web/src/product/*`
  - `rebuild/owners/integration/src/service.ts`
  - `rebuild/owners/integration/src/container.ts`
  - `architecture/BEHAVIOR_LEDGER.md`

## Current Shape

Integration is present in both the legacy product and the rebuild, but it is still narrow.

The legacy path handles provider status and provider-mode behavior through model-gateway and runtime-provider routes, with user-facing controls surfacing in the old product shell.

The rebuild gives Integration a clearer ownership area with a dedicated container, provider control surface, observability surface, and legacy provider/catalog import flow. Even so, it is currently focused mostly on provider credentials, mode, and catalog visibility rather than the full breadth of external crossing.

## Major Parts

- `legacy provider crossing`
  - what it does: provider mode, status, and runtime checks
  - where it lives: `packages/model-gateway`, `apps/api/src/runtime-provider-routes.ts`
- `legacy UI controls`
  - what it does: exposes provider control through flat settings/status areas
  - where it lives: `apps/web/src/product/*`
- `rebuild integration service`
  - what it does: stores provider records, changes mode, imports provider inventory, and reports observability
  - where it lives: `rebuild/owners/integration/src/service.ts`

## What Appears Correctly Placed

- The rebuild gives Integration an admin-heavy container rather than treating provider control as a generic product setting.
- Provider-mode and catalog behavior are no longer pretending to be global product truth.

## What Appears Drifted Or Fused

- The legacy path still mixes provider control into the flat product shell.
- The current rebuild shape is still strongly OpenAI-centric and provider-config-centric, which is narrower than the full Integration law.
- Credentials are currently stored directly in owner records, which is functionally useful but not hardened.

## What Is Missing Or Partial

- richer connector/adaptor inventory
- inbound normalization and safe re-intake surfaces
- broader outbound dispatch shaping
- stronger crossing policy visibility
- secret segregation and stronger credential handling

## What Is Intentionally Deferred Or Blocked

- deeper integration breadth is reasonably deferred until more external systems are actually being absorbed
- stronger secret custody likely depends on Storage hardening decisions

## Storage / Artifacts / Handoffs

The rebuild stores provider records and imported catalogs in owner-scoped storage.

That is better than legacy scattering, but the current storage form is still plain JSON records and the credential path is not yet hardened.

## Pressure Signals

- `signal`: hardening-pressure
  - `strength`: high
  - `where`: rebuild integration credential handling
  - `why`: credentials are stored directly in owner records
  - `what it threatens`: production readiness and secret hygiene

- `signal`: contract-ambiguity
  - `strength`: medium
  - `where`: full Integration scope
  - `why`: provider control is real, but the broader crossing contract set is still thin
  - `what it threatens`: future external-system absorption

## Open Audit Questions

- Which future external systems belong to Integration versus other owners?
- What is the right long-term boundary between Integration secrets, Storage custody, and host-local secure configuration?
