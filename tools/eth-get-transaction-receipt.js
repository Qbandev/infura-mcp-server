/**
 * @fileoverview Tool for retrieving transaction receipts via Infura JSON-RPC API.
 * @module tools/eth-get-transaction-receipt
 *
 * This tool fetches the receipt of a mined transaction, which contains the execution
 * results including status, gas consumption, and emitted event logs. Receipts are only
 * available for transactions that have been included in a block (not pending).
 *
 * Key differences from eth_getTransactionByHash:
 * - Receipt includes execution status (success/failure)
 * - Receipt includes actual gas used (not just gas limit)
 * - Receipt includes event logs emitted during execution
 * - Receipt is only available after transaction is mined
 *
 * Receipt data includes:
 * - Execution status (1 = success, 0 = failure/revert)
 * - Gas information (gasUsed, cumulativeGasUsed, effectiveGasPrice)
 * - Block data (blockHash, blockNumber, transactionIndex)
 * - Contract address (if this was a contract creation)
 * - Event logs array with topics and data
 * - Logs bloom filter for efficient log searching
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_gettransactionreceipt|Infura eth_getTransactionReceipt docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt|Ethereum JSON-RPC spec}
 *
 * @example
 * // Check if a transaction succeeded
 * const receipt = await eth_getTransactionReceipt({
 *   transactionHash: "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
 *   network: "mainnet"
 * });
 * // receipt.status === "0x1" means success
 * // receipt.logs contains emitted events
 *
 * @example
 * // Get receipt on Sepolia testnet
 * const receipt = await eth_getTransactionReceipt({
 *   transactionHash: "0xabc123...",
 *   network: "sepolia"
 * });
 */

import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Executes the eth_getTransactionReceipt JSON-RPC call to retrieve the transaction receipt.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.transactionHash - The 32-byte transaction hash (0x-prefixed, 64 hex characters).
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<Object|null>} Receipt object with status, blockHash, blockNumber, transactionIndex, from, to, contractAddress, cumulativeGasUsed, gasUsed, effectiveGasPrice, logs, logsBloom. Returns null if transaction is pending or not found.
 * @throws {ValidationError} If transactionHash is not a valid 32-byte hex string.
 * @throws {McpError} If the Infura API is unavailable or returns an error.
 */
const executeFunction = async ({ transactionHash, network = "mainnet" }) => {
  validateHash(transactionHash, 'transactionHash');
  return callInfura("eth_getTransactionReceipt", [transactionHash], network);
};

/**
 * Tool configuration for getting transaction receipts from Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionReceipt",
      description:
        "Retrieves the receipt of a mined transaction, including status, gas used, and logs. Only available for transactions that have been included in a block.\n\nArgs:\n  - transactionHash (string): 32-byte transaction hash in hex format (e.g., '0xabc123...')\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Receipt object with status (1=success, 0=failure), blockHash, blockNumber, transactionIndex, from, to, contractAddress (if contract creation), cumulativeGasUsed, gasUsed, effectiveGasPrice, logs array, logsBloom; null if transaction pending or not found\n\nExamples:\n  - \"Get receipt to check if transaction succeeded\": { \"transactionHash\": \"0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b\" }\n  - \"Get receipt on Sepolia\": { \"transactionHash\": \"0xabc...\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When transactionHash is not a valid 32-byte hex string\n  - InternalError: When Infura API is unavailable",
      parameters: {
        type: "object",
        properties: {
          transactionHash: {
            type: "string",
            description: "The 32-byte hash of the transaction.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
          response_format: {
            type: "string",
            enum: ["json", "markdown"],
            description: "Output format: 'json' for structured data, 'markdown' for human-readable.",
            default: "json",
          },
        },
        required: ["transactionHash"],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
  },
};

export { apiTool };