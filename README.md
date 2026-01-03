# Infura MCP Server

A Model Context Protocol (MCP) server that connects AI assistants to 30+ blockchain networks through Infura's infrastructure. Query blocks, transactions, smart contracts, and accounts across Ethereum, Polygon, Arbitrum, Base, Avalanche, BNB Chain, and more using natural language.

## Features

**29 JSON-RPC tools** - Complete blockchain query suite for accounts, blocks, transactions, smart contracts, logs, and network data.

**30+ networks** - EVM-compatible chains including Ethereum mainnet/testnets, Layer 2 solutions (Arbitrum, Base, Optimism, Polygon, Linea, Scroll, ZKsync), and alternative L1s (Avalanche, BNB Chain, Celo, Starknet).

**AI-optimized** - Built for Claude Desktop, Cursor, and VS Code with comprehensive context that helps AI provide expert blockchain guidance.

**Flexible deployment** - Stdio mode for desktop integration or Streamable HTTP for web applications.

## Available Tools

**Account & Balance** (3 tools) - Query balances, contract bytecode, and transaction counts

**Blocks** (7 tools) - Retrieve block data, uncle blocks, and latest block numbers

**Transactions** (6 tools) - Access transaction details, receipts, and logs by hash or block position

**Smart Contracts** (3 tools) - Execute read-only calls, estimate gas, and read storage slots

**Logs** (1 tool) - Query contract event logs with flexible filtering

**Network Info** (5 tools) - Chain ID, peer count, client version, and network status

**Gas & Fees** (4 tools) - Current gas prices, fee history, protocol version, and sync status

## Supported Networks

Access 30+ networks across 18 blockchain ecosystems via MetaMask/Infura infrastructure. See [complete network documentation](https://docs.metamask.io/services/get-started/endpoints/).

**Ethereum**: mainnet, sepolia, holesky

**Layer 2**: Arbitrum, Base, Blast, Linea, Mantle, Optimism, Polygon, Scroll, ZKsync Era

**Alternative L1**: Avalanche, BNB Chain, Celo, opBNB, Palm, Starknet, Swellchain, Unichain

Set your target network using the `INFURA_NETWORK` environment variable (defaults to `mainnet`).

## Quick Start

1. Get your Infura API key from the [MetaMask Developer Portal](https://developer.metamask.io/)
2. Install via npx or Docker (see configuration below)
3. Start querying blockchain data through your AI assistant

### Configuration

**Environment Variables**
- `INFURA_API_KEY` (required) - Your Infura API key
- `INFURA_NETWORK` (optional) - Target network (default: mainnet)
- `DEBUG` (optional) - Enable debug logging

### Claude Desktop / Cursor

Add to `claude_desktop_config.json` or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "infura-mcp-server": {
      "command": "npx",
      "args": ["infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here",
        "INFURA_NETWORK": "mainnet"
      }
    }
  }
}
```

### VS Code

Quick install: [![NPX](https://img.shields.io/badge/Install-NPX-0098FF?style=flat-square&logo=visualstudiocode)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22infura-mcp-server%22%5D%2C%22env%22%3A%7B%22INFURA_API_KEY%22%3A%22your_infura_api_key_here%22%7D%7D)

Or manually add to User Settings (JSON) or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "infura-mcp-server": {
        "command": "npx",
        "args": ["infura-mcp-server"],
        "env": {
          "INFURA_API_KEY": "your_infura_api_key_here"
        }
      }
    }
  }
}
```

### Docker

```json
{
  "command": "docker",
  "args": [
    "run", "--rm", "-i",
    "-e", "INFURA_API_KEY=your_key",
    "-e", "INFURA_NETWORK=mainnet",
    "ghcr.io/qbandev/infura-mcp-server:latest"
  ]
}
```

### HTTP Mode (Web Deployments)

```bash
npm run start:http
# Endpoints: http://localhost:3001/mcp (main) | http://localhost:3001/health
```

## Usage

Once configured, ask your AI assistant natural language questions about blockchain data:

![Cursor Chat with Infura MCP](img/cursor-chat.jpg)

The AI will automatically use the appropriate tools to query balances, transactions, smart contracts, and more across any supported network. Get contextual insights, multi-network comparisons, and learn blockchain concepts through conversation.

## Development

```bash
npm install              # Install dependencies
npm start                # Run in stdio mode
npm run start:http       # Run in HTTP mode
npm test                 # Run basic tests
npm run test:full        # Run all tests including HTTP transport
npm run list-tools       # List available tools
```

## Troubleshooting

**API key not working** - Verify your key at the [MetaMask Developer Dashboard](https://developer.metamask.io/)

**Network not supported** - Check the supported networks list and set `INFURA_NETWORK` correctly

**Tool not responding** - Restart your MCP client and verify configuration JSON syntax

**Rate limit exceeded** - Upgrade your Infura plan for higher limits

For detailed API documentation, see [Infura docs](https://docs.metamask.io/services/). For bugs or feature requests, open a GitHub issue.

## Security

**Built-in protections**: Parameter validation, read-only operations, HTTPS/TLS encryption, local execution by default, no arbitrary code execution.

**API key management**: Store keys in environment variables, use separate keys for dev/prod, monitor usage via MetaMask Developer Dashboard.

**Publishing**: This package uses npm Trusted Publishing with OIDC and provenance attestations for supply chain security.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details.
