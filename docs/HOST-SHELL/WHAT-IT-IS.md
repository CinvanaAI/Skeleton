# Host Shell: What It Is

## Scope

- `kind`: top-level host substrate
- `semantic owner`: Framework
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `architecture/REBUILD_LEDGER.md`

## Core Identity

The host shell is the governing substrate that lets the platform stand up, mount subsystem containers, maintain top-level lifecycle, and expose native bridge capability without becoming a semantic owner of domain truth.

It is not the place where package, agent, environment, publish, rollback, workflow, or storage meaning should live.

## Why It Exists

The platform needs one place that can:

- boot and stop the application
- register and mount containers
- maintain top-level navigation and layout
- project native bridge capabilities
- expose host diagnostics and health

without quietly turning into a central domain.

## What It Owns

- startup and shutdown
- lifecycle bootstrapping
- host-level navigation and composition state
- container registration and mounting
- native bridge boundaries
- host health, diagnostics, and minimal invariants

## What It Does Not Own

- capability package truth
- agent remit or operating logic
- environment semantics
- coordination semantics
- storage meaning
- subsystem-specific policy or observability semantics

## Core Internal Structure Or Object Model

The host shell should consist of:

- a top-level runtime/bootstrap layer
- a container registry
- typed container and surface descriptors
- host-level diagnostics
- native bridge capability projection
- layout and session state

## Human-Facing Structure In Principle

The host shell should present:

- the overall container-selection model
- host-level framing and orientation
- shell-level diagnostics

It should not flatten all subsystem interaction into one uniform page model.

## Boundaries And Relationships

- It mounts subsystem containers but does not define their semantics.
- It projects Execution Environment state but does not own environment truth.
- It may expose Storage and Coordination visibility, but only through those owners' surfaces.
- It uses Integration for external crossing, not direct provider logic in the host.

## Non-Negotiable Laws

- The host shell is Framework-owned substrate only.
- The host may register containers and surfaces, but never define their domain meaning.
- If a capability is not truly host-level, it does not belong here.
- The host is not a global environment.

## Common Deformation Risks

- turning the shell into a convenience layer
- letting host routing become semantic ownership
- centralizing owner-local UI rendering in one giant shell file
- keeping legacy boot topology just because it already exists

## Notes

- Current host implementations are described in `CURRENT-STRUCTURE`.
