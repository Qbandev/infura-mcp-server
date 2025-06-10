# Infura MCP Server

Connect Claude Desktop and you IDE (Cursor or VSCode) to Ethereum blockchain data through Infura's API.

## 🚀 Quick Start

### 1. Get Your Infura API Key

Sign up at [infura.io](https://infura.io) and create a new API key for Web3 API.

### 2. Setup you MCP configuration

Add to your MCP config file:

```json
{
  "mcpServers": {
    "Infura MCP Server": {
      "command": "npx",
      "args": ["infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here"
      }
    }
  }
}
```

### 3. Available tools and networks

![Cursor MCP Setup](img/cursor-mcp.jpg)

**Primary Networks**: `mainnet`, `optimism-mainnet`, `arbitrum-mainnet`, `polygon-mainnet`, `base-mainnet`, `sepolia`

**Additional Infura Networks**: `avalanche-mainnet`, `bsc-mainnet`, `celo-mainnet`, `linea-mainnet`, `mantle-mainnet`, `palm-mainnet`, `scroll-mainnet`, `starknet-mainnet`, `zksync-mainnet`, and [many more](https://docs.metamask.io/services/get-started/endpoints/)

### 4. Docker Setup (Alternative)

You can also run the MCP server using Docker:

```bash
# Pull the latest image
docker pull ghcr.io/qbandev/infura-mcp-server:latest
```

Add to your MCP config file:

```json
{
  "mcpServers": {
    "Infura MCP Server": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "INFURA_API_KEY=your_infura_api_key_here",
        "-e", "INFURA_NETWORK=mainnet",
        "ghcr.io/qbandev/infura-mcp-server:latest"
      ]
    }
  }
}
```

## ✨ What You Can Do

![Cursor Chat with Infura MCP](img/cursor-chat.jpg)

Once connected, ask Claude or Cursor to:

- **View available tools**: "What Ethereum tools do you have available?"
- **Check balances**: "What's the ETH balance of vitalik.eth?"
- **Get transaction details**: "Show me transaction 0x123..."
- **Read smart contracts**: "Call the balanceOf function on USDC contract"
- **Analyze blocks**: "What transactions were in the latest block?"
- **Estimate gas**: "How much gas would this transaction cost?"
- **Get network info**: "What's the current gas price on Polygon mainnet?"

## 🔧 Troubleshooting

### Not Working?

1. Restart Claude or the IDE after configuration
2. Check your API key is valid at [infura.io](https://infura.io/dashboard)
3. Verify the config file path and JSON formatting

---

**Ready to explore Blockchain with AI?** Just install and start asking questions! 🎯

