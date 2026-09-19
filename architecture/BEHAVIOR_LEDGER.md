# Skeleton Behavior Ledger

This ledger preserves platform behavior independent of the legacy code shape.

## Status Key

- `rebuilt`: implemented in the new ownership-governed rebuild
- `imported`: legacy truth can be re-homed into the rebuild through owner-local import
- `reference`: still treated as legacy/reference material, not rebuilt as first-class behavior

## Behavior Families

### Capability Packages

- `status`: rebuilt, imported
- `legacy source`: `database/prompt-truth/active/*`
- `owner`: `capability-platform`
- `new surfaces`:
  - `capability-workbench`
  - `capability-observability`
- `new behavior`:
  - package inventory
  - draft truth editing
  - validation
  - publish
  - rollback
  - published forms
  - legacy prompt package import

### Provider Crossing And Model Catalogs

- `status`: rebuilt, imported
- `legacy source`:
  - `database-domain/provider-configs/*`
  - `database/model-truth/providers/*`
- `owner`: `integration`
- `new surfaces`:
  - `provider-control`
  - `integration-observability`
- `new behavior`:
  - provider credential storage
  - online/offline mode
  - provider status inspection
  - provider catalog import
  - model catalog counts by provider

### Agents

- `status`: rebuilt, imported
- `legacy source`:
  - `database-domain/agent-definitions/*`
  - `database-domain/agent-instances/*`
  - `database-domain/memory/*`
- `owner`: `agents`
- `new surfaces`:
  - `agents-workbench`
  - `agents-observability`
- `new behavior`:
  - definition inventory
  - instance activation state
  - retained memory inspection
  - exportable agent packages
  - legacy agent import

### Governed Change Sessions

- `status`: rebuilt, imported
- `legacy source`:
  - `database/workflow-truth/*`
  - `database/change-sessions/*`
- `owner`: `coordination`
- `new surfaces`:
  - `change-sessions`
  - `coordination-observability`
- `new environment`:
  - `change-session-workspace`
- `new behavior`:
  - workflow definition inventory
  - session list
  - retained session detail
  - phase/status inspection
  - event and invocation counts
  - legacy workflow/session import

### Environment Lifecycle

- `status`: rebuilt
- `owner`: `execution-environment`
- `new surfaces`:
  - `environment-lifecycle`
- `new behavior`:
  - register bounded environments
  - lifecycle state updates
  - readiness and degraded posture
  - host environment projection

### Storage Custody

- `status`: rebuilt
- `owner`: `storage`
- `new surfaces`:
  - `storage-custody`
- `new behavior`:
  - namespace inspection
  - collection counts
  - event stream counts
  - owner-scoped custody visibility

### Host Diagnostics

- `status`: rebuilt
- `owner`: `framework`
- `new surfaces`:
  - `host-diagnostics`
- `new behavior`:
  - platform bootstrap
  - mounted container inventory
  - environment projection visibility
  - coordination event visibility
  - desktop open-path bridge

## Legacy Families Still In Reference Mode

### Derived Views, Cache, And Intake

- `status`: reference
- `legacy source`:
  - `database/views/*`
  - `database/cache/*`
  - `database/intake/*`
- `reason`:
  - these remain useful evidence and audit material, but they are not yet rebuilt as authoritative owner surfaces in the new architecture

### Deep Legacy Contracts And Shared Runtime Records

- `status`: reference
- `legacy source`:
  - `packages/contracts`
  - `packages/core-host`
  - `packages/domain-runtime`
  - `packages/operations-plane`
- `reason`:
  - these are still valuable behavioral reference, but they are intentionally not preserved as the new platform center
