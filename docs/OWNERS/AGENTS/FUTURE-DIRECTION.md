# Agents: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - partial
  - hardening-pending
- `certainty`: medium-high
- `time horizon`: mid-term

## Intended Direction

Agents should become a fully owner-shaped subsystem for bounded digital operators, with clearer remit, workflow, continuity, and granted-capability use represented directly in owner-local structure.

## Planned Structural Enrichments

- richer remit and workflow modeling
- richer agent-side policy and permissions visibility
- clearer task and action evidence
- stronger memory/continuity contexts
- better package export/import semantics

## Dependencies And Blockers

- deeper rebuild work depends on deciding which legacy agent behaviors are authoritative enough to carry forward
- some richer embedded contexts depend on cleaner UI/UX contracts

## Productization / Hardening / Cutover Needs

- full migration of required legacy agent behavior
- resilient long-running agent execution story
- removal of legacy agent-shell dependence

## Future Risks

- leaving agent truth split between owner-local records and cross-owner convenience layers
- treating agents as inventory only instead of true doers

## Re-Evaluation Triggers

- repeated need to inspect or edit longitudinal agent behavior that the current rebuild cannot express cleanly
- growth of agent-side policy or workflow features in non-Agent owners

## Notes

- Agents may eventually justify richer embedded operating contexts, but not a whole-app environment host.
