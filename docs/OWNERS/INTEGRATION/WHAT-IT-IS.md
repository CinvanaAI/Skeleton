# Integration: What It Is

## Scope

- `kind`: ownership area
- `semantic owner`: Integration Layer
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `architecture/BEHAVIOR_LEDGER.md`

## Core Identity

Integration is the governed boundary for external crossing.

It owns how the system talks to the outside world and how outside results re-enter the platform safely, without letting external protocols or vendors redefine internal meaning.

## Why It Exists

External crossing is real work, but it is not the same as domain meaning or storage.

The system needs one owner for:

- inbound normalization
- outbound shaping and dispatch
- endpoint selection
- protocol adaptation
- safe re-intake

without scattering those seams through every subsystem.

## What It Owns

- external crossing rules
- protocol adaptation
- provider and connector boundary handling
- inbound normalization
- outbound shaping
- safe re-intake from external systems

## What It Does Not Own

- capability meaning
- agent meaning
- environment meaning
- durable custody meaning
- host substrate meaning

## Core Internal Structure Or Object Model

Integration should contain:

- provider or connector records
- boundary adapters
- crossing-mode and availability logic
- normalized inbound and outbound payload handling

## Human-Facing Structure In Principle

Integration is likely to be more admin-heavy than workbench-heavy.

Its human-facing shape should usually emphasize:

- provider control
- crossing posture
- boundary observability
- import/re-intake visibility

## Boundaries And Relationships

- Integration speaks outward and returns inward, but does not define the meaning of what crosses.
- It depends on Coordination for handoff, not sovereignty.
- It should not become a hidden owner of provider-shaped domain meaning.

## Non-Negotiable Laws

- Integration owns the crossing, not the crossed-for thing.
- External endpoints must not become hidden semantic owners.
- Crossing does not imply ownership.

## Common Deformation Risks

- vendor APIs becoming hidden owners
- outbound transport logic scattered through owner services
- credential handling quietly becoming storage or app-config truth

## Notes

- Integration is one of the most likely places for convenience-driven drift if external pressure is strong.
