# Contributing

Contributions are welcome! This guide covers everything you need to add new tools, fix bugs, or improve the codebase.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Adding a New Tool](#adding-a-new-tool)
- [Code Style Requirements](#code-style-requirements)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Development Setup

### Prerequisites

- Node.js 20+ installed
- npm package manager
- Git
- (Optional) Infura API key for full testing - get one free at [MetaMask Developer Portal](https://developer.metamask.io/)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Qbandev/infura-mcp-server.git
cd infura-mcp-server

# Install dependencies
npm install

# Run basic tests (no API key needed)
npm test

# Set up environment for full testing
export INFURA_API_KEY=your_key_here

# Run comprehensive tests
npm run test:comprehensive
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start MCP server (stdio mode) |
| `npm run start:http` | Start MCP server (HTTP mode) |
| `npm run list-tools` | List all available tools |
| `npm test` | Run basic validation tests |
| `npm run test:comprehensive` | Test all 29 tools with API |
| `npm run test:full` | Complete test suite |

## Project Architecture

```
infura-mcp-server/
├── mcpServer.js          # Main MCP server (stdio + HTTP transports)
├── index.js              # CLI entry point
├── lib/
│   ├── infura-client.js  # Infura API client with retry logic
│   ├── tools.js          # Tool discovery (auto-loads from tools/)
│   ├── validators.js     # Input validation functions
│   ├── errors.js         # Structured error classes
│   └── constants.js      # Application constants
├── tools/                # Tool implementations (29 tools)
│   ├── eth-*.js          # Ethereum tools (eth_* methods)
│   ├── net-*.js          # Network tools (net_* methods)
│   └── web-3-*.js        # Web3 tools (web3_* methods)
├── test/                 # Test suites
└── commands/             # CLI commands
```

### Key Components

- **Tool Discovery**: Files in `tools/` are auto-discovered. Just create a file and export `apiTool`.
- **Validation Layer**: Use `lib/validators.js` for all input validation.
- **Error Handling**: Use `ValidationError` for input errors, `InfuraApiError` for API failures.
- **Infura Client**: `lib/infura-client.js` handles all API calls with automatic retry logic.

## Adding a New Tool

Follow these steps to add a new Ethereum JSON-RPC tool.

### Step 1: Create the Tool File

Create a new file in `tools/` following the naming convention:

```
tools/{namespace}-{method-name}.js
```

Examples:
- `eth-get-balance.js` for `eth_getBalance`
- `net-version.js` for `net_version`
- `web-3-client-version.js` for `web3_clientVersion`

### Step 2: Implement the Tool Structure

Every tool must export an `apiTool` object with three parts:

```javascript
import { callInfura } from "../lib/infura-client.js";
import { validateAddress, validateBlockTag } from "../lib/validators.js";

/**
 * Function to [describe what the function does].
 *
 * @param {Object} args - Arguments for the call.
 * @param {string} args.address - [Description of parameter].
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - [Description of return value].
 */
const executeFunction = async ({ address, tag, network = "mainnet" }) => {
  // 1. Validate all inputs FIRST
  validateAddress(address);
  validateBlockTag(tag);

  // 2. Call Infura API
  return callInfura("eth_methodName", [address, tag], network);
};

/**
 * Tool configuration for [tool description].
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_methodName",
      description:
        "[One-line description]\n\n" +
        "Args:\n" +
        "  - param1 (type): Description.\n" +
        "  - param2 (type, optional): Description. Defaults to 'value'.\n\n" +
        "Returns:\n" +
        "  - Description of return value.\n\n" +
        "Examples:\n" +
        "  - \"Use case 1\": { \"param1\": \"value1\" }\n" +
        "  - \"Use case 2\": { \"param1\": \"value1\", \"network\": \"sepolia\" }\n\n" +
        "Errors:\n" +
        "  - InvalidParams: When [condition].\n" +
        "  - InternalError: When [condition].",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The Ethereum address.",
          },
          tag: {
            type: "string",
            enum: ["latest", "earliest", "pending"],
            description: "The block parameter.",
          },
          network: {
            type: "string",
            description: "The network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["address", "tag"],
      },
      annotations: {
        readOnlyHint: true,      // All Infura tools are read-only
        destructiveHint: false,  // Never destructive
        idempotentHint: true,    // Same input = same output
        openWorldHint: true,     // Interacts with external API
      },
    },
  },
};

export { apiTool };
```

### Step 3: Validation Requirements

Always validate inputs before calling `callInfura()`. Use the validators from `lib/validators.js`:

| Validator | Use For |
|-----------|---------|
| `validateAddress(address)` | Ethereum addresses (0x + 40 hex chars) |
| `validateHash(hash)` | Transaction/block hashes (0x + 64 hex chars) |
| `validateBlockTag(tag)` | Block references ('latest', 'earliest', 'pending', hex) |
| `validateNetwork(network)` | Network names (auto-validated by infura-client) |

For optional parameters, validate only if provided:

```javascript
if (address) {
  validateAddress(address);
}
```

### Step 4: MCP Annotations (Required)

All tools must include MCP annotations:

```javascript
annotations: {
  readOnlyHint: true,      // Always true for this project (read-only tools)
  destructiveHint: false,  // Always false (no state changes)
  idempotentHint: true,    // Same request = same response
  openWorldHint: true,     // Connects to external Infura API
}
```

### Step 5: Enhanced Description Format

Follow this format for the `description` field:

```
[Brief one-line summary]

Args:
  - paramName (type): Description.
  - paramName (type, optional): Description. Defaults to 'value'.

Returns:
  - Description of the return value format.

Examples:
  - "Use case description": { "param": "value" }

Errors:
  - ErrorType: When this error occurs.
```

### Tool Naming Conventions

| JSON-RPC Method | File Name | Tool Name |
|-----------------|-----------|-----------|
| `eth_getBalance` | `eth-get-balance.js` | `eth_getBalance` |
| `eth_blockNumber` | `eth-block-number.js` | `eth_blockNumber` |
| `net_version` | `net-version.js` | `net_version` |
| `web3_clientVersion` | `web-3-client-version.js` | `web3_clientVersion` |

**Rules:**
- File names: lowercase with hyphens (kebab-case)
- Tool names: match Ethereum JSON-RPC method names exactly (with underscores)
- Namespace prefix matches the JSON-RPC namespace (`eth_`, `net_`, `web3_`)

## Code Style Requirements

### JavaScript Style

- ES Modules (`import`/`export`) - no CommonJS
- Use `const` for constants, `let` for variables, never `var`
- Async/await for all asynchronous code
- JSDoc comments for all exported functions
- No semicolons are required (project uses minimal style)
- 2-space indentation

### File Structure

1. Imports (external packages first, then local modules)
2. Constants and configuration
3. Helper functions (if any)
4. Main execute function
5. Tool definition object
6. Export statement

### Naming Conventions

- Functions: camelCase (`executeFunction`, `validateAddress`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `ALLOWED_NETWORKS`)
- Files: kebab-case (`eth-get-balance.js`)
- Tool names: Match JSON-RPC spec (`eth_getBalance`)

## Testing Requirements

### Before Submitting a PR

Run these tests and ensure they all pass:

```bash
# Required: Basic validation (must pass)
npm test

# Required if you have an API key: Comprehensive tests
INFURA_API_KEY=your_key npm run test:comprehensive

# Recommended: Full test suite
INFURA_API_KEY=your_key npm run test:full
```

### Test Types

| Test | Command | Requires API Key | What It Tests |
|------|---------|------------------|---------------|
| Structure | `npm run test:validate` | No | Tool definitions, schemas |
| Tools | `npm run test:tools` | No | Tool loading, structure |
| Comprehensive | `npm run test:comprehensive` | Yes | All 29 tools with real API |
| Integration | `npm run test:integration` | Yes | End-to-end MCP flows |
| HTTP | `npm run test:http` | Yes | HTTP transport |
| NPM | `npm run test:npm` | No | Package consistency |
| Full | `npm run test:full` | Yes | All of the above |

### Writing Tests for New Tools

When adding a new tool, the comprehensive test suite will automatically pick it up. Ensure:

1. Your tool exports `apiTool` correctly
2. The `definition` object has all required fields
3. The `function` property is an async function
4. Annotations are present

### CI/CD Integration

Tests run automatically on GitHub Actions:

1. PRs trigger the full test suite
2. Secrets are configured in Settings > Secrets > Actions
3. The `INFURA_API_KEY` secret enables API tests in CI

## Commit Message Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |
| `build` | Build system changes |
| `revert` | Reverting a commit |

### Scopes

- `tools` - Tool implementations
- `server` - MCP server changes
- `tests` - Test suite changes
- `docs` - Documentation
- `deps` - Dependencies

### Examples

```bash
# New tool
feat(tools): add eth_getTransactionReceipt tool

# Bug fix
fix(server): resolve HTTP transport timeout issues

# Documentation
docs: update CONTRIBUTING with tool patterns

# Test addition
test(tools): add validation for all tool definitions
```

### Validation

Commits are validated automatically. Test locally:

```bash
# Validate the last commit
npm run commitlint:last
```

## Pull Request Process

### 1. Fork and Branch

```bash
git checkout -b feat/your-feature-name
```

Branch naming:
- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `test/description` - Test additions
- `chore/description` - Maintenance

### 2. Make Changes

- Follow the code style requirements
- Add tests for new functionality
- Update documentation if needed

### 3. Test Locally

```bash
# Minimum required
npm test

# With API key (recommended)
INFURA_API_KEY=your_key npm run test:full
```

### 4. Commit

```bash
git add <specific-files>
git commit -m "feat(tools): add new_method tool"
```

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then open a Pull Request on GitHub.

### PR Guidelines

- Keep PRs focused on a single feature or fix
- Provide a clear description of changes
- Include test results in the PR description
- For new tools, show example usage
- Respond to review feedback promptly

### PR Checklist

- [ ] All tests pass (`npm test` minimum)
- [ ] Code follows style guidelines
- [ ] Commit messages follow conventional format
- [ ] Documentation updated (if applicable)
- [ ] New tools include all required fields
- [ ] MCP annotations included for new tools

## Building

### Docker

```bash
docker build -t infura-mcp-server .
docker run --rm -e INFURA_API_KEY=$INFURA_API_KEY infura-mcp-server
```

### NPM

```bash
npm install
npm test
npm start
```

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Join discussions for architecture questions
