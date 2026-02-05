import { callInfura } from "../lib/infura-client.js";

/**
 * Function to check if the Ethereum client is actively listening for network connections.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the net_listening method.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("net_listening", [], network);
};

/**
 * Tool configuration for checking if the Ethereum client is listening for network connections.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "net_isListening",
      description:
        "Returns whether the client is actively listening for network connections. Useful for checking node connectivity status.\n\nArgs:\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - true if the client is listening for connections\n  - false if the client is not listening\n\nExamples:\n  - \"Check if mainnet node is listening\": {}\n  - \"Check Sepolia node status\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable",
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