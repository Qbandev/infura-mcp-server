# Infura MCP Server

A Model Context Protocol (MCP) server that connects AI assistants to 30+ blockchain networks through Infura's infrastructure. Query blocks, transactions, smart contracts, and accounts across Ethereum, Polygon, Arbitrum, Base, Avalanche, BNB Chain, and more using natural language.

## What is This?

This server implements the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), an open standard for connecting AI assistants to external data sources. MCP enables AI models to execute tools and access real-time data in a secure, structured way.

**Why use this server?**
- Query live blockchain data directly from AI assistants (Claude, Cursor, VS Code Copilot)
- No Web3 library setup required - just configure and start asking questions
- All 29 tools are read-only and never modify blockchain state
- Built-in security features protect against common vulnerabilities

## Features

**29 JSON-RPC Tools** - Complete blockchain query suite for accounts, blocks, transactions, smart contracts, logs, and network data. All tools include MCP annotations (`readOnlyHint`, `idempotentHint`, etc.) for AI-optimized behavior. Optional `response_format: "markdown"` parameter for human-readable output.

**30+ Networks** - EVM-compatible chains including Ethereum mainnet/testnets, Layer 2 solutions (Arbitrum, Base, Optimism, Polygon, Linea, Scroll, ZKsync), and alternative L1s (Avalanche, BNB Chain, Celo, Starknet).

**Enterprise-Grade Security** - Configurable CORS, DNS rebinding protection, rate limiting, session management, input validation, and request/response size limits.

**Flexible Deployment** - Stdio mode for desktop integration or Streamable HTTP for web applications.

## Quick Start

1. Get your Infura API key from the [MetaMask Developer Portal](https://developer.metamask.io/)
2. Choose your integration method below
3. Restart your AI client and start querying blockchain data

### Claude Desktop

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**How to access:** Claude menu → Settings → Developer → Edit Config

```json
{
  "mcpServers": {
    "infura": {
      "command": "npx",
      "args": ["-y", "infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "<YOUR_API_KEY>",
        "INFURA_NETWORK": "mainnet"
      }
    }
  }
}
```

After saving, **quit and restart Claude Desktop** completely. Look for the MCP server indicator (hammer icon) in the bottom-right of the chat input.

### Cursor

**Config file location:**
- Global: `~/.cursor/mcp.json`
- Project: `.cursor/mcp.json` in project root

**How to access:** Settings → Cursor Settings → MCP → Add new MCP server

```json
{
  "mcpServers": {
    "infura": {
      "command": "npx",
      "args": ["-y", "infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "<YOUR_API_KEY>",
        "INFURA_NETWORK": "mainnet"
      }
    }
  }
}
```

**Using environment variables** (recommended for security):
```json
{
  "mcpServers": {
    "infura": {
      "command": "npx",
      "args": ["-y", "infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "${env:INFURA_API_KEY}",
        "INFURA_NETWORK": "mainnet"
      }
    }
  }
}
```

### Claude Code (CLI)

**One-line install:**
```bash
claude mcp add infura --transport stdio --env INFURA_API_KEY=<YOUR_API_KEY> -- npx -y infura-mcp-server
```

**With network selection:**
```bash
claude mcp add infura --transport stdio \
  --env INFURA_API_KEY=<YOUR_API_KEY> \
  --env INFURA_NETWORK=polygon-mainnet \
  -- npx -y infura-mcp-server
```

**Scope options:**
- `--scope local` (default): Available only in current project
- `--scope user`: Available across all your projects
- `--scope project`: Shared with team via `.mcp.json`

**Verify installation:**
```bash
claude mcp list        # List configured servers
claude mcp get infura  # Check server details
```

Inside Claude Code, use `/mcp` to check server status.

### VS Code

Quick install: [![NPX](https://img.shields.io/badge/Install-NPX-0098FF?style=flat-square&logo=visualstudiocode)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22infura-mcp-server%22%5D%2C%22env%22%3A%7B%22INFURA_API_KEY%22%3A%22%3CYOUR_API_KEY%3E%22%7D%7D)

Or manually add to User Settings (JSON) or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "infura": {
        "command": "npx",
        "args": ["-y", "infura-mcp-server"],
        "env": {
          "INFURA_API_KEY": "<YOUR_API_KEY>"
        }
      }
    }
  }
}
```

### Docker

Add to your MCP client config:

```json
{
  "mcpServers": {
    "infura": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "INFURA_API_KEY=<YOUR_API_KEY>",
        "-e", "INFURA_NETWORK=mainnet",
        "ghcr.io/qbandev/infura-mcp-server:latest"
      ]
    }
  }
}
```

### HTTP Mode (Web Deployments)

```bash
npm run start:http
# Endpoints: http://localhost:3001/mcp (main) | http://localhost:3001/health
```

For HTTP/SSE clients (Cursor remote servers):
```json
{
  "mcpServers": {
    "infura": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `INFURA_API_KEY` | Yes | - | Your Infura API key from [MetaMask Developer Portal](https://developer.metamask.io/) |
| `INFURA_NETWORK` | No | `mainnet` | Target blockchain network (see [Supported Networks](#supported-networks)) |
| `DEBUG` | No | `false` | Enable debug logging |
| `PORT` | No | `3001` | HTTP server port (HTTP mode only) |

### Security Configuration (HTTP Mode)

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000` | Comma-separated list of allowed CORS origins |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated list of allowed Host headers (DNS rebinding protection) |
| `SESSION_TIMEOUT_MS` | `1800000` (30 min) | Session timeout in milliseconds |
| `MAX_SESSIONS` | `1000` | Maximum concurrent sessions |

## Available Tools

### Account and Balance (3 tools)
- `eth_getBalance` - Get ETH balance of an address
- `eth_getCode` - Get contract bytecode at an address
- `eth_getTransactionCount` - Get transaction count (nonce) for an address

### Blocks (7 tools)
- `eth_blockNumber` - Get the latest block number
- `eth_getBlockByHash` - Get block by its hash
- `eth_getBlockByNumber` - Get block by number
- `eth_getBlockTransactionCountByHash` - Get transaction count in a block by hash
- `eth_getBlockTransactionCountByNumber` - Get transaction count in a block by number
- `eth_getUncleCountByBlockHash` - Get uncle count by block hash
- `eth_getUncleCountByBlockNumber` - Get uncle count by block number

### Transactions (6 tools)
- `eth_getTransactionByHash` - Get transaction details by hash
- `eth_getTransactionByBlockHashAndIndex` - Get transaction by block hash and index
- `eth_getTransactionByBlockNumberAndIndex` - Get transaction by block number and index
- `eth_getTransactionReceipt` - Get transaction receipt (logs, status, gas used)
- `eth_getUncleByBlockHashAndIndex` - Get uncle block by hash and index
- `eth_getUncleByBlockNumberAndIndex` - Get uncle block by number and index

### Smart Contracts (3 tools)
- `eth_call` - Execute a read-only contract call
- `eth_estimateGas` - Estimate gas for a transaction
- `eth_getStorageAt` - Read storage slot from a contract

### Logs (1 tool)
- `eth_getLogs` - Query contract event logs with filtering (supports pagination for large result sets)

### Network Info (5 tools)
- `eth_chainId` - Get the chain ID
- `net_version` - Get the network version
- `net_listening` - Check if node is listening for connections
- `net_peerCount` - Get number of connected peers
- `web3_clientVersion` - Get the client version string

### Gas and Fees (4 tools)
- `eth_gasPrice` - Get current gas price
- `eth_feeHistory` - Get historical fee data (EIP-1559)
- `eth_protocolVersion` - Get the Ethereum protocol version
- `eth_syncing` - Get sync status of the node

All tools include enhanced descriptions with Args, Returns, Examples, and Errors sections for better AI understanding.

## Supported Networks

Access 30+ networks across 18 blockchain ecosystems. Set your target using `INFURA_NETWORK`.

| Category | Networks |
|----------|----------|
| **Ethereum** | `mainnet`, `sepolia`, `holesky` |
| **Arbitrum** | `arbitrum-mainnet`, `arbitrum-sepolia` |
| **Base** | `base-mainnet`, `base-sepolia` |
| **Optimism** | `optimism-mainnet`, `optimism-sepolia` |
| **Polygon** | `polygon-mainnet`, `polygon-amoy` |
| **Linea** | `linea-mainnet`, `linea-sepolia` |
| **ZKsync** | `zksync-mainnet`, `zksync-sepolia` |
| **Scroll** | `scroll-mainnet`, `scroll-sepolia` |
| **Blast** | `blast-mainnet`, `blast-sepolia` |
| **Mantle** | `mantle-mainnet`, `mantle-sepolia` |
| **Avalanche** | `avalanche-mainnet`, `avalanche-fuji` |
| **BNB Chain** | `bsc-mainnet`, `bsc-testnet` |
| **opBNB** | `opbnb-mainnet`, `opbnb-testnet` |
| **Celo** | `celo-mainnet`, `celo-alfajores` |
| **Palm** | `palm-mainnet`, `palm-testnet` |
| **Starknet** | `starknet-mainnet`, `starknet-sepolia` |
| **Swellchain** | `swellchain-mainnet`, `swellchain-testnet` |
| **Unichain** | `unichain-mainnet`, `unichain-sepolia` |

See [complete network documentation](https://docs.metamask.io/services/get-started/endpoints/).

## Usage Examples

Once configured, ask your AI assistant natural language questions:

![Cursor Chat with Infura MCP](img/cursor-chat.jpg)

**Common queries:**
- "What is the ETH balance of vitalik.eth?"
- "Show me the latest block on Ethereum mainnet"
- "Get the transaction receipt for 0x..."
- "What is the current gas price on Polygon?"
- "Read the storage at slot 0 of this contract"
- "Compare gas prices across Ethereum, Arbitrum, and Base"

The AI automatically selects the appropriate tools and provides contextual insights.

**Tool parameters:**
- Use `response_format: "markdown"` for formatted, human-readable output
- Use `page` and `pageSize` with `eth_getLogs` to paginate large result sets

## Architecture

```
+------------------+     +-------------------+     +------------------+
|   AI Assistant   | <-> |  Infura MCP       | <-> |  Infura API      |
| (Claude, Cursor) |     |  Server           |     |  (30+ networks)  |
+------------------+     +-------------------+     +------------------+
                               |
                         +-----+-----+
                         |           |
                    Stdio Mode   HTTP Mode
                    (Desktop)    (Web/API)
```

**Transport Modes:**
- **Stdio** (default): For desktop integrations (Claude Desktop, Cursor, VS Code). The AI client spawns the server as a subprocess and communicates via stdin/stdout.
- **Streamable HTTP**: For web deployments and multi-client scenarios. Exposes `/mcp` endpoint with session management.

## Security

> **Warning**: Never commit API keys to version control. Use environment variables or secrets management.

### Built-in Security Features

**Input Validation**
- Required parameter validation: All tool inputs validated against strict patterns before execution
- Ethereum addresses: 0x + 40 hex characters
- Transaction/block hashes: 0x + 64 hex characters
- Networks: Validated against allowlist to prevent URL injection
- Local execution: Server runs locally with no external code execution

**Request Protection (HTTP Mode)**
- **Rate limiting**: 100 requests per minute per IP address
- **CORS**: Configurable origin allowlist via `CORS_ALLOWED_ORIGINS`
- **DNS rebinding protection**: Host header validation via `ALLOWED_HOSTS`
- **Request body limit**: 100KB maximum payload size
- **Response size limit**: 100KB maximum response (CHARACTER_LIMIT)
- **Session management**: Configurable timeout and maximum concurrent sessions

**Network Security**
- All Infura API calls use HTTPS/TLS encryption
- Read-only operations only - tools never modify blockchain state
- No arbitrary code execution - only predefined JSON-RPC methods
- Request identification via User-Agent header: `infura-mcp-server/{version}`

**Security Headers (HTTP Mode)**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'none'`
- `Referrer-Policy: no-referrer`
- `Cache-Control: no-store`

### API Key Security

- Store keys in environment variables, never in code or committed config files
- Use separate API keys for development and production
- Monitor usage via the [MetaMask Developer Dashboard](https://developer.metamask.io/)
- Rotate keys periodically and revoke unused keys
- Use Infura's allowlist feature to restrict key usage by domain or IP

### Supply Chain Security

This package uses npm Trusted Publishing with OIDC and provenance attestations for supply chain integrity.

## Error Handling

The server provides actionable error messages to help diagnose issues:

| Error | Cause | Solution |
|-------|-------|----------|
| `INFURA_API_KEY not set` | Missing environment variable | Set `INFURA_API_KEY` in your configuration |
| `Authentication failed` | Invalid or restricted API key | Verify key at [MetaMask Dashboard](https://developer.metamask.io/) |
| `Rate limit exceeded` | Too many requests | Wait 60 seconds, or upgrade your Infura plan |
| `Invalid Ethereum address` | Malformed address input | Use 0x followed by 40 hex characters |
| `Invalid network` | Unsupported network name | Check [Supported Networks](#supported-networks) |
| `Service unavailable (5xx)` | Infura outage | Transient error - automatic retry with exponential backoff |
| `Request timeout` | Network congestion | Retry, or simplify the query |

**Retry Logic**: Transient failures (HTTP 429, 5xx, network errors) are automatically retried up to 3 times with exponential backoff (1s, 2s, 4s). Rate limit responses respect the `Retry-After` header.

## Common Pitfalls

1. **Forgetting to set INFURA_API_KEY** - The most common issue. Verify the variable is exported in your shell or set in your MCP client config.

2. **Using wrong network name** - Network names are case-sensitive and hyphenated (e.g., `arbitrum-mainnet`, not `arbitrum` or `Arbitrum`).

3. **Querying testnet data on mainnet** - Transactions and addresses are network-specific. Set `INFURA_NETWORK` to match your data.

4. **Expecting real-time updates** - MCP tools query on-demand. For continuous monitoring, make repeated queries.

5. **Large log queries timing out** - Use specific block ranges and topic filters with `eth_getLogs` to limit result size.

6. **Committing API keys** - Use `.env` files (add to `.gitignore`) or your IDE's secrets management.

## Development

```bash
npm install              # Install dependencies
npm start                # Run in stdio mode
npm run start:http       # Run in HTTP mode
npm test                 # Run basic tests
npm run test:full        # Run all tests including HTTP transport
npm run list-tools       # List available tools
```

**Run without installation:**
```bash
npx infura-mcp-server --help    # Show available commands
```

### Docker

```bash
npm run docker:build     # Build image
npm run docker:run       # Run in stdio mode
npm run docker:run:http  # Run in HTTP mode
npm run docker:compose:up    # Start with docker-compose (HTTP)
npm run docker:compose:down  # Stop containers
```

## Troubleshooting

**API key not working** - Verify your key at the [MetaMask Developer Dashboard](https://developer.metamask.io/)

**Network not supported** - Check the [Supported Networks](#supported-networks) list and verify spelling

**Tool not responding** - Restart your MCP client and verify configuration JSON syntax

**Rate limit exceeded** - Upgrade your Infura plan for higher limits, or wait 60 seconds

**Connection refused (HTTP mode)** - Check that `ALLOWED_HOSTS` includes your hostname

**CORS errors (HTTP mode)** - Add your origin to `CORS_ALLOWED_ORIGINS`

For detailed API documentation, see [Infura docs](https://docs.metamask.io/services/). For bugs or feature requests, open a [GitHub issue](https://github.com/Qbandev/infura-mcp-server/issues).

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details.
