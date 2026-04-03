# bigspin-cli

CLI for the Bigspin public API. Built with TypeScript + oclif v4 (ESM).

## Quick Reference

- Build: `pnpm build` (runs `tsc`, outputs to `dist/`)
- Test: `pnpm test` (vitest)
- Dev: `node bin/dev.js <command>` (runs TypeScript directly via tsx)
- Lint: `pnpm lint`

## Project Structure

- `src/base-command.ts` -- Abstract base command with shared flags (`--api-key`, `--base-url`, `--json`), auth resolution, and error handling
- `src/client.ts` -- HTTP client wrapping native `fetch` with auth headers, timeout, and error parsing
- `src/config.ts` -- Config file read/write at oclif's `configDir` (~/.config/bigspin/config.json)
- `src/auth.ts` -- API key and base URL resolution (flag > env > config > default)
- `src/types.ts` -- API response types, error class, request types
- `src/utils.ts` -- Shared utilities (key redaction)
- `src/commands/` -- oclif command files (one file per command)

## Conventions

- **ESM**: All imports use `.js` extensions (required for Node16 module resolution)
- **oclif v4**: `ux.table` does not exist -- use `@oclif/table`'s `printTable()` instead
- **JSON output**: All commands set `enableJsonFlag = true` via BaseCommand. Return the data from `run()`. Wrap human-readable output in `if (!this.jsonEnabled())`.
- **Auth**: Commands that call the API use `this.getClient()` from BaseCommand. Config-only commands don't need auth.
- **Testing**: Use vitest. Mock `fetch` with `vi.stubGlobal`. No `@oclif/test` (incompatible with vitest).

## Adding a New Command

1. Create `src/commands/<topic>/<action>.ts`
2. Extend `BaseCommand<typeof YourCommand>`
3. Define `static args`, `static flags`, `static description`, `static examples`
4. Implement `async run()` -- return the API response for JSON output
5. Wrap human output in `if (!this.jsonEnabled())`
6. URL-encode user-supplied path params with `encodeURIComponent()`
7. Run `pnpm build` to verify

## API Base URL

Default: `https://app.bigspin.ai`. Override: `--base-url`, `BIGSPIN_BASE_URL` env, or `bigspin config set base_url`.
