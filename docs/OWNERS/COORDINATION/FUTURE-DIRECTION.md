# Coordination: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - partial
  - uncertain
- `certainty`: medium
- `time horizon`: near-to-mid-term, with repeated re-audit likely

## Intended Direction

Coordination should become thinner and clearer, not broader.

It should own handoff, routing, and transport seams cleanly. If workflow or change-session truth keeps deepening beyond seam governance, that should trigger a boundary review rather than automatic expansion of Coordination.

## Planned Structural Enrichments

- clearer routing and handoff contracts
- better handoff observability and lineage
- stricter distinction between coordination metadata and domain truth

## Dependencies And Blockers

- final shape depends on whether governed change sessions remain legitimately seam-centric or demand a more specific semantic owner

## Productization / Hardening / Cutover Needs

- retire legacy connection-layer behavior once the new handoff model is authoritative
- make routing and seam visibility reliable enough for production observability

## Future Risks

- allowing coordination to become the new blob layer
- treating orchestration as a hidden domain

## Re-Evaluation Triggers

- any growth in workflow/session semantics beyond routing and handoff governance
- repeated feature requests that only "fit" by stuffing more meaning into Coordination

## Notes

- Coordination should be re-audited more often than most owners because drift is especially likely here.
