import { callInfura } from "../lib/infura-client.js";
import { validateBlockTag } from "../lib/validators.js";

/**
 * Function to get the number of uncles in a block by block number using Infura's Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} [args.blockNumber="latest"] - The block number or tag (latest, earliest, pending) to get the uncle count for.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the uncle count request.
 */
const executeFunction = async ({
  blockNumber = "latest",
  network = "mainnet",
}) => {
  validateBlockTag(blockNumber, 'blockNumber');
  return callInfura("eth_getUncleCountByBlockNumber", [blockNumber], network);
};

/**
 * Tool configuration for getting the uncle count by block number on Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleCountByBlockNumber",
      description:
        "Returns the number of uncle (ommer) blocks in a specific block identified by its number or tag.\n\nArgs:\n  - blockNumber (string, optional): Block number as hex (e.g., '0x10d4f') or tag ('latest', 'earliest', 'pending'), defaults to 'latest'\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Hex-encoded integer representing the number of uncles in the block (e.g., '0x0' for no uncles, '0x2' for two uncles)\n\nExamples:\n  - \"Get uncle count for latest block\": {}\n  - \"Get uncle count for specific block\": { \"blockNumber\": \"0x29c\" }\n  - \"Query on Sepolia\": { \"blockNumber\": \"latest\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When blockNumber format is invalid\n  - InternalError: When Infura API is unavailable",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description:
              "The block number or tag (latest, earliest, pending) to get the uncle count for.",
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
        required: [],
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