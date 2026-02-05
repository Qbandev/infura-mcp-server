import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the latest block number from the Ethereum network using Infura.
 * @param {object} args The arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the block number request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_blockNumber", [], network);
};

/**
 * Tool configuration for fetching the latest block number from Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockNumber",
      description:
        "Fetch the latest block number from an Ethereum network.\n\nArgs:\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing the current block number (e.g., '0x10d4f').\n\nExamples:\n  - \"Get mainnet block number\": {}\n  - \"Get Sepolia block number\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
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