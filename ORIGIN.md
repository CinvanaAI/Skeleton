# Origin and public snapshot boundary

Skeleton grew inside a broader local AI workbench while its architecture was being re-evaluated. The source workspace contains two real product shapes: a legacy flat operator console and this newer ownership-governed composition host.

This repository publishes only the newer rebuild because presenting both shapes as one coherent finished product would be misleading. The behavior and rebuild ledgers are included so the migration boundary remains visible rather than being rewritten as a clean-room origin story.

Earlier work explored capability packaging and workflow composition in Python.
This later TypeScript implementation carries forward those questions with a
different architecture. It is not a file-for-file port or a complete copy of
the earlier workbench. The dated audits and migration ledgers describe the
broader workspace from which this implementation was extracted; legacy paths
in those records are historical references, not included source directories.

Included:

- the complete owner-governed TypeScript runtime, shell, and desktop host;
- all seven owner services and their current public contracts;
- the governing ownership law, owner audits, and migration ledgers;
- synthetic bootstrap capability packages;
- an offline smoke check using a disposable data directory.

Excluded:

- the legacy workbench implementation and its dependencies;
- local runtime databases, provider credentials, agent records, outputs, logs, caches, and packages;
- audit-session prompts and scratch files;
- private adjacent projects and media-heavy design references.

Two machine-specific paths embedded in a historical bootstrap package were replaced by opt-in environment variables. Legacy import is disabled unless an operator explicitly supplies `SKELETON_LEGACY_ROOT`.
