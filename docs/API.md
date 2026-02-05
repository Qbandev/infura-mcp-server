# Infura MCP Server API Reference

Complete API reference for the Infura MCP Server, providing 29 tools across 7 categories for querying blockchain data from 37+ supported networks.

## Table of Contents

- [Overview](#overview)
- [Response Formats](#response-formats)
- [Connection Methods](#connection-methods)
- [Authentication](#authentication)
- [Tool Reference](#tool-reference)
  - [Account and Balance](#account-and-balance)
  - [Blocks](#blocks)
  - [Transactions](#transactions)
  - [Smart Contracts](#smart-contracts)
  - [Logs](#logs)
  - [Network](#network)
  - [Gas and Fees](#gas-and-fees)
- [Error Reference](#error-reference)
- [Network Reference](#network-reference)

---

## Overview

The Infura MCP Server is a Model Context Protocol (MCP) server that provides AI assistants with read-only access to blockchain data through Infura's infrastructure. It implements 29 JSON-RPC tools that enable querying:

- Account balances and transaction counts
- Block information and uncle blocks
- Transaction details and receipts
- Smart contract data and storage
- Event logs with filtering
- Network status and gas prices

All operations are **read-only** and cannot modify blockchain state. The server validates all inputs to prevent injection attacks and ensures secure communication with the Infura API.

---

## Response Formats

All 29 tools support a `response_format` parameter that controls the output format. This parameter is optional and available on every tool.

### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `response_format` | string | No | `json` | Output format: `json` or `markdown` |

### JSON Format (Default)

The `json` format returns raw blockchain data as-is from the Infura API. This is the default format and is ideal for programmatic processing.

**Example Request:**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "tag": "latest",
  "response_format": "json"
}
```

**Example Response:**
```json
"0x1bc16d674ec80000"
```

### Markdown Format

The `markdown` format returns human-readable formatted output with labels, converted values, and structured presentation. This is ideal for display in chat interfaces or documentation.

**Example Request:**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "tag": "latest",
  "response_format": "markdown"
}
```

**Example Response:**
```markdown
## ETH Balance

**Address:** `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
**Network:** mainnet
**Block:** latest

| Property | Value |
|----------|-------|
| Balance (Wei) | 2000000000000000000 |
| Balance (ETH) | 2.0 |
```

### Format Comparison

| Aspect | JSON | Markdown |
|--------|------|----------|
| Use case | Programmatic processing | Human-readable display |
| Values | Raw hex strings | Converted decimal values |
| Structure | Raw API response | Formatted tables and sections |
| Size | Minimal | Larger with formatting |

---

## Connection Methods

### Stdio Mode (Recommended for Desktop)

The default mode for Claude Desktop, Cursor, and VS Code. The MCP client spawns the server as a subprocess and communicates via stdin/stdout.

```bash
# Run directly
npx infura-mcp-server

# Or with npm
npm start
```

Configuration for Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "infura-mcp-server": {
      "command": "npx",
      "args": ["infura-mcp-server"],
      "env": {
        "INFURA_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

### HTTP Mode (Web Applications)

Streamable HTTP transport for web deployments. Provides SSE (Server-Sent Events) for real-time communication.

```bash
npm run start:http
```

Endpoints:
- `POST http://localhost:3001/mcp` - Main MCP endpoint
- `GET http://localhost:3001/health` - Health check endpoint

---

## Authentication

### INFURA_API_KEY (Required)

All requests to the Infura API require authentication via an API key.

**Setup:**
1. Create an account at the [MetaMask Developer Portal](https://developer.metamask.io/)
2. Create a new project and copy your API key
3. Set the `INFURA_API_KEY` environment variable

```bash
export INFURA_API_KEY="your_api_key_here"
```

**Security Best Practices:**
- Never commit API keys to version control
- Use environment variables or secrets management
- Use separate keys for development and production
- Monitor usage via the MetaMask Developer Dashboard
- Rotate keys periodically

### INFURA_NETWORK (Optional)

Set the default network for all requests. Defaults to `mainnet` if not specified.

```bash
export INFURA_NETWORK="polygon-mainnet"
```

---

## Tool Reference

### Account and Balance

#### eth_getBalance

Get the ETH balance of an address at a specific block.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address` | string | Yes | Ethereum address (20-byte hex, e.g., `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`) |
| `tag` | string | Yes | Block reference: `latest`, `earliest`, or `pending` |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing balance in wei (e.g., `0xde0b6b3a7640000` for 1 ETH).

**Example Request:**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "tag": "latest"
}
```

**Example Response:**
```json
"0x1bc16d674ec80000"
```

**Errors:**
- `InvalidParams`: When address format is invalid or tag is not recognized
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getCode

Get the deployed bytecode of a smart contract.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contractAddress` | string | Yes | Contract address (20-byte hex, e.g., `0xdAC17F958D2ee523a2206206994597C13D831ec7`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string containing the contract bytecode. Returns `0x` if address is not a contract or has no code.

**Example Request:**
```json
{
  "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
}
```

**Example Response:**
```json
"0x606060405236156100..."
```

**Errors:**
- `InvalidParams`: When contractAddress format is invalid
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getTransactionCount

Returns the number of transactions sent from an address (nonce). Useful for determining the next nonce for sending transactions.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address` | string | Yes | Ethereum address (20-byte hex) |
| `tag` | string | No | Block tag: `latest`, `earliest`, or `pending` (default: `latest`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hex-encoded integer representing the number of transactions sent from the address.

**Example Request:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

**Example Response:**
```json
"0x1a"
```

**Errors:**
- `InvalidParams`: When address format is invalid or tag is not a valid block tag
- `InternalError`: When Infura API is unavailable

---

### Blocks

#### eth_getBlockNumber

Fetch the latest block number from an Ethereum network.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing the current block number (e.g., `0x10d4f`).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"0x11a3c8b"
```

**Errors:**
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getBlockByHash

Get detailed block information using its hash.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockHash` | string | Yes | 32-byte block hash (66 chars with 0x prefix) |
| `fullTransactions` | boolean | Yes | If `true`, returns full tx objects; if `false`, returns tx hashes only |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Block object with:
- `number` - Block number (hex)
- `hash` - Block hash
- `parentHash` - Parent block hash
- `nonce` - Proof-of-work nonce
- `sha3Uncles` - SHA3 of uncles data
- `logsBloom` - Bloom filter for logs
- `transactionsRoot` - Root of transaction trie
- `stateRoot` - Root of state trie
- `receiptsRoot` - Root of receipts trie
- `miner` - Address of beneficiary
- `difficulty` - Difficulty (hex)
- `totalDifficulty` - Total difficulty (hex)
- `extraData` - Extra data field
- `size` - Block size in bytes (hex)
- `gasLimit` - Gas limit (hex)
- `gasUsed` - Gas used (hex)
- `timestamp` - Unix timestamp (hex)
- `transactions` - Array of tx hashes or tx objects
- `uncles` - Array of uncle hashes

Returns `null` if block not found.

**Example Request:**
```json
{
  "blockHash": "0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238",
  "fullTransactions": false
}
```

**Errors:**
- `InvalidParams`: When blockHash format is invalid (not 66 char hex)
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getBlockByNumber

Get detailed block information using its number or tag.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockNumber` | string | Yes | Block number as hex (e.g., `0x10d4f`) or tag (`latest`, `earliest`, `pending`) |
| `fullTransactions` | boolean | Yes | If `true`, returns full tx objects; if `false`, returns tx hashes only |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Block object (same structure as `eth_getBlockByHash`). Returns `null` if block not found.

**Example Request:**
```json
{
  "blockNumber": "latest",
  "fullTransactions": false
}
```

**Errors:**
- `InvalidParams`: When blockNumber format is invalid
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getBlockTransactionCountByHash

Get the number of transactions in a block identified by its hash.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockHash` | string | Yes | 32-byte block hash (66 chars with 0x prefix) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing transaction count (e.g., `0x10` for 16 transactions). Returns `null` if block not found.

**Example Request:**
```json
{
  "blockHash": "0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238"
}
```

**Example Response:**
```json
"0x8b"
```

**Errors:**
- `InvalidParams`: When blockHash format is invalid (not 66 char hex)
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getBlockTransactionCountByNumber

Get the number of transactions in a block identified by its number or tag.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockNumber` | string | Yes | Block number as hex (e.g., `0x10d4f`) or tag (`latest`, `earliest`, `pending`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing transaction count. Returns `null` if block not found.

**Example Request:**
```json
{
  "blockNumber": "latest"
}
```

**Example Response:**
```json
"0x5a"
```

**Errors:**
- `InvalidParams`: When blockNumber format is invalid
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getUncleCountByBlockHash

Returns the number of uncle (ommer) blocks in a specific block identified by its hash.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockHash` | string | Yes | 32-byte hash of the block to query (e.g., `0xabc123...`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hex-encoded integer representing the number of uncles in the block (e.g., `0x0` for no uncles, `0x2` for two uncles).

**Example Request:**
```json
{
  "blockHash": "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35"
}
```

**Example Response:**
```json
"0x1"
```

**Errors:**
- `InvalidParams`: When blockHash is not a valid 32-byte hex string
- `InternalError`: When Infura API is unavailable

---

#### eth_getUncleCountByBlockNumber

Returns the number of uncle (ommer) blocks in a specific block identified by its number or tag.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockNumber` | string | No | Block number as hex (e.g., `0x10d4f`) or tag (`latest`, `earliest`, `pending`). Default: `latest` |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hex-encoded integer representing the number of uncles in the block.

**Example Request:**
```json
{
  "blockNumber": "0x29c"
}
```

**Example Response:**
```json
"0x0"
```

**Errors:**
- `InvalidParams`: When blockNumber format is invalid
- `InternalError`: When Infura API is unavailable

---

### Transactions

#### eth_getTransactionByHash

Retrieves detailed transaction information using its unique transaction hash.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionHash` | string | Yes | 32-byte transaction hash in hex format (e.g., `0xabc123...`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Transaction object with:
- `hash` - Transaction hash
- `nonce` - Number of transactions from sender (hex)
- `blockHash` - Hash of containing block (`null` if pending)
- `blockNumber` - Block number (hex, `null` if pending)
- `transactionIndex` - Position in block (hex, `null` if pending)
- `from` - Sender address
- `to` - Recipient address (`null` for contract creation)
- `value` - Value transferred in wei (hex)
- `gasPrice` - Gas price in wei (hex)
- `gas` - Gas provided (hex)
- `input` - Data sent with transaction
- `v`, `r`, `s` - ECDSA signature values

Returns `null` if transaction not found or still pending.

**Example Request:**
```json
{
  "transactionHash": "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"
}
```

**Errors:**
- `InvalidParams`: When transactionHash is not a valid 32-byte hex string
- `InternalError`: When Infura API is unavailable

---

#### eth_getTransactionReceipt

Retrieves the receipt of a mined transaction, including status, gas used, and logs. Only available for transactions that have been included in a block.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionHash` | string | Yes | 32-byte transaction hash in hex format |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Receipt object with:
- `transactionHash` - Transaction hash
- `transactionIndex` - Position in block (hex)
- `blockHash` - Hash of containing block
- `blockNumber` - Block number (hex)
- `from` - Sender address
- `to` - Recipient address (`null` for contract creation)
- `cumulativeGasUsed` - Total gas used in block up to this tx (hex)
- `gasUsed` - Gas used by this transaction (hex)
- `effectiveGasPrice` - Actual gas price paid (hex)
- `contractAddress` - Created contract address (if contract creation, else `null`)
- `logs` - Array of log objects
- `logsBloom` - Bloom filter for logs
- `status` - `0x1` (success) or `0x0` (failure)

Returns `null` if transaction pending or not found.

**Example Request:**
```json
{
  "transactionHash": "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"
}
```

**Errors:**
- `InvalidParams`: When transactionHash is not a valid 32-byte hex string
- `InternalError`: When Infura API is unavailable

---

#### eth_getTransactionByBlockHashAndIndex

Get a transaction by its position within a block identified by hash.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockHash` | string | Yes | 32-byte block hash (66 chars with 0x prefix) |
| `index` | string | Yes | Transaction index position as hex (e.g., `0x0` for first tx) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Transaction object (same structure as `eth_getTransactionByHash`). Returns `null` if not found.

**Example Request:**
```json
{
  "blockHash": "0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238",
  "index": "0x0"
}
```

**Errors:**
- `InvalidParams`: When blockHash or index format is invalid
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getTransactionByBlockNumberAndIndex

Retrieves a transaction by its position within a specific block using block number and transaction index.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockNumber` | string | Yes | Block number as hex (e.g., `0x10d4f`) or tag (`latest`, `earliest`, `pending`) |
| `transactionIndex` | string | Yes | Zero-based position of the transaction in the block as hex (e.g., `0x0`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Transaction object (same structure as `eth_getTransactionByHash`). Returns `null` if not found.

**Example Request:**
```json
{
  "blockNumber": "latest",
  "transactionIndex": "0x0"
}
```

**Errors:**
- `InvalidParams`: When blockNumber or transactionIndex format is invalid
- `InternalError`: When Infura API is unavailable

---

#### eth_getUncleByBlockHashAndIndex

Retrieves an uncle (ommer) block by block hash and uncle index position. Uncles are valid blocks that were not included in the main chain but are referenced by main chain blocks.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockHash` | string | Yes | 32-byte hash of the block containing the uncle |
| `index` | string | Yes | Zero-based uncle index position as hex (e.g., `0x0` for first uncle) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Uncle block object with:
- `number` - Block number (hex)
- `hash` - Block hash
- `parentHash` - Parent block hash
- `nonce` - Proof-of-work nonce
- `sha3Uncles` - SHA3 of uncles data
- `miner` - Address of beneficiary
- `stateRoot` - Root of state trie
- `difficulty` - Difficulty (hex)
- `gasLimit` - Gas limit (hex)
- `gasUsed` - Gas used (hex)
- `timestamp` - Unix timestamp (hex)

Returns `null` if not found.

**Example Request:**
```json
{
  "blockHash": "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35",
  "index": "0x0"
}
```

**Errors:**
- `InvalidParams`: When blockHash or index format is invalid
- `InternalError`: When Infura API is unavailable

---

#### eth_getUncleByBlockNumberAndIndex

Retrieves an uncle (ommer) block by block number and uncle index position.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockNumber` | string | Yes | Block number as hex (e.g., `0x10d4f`) or tag (`latest`, `earliest`, `pending`) |
| `index` | string | Yes | Zero-based uncle index position as hex (e.g., `0x0` for first uncle) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Uncle block object (same structure as `eth_getUncleByBlockHashAndIndex`). Returns `null` if not found.

**Example Request:**
```json
{
  "blockNumber": "0x29c",
  "index": "0x0"
}
```

**Errors:**
- `InvalidParams`: When blockNumber or index format is invalid
- `InternalError`: When Infura API is unavailable

---

### Smart Contracts

#### eth_call

Execute a read-only smart contract call without creating a transaction.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `to` | string | Yes | Contract address to call (20-byte hex) |
| `data` | string | Yes | ABI-encoded function call data (hex string starting with 0x) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string containing the return value of the executed contract method.

**Example Request:**
```json
{
  "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

**Example Response:**
```json
"0x0000000000000000000000000000000000000000000000000000000005f5e100"
```

**Errors:**
- `InvalidParams`: When `to` address or `data` format is invalid
- `InternalError`: When contract execution reverts or Infura API fails

---

#### eth_estimateGas

Estimate the gas required to execute a transaction without broadcasting it.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | Yes | Sender address (20-byte hex) |
| `to` | string | Yes | Recipient address (20-byte hex) |
| `value` | string | Yes | Amount to send in wei as hex (e.g., `0xde0b6b3a7640000` for 1 ETH) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing estimated gas units (e.g., `0x5208` for 21000 gas).

**Example Request:**
```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "to": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "value": "0xde0b6b3a7640000"
}
```

**Example Response:**
```json
"0x5208"
```

**Errors:**
- `InvalidParams`: When address format or value format is invalid
- `InternalError`: When transaction would revert or Infura API fails

---

#### eth_getStorageAt

Read the raw value from a specific storage slot of a contract.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address` | string | Yes | Contract address (20-byte hex) |
| `position` | string | Yes | Storage slot index as hex (e.g., `0x0` for slot 0) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

32-byte hexadecimal string representing the storage value at the given position.

**Example Request:**
```json
{
  "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "position": "0x0"
}
```

**Example Response:**
```json
"0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7"
```

**Errors:**
- `InvalidParams`: When address or position format is invalid
- `InternalError`: When Infura API is unavailable or returns an error

---

### Logs

#### eth_getLogs

Query event logs emitted by smart contracts with flexible filters. Supports pagination for handling large result sets.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fromBlock` | string | Yes | Start block as hex (e.g., `0x10d4f`) or tag (`latest`, `earliest`, `pending`) |
| `toBlock` | string | Yes | End block as hex or tag |
| `address` | string | No | Contract address to filter logs from |
| `topics` | array | No | Array of 32-byte topic filters for indexed event parameters |
| `limit` | number | No | Maximum number of logs to return (default: 100, max: 10000) |
| `offset` | number | No | Number of logs to skip for pagination (default: 0) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Object containing:
- `logs` - Array of log objects
- `pagination` - Pagination metadata object

**Log Object Fields:**
- `address` - Contract address that emitted the log
- `topics` - Array of indexed event parameters (up to 4)
- `data` - Non-indexed event data (hex)
- `blockNumber` - Block number (hex)
- `blockHash` - Block hash
- `transactionHash` - Transaction hash
- `transactionIndex` - Transaction position in block (hex)
- `logIndex` - Log position in block (hex)
- `removed` - `true` if log was removed due to reorg

**Pagination Object Fields:**
- `total` - Total number of logs matching the filter
- `limit` - Number of logs requested per page
- `offset` - Current offset (number of logs skipped)
- `hasMore` - Boolean indicating if more logs are available

**Example Request (Basic):**
```json
{
  "fromBlock": "0x10d4f",
  "toBlock": "0x10d50",
  "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
}
```

**Example Response (Basic):**
```json
{
  "logs": [
    {
      "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x000000000000000000000000abc123...",
        "0x000000000000000000000000def456..."
      ],
      "data": "0x0000000000000000000000000000000000000000000000000000000005f5e100",
      "blockNumber": "0x10d4f",
      "transactionHash": "0x...",
      "logIndex": "0x0"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

**Example Request (With Pagination):**
```json
{
  "fromBlock": "0x10d4f",
  "toBlock": "0x10e4f",
  "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "limit": 50,
  "offset": 100
}
```

**Example Response (With Pagination):**
```json
{
  "logs": [
    {
      "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "topics": ["0xddf252ad..."],
      "data": "0x...",
      "blockNumber": "0x10d52",
      "transactionHash": "0x...",
      "logIndex": "0x3"
    }
  ],
  "pagination": {
    "total": 500,
    "limit": 50,
    "offset": 100,
    "hasMore": true
  }
}
```

**Pagination Example - Iterating Through All Logs:**

To retrieve all logs from a large result set, iterate using `offset`:

```
# First request (logs 0-99)
{ "fromBlock": "0x10d4f", "toBlock": "0x10e4f", "limit": 100, "offset": 0 }

# Second request (logs 100-199)
{ "fromBlock": "0x10d4f", "toBlock": "0x10e4f", "limit": 100, "offset": 100 }

# Continue until hasMore is false
```

**Errors:**
- `InvalidParams`: When block tags, address format, limit, or offset is invalid
- `InternalError`: When query range is too large or Infura API fails

---

### Network

#### eth_chainId

Get the chain ID of an Ethereum network for EIP-155 transaction signing.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing the chain ID (e.g., `0x1` for mainnet, `0xaa36a7` for Sepolia).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"0x1"
```

**Errors:**
- `InternalError`: When Infura API is unavailable or returns an error

---

#### net_getVersion

Returns the current network ID. Useful for identifying which Ethereum network the node is connected to.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

String representing the network ID (e.g., `1` for mainnet, `11155111` for Sepolia).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"1"
```

**Errors:**
- `InternalError`: When Infura API is unavailable

---

#### net_isListening

Returns whether the client is actively listening for network connections. Useful for checking node connectivity status.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

- `true` if the client is listening for connections
- `false` if the client is not listening

**Example Request:**
```json
{}
```

**Example Response:**
```json
true
```

**Errors:**
- `InternalError`: When Infura API is unavailable

---

#### net_getPeerCount

Returns the number of peers currently connected to the client. Useful for monitoring network connectivity and health.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hex-encoded integer representing the number of connected peers (e.g., `0x19` for 25 peers).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"0x64"
```

**Errors:**
- `InternalError`: When Infura API is unavailable

---

#### web3_getClientVersion

Returns the current Ethereum client version string. Useful for identifying the node software and version being used.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

String containing the client name and version (e.g., `Geth/v1.10.26-stable/linux-amd64/go1.18.5`).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"Geth/v1.13.5-stable-916d6a44/linux-amd64/go1.21.4"
```

**Errors:**
- `InternalError`: When Infura API is unavailable

---

### Gas and Fees

#### eth_getGasPrice

Get the current gas price in wei for legacy (non-EIP-1559) transactions.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hexadecimal string representing gas price in wei (e.g., `0x3b9aca00` for 1 Gwei).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"0x4a817c800"
```

**Errors:**
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getFeeHistory

Get historical gas fee data for EIP-1559 fee estimation.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `blockCount` | string | Yes | Number of blocks to analyze as hex (e.g., `0x4` for 4 blocks) |
| `newestBlock` | string | Yes | Latest block to include (`latest`, `pending`, or hex block number) |
| `rewardPercentiles` | array | Yes | Percentiles for priority fee sampling (e.g., `[25, 50, 75]`) |
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Object with:
- `oldestBlock` - Oldest block in the range (hex)
- `baseFeePerGas` - Array of base fees for each block (hex)
- `gasUsedRatio` - Array of gas used ratios for each block
- `reward` - 2D array of priority fees at each percentile for each block

**Example Request:**
```json
{
  "blockCount": "0x4",
  "newestBlock": "latest",
  "rewardPercentiles": [25, 50, 75]
}
```

**Example Response:**
```json
{
  "oldestBlock": "0x11a3c88",
  "baseFeePerGas": ["0x3b9aca00", "0x3b9aca00", "0x3b9aca00", "0x3b9aca00", "0x3b9aca00"],
  "gasUsedRatio": [0.5, 0.6, 0.4, 0.7],
  "reward": [
    ["0x59682f00", "0x77359400", "0x9502f900"],
    ["0x59682f00", "0x77359400", "0x9502f900"],
    ["0x59682f00", "0x77359400", "0x9502f900"],
    ["0x59682f00", "0x77359400", "0x9502f900"]
  ]
}
```

**Errors:**
- `InvalidParams`: When blockCount format, newestBlock, or rewardPercentiles are invalid
- `InternalError`: When Infura API is unavailable or returns an error

---

#### eth_getProtocolVersion

Returns the current Ethereum protocol version used by the node. Useful for checking client compatibility and supported features.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

Hex-encoded string representing the protocol version number (e.g., `0x41` for version 65).

**Example Request:**
```json
{}
```

**Example Response:**
```json
"0x44"
```

**Errors:**
- `InternalError`: When Infura API is unavailable or method not supported

---

#### eth_isSyncing

Returns the sync status of the Ethereum node. Useful for determining if the node is fully synced before relying on its data.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `network` | string | No | Network to query (default: `mainnet`) |

**Returns:**

- `false` if the node is not syncing (fully synced)
- Object with sync progress if syncing:
  - `startingBlock` - Block where sync started (hex)
  - `currentBlock` - Current block being synced (hex)
  - `highestBlock` - Estimated highest block (hex)

**Example Request:**
```json
{}
```

**Example Response (synced):**
```json
false
```

**Example Response (syncing):**
```json
{
  "startingBlock": "0x0",
  "currentBlock": "0x10d4f",
  "highestBlock": "0x11a3c8b"
}
```

**Errors:**
- `InternalError`: When Infura API is unavailable

---

## Error Reference

### MCP Error Codes

The server uses standard MCP error codes from the `@modelcontextprotocol/sdk`:

| Code | Name | Description |
|------|------|-------------|
| `-32600` | `InvalidRequest` | INFURA_API_KEY environment variable not set |
| `-32602` | `InvalidParams` | Invalid parameter format (address, hash, network, etc.) |
| `-32603` | `InternalError` | API error, network error, or max retries exceeded |

### Common Error Messages and Solutions

#### Authentication Errors

**Error:** `INFURA_API_KEY environment variable not set.`

**Solution:** Set your Infura API key in the environment:
```bash
export INFURA_API_KEY="your_api_key_here"
```

**Error:** `Authentication failed. Verify your INFURA_API_KEY is correct and has access to [network].`

**Solution:**
- Verify your API key at the [MetaMask Developer Dashboard](https://developer.metamask.io/)
- Ensure the key has access to the requested network
- Check if the key has been revoked or expired

#### Validation Errors

**Error:** `Invalid Ethereum address for '[field]'. Expected format: 0x followed by 40 hexadecimal characters.`

**Solution:** Provide a valid 20-byte Ethereum address (e.g., `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`)

**Error:** `Invalid hash for '[field]'. Expected format: 0x followed by 64 hexadecimal characters.`

**Solution:** Provide a valid 32-byte hash (e.g., `0xabc123def456789012345678901234567890123456789012345678901234abcd`)

**Error:** `Invalid block tag for '[field]'. Expected: 'latest', 'earliest', 'pending', 'safe', 'finalized', or a hex block number.`

**Solution:** Use a valid block tag (`latest`, `earliest`, `pending`) or hex block number (`0x10d4f`)

**Error:** `Invalid network: '[network]'. Valid networks include: mainnet, sepolia, arbitrum-mainnet, ...`

**Solution:** Use a supported network from the [Network Reference](#network-reference) section

#### Rate Limiting

**Error:** `Rate limit exceeded. Wait 60 seconds before retrying, or upgrade your Infura plan.`

**Solution:**
- Wait 60 seconds before making additional requests
- Reduce request frequency
- Consider upgrading your Infura plan at https://infura.io/pricing

#### Transient Errors

**Error:** `Infura service temporarily unavailable (HTTP [status]). This is a transient error - retry in a few seconds.`

**Solution:** The server automatically retries transient errors (429, 5xx) up to 3 times with exponential backoff. If the error persists, wait and try again later.

**Error:** `Request timed out. The network may be congested - try again or use a simpler query.`

**Solution:**
- Retry the request
- Reduce the scope of your query (e.g., smaller block range for `eth_getLogs`)
- Try during periods of lower network congestion

### Retry Behavior

The server implements automatic retry with exponential backoff for transient errors:

- **Max retries:** 3 attempts
- **Retry delay:** 1s, 2s, 4s (exponential backoff)
- **Retryable errors:** HTTP 429 (rate limit), HTTP 5xx (server errors), network timeouts
- **Non-retryable errors:** HTTP 400, 401, 403, 404 (client errors)

If a `Retry-After` header is present in the response, the server respects that delay instead of the calculated backoff.

---

## Network Reference

The Infura MCP Server supports 37 networks across 18 blockchain ecosystems. Each network can be specified using the `network` parameter in tool calls.

### Ethereum

| Network ID | Description |
|------------|-------------|
| `mainnet` | Ethereum Mainnet (production) |
| `sepolia` | Ethereum Sepolia Testnet |

### Layer 2 Networks

| Network ID | Description |
|------------|-------------|
| `arbitrum-mainnet` | Arbitrum One Mainnet |
| `arbitrum-sepolia` | Arbitrum Sepolia Testnet |
| `optimism-mainnet` | Optimism Mainnet |
| `optimism-sepolia` | Optimism Sepolia Testnet |
| `polygon-mainnet` | Polygon PoS Mainnet |
| `polygon-amoy` | Polygon Amoy Testnet |
| `base-mainnet` | Base Mainnet |
| `base-sepolia` | Base Sepolia Testnet |
| `linea-mainnet` | Linea Mainnet |
| `linea-sepolia` | Linea Sepolia Testnet |
| `zksync-mainnet` | zkSync Era Mainnet |
| `zksync-sepolia` | zkSync Era Sepolia Testnet |
| `scroll-mainnet` | Scroll Mainnet |
| `scroll-sepolia` | Scroll Sepolia Testnet |
| `blast-mainnet` | Blast Mainnet |
| `blast-sepolia` | Blast Sepolia Testnet |
| `mantle-mainnet` | Mantle Mainnet |
| `mantle-sepolia` | Mantle Sepolia Testnet |

### Alternative L1 Networks

| Network ID | Description |
|------------|-------------|
| `avalanche-mainnet` | Avalanche C-Chain Mainnet |
| `avalanche-fuji` | Avalanche Fuji Testnet |
| `bsc-mainnet` | BNB Smart Chain Mainnet |
| `bsc-testnet` | BNB Smart Chain Testnet |
| `celo-mainnet` | Celo Mainnet |
| `celo-alfajores` | Celo Alfajores Testnet |
| `palm-mainnet` | Palm Mainnet |
| `palm-testnet` | Palm Testnet |
| `starknet-mainnet` | Starknet Mainnet |
| `starknet-sepolia` | Starknet Sepolia Testnet |

### Other Networks

| Network ID | Description |
|------------|-------------|
| `opbnb-mainnet` | opBNB Mainnet |
| `opbnb-testnet` | opBNB Testnet |
| `swellchain-mainnet` | Swellchain Mainnet |
| `swellchain-testnet` | Swellchain Testnet |
| `unichain-mainnet` | Unichain Mainnet |
| `unichain-sepolia` | Unichain Sepolia Testnet |

### Chain IDs Reference

| Network | Chain ID (Decimal) | Chain ID (Hex) |
|---------|-------------------|----------------|
| Ethereum Mainnet | 1 | 0x1 |
| Sepolia | 11155111 | 0xaa36a7 |
| Polygon Mainnet | 137 | 0x89 |
| Arbitrum One | 42161 | 0xa4b1 |
| Optimism | 10 | 0xa |
| Base | 8453 | 0x2105 |
| Linea | 59144 | 0xe708 |
| Avalanche C-Chain | 43114 | 0xa86a |
| BNB Smart Chain | 56 | 0x38 |

For the complete and up-to-date list of supported networks and their endpoints, see the [MetaMask Developer Documentation](https://docs.metamask.io/services/get-started/endpoints/).
