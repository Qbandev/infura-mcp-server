# Infura MCP Server

A Model Context Protocol (MCP) server implementation that provides comprehensive Ethereum blockchain access through Infura's infrastructure. Connect Claude Desktop, VS Code, Cursor, and other MCP clients to 29 read-only Ethereum JSON-RPC tools across 30+ networks.

## What's New in v0.3.0

- **Streamable HTTP Transport**: Migrated from deprecated SSE to the new Streamable HTTP transport (2025 MCP spec)
- **Improved Session Management**: Better handling of multiple concurrent sessions
- **Enhanced Security**: npm provenance attestation for package integrity
- **Backward Compatibility**: Legacy SSE endpoint still available for older clients

## Features

- **29 read-only Ethereum JSON-RPC tools** - Complete blockchain query suite
- **Multi-network support** - 30+ networks including Ethereum, Polygon, Arbitrum, Base, Optimism
- **Real-time data** - Direct access to Infura's blockchain infrastructure
- **AI-optimized** - Comprehensive LLM context for expert blockchain guidance
- **Dual Transport** - Streamable HTTP (recommended) and stdio modes

## Tools

### Account & Balance Tools (3)
- **eth_getBalance** - Get account balance in wei
- **eth_getCode** - Get contract bytecode  
- **eth_getTransactionCount** - Get account nonce/transaction count

### Block Tools (7)
- **eth_getBlockNumber** - Get latest block number
- **eth_getBlockByHash** - Get block details by hash
- **eth_getBlockByNumber** - Get block details by number
- **eth_getUncleByBlockHashAndIndex** - Get uncle block by hash and index
- **eth_getUncleByBlockNumberAndIndex** - Get uncle block by number and index
- **eth_getUncleCountByBlockHash** - Count uncle blocks by hash
- **eth_getUncleCountByBlockNumber** - Count uncle blocks by number

### Transaction Tools (6)
- **eth_getBlockTransactionCountByHash** - Count transactions in block by hash
- **eth_getBlockTransactionCountByNumber** - Count transactions in block by number
- **eth_getTransactionByBlockHashAndIndex** - Get transaction by block hash and index
- **eth_getTransactionByBlockNumberAndIndex** - Get transaction by block number and index
- **eth_getTransactionByHash** - Get transaction details by hash
- **eth_getTransactionReceipt** - Get transaction receipt and logs

### Smart Contract Tools (3)
- **eth_call** - Execute read-only contract call
- **eth_estimateGas** - Estimate gas cost for transaction
- **eth_getStorageAt** - Read contract storage slot

### Network Tools (5)
- **eth_chainId** - Get network chain ID
- **net_isListening** - Check if client is listening for connections
- **net_getPeerCount** - Get number of connected peers
- **net_getVersion** - Get network ID
- **web3_getClientVersion** - Get client version string

### Log Query Tools (1)
- **eth_getLogs** - Get logs with flexible filtering

### Utility Tools (4)
- **eth_getFeeHistory** - Get historical gas fee data (EIP-1559)
- **eth_getGasPrice** - Get current gas price
- **eth_getProtocolVersion** - Get Ethereum protocol version
- **eth_isSyncing** - Check node synchronization status

## Network Support

The Infura MCP Server supports **all networks available through MetaMask/Infura infrastructure** - providing access to 30+ network endpoints across 18 blockchain ecosystems.

*For complete network details and endpoints, see: [MetaMask Developer Documentation](https://docs.metamask.io/services/get-started/endpoints/)*

### Primary Ethereum Networks
- **mainnet** - Ethereum Mainnet
- **sepolia** - Ethereum Sepolia Testnet  
- **holesky** - Ethereum Holesky Testnet

### Layer 2 & Scaling Solutions
- **arbitrum-mainnet**, **arbitrum-sepolia** - Arbitrum One & Testnet
- **base-mainnet**, **base-sepolia** - Base (Coinbase) & Testnet
- **blast-mainnet**, **blast-sepolia** - Blast & Testnet
- **linea-mainnet**, **linea-sepolia** - Linea (MetaMask) & Testnet
- **mantle-mainnet**, **mantle-sepolia** - Mantle & Testnet
- **optimism-mainnet**, **optimism-sepolia** - Optimism & Testnet
- **polygon-mainnet**, **polygon-amoy** - Polygon PoS & Testnet
- **scroll-mainnet**, **scroll-sepolia** - Scroll & Testnet
- **zksync-mainnet**, **zksync-sepolia** - ZKsync Era & Testnet

### Alternative Layer 1 Networks
- **avalanche-mainnet**, **avalanche-fuji** - Avalanche C-Chain & Testnet
- **bsc-mainnet**, **bsc-testnet** - BNB Smart Chain & Testnet
- **celo-mainnet**, **celo-alfajores** - Celo & Testnet
- **opbnb-mainnet**, **opbnb-testnet** - opBNB (Binance Layer 2) & Testnet
- **palm-mainnet**, **palm-testnet** - Palm (NFT-focused) & Testnet
- **starknet-mainnet**, **starknet-sepolia** - Starknet & Testnet
- **swellchain-mainnet**, **swellchain-testnet** - Swellchain & Testnet
- **unichain-mainnet**, **unichain-sepolia** - Unichain (Uniswap) & Testnet

## Configuration

### Environment Variables

- **`INFURA_API_KEY`** (required) - Your Infura API key from [MetaMask Developer Portal](https://developer.metamask.io/)
- **`INFURA_NETWORK`** (optional) - Target network (default: mainnet)
- **`DEBUG`** (optional) - Enable debug logging

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

#### npx (Recommended)
```json
{
  "mcpServers": {
    "infura-mcp-server": {
      "command": "npx",
      "args": [
        "infura-mcp-server"
      ],
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here"
      }
    }
  }
}
```

#### Docker
```json
{
  "mcpServers": {
    "infura-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "INFURA_API_KEY=your_infura_api_key_here",
        "-e",
        "INFURA_NETWORK=mainnet",
        "ghcr.io/qbandev/infura-mcp-server:latest"
      ]
    }
  }
}
```

### Usage with Cursor

Add this to your Cursor MCP configuration file (`.cursor/mcp.json` in your workspace or global settings):

#### npx (Recommended)
```json
{
  "mcpServers": {
    "infura-mcp-server": {
      "command": "npx",
      "args": [
        "infura-mcp-server"
      ],
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here"
      }
    }
  }
}
```

#### Docker
```json
{
  "mcpServers": {
    "infura-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "INFURA_API_KEY=your_infura_api_key_here",
        "-e",
        "INFURA_NETWORK=mainnet",
        "ghcr.io/qbandev/infura-mcp-server:latest"
      ]
    }
  }
}
```

**To configure in Cursor:**
1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type "Open MCP Settings" 
3. Add the JSON configuration above
4. Restart Cursor to activate the MCP server
5. Start using blockchain tools in your AI conversations!

### Usage with VS Code

For quick installation, click one of the installation buttons below...

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22infura-mcp-server%22%5D%2C%22env%22%3A%7B%22INFURA_API_KEY%22%3A%22your_infura_api_key_here%22%7D%7D)

[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22--rm%22%2C%22-i%22%2C%22-e%22%2C%22INFURA_API_KEY%3Dyour_infura_api_key_here%22%2C%22ghcr.io%2Fqbandev%2Finfura-mcp-server%3Alatest%22%5D%7D)

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open Settings (JSON)`. Optionally, you can add it to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others.

> Note that the `mcp` key is not needed in the `.vscode/mcp.json` file.

For NPX installation:
```json
{
  "mcp": {
    "servers": {
      "infura-mcp-server": {
        "command": "npx",
        "args": [
          "infura-mcp-server"
        ],
        "env": {
          "INFURA_API_KEY": "your_infura_api_key_here"
        }
      }
    }
  }
}
```

For Docker installation:
```json
{
  "mcp": {
    "servers": {
      "infura-mcp-server": {
        "command": "docker",
        "args": [
          "run",
          "--rm",
          "-i",
          "-e",
          "INFURA_API_KEY=your_infura_api_key_here",
          "ghcr.io/qbandev/infura-mcp-server:latest"
        ]
      }
    }
  }
}
```

### Web Deployment (Streamable HTTP)

For web applications and remote deployments, use the Streamable HTTP transport:

```bash
# Start in HTTP mode
npm run start:http

# Or with Docker
docker run -p 3001:3001 -e INFURA_API_KEY=your_key ghcr.io/qbandev/infura-mcp-server:latest node mcpServer.js --http
```

Connect your MCP client to:
- **Streamable HTTP**: `http://localhost:3001/mcp` (recommended)
- **Legacy SSE**: `http://localhost:3001/sse` (deprecated)
- **Health Check**: `http://localhost:3001/health`

## Usage Examples

### Getting Started

1. **Get your Infura API key** at [MetaMask Developer Portal](https://developer.metamask.io/)
2. **Configure your MCP client** (Claude Desktop, Cursor, or VS Code) using the examples above
3. **Start exploring blockchain data** with AI assistance

### AI Assistant Conversations

Once configured, you can have natural blockchain conversations with AI assistants in Claude Desktop, Cursor, or VS Code:

![Cursor Chat with Infura MCP](img/cursor-chat.jpg)

**Key Benefits:**
- **Contextual insights** - AI explains what the data means and provides actionable advice
- **Multi-network analysis** - Seamlessly compare data across different blockchain networks  
- **Educational guidance** - Learn blockchain concepts through natural conversation

## Development

```bash
# Install dependencies
npm install

# Run in stdio mode (default)
npm start

# Run in HTTP mode (Streamable HTTP)
npm run start:http

# Run tests
npm test

# Run all tests including HTTP transport
npm run test:full

# List available tools
npm run list-tools
```

## Testing

The project includes comprehensive tests for all 29 tools and transport modes:

```bash
# Run basic validation tests
npm test

# Run comprehensive tool validation
npm run test:comprehensive

# Run HTTP transport tests
npm run test:http

# Run integration tests (requires INFURA_API_KEY)
npm run test:integration

# Run all tests
npm run test:full
```

## Troubleshooting

### Common Issues

**"API key not working"**
- Verify your `INFURA_API_KEY` is valid at [MetaMask Developer Dashboard](https://developer.metamask.io/)
- Check the environment variable is properly set

**"Network not supported"**
- Use the `INFURA_NETWORK` environment variable
- Refer to the supported networks list above

**"Tool not responding"**
- Restart your MCP client (Claude Desktop, VS Code)
- Verify the configuration JSON syntax

**"Rate limit exceeded"**
- Upgrade your Infura plan for higher limits

### Getting Help

1. Visit [Infura documentation](https://docs.metamask.io/services/) for API details
2. Open an issue on GitHub for bugs or feature requests

## 🔐 Security

### 🛡️ Built-in Security Features
- ✅ **Required parameter validation** - validates presence of required parameters
- ✅ **No arbitrary code execution** - only predefined Ethereum JSON-RPC methods
- ✅ **HTTPS/TLS encryption** for all Infura connections
- ✅ **Local execution** by default (stdio mode, no network exposure)
- ✅ **Read-only operations** - server can never modify blockchain state
- ✅ **npm provenance** - package integrity verification with OIDC trusted publishing

### 🔑 API Key Security
- Store your `INFURA_API_KEY` in environment variables, never in code
- Use environment-specific API keys for development and production
- Monitor your API key usage in the MetaMask Developer Dashboard

### 📦 npm Publishing Security (Dec 2025+)
This package uses [npm Trusted Publishing with OIDC](https://docs.npmjs.com/trusted-publishers/) for secure releases:
- No long-lived npm tokens stored in secrets
- Provenance attestations verify build authenticity
- Compliant with [npm's Dec 2025 security changes](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

---

**Transform your AI into a blockchain expert with comprehensive Ethereum data access!** 🚀
