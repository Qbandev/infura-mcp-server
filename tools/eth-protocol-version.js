import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current Ethereum protocol version from Infura.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the Ethereum protocol version request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_protocolVersion", [], network);
};

/**
 * Tool configuration for getting the Ethereum protocol version from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getProtocolVersion",
      description:
        "Returns the current Ethereum protocol version used by the node. Useful for checking client compatibility and supported features.\n\nArgs:\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Hex-encoded string representing the protocol version number (e.g., '0x41' for version 65)\n\nExamples:\n  - \"Get mainnet protocol version\": {}\n  - \"Get Sepolia protocol version\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable or method not supported",
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