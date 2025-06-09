# Infura MCP Server

Connect Claude Desktop and Cursor to Ethereum blockchain data through Infura's API.

## 🚀 Quick Start

### 1. Get Your Infura API Key

Sign up at [infura.io](https://infura.io) and create a new API key for Web3 API.

### 2. Setup for Claude Desktop

Add to your Claude Desktop config file:

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

### 3. Setup for Cursor

Add to your Cursor MCP settings:

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

### 4. Choose Your Network (Optional)

By default, connects to Ethereum Mainnet. To use other networks:

```json
{
  "mcpServers": {
    "Infura MCP Server": {
      "command": "npx",
      "args": ["infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here",
        "INFURA_NETWORK": "polygon-mainnet"
      }
    }
  }
}
```

**Primary Networks**: `mainnet`, `optimism-mainnet`, `arbitrum-mainnet`, `polygon-mainnet`, `base-mainnet`, `sepolia`

**Additional Infura Networks**: `avalanche-mainnet`, `bsc-mainnet`, `celo-mainnet`, `linea-mainnet`, `mantle-mainnet`, `palm-mainnet`, `scroll-mainnet`, `starknet-mainnet`, `zksync-mainnet`, and [many more](https://docs.metamask.io/services/get-started/endpoints/)

## ✨ What You Can Do

Once connected, ask Claude or Cursor to:

- **Check balances**: "What's the ETH balance of vitalik.eth?"
- **Get transaction details**: "Show me transaction 0x123..."
- **Read smart contracts**: "Call the balanceOf function on USDC contract"
- **Analyze blocks**: "What transactions were in the latest block?"
- **Estimate gas**: "How much gas would this transaction cost?"
- **Get network info**: "What's the current gas price?"

## 🔧 Troubleshooting

### Claude Desktop Not Working?

1. Restart Claude Desktop after configuration
2. Check your API key is valid at [infura.io](https://infura.io/dashboard)
3. Verify the config file path and JSON formatting

### Need Help?

- View available tools: Ask "What Ethereum tools do you have available?"
- Check connection: Ask "Can you check the current block number?"

## 📚 Examples

```
"Get the balance of 0x742A4c... address"
"What's in block 18500000?"
"Call the totalSupply function on contract 0x123..."
"Get transaction receipt for 0xabc..."
"What's the current gas price on Polygon?"
```

---

**Ready to explore Ethereum with AI?** Just install and start asking questions! 🎯

