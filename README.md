# Infura MCP Server

A Model Context Protocol (MCP) server implementation that provides comprehensive Ethereum blockchain access through Infura's infrastructure. Connect Claude Desktop, VS Code, and other MCP clients to 29 read-only Ethereum JSON-RPC tools across 21+ networks.

## Features

- **29 read-only Ethereum JSON-RPC tools** - Complete blockchain query suite
- **Multi-network support** - 21+ networks including Ethereum, Polygon, Arbitrum, Base, Optimism
- **Enterprise security** - 9.5/10 security rating with comprehensive CI/CD protection
- **Real-time data** - Direct access to Infura's blockchain infrastructure
- **AI-optimized** - Comprehensive LLM context for expert blockchain guidance
- **Production ready** - 100% test coverage with real API validation

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

### Primary Networks
- **mainnet** - Ethereum Mainnet
- **sepolia** - Ethereum Sepolia Testnet
- **polygon-mainnet** - Polygon Mainnet
- **arbitrum-mainnet** - Arbitrum One
- **base-mainnet** - Base Mainnet
- **optimism-mainnet** - Optimism Mainnet

### Additional Networks
- **avalanche-mainnet**, **avalanche-fuji** - Avalanche C-Chain
- **bsc-mainnet**, **bsc-testnet** - Binance Smart Chain
- **celo-mainnet**, **celo-alfajores** - Celo
- **linea-mainnet**, **linea-sepolia** - Linea
- **mantle-mainnet**, **mantle-sepolia** - Mantle
- **palm-mainnet**, **palm-testnet** - Palm
- **scroll-mainnet**, **scroll-sepolia** - Scroll
- **starknet-mainnet**, **starknet-sepolia** - Starknet
- **zksync-mainnet**, **zksync-sepolia** - ZKsync Era
- **blast-mainnet**, **blast-sepolia** - Blast
- **opbnb-mainnet**, **opbnb-testnet** - opBNB
- **swellchain-mainnet**, **swellchain-testnet** - Swellchain
- **unichain-mainnet**, **unichain-sepolia** - Unichain

## Configuration

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

#### npx
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

#### docker
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

#### npx
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

#### docker
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
2. Type "MCP: Configure Servers" 
3. Add the JSON configuration above
4. Restart Cursor to activate the MCP server
5. Start using blockchain tools in your AI conversations!

### Usage with VS Code

For quick installation, click one of the installation buttons below...

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22infura-mcp-server%22%5D%2C%22env%22%3A%7B%22INFURA_API_KEY%22%3A%22your_infura_api_key_here%22%7D%7D)

[![Install with NPX in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-NPM-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22infura-mcp-server%22%5D%2C%22env%22%3A%7B%22INFURA_API_KEY%22%3A%22your_infura_api_key_here%22%7D%7D&quality=insiders)

[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22--rm%22%2C%22-i%22%2C%22-e%22%2C%22INFURA_API_KEY%3Dyour_infura_api_key_here%22%2C%22ghcr.io%2Fqbandev%2Finfura-mcp-server%3Alatest%22%5D%7D)

[![Install with Docker in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Docker-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=infura-mcp-server&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22--rm%22%2C%22-i%22%2C%22-e%22%2C%22INFURA_API_KEY%3Dyour_infura_api_key_here%22%2C%22ghcr.io%2Fqbandev%2Finfura-mcp-server%3Alatest%22%5D%7D&quality=insiders)

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

## Usage Examples

### Getting Started

1. **Get your Infura API key** at [infura.io](https://infura.io)
2. **Configure your MCP client** (Claude Desktop, Cursor, or VS Code) using the examples above
3. **Start exploring blockchain data** with AI assistance

### Cursor-Specific Usage

Once configured in Cursor, you can interact with blockchain data directly in your AI conversations:

```javascript
// In Cursor's AI chat, ask:
"What's the current gas price on Ethereum mainnet?"
"Show me the balance of this wallet: 0x742d35Cc6E99043Ed1287354E1e3E19b61FC0B72"
"Help me analyze this smart contract on Polygon"
"Compare gas fees across Ethereum, Arbitrum, and Base networks"
```

**Cursor Integration Benefits:**
- **Code context awareness** - AI understands your blockchain project structure
- **Inline suggestions** - Get blockchain data while coding smart contracts
- **Multi-file analysis** - Analyze contracts across your entire project
- **Network switching** - Easily switch between mainnet, testnets, and L2s

### Common Use Cases

#### Check Account Balance
```javascript
// Ask your AI assistant:
"What's the ETH balance of vitalik.eth?"
// Uses: eth_getBalance with ENS resolution
```

#### Analyze Smart Contracts
```javascript  
// Ask your AI assistant:
"Show me the total supply of USDC and estimate gas for a transfer"
// Uses: eth_call for contract data, eth_estimateGas for cost analysis
```

#### Monitor Gas Prices
```javascript
// Ask your AI assistant:
"What's the current gas price and fee history?"
// Uses: eth_gasPrice, eth_getFeeHistory for optimization insights
```

#### Cross-Chain Analysis
```javascript
// Ask your AI assistant:
"Compare this contract address across Ethereum, Polygon, and Arbitrum"
// Uses: Multi-network eth_getCode, eth_call queries
```

#### Transaction Debugging
```javascript
// Ask your AI assistant:
"Why did this transaction fail and what was the gas used?"
// Uses: eth_getTransactionReceipt, eth_getTransactionByHash for analysis
```

### Network-Specific Usage

#### Polygon Operations
```bash
# Set network via environment variable
INFURA_NETWORK=polygon-mainnet npx infura-mcp-server
```

#### Arbitrum Analysis  
```bash
# Configure for Arbitrum
INFURA_NETWORK=arbitrum-mainnet npx infura-mcp-server
```

#### Multi-Network Queries
```javascript
// AI assistants can automatically query multiple networks
"Check if this contract exists on mainnet, Polygon, and Base"
```

## 📚 AI Assistant & Developer Resources

### LLM Context Document
This project includes a comprehensive **LLM Context Document** (600+ lines) that transforms AI assistants into blockchain experts:

- **📖 Full Context**: `.cursor/rules/infura-mcp-server-llm-context.md`
- **📋 Summary**: `docs/llm-context-summary.md`

**Key Features:**
- 35 Ethereum JSON-RPC tools usage patterns
- Blockchain concepts explanations  
- Security best practices
- Multi-network guidance (21+ networks)
- Common troubleshooting scenarios

**For AI Assistants:** Enables expert-level blockchain interactions while educating users about Ethereum, DeFi, and gas optimization.

**For Developers:** Reference for adding tools, updating documentation, and maintaining blockchain accuracy.

## Environment Variables

- **`INFURA_API_KEY`** (required) - Your Infura API key from [infura.io](https://infura.io)
- **`INFURA_NETWORK`** (optional) - Target network (default: mainnet)
- **`DEBUG`** (optional) - Enable debug logging

## Building

### Docker
```bash
docker build -t infura-mcp-server .
```

### NPM
```bash
npm install
npm test
npm run build
```

## Testing

The server includes comprehensive testing with 100% tool validation:

```bash
# Basic validation
npm test

# Comprehensive tool testing (requires API key)
INFURA_API_KEY=your_key npm run test:comprehensive

# Full test suite including integration tests
INFURA_API_KEY=your_key npm run test:full
```

## Troubleshooting

### Common Issues

**"API key not working"**
- Verify your `INFURA_API_KEY` is valid at [infura.io](https://infura.io/dashboard)
- Check the environment variable is properly set

**"Network not supported"**
- Use the `INFURA_NETWORK` environment variable
- Refer to the supported networks list above

**"Tool not responding"**
- Restart your MCP client (Claude Desktop, VS Code)
- Verify the configuration JSON syntax
- Check the server logs for specific errors

**"Rate limit exceeded"**
- Upgrade your Infura plan for higher limits
- Implement delays between rapid requests
- Use caching for frequently accessed data

### Getting Help

1. Check the [LLM context document](.cursor/rules/infura-mcp-server-llm-context.md) for detailed guidance
2. Review the [test documentation](test/README.md) for examples
3. Visit [Infura documentation](https://docs.infura.io/) for API details
4. Open an issue on GitHub for bugs or feature requests

## 🔐 Security

### API Key Security
- **Never hardcode** API keys in configuration files
- **Monitor API usage** in your Infura dashboard regularly
- **Rotate keys** for production environments

### 🛡️ Built-in Security Features
- ✅ **Required parameter validation** - validates presence of required parameters
- ✅ **No arbitrary code execution** - only predefined Ethereum JSON-RPC methods
- ✅ **HTTPS/TLS encryption** for all Infura connections
- ✅ **Local execution** by default (stdio mode, no network exposure)
- ✅ **Read-only operations** - server can never modify blockchain state


## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Transform your AI into a blockchain expert with comprehensive Ethereum data access!** 🚀

