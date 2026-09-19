# UI / UX: What It Is

## Scope

- `kind`: human-facing projection and embodiment layer
- `semantic owner`: distributed; UI/UX projects owner truth but does not own domain semantics
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `The Ultimate Design/Capability Platform.txt`
  - `architecture/REBUILD_LEDGER.md`

## Core Identity

Skeleton's UI/UX is the human-facing embodiment of the platform's owner truth.

It is not itself the semantic owner of packages, agents, environments, crossing, handoff, or storage. It is the layer that makes those things operable, inspectable, and understandable for humans through subsystem containers, surfaces, and embedded operating contexts.

## Why It Exists

The system needs humans to:

- work directly on first-class objects
- inspect platform posture
- move between workbench-heavy and observability-heavy tasks
- understand bounded operating contexts when they are real
- do all of that without the UI silently becoming ontology

## What It Owns

UI/UX owns:

- presentation
- interaction design
- orientation and navigation as presentation behavior
- visual embodiment, skins, vskins, and motion
- human-facing shell composition

## What It Does Not Own

UI/UX does not own:

- semantic meaning of subsystem objects
- environment truth unless it is merely projecting a real environment owner
- package laws
- agent laws
- storage custody meaning
- coordination truth

## Core Internal Structure Or Object Model

The principled UI/UX model is:

- subsystem container
- operating surface
- embedded operating context
- embedded environment when the underlying thing is a real bounded place

## Human-Facing Structure In Principle

Different owners may legitimately present different mixes of:

- workbench surfaces
- admin/observability surfaces
- embedded contexts such as editors, inspectors, compare views, review zones, or workspaces
- more embodied environment-like containers where a real place exists

Rich interactivity, animation, playfulness, living behavior, and skins do not require the whole platform to become an environment-scale host.

## Boundaries And Relationships

- UI projects owner truth; it does not redefine it.
- Framework hosts the top-level shell shape.
- Execution Environment may own true bounded places that UI renders.
- Capability Platform, Agents, Integration, Coordination, and Storage each contribute different human-facing needs.

## Non-Negotiable Laws

- Presentation richness is not architectural proof.
- Skins and embodiment do not automatically create environment ontology.
- Different subsystems do not need the same human-facing shape.
- Workbench and observability are distinct human-facing roles and should stay distinct where useful.

## Common Deformation Risks

- mistaking attractive embodiment for system ontology
- flattening all subsystem UX into one page model
- using admin surfaces as ersatz workbenches
- putting owner meaning in UI routing or view state

## Notes

- Current UI reality is split between the legacy flat shell and the rebuild container shell.
