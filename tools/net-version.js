import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the network ID from Infura Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the current network ID.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("net_version", [], network);
};

/**
 * Tool configuration for getting the network ID from Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "net_getVersion",
      description:
        "Get the current network ID from a specified Infura Ethereum network.",
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