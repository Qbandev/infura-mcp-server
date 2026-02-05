/**
 * Markdown formatters for Ethereum JSON-RPC responses.
 *
 * This module provides utility functions to convert raw Ethereum blockchain data
 * into human-readable Markdown format. It includes formatters for blocks, transactions,
 * receipts, balances, logs, gas prices, and various other Ethereum data types.
 *
 * @module formatters
 * @author Infura MCP Server
 * @license MIT
 *
 * @example
 * // Import specific formatters
 * import { formatBlock, formatTransaction, weiToEth } from './formatters.js';
 *
 * @example
 * // Use the main formatter with automatic routing
 * import { formatAsMarkdown } from './formatters.js';
 * const markdown = formatAsMarkdown(blockData, 'eth_getBlockByNumber');
 */

/**
 * Converts a hexadecimal string to its decimal representation.
 *
 * @param {string} hex - The hexadecimal string to convert (e.g., '0x1a2b3c')
 * @returns {string} The decimal string representation of the hex value
 *
 * @example
 * hexToDecimal('0x10'); // Returns '16'
 * hexToDecimal('0x'); // Returns '0'
 * hexToDecimal(null); // Returns '0'
 */
export function hexToDecimal(hex) {
  if (!hex || hex === '0x') return '0';
  return BigInt(hex).toString();
}

/**
 * Converts a wei value (in hex) to ETH with appropriate unit formatting.
 *
 * For very small amounts (less than 0.0001 ETH), displays the value in wei.
 * For larger amounts, displays the value in ETH with 6 decimal places.
 *
 * @param {string} weiHex - The wei amount as a hexadecimal string
 * @returns {string} The formatted value with unit (ETH or wei)
 *
 * @example
 * weiToEth('0xde0b6b3a7640000'); // Returns '1.000000 ETH' (1 ETH)
 * weiToEth('0x64'); // Returns '100 wei' (small amount)
 * weiToEth('0x0'); // Returns '0 ETH'
 */
export function weiToEth(weiHex) {
  if (!weiHex || weiHex === '0x0') return '0 ETH';
  const wei = BigInt(weiHex);
  const eth = Number(wei) / 1e18;
  if (eth < 0.0001) return `${wei.toString()} wei`;
  return `${eth.toFixed(6)} ETH`;
}

/**
 * Converts a Unix timestamp (in hex) to an ISO 8601 formatted date string.
 *
 * @param {string} hexTimestamp - The Unix timestamp as a hexadecimal string
 * @returns {string} The ISO 8601 formatted date string, or 'N/A' if invalid
 *
 * @example
 * formatTimestamp('0x5f5e100'); // Returns '1973-03-03T09:46:40.000Z'
 * formatTimestamp(null); // Returns 'N/A'
 */
export function formatTimestamp(hexTimestamp) {
  if (!hexTimestamp) return 'N/A';
  const timestamp = parseInt(hexTimestamp, 16);
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Truncates a hash or hex string for display, showing the beginning and end.
 *
 * @param {string} hash - The full hash string to truncate
 * @param {number} [chars=8] - The number of characters to show at each end
 * @returns {string} The truncated hash in format '0xabc123...xyz789', or 'N/A' if invalid
 *
 * @example
 * truncateHash('0x1234567890abcdef1234567890abcdef12345678'); // Returns '0x12345678...12345678'
 * truncateHash('0x1234567890abcdef', 4); // Returns '0x1234...cdef'
 * truncateHash(null); // Returns 'N/A'
 */
export function truncateHash(hash, chars = 8) {
  if (!hash) return 'N/A';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Formats Ethereum block data as a Markdown table.
 *
 * @param {Object} block - The block object from eth_getBlockByHash or eth_getBlockByNumber
 * @param {string} block.number - Block number in hex
 * @param {string} block.hash - Block hash
 * @param {string} block.parentHash - Parent block hash
 * @param {string} block.timestamp - Block timestamp in hex
 * @param {string} block.miner - Miner address
 * @param {string} block.gasUsed - Gas used in hex
 * @param {string} block.gasLimit - Gas limit in hex
 * @param {string} [block.baseFeePerGas] - Base fee per gas in hex (EIP-1559)
 * @param {Array<string>} [block.transactions] - Array of transaction hashes
 * @param {Array<string>} [block.uncles] - Array of uncle block hashes
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted block information
 *
 * @example
 * const block = await provider.getBlock('latest');
 * const markdown = formatBlock(block, 'eth_getBlockByNumber');
 */
export function formatBlock(block, toolName) {
  if (!block) return 'Block not found.';

  return `# Block ${hexToDecimal(block.number)}

| Property | Value |
|----------|-------|
| Hash | \`${block.hash}\` |
| Parent Hash | \`${truncateHash(block.parentHash)}\` |
| Timestamp | ${formatTimestamp(block.timestamp)} |
| Miner | \`${block.miner}\` |
| Gas Used | ${hexToDecimal(block.gasUsed)} |
| Gas Limit | ${hexToDecimal(block.gasLimit)} |
| Base Fee | ${block.baseFeePerGas ? hexToDecimal(block.baseFeePerGas) + ' wei' : 'N/A'} |
| Transactions | ${block.transactions?.length || 0} |
| Uncles | ${block.uncles?.length || 0} |
`;
}

/**
 * Formats Ethereum transaction data as a Markdown table.
 *
 * @param {Object} tx - The transaction object from eth_getTransactionByHash
 * @param {string} tx.hash - Transaction hash
 * @param {string|null} tx.blockNumber - Block number in hex (null if pending)
 * @param {string} tx.from - Sender address
 * @param {string|null} tx.to - Recipient address (null for contract creation)
 * @param {string} tx.value - Value transferred in wei (hex)
 * @param {string} tx.gas - Gas limit in hex
 * @param {string} [tx.gasPrice] - Gas price in wei (hex)
 * @param {string} tx.nonce - Transaction nonce in hex
 * @param {string} tx.input - Transaction input data
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted transaction information
 *
 * @example
 * const tx = await provider.getTransaction(txHash);
 * const markdown = formatTransaction(tx, 'eth_getTransactionByHash');
 */
export function formatTransaction(tx, toolName) {
  if (!tx) return 'Transaction not found.';

  return `# Transaction

| Property | Value |
|----------|-------|
| Hash | \`${tx.hash}\` |
| Status | ${tx.blockNumber ? 'Confirmed' : 'Pending'} |
| Block | ${tx.blockNumber ? hexToDecimal(tx.blockNumber) : 'Pending'} |
| From | \`${tx.from}\` |
| To | \`${tx.to || 'Contract Creation'}\` |
| Value | ${weiToEth(tx.value)} |
| Gas | ${hexToDecimal(tx.gas)} |
| Gas Price | ${tx.gasPrice ? hexToDecimal(tx.gasPrice) + ' wei' : 'N/A'} |
| Nonce | ${hexToDecimal(tx.nonce)} |
| Input | ${tx.input === '0x' ? 'None' : `\`${truncateHash(tx.input, 16)}\``} |
`;
}

/**
 * Formats Ethereum transaction receipt data as a Markdown table.
 *
 * @param {Object} receipt - The receipt object from eth_getTransactionReceipt
 * @param {string} receipt.status - Transaction status ('0x1' for success, '0x0' for failure)
 * @param {string} receipt.transactionHash - Transaction hash
 * @param {string} receipt.blockNumber - Block number in hex
 * @param {string} receipt.from - Sender address
 * @param {string|null} receipt.to - Recipient address (null for contract creation)
 * @param {string|null} receipt.contractAddress - Created contract address (if applicable)
 * @param {string} receipt.gasUsed - Gas used in hex
 * @param {string} [receipt.effectiveGasPrice] - Effective gas price in wei (hex)
 * @param {Array<Object>} [receipt.logs] - Array of log entries
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted receipt information
 *
 * @example
 * const receipt = await provider.getTransactionReceipt(txHash);
 * const markdown = formatReceipt(receipt, 'eth_getTransactionReceipt');
 */
export function formatReceipt(receipt, toolName) {
  if (!receipt) return 'Receipt not found.';

  const status = receipt.status === '0x1' ? 'Success' : 'Failed';

  return `# Transaction Receipt

| Property | Value |
|----------|-------|
| Status | **${status}** |
| Transaction Hash | \`${receipt.transactionHash}\` |
| Block | ${hexToDecimal(receipt.blockNumber)} |
| From | \`${receipt.from}\` |
| To | \`${receipt.to || 'Contract Created'}\` |
| Contract Address | ${receipt.contractAddress ? `\`${receipt.contractAddress}\`` : 'N/A'} |
| Gas Used | ${hexToDecimal(receipt.gasUsed)} |
| Effective Gas Price | ${receipt.effectiveGasPrice ? hexToDecimal(receipt.effectiveGasPrice) + ' wei' : 'N/A'} |
| Logs | ${receipt.logs?.length || 0} events |
`;
}

/**
 * Formats an Ethereum account balance as Markdown.
 *
 * @param {string} balance - The balance in wei as a hexadecimal string
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted balance with ETH and wei values
 *
 * @example
 * const balance = await provider.getBalance(address);
 * const markdown = formatBalance(balance, 'eth_getBalance');
 */
export function formatBalance(balance, toolName) {
  return `# Account Balance

**Balance:** ${weiToEth(balance)}

Raw value: \`${balance}\` (${hexToDecimal(balance)} wei)
`;
}

/**
 * Formats Ethereum event logs as Markdown.
 *
 * Displays up to 10 logs with details. If more than 10 logs are present,
 * shows a message indicating the remaining count.
 *
 * @param {Array<Object>} logs - Array of log objects from eth_getLogs
 * @param {string} logs[].address - Contract address that emitted the log
 * @param {string} logs[].blockNumber - Block number in hex
 * @param {string} logs[].transactionHash - Transaction hash
 * @param {Array<string>} logs[].topics - Array of indexed event topics
 * @param {string} logs[].data - Non-indexed event data
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted log entries
 *
 * @example
 * const logs = await provider.getLogs({ fromBlock: 'latest', toBlock: 'latest' });
 * const markdown = formatLogs(logs, 'eth_getLogs');
 */
export function formatLogs(logs, toolName) {
  if (!logs || logs.length === 0) return 'No logs found.';

  let md = `# Event Logs

Found **${logs.length}** log entries.

`;

  logs.slice(0, 10).forEach((log, i) => {
    md += `## Log ${i + 1}

| Property | Value |
|----------|-------|
| Address | \`${log.address}\` |
| Block | ${hexToDecimal(log.blockNumber)} |
| Transaction | \`${truncateHash(log.transactionHash)}\` |
| Topics | ${log.topics?.length || 0} |
| Data | ${log.data === '0x' ? 'None' : `\`${truncateHash(log.data, 16)}\``} |

`;
  });

  if (logs.length > 10) {
    md += `\n*...and ${logs.length - 10} more logs (showing first 10)*\n`;
  }

  return md;
}

/**
 * Formats the current gas price as Markdown.
 *
 * @param {string} gasPrice - The gas price in wei as a hexadecimal string
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted gas price with Gwei and wei values
 *
 * @example
 * const gasPrice = await provider.getGasPrice();
 * const markdown = formatGasPrice(gasPrice, 'eth_getGasPrice');
 */
export function formatGasPrice(gasPrice, toolName) {
  const gwei = Number(BigInt(gasPrice)) / 1e9;
  return `# Current Gas Price

**Gas Price:** ${gwei.toFixed(2)} Gwei

Raw value: \`${gasPrice}\` (${hexToDecimal(gasPrice)} wei)
`;
}

/**
 * Formats fee history data as a Markdown table.
 *
 * Displays up to 10 blocks of fee history including base fees and gas usage ratios.
 *
 * @param {Object} history - The fee history object from eth_feeHistory
 * @param {Array<string>} [history.baseFeePerGas] - Array of base fees in hex
 * @param {Array<number>} [history.gasUsedRatio] - Array of gas used ratios (0-1)
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted fee history table
 *
 * @example
 * const history = await provider.getFeeHistory(10, 'latest', [25, 50, 75]);
 * const markdown = formatFeeHistory(history, 'eth_getFeeHistory');
 */
export function formatFeeHistory(history, toolName) {
  if (!history) return 'Fee history not available.';

  let md = `# Fee History

| Block | Base Fee (Gwei) | Gas Used Ratio |
|-------|-----------------|----------------|
`;

  const baseFees = history.baseFeePerGas || [];
  const gasRatios = history.gasUsedRatio || [];

  baseFees.slice(0, 10).forEach((fee, i) => {
    const gwei = (Number(BigInt(fee)) / 1e9).toFixed(2);
    const ratio = gasRatios[i] ? (gasRatios[i] * 100).toFixed(1) + '%' : 'N/A';
    md += `| ${i + 1} | ${gwei} | ${ratio} |\n`;
  });

  return md;
}

/**
 * Formats a simple hexadecimal value with a custom label as Markdown.
 *
 * @param {string} value - The hexadecimal value to format
 * @param {string} label - The label/title for the value
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted value with label
 *
 * @example
 * formatHexValue('0x10', 'Block Number', 'eth_blockNumber');
 * // Returns: '# Block Number\n\n**Value:** 16\n\nRaw hex: `0x10`\n'
 */
export function formatHexValue(value, label, toolName) {
  return `# ${label}

**Value:** ${hexToDecimal(value)}

Raw hex: \`${value}\`
`;
}

/**
 * Formats the Ethereum node sync status as Markdown.
 *
 * @param {boolean|Object} status - Sync status (false if synced, or sync progress object)
 * @param {string} [status.startingBlock] - Starting block of sync in hex
 * @param {string} [status.currentBlock] - Current block in hex
 * @param {string} [status.highestBlock] - Highest known block in hex
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted sync status
 *
 * @example
 * const syncStatus = await provider.isSyncing();
 * const markdown = formatSyncStatus(syncStatus, 'eth_syncing');
 */
export function formatSyncStatus(status, toolName) {
  if (status === false) {
    return `# Sync Status

**Status:** Fully synced
`;
  }

  return `# Sync Status

**Status:** Syncing...

| Property | Value |
|----------|-------|
| Starting Block | ${hexToDecimal(status.startingBlock)} |
| Current Block | ${hexToDecimal(status.currentBlock)} |
| Highest Block | ${hexToDecimal(status.highestBlock)} |
`;
}

/**
 * Formats a boolean result with a custom label as Markdown.
 *
 * @param {boolean} value - The boolean value to format
 * @param {string} label - The label/title for the result
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted boolean result
 *
 * @example
 * formatBoolean(true, 'Network Listening', 'net_listening');
 * // Returns: '# Network Listening\n\n**Result:** Yes\n'
 */
export function formatBoolean(value, label, toolName) {
  return `# ${label}

**Result:** ${value ? 'Yes' : 'No'}
`;
}

/**
 * Formats contract bytecode as Markdown.
 *
 * Shows bytecode length and a truncated preview (first 200 characters).
 * For EOAs (externally owned accounts) or empty contracts, indicates no code.
 *
 * @param {string} code - The contract bytecode as a hexadecimal string
 * @param {string} toolName - The name of the calling tool (for context)
 * @returns {string} Markdown formatted code information
 *
 * @example
 * const code = await provider.getCode(contractAddress);
 * const markdown = formatCode(code, 'eth_getCode');
 */
export function formatCode(code, toolName) {
  if (!code || code === '0x') {
    return `# Contract Code

**Result:** No code (EOA or empty contract)
`;
  }

  return `# Contract Code

**Bytecode Length:** ${(code.length - 2) / 2} bytes

\`\`\`
${code.slice(0, 200)}${code.length > 200 ? '...' : ''}
\`\`\`
`;
}

/**
 * Main formatter that routes to the appropriate formatter based on the tool name.
 *
 * This is the primary entry point for formatting Ethereum JSON-RPC responses.
 * It automatically selects the appropriate formatter based on the RPC method name.
 *
 * @param {*} result - The raw result from the Ethereum JSON-RPC call
 * @param {string} toolName - The name of the Ethereum JSON-RPC method
 * @returns {string} Markdown formatted result
 *
 * @example
 * // Format a block response
 * const block = await rpcCall('eth_getBlockByNumber', ['latest', true]);
 * const markdown = formatAsMarkdown(block, 'eth_getBlockByNumber');
 *
 * @example
 * // Format a balance response
 * const balance = await rpcCall('eth_getBalance', [address, 'latest']);
 * const markdown = formatAsMarkdown(balance, 'eth_getBalance');
 *
 * @example
 * // Handle unknown methods with generic formatting
 * const result = await rpcCall('custom_method', []);
 * const markdown = formatAsMarkdown(result, 'custom_method');
 */
export function formatAsMarkdown(result, toolName) {
  // Handle null/undefined
  if (result === null || result === undefined) {
    return 'No data returned.';
  }

  // Route to specific formatter based on tool name
  switch (toolName) {
    case 'eth_getBlockNumber':
      return formatHexValue(result, 'Latest Block Number', toolName);

    case 'eth_getBlockByHash':
    case 'eth_getBlockByNumber':
      return formatBlock(result, toolName);

    case 'eth_getTransactionByHash':
    case 'eth_getTransactionByBlockHashAndIndex':
    case 'eth_getTransactionByBlockNumberAndIndex':
      return formatTransaction(result, toolName);

    case 'eth_getTransactionReceipt':
      return formatReceipt(result, toolName);

    case 'eth_getBalance':
      return formatBalance(result, toolName);

    case 'eth_getLogs':
      return formatLogs(result, toolName);

    case 'eth_getGasPrice':
      return formatGasPrice(result, toolName);

    case 'eth_getFeeHistory':
      return formatFeeHistory(result, toolName);

    case 'eth_isSyncing':
      return formatSyncStatus(result, toolName);

    case 'eth_getCode':
      return formatCode(result, toolName);

    case 'eth_chainId':
      return formatHexValue(result, 'Chain ID', toolName);

    case 'eth_getTransactionCount':
      return formatHexValue(result, 'Transaction Count (Nonce)', toolName);

    case 'eth_getBlockTransactionCountByHash':
    case 'eth_getBlockTransactionCountByNumber':
      return formatHexValue(result, 'Block Transaction Count', toolName);

    case 'eth_getUncleCountByBlockHash':
    case 'eth_getUncleCountByBlockNumber':
      return formatHexValue(result, 'Uncle Count', toolName);

    case 'eth_estimateGas':
      return formatHexValue(result, 'Estimated Gas', toolName);

    case 'eth_getStorageAt':
      return formatHexValue(result, 'Storage Value', toolName);

    case 'net_isListening':
      return formatBoolean(result, 'Network Listening', toolName);

    case 'net_getPeerCount':
      return formatHexValue(result, 'Peer Count', toolName);

    case 'net_getVersion':
      return `# Network Version\n\n**Network ID:** ${result}\n`;

    case 'web3_getClientVersion':
      return `# Client Version\n\n**Version:** ${result}\n`;

    case 'eth_getProtocolVersion':
      return `# Protocol Version\n\n**Version:** ${result}\n`;

    case 'eth_call':
      return `# Contract Call Result\n\n**Return Data:**\n\`\`\`\n${result}\n\`\`\`\n`;

    default:
      // Generic formatting for unknown tools
      if (typeof result === 'string') {
        return `# Result\n\n\`${result}\`\n`;
      }
      return `# Result\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`;
  }
}
