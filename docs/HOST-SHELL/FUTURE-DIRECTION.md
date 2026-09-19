# Host Shell: Future Direction

## Direction Snapshot

- `target state`: healthy
- `supporting states`:
  - hardening-pending
  - productization-pending
- `certainty`: high
- `time horizon`: near-to-mid-term rebuild evolution

## Intended Direction

The host shell should become a small, explicit, registration-driven Framework substrate.

It should boot the platform, mount owner containers, project native capability, and expose diagnostics. It should not serve as a long-lived site of owner-local rendering logic or runtime semantics.

## Planned Structural Enrichments

- registration-driven container and surface mounting
- smaller shell renderer units instead of one central render switchboard
- stronger native bridge with explicit capability boundaries
- host-level layout persistence and session restore
- dedicated job/runtime executor support

## Dependencies And Blockers

- owner surfaces need stable enough descriptors to mount more declaratively
- cutover sequencing depends on more legacy behavior moving under owner-local paths

## Productization / Hardening / Cutover Needs

- packaging and installer story for the rebuild host
- graceful process supervision and failure handling
- finalized data-root and migration behavior
- removal of the legacy host once the rebuild becomes authoritative

## Future Risks

- shell convenience logic re-growing into a new central blob
- surface rendering remaining host-owned instead of becoming owner-local
- forcing all embedded contexts through one uniform shell interaction model

## Re-Evaluation Triggers

- host files growing rapidly again
- more owners being added without a cleaner registration/mounting pattern
- bridge growth starting to carry semantic behavior rather than host capability

## Notes

- The right future host is thinner than both the legacy host and the current rebuild shell renderer.
