# Bigspin CLI

Command-line interface for the [Bigspin](https://app.bigspin.ai) API. Manage projects, transcripts, and issues from your terminal.

```bash
npm install -g @bigspin/cli
```

## Installation

### From npm (recommended)

```bash
npm install -g @bigspin/cli
```

### Run without installing

```bash
npx @bigspin/cli <command>
```

### From source

```bash
git clone https://github.com/bigspinai/bigspin-cli.git
cd bigspin-cli
pnpm install
pnpm build
node bin/run.js <command>
```

Requires Node.js >= 20.0.0.

## Quick Start

```bash
# 1. Install
npm install -g @bigspin/cli

# 2. Authenticate (get your key from https://app.bigspin.ai -> Settings -> API Keys)
bigspin auth login

# 3. List your projects
bigspin projects list
```

## Authentication

The CLI needs an API key to access the Bigspin API. Get yours from [Settings > API Keys](https://app.bigspin.ai/dashboard/settings) in the Bigspin app.

### Methods

**Interactive login (recommended)**

```bash
bigspin auth login
```

You will be prompted to paste your API key. Input is masked. The key is validated against the API before being saved.

**Non-interactive login**

```bash
bigspin auth login --token sk-bigspin-api03-...
```

> Security note: The `--token` flag will appear in your shell history. For CI/CD or shared systems, prefer the environment variable method.

**Environment variable**

```bash
export BIGSPIN_API_KEY=sk-bigspin-api03-...
bigspin projects list
```

**Config file**

```bash
bigspin config set api_key sk-bigspin-api03-...
```

**Per-command flag**

```bash
bigspin projects list --api-key sk-bigspin-api03-...
```

### Resolution Order

The CLI resolves the API key using the first value found in this order:

1. `--api-key` flag
2. `BIGSPIN_API_KEY` environment variable
3. Config file (`~/.config/bigspin/config.json`)

If no key is found, the CLI exits with an error and suggests how to set one.

### Verify Authentication

```bash
bigspin whoami
```

Example output:

```
Authenticated to https://app.bigspin.ai
API key: sk-bigspin-api03-abc...
```

## Commands

### auth login

Authenticate with the Bigspin API. Validates the key and saves it to the config file.

```bash
bigspin auth login
bigspin auth login --token sk-bigspin-api03-...
```

| Flag | Description |
|------|-------------|
| `--token` | API key for non-interactive login |

### whoami

Verify authentication and display the current API endpoint and key prefix.

```bash
bigspin whoami
```

### projects list

List all projects with pagination.

```bash
bigspin projects list
bigspin projects list --page 2 --limit 10
```

| Flag | Default | Description |
|------|---------|-------------|
| `--page` | 1 | Page number |
| `--limit` | 20 | Results per page |

Example output:

```
 ID                                   Name              Transcripts  Latest Transcript        Created
 ──────────────────────────────────── ───────────────── ──────────── ──────────────────────── ────────────────────────
 a1b2c3d4-e5f6-7890-abcd-ef1234567890 Support Bot v2   1,247        4/1/2026, 10:30:00 AM    3/15/2026, 9:00:00 AM
 f9e8d7c6-b5a4-3210-fedc-ba9876543210 Sales Assistant   312          3/31/2026, 3:45:00 PM    2/1/2026, 11:15:00 AM

Page 1 of 1 (2 total)
```

### projects get

Get detailed information about a single project, including the executive summary.

```bash
bigspin projects get <projectId>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `projectId` | Yes | Project ID |

### projects issues

List issues discovered for a project, ranked by severity and frequency.

```bash
bigspin projects issues <projectId>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `projectId` | Yes | Project ID |

Example output:

```
 Rank  Title                              Severity  Flagged  Tags
 ───── ──────────────────────────────────── ──────── ──────── ──────────────────
 1     Incorrect refund policy cited        high     87       billing, accuracy
 2     Hallucinated product features        high     43       accuracy
 3     Slow response to urgent requests     medium   31       latency, ux
```

### projects transcripts

List transcripts in a project with filtering and pagination.

```bash
bigspin projects transcripts <projectId>
bigspin projects transcripts <projectId> --q "refund" --language en
bigspin projects transcripts <projectId> --date-from 2026-01-01 --date-to 2026-03-31
bigspin projects transcripts <projectId> --model-name gpt-4 --source-system intercom
bigspin projects transcripts <projectId> --annotation "sentiment:negative"
```

| Argument | Required | Description |
|----------|----------|-------------|
| `projectId` | Yes | Project ID |

| Flag | Default | Description |
|------|---------|-------------|
| `--page` | 1 | Page number |
| `--limit` | 20 | Results per page |
| `--q` | | Full-text search query |
| `--model-name` | | Filter by model name (e.g., `gpt-4`, `claude-3`) |
| `--language` | | Filter by language code (e.g., `en`, `es`, `fr`) |
| `--source-system` | | Filter by source system (e.g., `intercom`, `zendesk`) |
| `--annotation` | | Filter by annotation. Format: `"key"` or `"key:value"` |
| `--date-from` | | Filter from date (ISO format, e.g., `2026-01-01`) |
| `--date-to` | | Filter to date (ISO format, e.g., `2026-03-31`) |

### transcripts get

Get full transcript detail including all conversation turns.

```bash
bigspin transcripts get <transcriptId>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `transcriptId` | Yes | Transcript ID |

Example output:

```
ID:          a1b2c3d4-e5f6-7890-abcd-ef1234567890
Name:        Support chat #4821
Model:       gpt-4
Language:    en
Turns:       6
Created:     2026-03-15T14:30:00.000Z

--- Turns ---

[user] I was charged twice for my subscription last month.

[assistant] I'm sorry to hear about the double charge. Let me look into your account right away.

[user] My email is jane@example.com

[assistant] I've found your account. I can see the duplicate charge from March 1st. I'll process a refund for $29.99 which should appear within 3-5 business days.
```

### transcripts upload

Upload a transcript from a JSON file or stdin.

```bash
# From a file
bigspin transcripts upload --file transcript.json

# From stdin
cat transcript.json | bigspin transcripts upload

# Explicit stdin
bigspin transcripts upload --file -
```

| Flag | Description |
|------|-------------|
| `--file` | Path to JSON file. Use `-` for stdin. |

If no `--file` flag is provided and stdin is not a TTY (i.e., data is piped in), the CLI reads from stdin automatically.

Example output:

```
Transcript uploaded successfully.
ID:     a1b2c3d4-e5f6-7890-abcd-ef1234567890
Name:   Support chat #4821
Turns:  6
```

### config set

Set a configuration value.

```bash
bigspin config set api_key sk-bigspin-api03-...
bigspin config set base_url https://staging.bigspin.ai
```

| Argument | Required | Description |
|----------|----------|-------------|
| `key` | Yes | Config key. Must be `api_key` or `base_url`. |
| `value` | Yes | Value to set |

### config get

Get a configuration value. API keys are displayed redacted.

```bash
bigspin config get api_key
bigspin config get base_url
```

| Argument | Required | Description |
|----------|----------|-------------|
| `key` | Yes | Config key. Must be `api_key` or `base_url`. |

### config list

Display all configuration values and the config file path.

```bash
bigspin config list
```

Example output:

```
Config file: /Users/you/.config/bigspin/config.json

api_key:  sk-bigspin-api03-ab...
base_url: (not set)
```

## JSON Output

All commands support the `--json` flag for machine-readable output. When `--json` is passed, the command outputs the raw API response as JSON to stdout.

```bash
bigspin projects list --json
```

This works well with `jq` for extracting specific fields:

```bash
# Get all project names
bigspin projects list --json | jq '.data[].name'

# Get the ID of the first project
bigspin projects list --json | jq -r '.data[0].id'

# Count transcripts across all projects
bigspin projects list --json | jq '[.data[].transcript_count] | add'

# Get all high-severity issues
bigspin projects issues <projectId> --json | jq '.data[] | select(.severity == "high")'

# Extract transcript text as plain conversation
bigspin transcripts get <id> --json | jq -r '.data.turns[] | "[\(.role)] \(.content)"'
```

## Transcript Upload Format

The `transcripts upload` command expects a JSON file matching the following schema. Only `name` and `turns` (with `role` and `content` per turn) are required. All other fields are optional.

### Complete Example

```json
{
  "name": "Support chat #4821",
  "modelName": "gpt-4",
  "language": "en",
  "sourceSystem": "intercom",
  "externalId": "conv-4821",
  "externalUserId": "user-9382",
  "sourceTimestamp": "2026-03-15T14:30:00.000Z",
  "metadata": {
    "channel": "web",
    "department": "billing",
    "priority": "high"
  },
  "turns": [
    {
      "role": "system",
      "content": "You are a helpful support agent for Acme Corp."
    },
    {
      "role": "user",
      "content": "I was charged twice for my subscription last month.",
      "createdAt": "2026-03-15T14:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "I'm sorry to hear about the double charge. Let me look into your account.",
      "createdAt": "2026-03-15T14:30:05.000Z",
      "metadata": {
        "latency_ms": 1200,
        "model_version": "gpt-4-0125"
      }
    },
    {
      "role": "assistant",
      "content": "",
      "toolCalls": [
        {
          "name": "lookup_account",
          "args": { "email": "jane@example.com" }
        }
      ]
    },
    {
      "role": "tool",
      "content": "",
      "toolResults": [
        {
          "name": "lookup_account",
          "result": { "account_id": "acct-123", "plan": "pro", "status": "active" }
        }
      ]
    },
    {
      "role": "assistant",
      "content": "I've found your account and I can see the duplicate charge. I'll process a refund for $29.99.",
      "createdAt": "2026-03-15T14:30:12.000Z"
    }
  ]
}
```

### Schema Reference

**Top-level fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name for the transcript |
| `turns` | array | Yes | Array of conversation turns (see below) |
| `modelName` | string | No | Model name (e.g., `gpt-4`, `claude-3-sonnet`) |
| `language` | string | No | Language code (e.g., `en`, `es`) |
| `sourceSystem` | string | No | Source system identifier (e.g., `intercom`, `zendesk`) |
| `externalId` | string | No | Your system's ID for this conversation |
| `externalUserId` | string | No | Your system's user ID |
| `sourceTimestamp` | string | No | ISO 8601 timestamp of the original conversation |
| `metadata` | object | No | Arbitrary key-value metadata |

**Turn fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | One of: `user`, `assistant`, `system`, `tool`, `human_agent` |
| `content` | string | Yes | The text content of the turn |
| `toolCalls` | array | No | Tool/function calls made by the assistant |
| `toolCalls[].name` | string | Yes | Tool name |
| `toolCalls[].args` | object | Yes | Tool arguments |
| `toolResults` | array | No | Results returned from tool execution |
| `toolResults[].name` | string | Yes | Tool name |
| `toolResults[].result` | any | Yes | Tool return value |
| `metadata` | object | No | Arbitrary per-turn metadata |
| `createdAt` | string | No | ISO 8601 timestamp for the turn |

### Minimal Example

```json
{
  "name": "Quick test transcript",
  "turns": [
    { "role": "user", "content": "Hello, can you help me?" },
    { "role": "assistant", "content": "Of course! What do you need help with?" }
  ]
}
```

## Configuration

### Config File

The CLI stores configuration at:

```
~/.config/bigspin/config.json
```

The file is created automatically on first `auth login` or `config set` and is set to permission mode `0600` (owner read/write only).

### Config Keys

| Key | Description | Example |
|-----|-------------|---------|
| `api_key` | Your Bigspin API key | `sk-bigspin-api03-...` |
| `base_url` | API base URL override | `https://staging.bigspin.ai` |

### Base URL Override

The default API base URL is `https://app.bigspin.ai`. Override it using any of these methods (listed in resolution order):

1. `--base-url` flag on any command
2. `BIGSPIN_BASE_URL` environment variable
3. `bigspin config set base_url <url>`

```bash
# Per-command
bigspin projects list --base-url https://staging.bigspin.ai

# Environment variable
export BIGSPIN_BASE_URL=https://staging.bigspin.ai

# Persistent config
bigspin config set base_url https://staging.bigspin.ai
```

## Troubleshooting

### "No API key found"

You have not configured authentication. Run one of:

```bash
bigspin auth login
# or
export BIGSPIN_API_KEY=sk-bigspin-api03-...
# or
bigspin config set api_key sk-bigspin-api03-...
```

### "Authentication failed"

Your API key is invalid or expired. Generate a new key at [Settings > API Keys](https://app.bigspin.ai/dashboard/settings) and run `bigspin auth login` again.

### "Invalid API key format"

The key must start with `sk-bigspin-api` or `sk-prism-api`. Check that you copied the full key.

### "Network error" or connection refused

- Check your internet connection.
- If using a custom base URL, verify it is correct: `bigspin config get base_url`
- Try the default URL: `bigspin projects list --base-url https://app.bigspin.ai`

### "Server returned non-JSON response"

The API endpoint returned HTML or another non-JSON format. This usually means:

- The base URL is wrong (pointing at a web page instead of the API).
- The API is temporarily unavailable.
- A proxy or firewall is intercepting the request.

Check your base URL with `bigspin config list` and verify it points to the correct Bigspin instance.

### "Request timed out after 30 seconds"

The API did not respond within the 30-second timeout. This is usually a temporary server issue. Retry the command.

## Development

### Setup

```bash
cd bigspin-cli
pnpm install
```

### Build

```bash
pnpm build
```

Compiles TypeScript to `dist/` via `tsc`.

### Test

```bash
pnpm test
```

Runs tests with vitest.

### Dev Mode

Run commands directly from TypeScript without building:

```bash
node bin/dev.js projects list
node bin/dev.js whoami
node bin/dev.js transcripts upload --file test.json
```

### Project Structure

```
bigspin-cli/
  bin/
    run.js          # Production entry point
    dev.js          # Dev entry point (uses tsx)
  src/
    base-command.ts # Abstract base with shared flags and auth
    client.ts       # HTTP client (fetch wrapper)
    auth.ts         # API key and base URL resolution
    config.ts       # Config file I/O
    types.ts        # TypeScript types and ApiError class
    utils.ts        # Shared utilities
    commands/
      auth/
        login.ts    # bigspin auth login
      config/
        get.ts      # bigspin config get
        list.ts     # bigspin config list
        set.ts      # bigspin config set
      projects/
        get.ts      # bigspin projects get
        issues.ts   # bigspin projects issues
        list.ts     # bigspin projects list
        transcripts.ts  # bigspin projects transcripts
      transcripts/
        get.ts      # bigspin transcripts get
        upload.ts   # bigspin transcripts upload
      whoami.ts     # bigspin whoami
  dist/             # Compiled output (generated by pnpm build)
```

### Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript (strict, ESM)
- **CLI framework**: [oclif v4](https://oclif.io/)
- **Table rendering**: [@oclif/table](https://github.com/oclif/table)
- **Testing**: [vitest](https://vitest.dev/)
- **Package manager**: pnpm

## License

MIT
