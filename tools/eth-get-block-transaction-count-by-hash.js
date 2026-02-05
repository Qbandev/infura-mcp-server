import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Function to get the transaction count of a block by its hash from the Infura Ethereum JSON-RPC API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockHash - The 32-byte block hash to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the number of transactions in the specified block.
 */
const executeFunction = async ({ blockHash, network = "mainnet" }) => {
  validateHash(blockHash, 'blockHash');
  return callInfura("eth_getBlockTransactionCountByHash", [blockHash], network);
};

/**
 * Tool configuration for getting the transaction count of a block by its hash from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockTransactionCountByHash",
      description:
        "Get the number of transactions in a block identified by its hash.\n\nArgs:\n  - blockHash (string): 32-byte block hash (66 chars with 0x prefix).\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing transaction count (e.g., '0x10' for 16 transactions). Returns null if block not found.\n\nExamples:\n  - \"Count txs in block\": { \"blockHash\": \"0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238\" }\n  - \"Query Sepolia block\": { \"blockHash\": \"0x...\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When blockHash format is invalid (not 66 char hex).\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte block hash to query.",
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
        required: ["blockHash"],
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