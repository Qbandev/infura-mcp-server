import { callInfura } from "../lib/infura-client.js";

/**
 * Function to check the synchronization status of the Ethereum node.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object|boolean>} - An object with synchronization status data or `false` if not synchronizing.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_syncing", [], network);
};

/**
 * Tool configuration for checking Ethereum node synchronization status.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_isSyncing",
      description:
        "Returns the sync status of the Ethereum node. Useful for determining if the node is fully synced before relying on its data.\n\nArgs:\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - false if the node is not syncing (fully synced)\n  - Object with startingBlock, currentBlock, and highestBlock (all hex-encoded) if syncing is in progress\n\nExamples:\n  - \"Check if mainnet node is synced\": {}\n  - \"Check Sepolia sync status\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable",
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