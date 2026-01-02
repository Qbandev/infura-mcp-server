# AGENTS.md

Instructions and context for AI coding agents working on the Infura MCP Server.

## Project Overview

This is a **Model Context Protocol (MCP) server** providing 29 read-only Ethereum JSON-RPC tools via Infura's infrastructure. It enables AI assistants (Claude Desktop, Cursor, VS Code) to interact with blockchain data across 30+ networks.

**Key facts:**
- **Language**: Node.js ES modules (`type: "module"`)
- **Tools**: 29 read-only Ethereum JSON-RPC methods
- **Transport**: Streamable HTTP (primary) and stdio modes
- **Security**: All operations are read-only; blockchain state cannot be modified

## Setup Commands

```bash
# Install dependencies
npm ci

# Run in stdio mode (default, for MCP clients)
npm start

# Run in HTTP mode (for web deployments)
npm run start:http

# List available tools
npm run list-tools
```

## Testing Commands

```bash
# Basic validation (no API key needed)
npm test

# Comprehensive tool validation (all 29 tools)
npm run test:comprehensive

# HTTP transport tests (requires server running)
npm run test:http

# Integration tests (requires INFURA_API_KEY)
npm run test:integration

# NPM package consistency
npm run test:npm

# Full test suite
npm run test:full

# Run with real API key
INFURA_API_KEY=your_key npm run test:full
```

**Test requirements:**
- `test:comprehensive` and `test:integration` need `INFURA_API_KEY` for real API calls
- `test:http` requires the server running (`npm run start:http`)
- Tests should pass before any commit

## Docker Commands

```bash
# Build image
npm run docker:build

# Run in stdio mode
npm run docker:run

# Run in HTTP mode
npm run docker:run:http

# Docker Compose
npm run docker:compose:up
npm run docker:compose:down
```

## Code Style

- **ES modules**: Use `import`/`export`, not `require`
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **File names**: kebab-case (e.g., `eth-get-balance.js`)
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Comments**: Explain WHY, not WHAT
- **Error handling**: Use `McpError` with appropriate `ErrorCode`

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `security:` - Security improvements

**Examples:**
```
feat(tools): add eth_getTransactionReceipt tool
fix(server): resolve HTTP transport timeout issues
security: add input validation for Ethereum addresses
```

**All commits must be GPG signed** (`git commit -S`).

## Architecture

### Core Files
```
mcpServer.js          # Main server implementation
index.js              # Entry point and CLI handling
lib/
  infura-client.js    # Infura JSON-RPC API client
  tools.js            # Tool discovery utilities
  validators.js       # Input validation (addresses, hashes, networks)
tools/                # 29 Ethereum JSON-RPC tool implementations
commands/             # CLI command definitions
```

### Tool Categories
| Category | Tools |
|----------|-------|
| Account | `eth_getBalance`, `eth_getCode`, `eth_getTransactionCount` |
| Block | `eth_getBlockNumber`, `eth_getBlockByHash`, `eth_getBlockByNumber`, etc. |
| Transaction | `eth_getTransactionByHash`, `eth_getTransactionReceipt`, etc. |
| Contract | `eth_call`, `eth_estimateGas`, `eth_getStorageAt` |
| Network | `eth_chainId`, `net_isListening`, `net_getPeerCount`, etc. |
| Logs | `eth_getLogs` |
| Utility | `eth_getFeeHistory`, `eth_getGasPrice`, etc. |

### Transport Modes
- **stdio** (default): For MCP clients like Claude Desktop, Cursor
- **Streamable HTTP** (`--http`): For web deployments, exposes `/mcp` endpoint

## Security Considerations

### Input Validation
All user inputs are validated in `lib/validators.js`:
- **Addresses**: Must be `0x` + 40 hex characters
- **Hashes**: Must be `0x` + 64 hex characters  
- **Block tags**: `latest`, `earliest`, `pending`, `safe`, `finalized`, or hex number
- **Networks**: Allowlist of 36 supported Infura networks (prevents URL injection)

When adding new tools:
```javascript
import { validateAddress, validateHash, validateBlockTag } from "../lib/validators.js";

// In tool function:
validateAddress(address);  // Throws ValidationError if invalid
validateHash(txHash, 'transactionHash');
validateBlockTag(tag, 'blockTag');
```

### Security Headers
The HTTP server sets these headers automatically:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'none'`
- `X-Powered-By` is disabled

### Environment Variables
- **Never commit API keys** - Use `INFURA_API_KEY` environment variable
- Store secrets in GitHub Secrets for CI/CD

## Adding New Tools

1. Create file in `tools/` following naming convention: `eth-method-name.js`
2. Export `apiTool` object with `function` and `definition`
3. Add input validation using `lib/validators.js`
4. Tool is auto-discovered (no registration needed)

**Template:**
```javascript
import { callInfura } from "../lib/infura-client.js";
import { validateAddress } from "../lib/validators.js";

const executeFunction = async ({ address, network = "mainnet" }) => {
  validateAddress(address);
  return callInfura("eth_methodName", [address], network);
};

const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_methodName",
      description: "Description of what this tool does.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The Ethereum address.",
          },
          network: {
            type: "string",
            description: "The network to query.",
            default: "mainnet",
          },
        },
        required: ["address"],
      },
    },
  },
};

export { apiTool };
```

## CI/CD Pipeline

### GitHub Actions Workflows
- **ci.yml**: Runs on PRs and pushes to main
  - Tests on Node 20, 22, 24
  - Validates package structure
  - Security scanning with `npm audit` and `audit-ci`
  
- **release-please.yml**: Automated releases
  - Creates release PRs with changelog
  - Publishes to npm with provenance (OIDC)
  
- **docker.yml**: Builds and pushes Docker images to GHCR

### npm Publishing
Uses **OIDC Trusted Publishing** (no long-lived tokens):
- Configured at npmjs.com/package/infura-mcp-server/access
- Publishes with `--provenance` for attestation

## Supported Networks

Primary networks are tested in CI. Full list in `lib/validators.js`:

```
mainnet, sepolia, arbitrum-mainnet, arbitrum-sepolia,
optimism-mainnet, optimism-sepolia, polygon-mainnet, polygon-amoy,
base-mainnet, base-sepolia, linea-mainnet, linea-sepolia,
avalanche-mainnet, avalanche-fuji, bsc-mainnet, bsc-testnet,
... (36 total)
```

## Common Issues

### "INFURA_API_KEY not set"
Set the environment variable:
```bash
export INFURA_API_KEY=your_key_here
```

### "Invalid network" error
Network must be in the allowlist. Check `lib/validators.js` for supported networks.

### Tests failing with validation errors
Ensure test data uses valid Ethereum formats:
- Addresses: 40 hex chars after `0x`
- Hashes: 64 hex chars after `0x`
- Block numbers: Use `latest` or proper hex format

### HTTP tests skipped
Start the server first:
```bash
npm run start:http  # Terminal 1
npm run test:http   # Terminal 2
```

## PR Checklist

Before submitting a PR:
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run test:comprehensive` with API key
- [ ] Commits are GPG signed
- [ ] Commit messages follow Conventional Commits
- [ ] No hardcoded secrets or API keys
- [ ] Input validation added for new parameters
- [ ] Documentation updated if needed

## Resources

- [Infura Documentation](https://docs.metamask.io/services/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Ethereum JSON-RPC Spec](https://ethereum.org/en/developers/docs/apis/json-rpc/)
