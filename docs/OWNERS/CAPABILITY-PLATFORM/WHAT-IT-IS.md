# Capability Platform: What It Is

## Scope

- `kind`: ownership area
- `semantic owner`: Capability Platform
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `The Ultimate Design/Capability Platform.txt`

## Core Identity

Capability Platform is the semantic owner of capability packages.

It defines what a capability package is, what package truth means, what package surfaces exist, what validation and publish mean, what history and rollback mean, what published forms exist, and what package gating and contracts mean.

## Why It Exists

First-class packageable capability objects require real governance.

They are not just files, scripts, or registry rows. They need source truth, publish semantics, history, rollback, multiple consumer-facing surfaces, policy, and observability.

## What It Owns

- package identity and ontology
- package source truth
- package surfaces and forms
- validation
- publish
- history and rollback meaning
- package-level contracts and gating
- capability-platform observability

## What It Does Not Own

- downstream workflow meaning
- consumer retrieval mechanics
- external transport
- durable custody itself
- downstream execution semantics outside its boundary

## Core Internal Structure Or Object Model

At minimum, Capability Platform contains:

- capability package objects
- unpublished editable surfaces
- published read-only surfaces
- validation state
- publish lineage and rollback meaning
- surface contracts and gates

## Human-Facing Structure In Principle

Capability Platform should be embodied through:

- a bounded subsystem container or environment
- a focused capability package workbench
- a separate platform observability surface

The workbench and observability surface should not be collapsed into one view.

## Boundaries And Relationships

- Consumers request surfaces or operations, not "the whole package" by default.
- Coordination owns the crossing between consumers and the platform.
- Storage owns durable custody of package records and artifacts.
- UI projects package law; it does not define package law.

## Non-Negotiable Laws

- The package is the only authored source of implementation truth.
- Published forms are derived from package truth.
- Package shape may evolve by surface without forcing unrelated consumers to couple to internal shape.
- New packages are inventory changes, not backend rewrites.

## Common Deformation Risks

- reducing capability packages to loose scripts
- confusing published artifacts with source truth
- letting workflows or consumers quietly become package owners
- collapsing environment, workbench, and observability into one undifferentiated UI object

## Notes

- Capability Platform is the strongest worked example in the current design reference set.
