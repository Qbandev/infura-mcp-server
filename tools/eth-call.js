/**
 * @fileoverview Tool for executing read-only smart contract calls via Infura JSON-RPC API.
 * @module tools/eth-call
 *
 * This tool executes a message call to a smart contract without creating a transaction
 * on the blockchain. It is commonly used to read data from contracts, such as querying
 * ERC-20 token balances, fetching NFT metadata, or calling any view/pure function.
 *
 * The call is executed against the "latest" block state.
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_call|Infura eth_call docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call|Ethereum JSON-RPC spec}
 *
 * @example
 * // Query ERC-20 token balance (balanceOf function selector: 0x70a08231)
 * const result = await eth_call({
 *   to: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT contract
 *   data: "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
 *   network: "mainnet"
 * });
 * // Returns: "0x0000000000000000000000000000000000000000000000000000000005f5e100"
 *
 * @example
 * // Call a contract on Sepolia testnet
 * const result = await eth_call({
 *   to: "0x1234567890123456789012345678901234567890",
 *   data: "0x06fdde03", // name() function selector
 *   network: "sepolia"
 * });
 */

import { callInfura } from "../lib/infura-client.js";
import { validateAddress, isValidHexString, ValidationError } from "../lib/validators.js";

/**
 * Executes the eth_call JSON-RPC method to perform a read-only contract call.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.to - Target contract address (0x-prefixed, 40 hex characters).
 * @param {string} args.data - ABI-encoded function call data (0x-prefixed hex string).
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<string>} ABI-encoded return value as a hexadecimal string.
 * @throws {ValidationError} If the "to" address format is invalid.
 * @throws {ValidationError} If the "data" is not a valid hex string starting with 0x.
 * @throws {McpError} If the contract execution reverts or Infura API fails.
 */
const executeFunction = async ({ to, data, network = "mainnet" }) => {
  validateAddress(to, 'to');
  if (!isValidHexString(data)) {
    throw new ValidationError('Invalid data format. Expected hex string starting with 0x.', 'data');
  }
  const params = [
    {
      to,
      data,
    },
    "latest",
  ];
  return callInfura("eth_call", params, network);
};

/**
 * Tool configuration for making Ethereum calls using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_call",
      description:
        "Execute a read-only smart contract call without creating a transaction.\n\nArgs:\n  - to (string): Contract address to call (20-byte hex, e.g., '0x...').\n  - data (string): ABI-encoded function call data (hex string starting with 0x).\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string containing the return value of the executed contract method.\n\nExamples:\n  - \"Read ERC20 balance\": { \"to\": \"0xdAC17F958D2ee523a2206206994597C13D831ec7\", \"data\": \"0x70a08231000000000000000000000000...\" }\n  - \"Query on Sepolia\": { \"to\": \"0x...\", \"data\": \"0x...\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When 'to' address or 'data' format is invalid.\n  - InternalError: When contract execution reverts or Infura API fails.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "The address of the contract to call.",
          },
          data: {
            type: "string",
            description: "The data to send with the call.",
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
        required: ["to", "data"],
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