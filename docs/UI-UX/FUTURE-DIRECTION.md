# UI / UX: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - partial
  - cutover-pending
- `certainty`: high on structure, medium on visual language
- `time horizon`: iterative over multiple subsystem slices

## Intended Direction

The UI/UX should become a family of owner-aligned subsystem containers with strong surface differentiation and richer embedded operating contexts where useful.

The platform should support deeply interactive, animated, skinned, reactive, and even playful experiences without turning the whole app into an environment-scale host.

## Planned Structural Enrichments

- owner-local surface modules rather than a central shell switchboard
- richer workbench surfaces for Capability Platform and Agents
- richer observability/admin surfaces for Integration, Storage, Framework, and Coordination
- embedded contexts such as editors, inspectors, compare views, review zones, and workspaces
- selective embedded environments when a real bounded place exists

## Dependencies And Blockers

- richer UI needs cleaner owner-local contracts first
- some environment candidates depend on Execution Environment gaining deeper real operating-context ownership

## Productization / Hardening / Cutover Needs

- unified interaction patterns across the new shell
- better eventing and live update patterns
- design-system-level decisions for theming, skinning, and subsystem differentiation
- retirement of the legacy flat product shell

## Future Risks

- rebuilding everything as generic tabs
- overreacting in the opposite direction and forcing environment semantics everywhere
- letting style work run ahead of owner truth

## Re-Evaluation Triggers

- repeated addition of ad hoc local panels that really want to be embedded contexts
- repeated UX confusion around owner boundaries or subsystem identity
- demand for richer embodiment that starts exposing missing Execution Environment ownership

## Notes

- Rich UX belongs on top of modular architecture, not in place of it.
