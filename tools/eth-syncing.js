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
        "Check the synchronization status of the Ethereum node on a specified network.",
      parameters: {
        type: "object",
        properties: {
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: [],
      },
    },
  },
};

export { apiTool };