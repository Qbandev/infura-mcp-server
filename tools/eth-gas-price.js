import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current gas price from the Infura Ethereum JSON-RPC.
 *
 * @param {object} args The arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The gas price in Wei as a hexadecimal value.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_gasPrice", [], network);
};

/**
 * Tool configuration for fetching gas price from Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getGasPrice",
      description:
        "Get the current gas price in wei for legacy (non-EIP-1559) transactions.\n\nArgs:\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing gas price in wei (e.g., '0x3b9aca00' for 1 Gwei).\n\nExamples:\n  - \"Get mainnet gas price\": {}\n  - \"Get Sepolia gas price\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable or returns an error.",
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