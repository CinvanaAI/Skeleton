# Integration: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - hardening-pending
  - partial
- `certainty`: medium-high
- `time horizon`: staged as more crossings become real

## Intended Direction

Integration should grow from provider control into the true owner of governed external crossing.

It should remain admin-heavy, policy-heavy, and boundary-focused, not drift into domain meaning.

## Planned Structural Enrichments

- more provider and connector adapters
- clearer inbound normalization and safe re-intake flows
- clearer outbound shaping and dispatch rules
- richer crossing observability and failure visibility
- stronger secret and credential handling

## Dependencies And Blockers

- full shape depends on which adjacent systems are actually absorbed into Skeleton
- secret-handling hardening depends on broader custody decisions

## Productization / Hardening / Cutover Needs

- secure credential storage
- durable migration from legacy provider records
- clearer operator-facing error and crossing-state behavior

## Future Risks

- allowing each owner to add its own external crossing shortcuts
- overfitting Integration to one provider or one transport style

## Re-Evaluation Triggers

- repeated addition of external crossing logic in non-Integration owners
- new inbound data families with unclear ownership after crossing

## Notes

- Integration should get broader, not more central.
