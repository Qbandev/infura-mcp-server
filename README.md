# Infura MCP Server

Welcome to your Infura MCP server! 🚀 This project provides a ready-to-use [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that exposes the Infura Ethereum JSON-RPC API as a set of tools for Large Language Models like Claude and Cursor.


## Getting Started

### Prerequisites

Before starting, please ensure you have:

- [Node.js (v18+ required, v20+ recommended)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (included with Node)
- An [Infura account](https://www.infura.io/register) and API key.

### Installation & Setup

**1. Clone the repository**

```sh
git clone https://github.com/qbandev/infura-mcp-server.git
cd infura-mcp-server
```

**2. Install dependencies**

Run from your project's root directory:

```sh
npm install
```

**3. Set your Infura API Key**

This project uses a `.env` file to manage your Infura API key.

First, copy the example file:

```sh
cp .env.example .env
```

Then, open the `.env` file and add your Infura API key:

```
INFURA_API_KEY="your_infura_api_key_here"
```

This environment variable is used by the server to authenticate with the Infura API.

## Running the Server

You can run the server in two modes:

**1. Standard I/O (for most MCP clients like Claude Desktop and Cursor)**

```sh
npm start
```

**2. Server-Sent Events (SSE) (for web-based clients)**

```sh
npm run start:sse
```

When running in SSE mode, the server will be available at `http://localhost:3001`.

## 🧪 Testing the SSE Server

To verify that your SSE server is working correctly, you can use the included test script:

**1. Install testing dependencies**

```sh
npm install
```

**2. Start the SSE server**

```sh
npm run start:sse
```

**3. In another terminal, run the test script**

```sh
npm run test:sse
```

The test script will:
- Connect to the SSE endpoint
- Establish a session
- Send initialize and initialized messages
- List available tools
- Test calling a tool
- Verify the complete MCP flow

If everything is working correctly, you should see output like:

```
🧪 Testing MCP SSE Server...

📡 Connecting to SSE endpoint...
✅ SSE connection opened
✅ Received endpoint: /messages
✅ Received sessionId: 12345678-1234-1234-1234-123456789abc

📨 Sending initialize request...
✅ Initialize response: { ... }

📨 Sending initialized notification...
✅ Initialized notification sent successfully

📨 Listing tools...
✅ Tools response: { ... }

📨 Testing tool: eth_getBlockNumber...
✅ Tool response: { ... }

🎉 Test completed successfully!
```

### Manual Testing with curl

You can also test the SSE server manually using curl:

**1. Start the SSE server**

```sh
npm run start:sse
```

**2. Connect to the SSE endpoint to get a session ID**

```sh
curl -N http://localhost:3001/sse
```

You should see output like:
```
event: endpoint
data: /messages

event: sessionId
data: 12345678-1234-1234-1234-123456789abc
```

**3. Use the sessionId to send messages**

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' \
  "http://localhost:3001/messages?sessionId=YOUR_SESSION_ID_HERE"
```

Replace `YOUR_SESSION_ID_HERE` with the sessionId you received from step 2.

## 📦 Automated Publishing & Releases

This package includes automated GitHub workflows for publishing. You can easily create new releases using the built-in automation scripts.

**1. Automated Release (Recommended)**

Use the automated release scripts to trigger GitHub workflows:

```sh
# Create a patch release (0.1.0 → 0.1.1)
npm run release:patch

# Create a minor release (0.1.0 → 0.2.0)  
npm run release:minor

# Create a major release (0.1.0 → 1.0.0)
npm run release:major

# Create a beta prerelease (0.1.0 → 0.1.1-beta.0)
npm run release:beta

# Create an alpha prerelease (0.1.0 → 0.1.1-alpha.0)
npm run release:alpha
```

The automation will:
- ✅ Run all tests
- ✅ Bump version in package.json
- ✅ Create git tag
- ✅ Create GitHub release
- ✅ Automatically publish to npm

**2. Manual Publishing (Advanced)**

If you prefer manual control, you can still publish directly:

```sh
npm publish
```

**2. Running with NPX**

Once published, anyone can run your MCP server directly using `npx`:

```sh
npx infura-mcp-server
```

Or for SSE mode:

```sh
npx infura-mcp-server --sse
```

## 🤖 Release Automation

### Prerequisites

- [GitHub CLI](https://cli.github.com/) installed and authenticated (`gh auth login`)
- NPM_TOKEN secret configured in GitHub repository (see `.github/SETUP.md`)
- **Security**: Only repository owner can trigger releases (see `.github/SECURITY.md`)

### Available Release Commands

| Command | Description | Version Change |
|---------|-------------|----------------|
| `npm run release:patch` | Bug fixes and patches | 0.1.0 → 0.1.1 |
| `npm run release:minor` | New features (backwards compatible) | 0.1.0 → 0.2.0 |
| `npm run release:major` | Breaking changes | 0.1.0 → 1.0.0 |
| `npm run release:beta` | Beta prerelease | 0.1.0 → 0.1.1-beta.0 |
| `npm run release:alpha` | Alpha prerelease | 0.1.0 → 0.1.1-alpha.0 |

### Manual Workflow Trigger

You can also trigger releases using the scripts directly:

```sh
# Bash script (macOS/Linux)
./scripts/release.sh patch
./scripts/release.sh minor
./scripts/release.sh prerelease beta

# Node.js script (cross-platform)
node scripts/release.js patch
node scripts/release.js minor  
node scripts/release.js prerelease beta
```

### What Happens During Release

1. **Validation**: Checks GitHub CLI authentication and current version
2. **Confirmation**: Prompts for confirmation before proceeding
3. **Workflow Trigger**: Triggers the GitHub Release workflow
4. **Automated Process**: 
   - Runs comprehensive tests
   - Bumps version in package.json
   - Creates git tag
   - Generates GitHub release with changelog
   - Publishes to npm registry
5. **Monitoring**: Provides links to monitor progress

## 🔒 Release Security

**Only the repository owner (`Qbandev`) can trigger releases.**

### Security Features:
- ✅ **Authorization verification** before every release
- ✅ **User identity validation** against authorized list  
- ✅ **Audit logging** of all release attempts
- ✅ **Fail-safe design** - unauthorized users cannot bypass security
- ✅ **GPG signed commits** required

### How it works:
1. Release workflow starts with authorization check
2. Compares triggering user against repository owner
3. Only proceeds if authorized, fails immediately otherwise
4. Logs all attempts for security audit

For full security details, see **[`.github/SECURITY.md`](.github/SECURITY.md)**

## 🛠️ Available Tools

This server exposes **40 comprehensive tools** for interacting with the Infura Ethereum JSON-RPC API across multiple networks. To see a full list of available tools, their descriptions, and parameters, run:

```sh
npm run list-tools
```

Example output:

```
Available Tools:

  eth getBlockNumber (technical name: eth_getBlockNumber)
    Description: Fetch the latest block number from a specified Ethereum network.
    Parameters:
      - network: The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.

  eth getBalance (technical name: eth_getBalance)
    Description: Get the balance of an Ethereum account on a specified network.
    Parameters:
      - address: The Ethereum address to check the balance for.
      - tag: The block parameter to use.
      - network: The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.

  eth getGasPrice (technical name: eth_getGasPrice)
    Description: Fetch the current gas price from a specified Infura Ethereum network.
    Parameters:
      - network: The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.
[... and 37 more tools]
```

### 🌐 Supported Networks

The server supports multiple Ethereum networks through Infura:
- **Ethereum Mainnet** (`mainnet`)
- **Optimism** (`optimism-mainnet`)
- **Arbitrum** (`arbitrum-mainnet`)  
- **Polygon** (`polygon-mainnet`)
- **Base** (`base-mainnet`)
- **Sepolia Testnet** (`sepolia`)
- And more!

## 👩‍💻 Connect the MCP Server to Claude/Cursor

You can connect your MCP server to any MCP client. Here we provide instructions for connecting it to Claude Desktop and Cursor.

### For Local Development (Recommended)

**Step 1**: Get the absolute path to your project's `mcpServer.js` file:

```sh
realpath mcpServer.js
```

**Step 2**: Get the absolute path to your `node` executable:
```sh
which node
```
Ensure your node version is v18+.

**Step 3**: Open your MCP client settings and add the server configuration:

**For Claude Desktop** → **Settings** → **Developers** → **Edit Config**:

```json
{
  "mcpServers": {
    "Infura MCP Server": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/mcpServer.js"],
      "workingDirectory": "/absolute/path/to/infura-mcp-server",
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here"
      }
    }
  }
}
```

**For Cursor** → Create/edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Infura MCP Server": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/mcpServer.js"],
      "workingDirectory": "/absolute/path/to/infura-mcp-server",
      "env": {
        "INFURA_API_KEY": "your_infura_api_key_here"
      }
    }
  }
}
```

**Important**: 
- You must provide absolute paths for `command`, `args`, and `workingDirectory`
- Include your `INFURA_API_KEY` in the `env` section for reliable access
- The `workingDirectory` ensures the server can find configuration files

Restart your MCP client to activate the server. Look for a green indicator showing the "Infura MCP Server" is connected.

### For Published Package (NPX)

For published tools, you can use `npx` which is more convenient:

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

### Example Usage with Claude/Cursor

Once connected, you can ask questions that will trigger the Infura tools:

> **"What's the latest block number on Ethereum mainnet using Infura?"**

Uses the `eth_getBlockNumber` tool with network `mainnet`.

> **"Check the ETH balance of 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (Vitalik's wallet)"**

Uses the `eth_getBalance` tool to check wallet balances.

> **"What's the current gas price on Arbitrum?"**

Uses the `eth_getGasPrice` tool with network `arbitrum-mainnet`.

> **"Get the latest block on Optimism"**

Uses the `eth_getBlockNumber` tool with network `optimism-mainnet`.

## 🐳 Docker Deployment (Production)

For production deployments, you can use Docker.

**1. Build Docker image**

```sh
docker build -t infura-mcp-server .
```

**2. Run with Docker**

You can run the container and pass in the environment file.

```sh
docker run -it --rm --env-file .env infura-mcp-server
```

**3. MCP Client Integration with Docker**

Add the Docker server configuration to your MCP client. Make sure to replace `/absolute/path/to/your/project` with the actual absolute path to this project directory on your machine.

```json
{
  "mcpServers": {
    "Infura MCP Server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        "/absolute/path/to/your/project/.env",
        "infura-mcp-server"
      ]
    }
  }
}
```

**Note**: For the Docker setup, the `workingDirectory` is not needed because the `--env-file` path is absolute.

## ✨ Enhanced Features

This server includes several enhancements for production use:

### **Enhanced Error Handling**
- **Rate Limit Detection**: Specific handling for Infura API rate limits
- **Timeout Protection**: Graceful handling of slow network requests  
- **Connection Recovery**: Robust error recovery without server crashes
- **Detailed Error Messages**: User-friendly error descriptions

### **Comprehensive Logging**
- **Timestamped Logs**: All operations logged with ISO timestamps
- **Structured Data**: JSON-formatted log data for debugging
- **Tool Execution Tracking**: Monitor every tool call with arguments
- **Error Stack Traces**: Detailed error information for troubleshooting

### **Multi-Network Support**
- **Ethereum Mainnet**: Full support for production transactions
- **Layer 2 Networks**: Optimism, Arbitrum, Polygon, Base support
- **Testnets**: Sepolia and other test networks
- **Dynamic Network Selection**: Specify network per request

### **Security & Reliability**  
- **Environment Variable Isolation**: API keys properly isolated
- **Connection Stability**: Enhanced protocol reliability
- **Graceful Shutdown**: Proper cleanup on server termination
- **Health Monitoring**: Built-in health check endpoints (SSE mode)

## Contributing

Contributions are welcome! If you want to add or improve a tool:

1. Find the relevant API endpoint in the [Infura Documentation](https://docs.infura.io/api/network-apis/ethereum).
2. Create a new tool file in the `tools/` directory.
3. Follow the existing tool structure: define an `executeFunction` that calls the `lib/infura-client.js` and an `apiTool` object that describes the tool for the MCP server.
4. The server will automatically discover your new tool.
5. Open a Pull Request with your changes.

## Troubleshooting

### Common Issues

**Server not connecting:**
- Ensure Cursor/Claude is completely restarted after configuration changes
- Verify all paths in the MCP configuration are absolute
- Check that the `INFURA_API_KEY` is included in the `env` section

**API errors:**
- Verify your Infura API key is valid and has sufficient quota
- Check that the network name is correct (e.g., `mainnet`, `optimism-mainnet`)
- Monitor the enhanced logs for detailed error information

**Intermittent connections:**
- The enhanced error handling should prevent most connection issues
- Restart your MCP client if problems persist
- Check the server logs for specific error messages

### Getting Help

If you encounter issues:
1. Check the enhanced server logs for detailed error information
2. Verify your configuration matches the examples above
3. Test the server directly using `npm run list-tools`
4. Open an issue with log details and configuration information

