# Agents: Current Structure

## Audit Snapshot

- `overall state`: partial
- `supporting states`:
  - cutover-pending
  - reference-only
  - hardening-pending
- `confidence`: medium-high
- `last reviewed`: 2026-04-11
- `evidence anchors`:
  - `packages/agent-platform/*`
  - `packages/domain-runtime/src/service.ts`
  - `apps/web/src/surfaces/AgentsSurface.tsx`
  - `rebuild/owners/agents/src/service.ts`
  - `rebuild/owners/agents/src/container.ts`
  - `architecture/BEHAVIOR_LEDGER.md`

## Current Shape

Agents currently exist as a mix of legacy runtime behavior and rebuild owner structure.

The legacy path contains richer underlying agent behavior spread across agent-platform, database records, domain-runtime reaction logic, and a legacy UI surface.

The rebuild gives Agents a cleaner owner-local container with definition inventory, instance activation state, retained memory inspection, exportable packages, observability, and legacy import paths.

As of the RevEng Capability/Agents migration implementation pass, the rebuild Agents owner also has specs, addressable sections, capability assignments, keycard file visibility, per-tool file permissions, workflow records, target previews, executor-backed run records, appearance preferences, and agent environment context assembly.

Workflow submission now performs runtime permission checks before bounded executor handoff. Agents records the run state, permission checks, denials, executor run id, outputs, failures, and events as agent runtime evidence.

## Major Parts

- `legacy agent platform`
  - what it does: agent domain behavior, tool access, runtime tasks
  - where it lives: `packages/agent-platform`, `packages/domain-runtime`
- `legacy agent UI`
  - what it does: operator-facing agent surface in the old product shell
  - where it lives: `apps/web/src/surfaces/AgentsSurface.tsx`
- `rebuild agents service`
  - what it does: definitions, instances, memory, package export, specs, sections, activation gate sync, capability grants, file/keycard assignments, per-tool permissions, workflows, target preview, runtime permission checks, executor handoff, workflow run evidence, environment context, legacy import
  - where it lives: `rebuild/owners/agents/src/service.ts`

## What Appears Correctly Placed

- The rebuild gives Agents a real owner-local container instead of treating agent visibility as just another tab.
- Identity, instance state, retained memory, and exportable packages are re-homed under the Agents owner.
- Agent operating posture now has owner-local records rather than only flat instance inventory.
- Workflow requests now pass through runtime permission checks and bounded executor handoff without unsafe direct execution.

## What Appears Drifted Or Fused

- Legacy agent behavior is still entangled with domain-runtime and shared database structures.
- Runtime execution is bounded and limited to registered executor action handlers; arbitrary workflow code execution remains intentionally absent.
- Some legacy task/journal/finding behavior is not yet fully re-homed into the rebuild records.

## What Is Missing Or Partial

- deeper task, journal, finding, and output evidence records
- richer policy editing surfaces and broader runtime permission enforcement hooks
- fuller extraction of Agent Hall/Bay UI modules out of the central shell

## What Is Intentionally Deferred Or Blocked

- some deeper re-homing is deferred while legacy agent behavior remains the richer behavioral reference
- richer agent contexts are deferred until the owner contract shape is stronger

## Storage / Artifacts / Handoffs

Legacy agent truth still spans multiple legacy record families.

The rebuild stores agent definitions, instances, memory, exported packages, specs, sections, grants, keycards, permissions, workflows, executor-backed run records, outputs, failures, permission denials, and appearance preferences under owner-local custody. This is structurally better, but it has not yet replaced the full depth of the legacy behavior stack.

## Pressure Signals

- `signal`: responsibility-fusion
  - `strength`: medium
  - `where`: legacy agent/runtime behavior
  - `why`: agent behavior is still spread across domain-runtime, database records, and UI surfaces
  - `what it threatens`: clean re-foundation under the true owner

- `signal`: contract-ambiguity
  - `strength`: medium
  - `where`: future agent remit and workflow depth
  - `why`: inventory and memory are real, but richer operating semantics are not yet fully expressed in the rebuild
  - `what it threatens`: complete agent re-homing

## Open Audit Questions

- What parts of legacy agent behavior are still essential and not yet re-homed?
- Which agent interactions should become richer embedded contexts in the future shell?
