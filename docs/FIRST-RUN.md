# From Python source to a recorded result

This walkthrough uses the bundled Text Normalizer. The browser and command-line routes exercise the actual TypeScript services and your Python interpreter. All example text is synthetic; no model account is required.

Install and build using the repository README, then run `npm run demo`. The script creates a new `.demo-runs/` directory, starts a disposable loopback runtime, and performs this sequence:

| Step | What happens | What to notice |
|---|---|---|
| Request the unpublished action | HTTP 403, executor status `denied` | No release means no published action can run. The denial is retained. |
| Validate | Structural validation passes | This is a package-contract check, not proof that arbitrary Python is safe. |
| Publish | Local version 1 is created | Source and generated forms are attached to the version. |
| Run | Python returns `hello world` | The executor records the authorized request and its result. |

The [captured JSON](../examples/result.json) is a public projection of that run. Full local records include execution identities, events, source artifacts, and machine paths; the demo retains them locally for inspection. Repeating the demo creates a new directory. For a chosen destination, use `node scripts/example.mjs --out NEW_DIRECTORY`; an existing destination is refused.

## Through the interface

Run `npm run start:runtime`, open http://127.0.0.1:4310, and select **Text Normalizer** in **Package Workbench**. Read the two-line Python function. Choose **Validate**, then **Publish**. Scroll to **Governed Package Action**, leave the supplied payload in place, and choose **Run Published Action**.

The result should contain `"output": "sample text"`, executor status `complete`, and a package version. Notice that the action button was disabled before publication. Change the input and run again; each invocation gets its own evidence.

![Actual workbench after the synthetic text-normalization action.](assets/recorded-result.png)

Use **Lifecycle Ledger** to inspect versions and **Execution Environment** to examine run records. Publishing here is entirely local. The runtime stops when you stop its terminal; saved records remain in `.skeleton-data/`.

## If the example cannot complete

- A missing Python interpreter causes execution failure. Install Python 3.10+ or set `PYTHON_EXECUTABLE` to your interpreter, then restart the runtime.
- A busy port prevents browser startup. Stop the older runtime or set `PORT` to another local port. The scripted demo selects an available port automatically.
- Unsaved edits are not part of the draft. Choose **Save Draft** before validation/publication when changing source.

This prototype executes trusted Python with the runtime's permissions. Permission records are application rules, not OS isolation or authentication. See [SECURITY.md](../SECURITY.md).
