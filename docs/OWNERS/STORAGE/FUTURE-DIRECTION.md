# Storage: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - hardening-pending
  - partial
- `certainty`: medium-high
- `time horizon`: mid-term

## Intended Direction

Storage should remain explicitly beneath owner meaning while gaining stronger durability, indexing, and secret-handling posture.

Its future job is to make owner-defined truth durable and inspectable without letting persistence mechanics reassert ontology.

## Planned Structural Enrichments

- stronger owner-scoped persistence backing
- indexing and migration support
- secret custody separation
- clearer artifact retention strategy

## Dependencies And Blockers

- full shape depends on the final authoritative runtime and cutover path
- secret custody decisions intersect with Integration and host productization work

## Productization / Hardening / Cutover Needs

- migrate owner records cleanly from legacy roots
- harden data durability and recovery
- finalize observability for retained custody

## Future Risks

- reintroducing storage-role ontology under new names
- allowing owners to bypass owner-scoped custody

## Re-Evaluation Triggers

- repeated direct filesystem access by non-Storage owners
- growth in secret-bearing records without clear separation

## Notes

- The right final Storage owner should be more robust than the current rebuild while remaining just as semantically humble.
