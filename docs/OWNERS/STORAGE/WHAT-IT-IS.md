# Storage: What It Is

## Scope

- `kind`: ownership area
- `semantic owner`: Storage Substrate
- `authority sources`:
  - `system-audit/THE-7-LAWS-OF-THE-7-OWNERSHIPS.md`
  - `architecture/REBUILD_LEDGER.md`

## Core Identity

Storage owns durable custody.

It keeps records and artifacts alive, retrievable, and addressable over time without becoming the owner of their semantic meaning.

## Why It Exists

Persistence is real work, but custody must remain distinct from interpretation.

Without a storage owner, record keeping becomes scattered.
Without a storage boundary, tables and folders start pretending to define ontology.

## What It Owns

- persistence mechanics
- indexing
- retrieval
- durable addressing
- record and artifact custody

## What It Does Not Own

- package meaning
- publish meaning
- policy meaning
- history meaning
- lifecycle meaning
- routing meaning

## Core Internal Structure Or Object Model

Storage should contain:

- owner-scoped custody spaces
- collections and indexes
- artifact and record addressing
- event and history retention where required

## Human-Facing Structure In Principle

Storage is usually observability-heavy.

It may expose custody visibility, record inventory, and artifact posture, but should not become the operator-facing place where semantic work is performed.

## Boundaries And Relationships

- Storage preserves what owners define.
- Storage should not define schema truth that overrides owner semantics.
- Owners may specify what must be persisted, but Storage owns the custody mechanics.

## Non-Negotiable Laws

- custody is not interpretation
- schemas and folders are not ontology
- storage models must not silently redefine domain models

## Common Deformation Risks

- storage-role folders dictating product shape
- schemas becoming hidden owners
- secrets being stored as ordinary records without enough distinction

## Notes

- Storage is safest when it is explicit and boring.
