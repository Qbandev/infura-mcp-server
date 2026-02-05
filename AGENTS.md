# AGENTS.md

Guidance for AI agents (Claude, GPT, Cursor, etc.) using the Infura MCP Server to interact with blockchain data.

## Overview

This MCP server provides **29 read-only Ethereum JSON-RPC tools** that enable AI agents to query blockchain data across **37+ supported networks**. All operations are read-only and cannot modify blockchain state.

**What you can do:**
- Query account balances, nonces, and contract bytecode
- Retrieve block and transaction data
- Read smart contract state via `eth_call`
- Query event logs from contracts
- Get gas prices and fee estimates
- Check network status and chain IDs

**What you cannot do:**
- Send transactions or modify blockchain state
- Sign messages or manage private keys
- Deploy or modify smart contracts

## Tool Categories

### Account Queries (3 tools)

Use these to check wallet and contract information.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_getBalance` | Get ETH balance of an address | `address`, `tag`, `network` |
| `eth_getTransactionCount` | Get nonce (transaction count) | `address`, `tag`, `network` |
| `eth_getCode` | Get contract bytecode | `address`, `tag`, `network` |

### Block Queries (7 tools)

Use these to retrieve block data and metadata.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_blockNumber` | Get latest block number | `network` |
| `eth_getBlockByHash` | Get block by its hash | `blockHash`, `fullTransactions`, `network` |
| `eth_getBlockByNumber` | Get block by number | `blockNumber`, `fullTransactions`, `network` |
| `eth_getBlockTransactionCountByHash` | Count transactions in block | `blockHash`, `network` |
| `eth_getBlockTransactionCountByNumber` | Count transactions in block | `blockNumber`, `network` |
| `eth_getUncleCountByBlockHash` | Count uncles in block | `blockHash`, `network` |
| `eth_getUncleCountByBlockNumber` | Count uncles in block | `blockNumber`, `network` |

### Transaction Queries (6 tools)

Use these to get transaction details and receipts.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_getTransactionByHash` | Get transaction by hash | `transactionHash`, `network` |
| `eth_getTransactionReceipt` | Get transaction receipt | `transactionHash`, `network` |
| `eth_getTransactionByBlockHashAndIndex` | Get transaction by position | `blockHash`, `index`, `network` |
| `eth_getTransactionByBlockNumberAndIndex` | Get transaction by position | `blockNumber`, `index`, `network` |
| `eth_getUncleByBlockHashAndIndex` | Get uncle block | `blockHash`, `index`, `network` |
| `eth_getUncleByBlockNumberAndIndex` | Get uncle block | `blockNumber`, `index`, `network` |

### Contract Interactions (3 tools)

Use these to read smart contract state.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_call` | Execute read-only contract call | `to`, `data`, `network` |
| `eth_estimateGas` | Estimate gas for a call | `to`, `data`, `from`, `value`, `network` |
| `eth_getStorageAt` | Read contract storage slot | `address`, `position`, `tag`, `network` |

### Log Queries (1 tool)

Use this to query contract events.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_getLogs` | Query event logs | `fromBlock`, `toBlock`, `address`, `topics`, `network` |

### Network Information (5 tools)

Use these to get network status and metadata.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_chainId` | Get chain ID | `network` |
| `net_version` | Get network version | `network` |
| `net_listening` | Check if node is listening | `network` |
| `net_peerCount` | Get connected peer count | `network` |
| `web3_clientVersion` | Get client version | `network` |

### Gas and Fees (4 tools)

Use these for gas estimation and fee data.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `eth_gasPrice` | Get current gas price | `network` |
| `eth_feeHistory` | Get historical fee data | `blockCount`, `newestBlock`, `rewardPercentiles`, `network` |
| `eth_protocolVersion` | Get protocol version | `network` |
| `eth_syncing` | Get sync status | `network` |

## Common Patterns

### Check an Account Balance

```json
{
  "tool": "eth_getBalance",
  "parameters": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "tag": "latest",
    "network": "mainnet"
  }
}
```

The result is in wei (hex). To convert to ETH, divide by 10^18.

### Read a Smart Contract (ERC20 balanceOf)

To read an ERC20 token balance, use `eth_call` with ABI-encoded function data:

```json
{
  "tool": "eth_call",
  "parameters": {
    "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "network": "mainnet"
  }
}
```

The `data` field contains:
- `0x70a08231` - Function selector for `balanceOf(address)`
- Followed by the address padded to 32 bytes

### Get Transaction Details

```json
{
  "tool": "eth_getTransactionByHash",
  "parameters": {
    "transactionHash": "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
    "network": "mainnet"
  }
}
```

### Check if Transaction is Confirmed

Use `eth_getTransactionReceipt` to verify confirmation:

```json
{
  "tool": "eth_getTransactionReceipt",
  "parameters": {
    "transactionHash": "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
    "network": "mainnet"
  }
}
```

A `null` result means the transaction is pending or not found. Check `status` field: `0x1` = success, `0x0` = reverted.

### Query Event Logs

To get Transfer events from a token contract:

```json
{
  "tool": "eth_getLogs",
  "parameters": {
    "fromBlock": "0x10d4f00",
    "toBlock": "0x10d4f10",
    "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
    "network": "mainnet"
  }
}
```

The topic `0xddf252ad...` is the keccak256 hash of `Transfer(address,address,uint256)`.

### Paginating Event Logs

When querying event logs that may return large result sets, use pagination to retrieve results in manageable chunks. This is useful when:

- Querying popular contracts with many events
- Scanning large block ranges
- Avoiding response size limits or timeouts

**Enable pagination with `pageSize`:**

```json
{
  "tool": "eth_getLogs",
  "parameters": {
    "fromBlock": "0x10d4f00",
    "toBlock": "0x10d5000",
    "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
    "network": "mainnet",
    "limit": 100
  }
}
```

**Pagination response structure:**

When pagination parameters are used, the response includes a `pagination` object:

```json
{
  "logs": [...],
  "pagination": {
    "total": 450,
    "count": 100,
    "offset": 0,
    "limit": 100,
    "has_more": true,
    "next_offset": 100
  }
}
```

**Retrieve subsequent pages with `offset`:**

```json
{
  "tool": "eth_getLogs",
  "parameters": {
    "fromBlock": "0x10d4f00",
    "toBlock": "0x10d5000",
    "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
    "network": "mainnet",
    "limit": 100,
    "offset": 100
  }
}
```

**Pagination workflow:**

1. Make initial request with `limit` to get first page and total count
2. Check `pagination.has_more` to determine if more results exist
3. Use `pagination.next_offset` as the `offset` for the next request
4. Continue until `has_more` is `false`

**Best practices for pagination:**

- Use limit values between 100-1000 depending on log complexity
- Always check `has_more` rather than calculating from totals
- For very large result sets, consider narrowing filters first
- Combine with `response_format: "markdown"` for human-readable paginated output

### Estimate Gas for a Transaction

```json
{
  "tool": "eth_estimateGas",
  "parameters": {
    "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "network": "mainnet"
  }
}
```

### Get Current Gas Price

```json
{
  "tool": "eth_gasPrice",
  "parameters": {
    "network": "mainnet"
  }
}
```

Result is in wei (hex). Divide by 10^9 to get Gwei.

## Parameter Formats

### Addresses

Format: `0x` followed by exactly 40 hexadecimal characters.

```
Valid:   0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Invalid: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA9604   (39 chars)
Invalid: d8dA6BF26964aF9D7eEd9e03E53415D37aA96045   (missing 0x)
```

### Transaction and Block Hashes

Format: `0x` followed by exactly 64 hexadecimal characters.

```
Valid:   0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b
Invalid: 0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944  (63 chars)
```

### Block Tags

Use one of these string values:

| Tag | Description |
|-----|-------------|
| `latest` | Most recent mined block |
| `earliest` | Genesis block (block 0) |
| `pending` | Pending state/transactions |
| `safe` | Latest safe head block |
| `finalized` | Latest finalized block |
| `0x...` | Specific block number in hex (e.g., `0x10d4f00`) |

For most queries, use `latest` to get current state.

### Hex Quantities

Format: `0x` followed by hex digits with no leading zeros (except `0x0` for zero).

```
Valid:   0x0, 0x1, 0x10, 0x1a2b3c
Invalid: 0x01, 0x001  (leading zeros not allowed)
```

### Topics (for eth_getLogs)

Topics are 32-byte hex values used to filter event logs:

```
0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

The first topic is typically the event signature hash. Subsequent topics are indexed parameters.

### Response Format

All tools support an optional `response_format` parameter that controls how results are returned:

| Format | Description | Use Case |
|--------|-------------|----------|
| `json` | Raw JSON response (default) | Programmatic data processing |
| `markdown` | Human-readable formatted output | Displaying results to users |

**When to use each format:**

- **Use `json` (default)** when you need to process the data programmatically, extract specific fields, perform calculations, or pass data to other tools.

- **Use `markdown`** when displaying results directly to humans, creating reports, or when readability is more important than raw data access.

**Example with markdown format:**

```json
{
  "tool": "eth_getBalance",
  "parameters": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "tag": "latest",
    "network": "mainnet",
    "response_format": "markdown"
  }
}
```

The markdown format returns a formatted response with headers, tables, and human-readable values (e.g., ETH instead of wei).

**Example with json format (default):**

```json
{
  "tool": "eth_getBalance",
  "parameters": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "tag": "latest",
    "network": "mainnet"
  }
}
```

Returns raw hex values suitable for programmatic processing.

## Network Selection

### Default Network

If `network` is not specified, queries default to `mainnet` (Ethereum mainnet).

### Specifying a Network

Always include the `network` parameter for clarity:

```json
{
  "tool": "eth_getBalance",
  "parameters": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "tag": "latest",
    "network": "polygon-mainnet"
  }
}
```

### Supported Networks (37 total)

**Ethereum**
- `mainnet` - Ethereum mainnet
- `sepolia` - Ethereum testnet

**Layer 2 Networks**
- `arbitrum-mainnet`, `arbitrum-sepolia` - Arbitrum
- `optimism-mainnet`, `optimism-sepolia` - Optimism
- `base-mainnet`, `base-sepolia` - Base
- `linea-mainnet`, `linea-sepolia` - Linea
- `polygon-mainnet`, `polygon-amoy` - Polygon
- `zksync-mainnet`, `zksync-sepolia` - zkSync Era
- `scroll-mainnet`, `scroll-sepolia` - Scroll
- `blast-mainnet`, `blast-sepolia` - Blast
- `mantle-mainnet`, `mantle-sepolia` - Mantle

**Alternative L1s**
- `avalanche-mainnet`, `avalanche-fuji` - Avalanche C-Chain
- `bsc-mainnet`, `bsc-testnet` - BNB Smart Chain
- `celo-mainnet`, `celo-alfajores` - Celo
- `palm-mainnet`, `palm-testnet` - Palm

**Other Networks**
- `starknet-mainnet`, `starknet-sepolia` - Starknet
- `opbnb-mainnet`, `opbnb-testnet` - opBNB
- `swellchain-mainnet`, `swellchain-testnet` - Swellchain
- `unichain-mainnet`, `unichain-sepolia` - Unichain

### Popular Network Use Cases

| Use Case | Recommended Network |
|----------|-------------------|
| Production DeFi queries | `mainnet` |
| NFT data on Polygon | `polygon-mainnet` |
| Low-cost testing | `sepolia`, `polygon-amoy` |
| L2 transactions | `arbitrum-mainnet`, `base-mainnet`, `optimism-mainnet` |
| BNB Chain data | `bsc-mainnet` |

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid Ethereum address` | Address format incorrect | Ensure 0x + 40 hex characters |
| `Invalid hash` | Hash format incorrect | Ensure 0x + 64 hex characters |
| `Invalid block tag` | Unrecognized block reference | Use `latest`, `earliest`, `pending`, `safe`, `finalized`, or hex block number |
| `Invalid network` | Network not supported | Check the supported networks list |
| `INFURA_API_KEY not set` | Missing API key | Configure the environment variable |

### Rate Limit Errors

If you receive rate limit errors:
1. Wait a few seconds before retrying
2. Reduce query frequency
3. Batch related queries together when possible

### Timeout Errors

For `eth_getLogs` queries that timeout:
1. Reduce the block range (use smaller `fromBlock` to `toBlock` range)
2. Add an `address` filter to reduce results
3. Add `topics` filters to narrow results

### Retry Strategy

Retry on these conditions:
- Rate limit errors (429) - wait 1-5 seconds
- Timeout errors - reduce query scope and retry
- Network errors (5xx) - wait briefly and retry

Do not retry on:
- Validation errors (400) - fix the parameters
- Invalid method errors - check tool name

## Best Practices

### General Guidelines

1. **Always specify network explicitly** - Even for mainnet, include `network: "mainnet"` for clarity.

2. **Use "latest" for current state** - When you need the current blockchain state, use `tag: "latest"`.

3. **Check transaction receipts for confirmation** - A transaction in `eth_getTransactionByHash` may still be pending. Use `eth_getTransactionReceipt` to verify inclusion in a block.

4. **Handle hex values properly** - All numeric values are returned as hex strings. Convert them for display.

5. **Limit eth_getLogs block ranges** - Query specific block ranges (e.g., 1000-2000 blocks) to avoid timeouts.

### Converting Values

**Wei to ETH:**
```
ETH = Wei / 10^18
Example: 0xde0b6b3a7640000 (hex) = 1000000000000000000 (decimal) = 1 ETH
```

**Wei to Gwei (for gas prices):**
```
Gwei = Wei / 10^9
Example: 0x3b9aca00 (hex) = 1000000000 (decimal) = 1 Gwei
```

**Hex to Decimal:**
```
0x10d4f00 = 17649408 (decimal)
```

### Efficient Querying

1. **Get multiple pieces of data in one flow** - If you need balance and nonce, make both calls rather than asking the user to make separate requests.

2. **Use block numbers for consistency** - If making multiple related queries, use a specific block number rather than "latest" to ensure consistency.

3. **Filter logs efficiently** - Always provide the most specific filters possible (address, topics) to reduce response size.

4. **Check block number first** - Use `eth_blockNumber` to get the latest block, then use that number for subsequent queries.

### Security Notes

- All tools are read-only and cannot modify blockchain state
- Never ask users to share private keys - this server cannot use them
- Validate addresses before querying to provide better error messages
- Be aware that blockchain data is public - balance queries reveal holdings

## Example Workflows

### Investigate a Wallet

1. Get ETH balance: `eth_getBalance`
2. Get transaction count (nonce): `eth_getTransactionCount`
3. Check if it's a contract: `eth_getCode` (empty = EOA, non-empty = contract)

### Analyze a Transaction

1. Get transaction details: `eth_getTransactionByHash`
2. Get receipt for status and logs: `eth_getTransactionReceipt`
3. Get the block it was included in: `eth_getBlockByNumber`

### Monitor Contract Events

1. Get current block: `eth_blockNumber`
2. Query recent logs: `eth_getLogs` with appropriate filters
3. Parse log data to understand events

### Check Network Status

1. Get chain ID: `eth_chainId`
2. Check sync status: `eth_syncing`
3. Get current gas price: `eth_gasPrice`
