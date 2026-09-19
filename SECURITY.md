# Security posture

Skeleton is a local architectural prototype. Do not expose its runtime to an untrusted network or use it as a production multi-user service.

## Public snapshot guarantees

- No `.env`, credential database, runtime record tree, provider key, agent memory, local log, or private import source is included.
- The runtime binds to loopback only.
- Historical import endpoints have no source unless `SKELETON_LEGACY_ROOT` is explicitly set.
- The verification command uses a temporary data directory and deletes it afterward.
- Default package examples use generic local paths instead of author-machine paths.

## Known hardening work

- The local HTTP API has no authentication and permissive CORS.
- Provider credentials are stored as ordinary owner records rather than through hardened secret custody.
- The Electron preload can request local path opening and the renderer sandbox is currently disabled.
- JSON/JSONL file custody is a structural proof, not a production durability mechanism.
- The bounded executor only accepts registered action kinds, but every new handler still requires a dedicated threat review.
- The Python handler executes published source with the local process's permissions. The dispatcher is not an operating-system sandbox; only execute code you trust.

Use synthetic credentials and disposable data for evaluation. Report suspected leaks or unsafe execution paths privately before public disclosure.
