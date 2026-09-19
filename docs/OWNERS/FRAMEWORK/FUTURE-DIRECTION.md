# Framework: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - productization-pending
  - hardening-pending
- `certainty`: high
- `time horizon`: near-to-mid-term

## Intended Direction

Framework should become the smallest credible center of the platform.

It should own bootstrap, registration, diagnostics, and bridge substrate, while delegating everything semantic outward to the true owners.

## Planned Structural Enrichments

- cleaner registration-driven host composition
- stronger host validation and startup diagnostics
- explicit jobs/runtime executor integration
- clearer shell persistence and session restore

## Dependencies And Blockers

- some remaining legacy behavior is still shaping expectations about what the center does
- a final jobs/runtime model is still needed

## Productization / Hardening / Cutover Needs

- packaged host startup
- process supervision and failure recovery
- final retirement of legacy host responsibilities

## Future Risks

- letting host convenience logic regrow under new names
- pulling owner-local observability or admin behavior back into Framework

## Re-Evaluation Triggers

- repeated requests to add broad shared utilities to Framework
- new cross-owner features that seem to "fit nowhere" and therefore tempt centralization

## Notes

- Framework should become smaller as the rest of the platform becomes clearer.
