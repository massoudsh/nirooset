# Static Analysis (Slither)

The project runs [Slither](https://github.com/crytic/slither) in CI (`.github/workflows/ci.yml`) to report potential issues in Solidity contracts.

## Running locally

1. Install Slither (and its deps, e.g. solc-select):
   ```bash
   pip install slither-analyzer
   ```

2. Build with Foundry so Slither can use the artifacts:
   ```bash
   forge build
   ```

3. Run Slither (from repo root):
   ```bash
   slither . --compile-force-framework foundry --filter-paths "lib|test"
   ```

The `--filter-paths "lib|test"` option limits analysis to the `src/` contracts and excludes dependencies and tests.

## CI behavior

- The **slither** job runs on push/PR to `main`.
- It compiles with Foundry, installs Slither, and runs the command above.
- The step is set to `continue-on-error: true` so CI does not block on findings; the log is available in the workflow run.
- Before mainnet, consider: addressing or documenting all high/medium findings, or removing `continue-on-error` and fixing remaining issues.

## Policy

- **High/medium:** Fix or document accepted risk (e.g. in code comments or SECURITY.md). Do not leave unacknowledged.
- **Low/informational:** Optional to fix; can be tracked in issues.
- Add new contracts under `src/` to the scope; keep `test/` and `lib/` filtered out.

## Optional: Aderyn

[Aderyn](https://github.com/Cyfrin/aderyn) is an alternative. To use it in CI, add a job that runs `aderyn .` (or equivalent) after `forge build`. The same “fix or document high/medium” policy applies.
