# Skeleton System: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - hardening-pending
  - productization-pending
  - cutover-pending
- `certainty`: high on topology, medium on final subsystem breadth
- `time horizon`: multi-stage rebuild and cutover

## Intended Direction

Skeleton should converge on the ownership-governed composition-host model, with the rebuild path becoming authoritative and the legacy flat-shell architecture retiring.

The platform should remain a modular host with subsystem containers and embedded operating contexts. It should not become a whole-platform environment host merely because some subsystems gain richer embodiment or more animated UX.

## Planned Structural Enrichments

- dedicated job/runtime execution layer for long-running or risky work
- fuller owner-local contracts and importers for remaining reference-only behavior families
- richer subsystem containers for workbench-heavy and observability-heavy owners
- more explicit embedded operating contexts and true environments where bounded places are real
- clearer owner-local secret handling and durable storage mechanisms

## Dependencies And Blockers

- remaining reference-only families need either re-homing or explicit retirement decisions
- cross-owner contract boundaries must be defined where legacy shared contracts still dominate understanding
- cutover depends on enough behavioral parity that the legacy shell can stop defining product reality

## Productization / Hardening / Cutover Needs

- packaging and installer path for the new authoritative product
- hardened storage, secret custody, and migration paths
- import/export strategy for legacy data roots
- explicit decommission plan for legacy product paths once feature coverage is sufficient

## Future Risks

- rebuilding around old navigation or route shapes out of convenience
- allowing compatibility layers to become permanent architecture
- letting Coordination or Framework absorb more semantics during cutover
- using rich UX or skins as justification for a whole-platform environment host

## Re-Evaluation Triggers

- repeated addition of new subsystem families that do not fit the current container model
- growth of embedded operating contexts into true environment candidates
- continued accumulation of reference-only behavior with no re-homing plan
- any new central package that starts looking like a replacement blob layer

## Notes

- The future target should be driven by ownership truth and platform integrity, not by loyalty to current folder shape.
