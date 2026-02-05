import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Function to get the number of uncles in a block from Ethereum using Infura.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockHash - The 32-byte block hash to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the number of uncles in the specified block.
 */
const executeFunction = async ({ blockHash, network = "mainnet" }) => {
  validateHash(blockHash, 'blockHash');
  return callInfura("eth_getUncleCountByBlockHash", [blockHash], network);
};

/**
 * Tool configuration for getting the number of uncles in a block from Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleCountByBlockHash",
      description:
        "Returns the number of uncle (ommer) blocks in a specific block identified by its hash.\n\nArgs:\n  - blockHash (string): 32-byte hash of the block to query (e.g., '0xabc123...')\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Hex-encoded integer representing the number of uncles in the block (e.g., '0x0' for no uncles, '0x2' for two uncles)\n\nExamples:\n  - \"Get uncle count for block\": { \"blockHash\": \"0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35\" }\n  - \"Query on Sepolia\": { \"blockHash\": \"0xabc...\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When blockHash is not a valid 32-byte hex string\n  - InternalError: When Infura API is unavailable",
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