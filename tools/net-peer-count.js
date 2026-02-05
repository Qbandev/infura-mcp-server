import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the number of peers connected to the Ethereum client.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the peer count request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("net_peerCount", [], network);
};

/**
 * Tool configuration for getting the number of peers connected to the Ethereum client.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "net_getPeerCount",
      description:
        "Returns the number of peers currently connected to the client. Useful for monitoring network connectivity and health.\n\nArgs:\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Hex-encoded integer representing the number of connected peers (e.g., '0x19' for 25 peers)\n\nExamples:\n  - \"Get mainnet peer count\": {}\n  - \"Get Sepolia peer count\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable",
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