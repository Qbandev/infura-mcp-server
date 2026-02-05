/**
 * @fileoverview Tool for retrieving transaction details by hash via Infura JSON-RPC API.
 * @module tools/eth-get-transaction-by-hash
 *
 * This tool fetches detailed information about a specific transaction using its
 * unique transaction hash. It returns the transaction data as it was submitted
 * to the network, including sender, recipient, value, gas parameters, and input data.
 *
 * Note: This returns the transaction object, not the receipt. For execution results
 * (status, logs, gas used), use eth_getTransactionReceipt instead.
 *
 * Transaction data includes:
 * - Addresses (from, to)
 * - Value and gas parameters (value, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas)
 * - Transaction metadata (hash, nonce, transactionIndex)
 * - Block information (blockHash, blockNumber) - null if pending
 * - Input data (for contract interactions)
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_gettransactionbyhash|Infura eth_getTransactionByHash docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyhash|Ethereum JSON-RPC spec}
 *
 * @example
 * // Get transaction details on mainnet
 * const result = await eth_getTransactionByHash({
 *   transactionHash: "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
 *   network: "mainnet"
 * });
 * // Returns: Transaction object with from, to, value, gas, input, etc.
 *
 * @example
 * // Query a transaction on Sepolia testnet
 * const result = await eth_getTransactionByHash({
 *   transactionHash: "0xabc123...",
 *   network: "sepolia"
 * });
 */

import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Executes the eth_getTransactionByHash JSON-RPC call to retrieve transaction details.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.transactionHash - The 32-byte transaction hash (0x-prefixed, 64 hex characters).
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<Object|null>} Transaction object with hash, from, to, value, gas, gasPrice, input, nonce, blockHash, blockNumber, transactionIndex. Returns null if not found.
 * @throws {ValidationError} If transactionHash is not a valid 32-byte hex string.
 * @throws {McpError} If the Infura API is unavailable or returns an error.
 */
const executeFunction = async ({ transactionHash, network = "mainnet" }) => {
  validateHash(transactionHash, 'transactionHash');
  return callInfura("eth_getTransactionByHash", [transactionHash], network);
};

/**
 * Tool configuration for getting transaction information by hash from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionByHash",
      description:
        "Retrieves detailed transaction information using its unique transaction hash.\n\nArgs:\n  - transactionHash (string): 32-byte transaction hash in hex format (e.g., '0xabc123...')\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Transaction object with hash, from, to, value, gas, gasPrice, input, nonce, blockHash, blockNumber, transactionIndex; null if transaction not found or still pending\n\nExamples:\n  - \"Get transaction details\": { \"transactionHash\": \"0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b\" }\n  - \"Query on Sepolia testnet\": { \"transactionHash\": \"0xabc...\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When transactionHash is not a valid 32-byte hex string\n  - InternalError: When Infura API is unavailable",
      parameters: {
        type: "object",
        properties: {
          transactionHash: {
            type: "string",
            description: "The 32-byte transaction hash to query.",
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