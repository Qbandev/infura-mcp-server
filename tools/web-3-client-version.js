import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current client version from Infura Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the current client version.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("web3_clientVersion", [], network);
};

/**
 * Tool configuration for getting the current client version from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "web3_getClientVersion",
      description:
        "Returns the current Ethereum client version string. Useful for identifying the node software and version being used.\n\nArgs:\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - String containing the client name and version (e.g., 'Geth/v1.10.26-stable/linux-amd64/go1.18.5')\n\nExamples:\n  - \"Get mainnet client version\": {}\n  - \"Get Sepolia client version\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable",
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