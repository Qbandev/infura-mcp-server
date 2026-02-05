/**
 * @fileoverview Tool for querying Ethereum account balances via Infura JSON-RPC API.
 * @module tools/eth-get-balance
 *
 * This tool retrieves the native ETH balance of any Ethereum address at a specific
 * block height using the Infura JSON-RPC API. The balance is returned in wei as a
 * hexadecimal string.
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_getbalance|Infura eth_getBalance docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance|Ethereum JSON-RPC spec}
 *
 * @example
 * // Get the current balance of an address on mainnet
 * const result = await eth_getBalance({
 *   address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
 *   tag: "latest",
 *   network: "mainnet"
 * });
 * // Returns: "0xde0b6b3a7640000" (1 ETH in wei as hex)
 *
 * @example
 * // Get balance at a specific block on Sepolia testnet
 * const result = await eth_getBalance({
 *   address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
 *   tag: "0x10d4f",
 *   network: "sepolia"
 * });
 */

import { callInfura } from "../lib/infura-client.js";
import { validateAddress, validateBlockTag } from "../lib/validators.js";

/**
 * Executes the eth_getBalance JSON-RPC call to retrieve an account's ETH balance.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.address - Ethereum address to query (0x-prefixed, 40 hex characters).
 * @param {string} args.tag - Block identifier: "latest", "earliest", "pending", "safe", "finalized", or hex block number.
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<string>} Balance in wei as a hexadecimal string (e.g., "0xde0b6b3a7640000").
 * @throws {ValidationError} If the address format is invalid (not 0x + 40 hex chars).
 * @throws {ValidationError} If the block tag format is not recognized.
 * @throws {McpError} If the Infura API call fails or returns an error.
 */
const executeFunction = async ({ address, tag = "latest", network = "mainnet" }) => {
  validateAddress(address);
  validateBlockTag(tag);
  return callInfura("eth_getBalance", [address, tag], network);
};

/**
 * Tool configuration for getting Ethereum account balance.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBalance",
      description:
        "Get the ETH balance of an address at a specific block.\n\nArgs:\n  - address (string): Ethereum address to check (20-byte hex, e.g., '0x...').\n  - tag (string): Block reference - 'latest', 'earliest', or 'pending'.\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing balance in wei (e.g., '0xde0b6b3a7640000' for 1 ETH).\n\nExamples:\n  - \"Get current balance\": { \"address\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\", \"tag\": \"latest\" }\n  - \"Check Sepolia balance\": { \"address\": \"0x...\", \"tag\": \"latest\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When address format is invalid or tag is not recognized.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The Ethereum address to check the balance for.",
          },
          tag: {
            type: "string",
            enum: ["latest", "earliest", "pending"],
            description: "The block parameter to use.",
            default: "latest",
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
        required: ["address"],
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