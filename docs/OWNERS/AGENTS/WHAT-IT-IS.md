# Agents: What It Is

## Scope

- `kind`: ownership area
- `semantic owner`: Agents Domain
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `architecture/BEHAVIOR_LEDGER.md`

## Core Identity

Agents is the ownership area for bounded operating entities.

These are not generic assistant abstractions. They are resident digital operators with identity, remit, continuity, workflows, permissions, and outputs over time.

## Why It Exists

Doing belongs together.

If an agent is a real operator, then identity, remit, workflow, decision flow, granted capability use, and output behavior belong to the same bounded owner rather than being scattered across the system.

## What It Owns

- agent identity
- agent remit
- agent workflows
- agent-side policy and governance
- decision flow
- granted capability use
- outputs and action logic

## What It Does Not Own

- capability package ontology
- environment ontology
- external crossing semantics
- storage meaning

## Core Internal Structure Or Object Model

Agents should include:

- agent definitions
- runtime or resident instances
- retained memory or continuity records
- workflow and remit structures
- granted capability/tool use posture

## Human-Facing Structure In Principle

Agents likely need:

- an agent workbench
- an agent observability/admin surface
- possibly richer embedded contexts for memory, remit, or task inspection

They do not automatically require a global environment-scale host.

## Boundaries And Relationships

- Agents use capabilities after access is granted; they do not own capability meaning.
- Coordination handles handoff seams; it should not absorb agent truth.
- Storage retains agent records without owning agent identity or remit.

## Non-Negotiable Laws

- bounded doers should not dissolve into task soup
- workflow and use logic should not be split into fake independent owners if they belong to the same actor
- capability use after grant belongs with the agent, not with capability ontology

## Common Deformation Risks

- treating agents as mere wrappers around other layers
- splitting identity, workflow, and action across unrelated packages
- reducing agents to execution queues without continuity

## Notes

- Agent richness in the current repo is stronger in behavior than in human-facing subsystem form.
