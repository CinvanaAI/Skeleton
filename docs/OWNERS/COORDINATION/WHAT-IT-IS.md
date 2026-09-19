# Coordination: What It Is

## Scope

- `kind`: ownership area
- `semantic owner`: Coordination Layer
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `architecture/REBUILD_LEDGER.md`

## Core Identity

Coordination is the thin bridge of handoff and routing between true owners.

It carries transport, routing, and handoff seams that have no semantic ownership of their own. It must remain non-sovereign.

## Why It Exists

The system needs something to bridge owners and requests without allowing the bridge to become the ruler.

Coordination exists to preserve the distinction between:

- owners that define meaning
- seams that carry and route

## What It Owns

- domain-to-domain handoff seams
- routing
- transport metadata
- orchestration glue that has no semantic ownership of its own

## What It Does Not Own

- capability meaning
- agent meaning
- environment meaning
- storage meaning
- host truth

## Core Internal Structure Or Object Model

Coordination should contain:

- handoff records
- routing metadata
- transport envelopes
- non-sovereign orchestration glue

## Human-Facing Structure In Principle

Coordination should usually be observability-heavy.

If it exposes workbench-like surfaces, those should remain tightly scoped to handoff or routing governance rather than becoming a new hidden domain.

## Boundaries And Relationships

- Coordination bridges owners but should not define their objects.
- It may record crossing events and routing posture.
- It must not become the place where truth is secretly decided.

## Non-Negotiable Laws

- a bridge is not a kingdom
- transport seams do not own what they carry
- orchestration glue must remain thin and non-sovereign

## Common Deformation Risks

- orchestration becoming a hidden blob
- coordination records being mistaken for domain truth
- convenience routing logic absorbing semantic meaning

## Notes

- Coordination is one of the most dangerous owners because useful connective logic is always tempting.
