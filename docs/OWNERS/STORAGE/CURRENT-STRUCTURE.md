# Storage: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - hardening-pending
  - cutover-pending
  - wrong-shaped
- `confidence`: high
- `last reviewed`: 2026-04-11
- `evidence anchors`:
  - `README.md`
  - `packages/database/*`
  - `rebuild/owners/storage/src/service.ts`
  - `rebuild/owners/storage/src/container.ts`
  - `architecture/BEHAVIOR_LEDGER.md`

## Current Shape

Storage currently exists in two materially different forms.

The legacy path uses broad storage-role roots and database-domain records that strongly influence how the system describes itself. That makes custody visible, but it also exerts ontology pressure.

The rebuild introduces owner-scoped namespaces with collection JSON records and JSONL event streams. That is architecturally cleaner because custody is grouped by owner rather than by pseudo-domain storage role.

As of the RevEng Capability/Agents migration implementation pass, the rebuild Storage substrate also has generic owner artifact custody, artifact indexes, migration metadata, richer namespace observability, and serialized record update/delete helpers. These are structural custody primitives, not semantic ownership.

## Major Parts

- `legacy database domain`
  - what it does: stores many semantic families under one legacy database package
  - where it lives: `packages/database`
- `legacy storage-role roots`
  - what it does: organize runtime data under product-level storage-role labels
  - where it lives: `.data/database/*`
- `rebuild storage substrate`
  - what it does: owner-scoped records, events, artifact custody, migration metadata, serialized record mutation helpers, and custody observability
  - where it lives: `rebuild/owners/storage/src/service.ts`

## What Appears Correctly Placed

- The rebuild makes owner-scoped custody explicit.
- The rebuild exposes storage observability without claiming semantic ownership.
- The rebuild now provides generic artifact custody and migration records that Capability Platform and Agents can use without moving their meaning into Storage.

## What Appears Drifted Or Fused

- Legacy storage roles still strongly shape how the product is described.
- The rebuild still uses simple file-backed JSON, JSONL, and artifact files, which is clear but not yet operationally strong.
- Secrets currently sit too close to normal owner records.

## What Is Missing Or Partial

- hardened secret custody
- production-grade indexing and persistence guarantees
- authoritative cutover away from legacy storage-role roots

## What Is Intentionally Deferred Or Blocked

- stronger persistence infrastructure is reasonably deferred until more of the new owner model is authoritative
- full legacy storage retirement is blocked by ongoing reference-only behavior families

## Storage / Artifacts / Handoffs

Legacy storage still contains prompt truth, model truth, intake, cache, views, and other records under top-level roles.

The rebuild stores owner records in namespaced folders, appends owner event streams, stores owner artifacts under generic custody, and records owner migration metadata. This is much closer to the intended custody model. It is still file-backed and therefore more of a structural proof than a final hardened storage substrate.

## Pressure Signals

- `signal`: custody-ambiguity
  - `strength`: medium
  - `where`: whole-platform storage story
  - `why`: legacy storage-role taxonomy still shapes understanding while the rebuild uses owner namespaces
  - `what it threatens`: clean mental model and cutover

- `signal`: hardening-pressure
  - `strength`: high
  - `where`: rebuild storage substrate
  - `why`: file-backed JSON/JSONL custody and nearby secret storage are not final production posture
  - `what it threatens`: productization and security

## Open Audit Questions

- What is the final durable backing technology and migration story for owner-scoped custody?
- How should secret custody be separated from ordinary owner records?
