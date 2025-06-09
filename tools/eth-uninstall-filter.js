import { callInfura } from "../lib/infura-client.js";

/**
 * Function to uninstall a filter in the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the uninstall filter.
 * @param {string} args.filterId - The ID of the filter to uninstall.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<boolean>} - Returns true if the filter was successfully uninstalled, otherwise false.
 */
const executeFunction = async ({ filterId, network = "mainnet" }) => {
  return callInfura("eth_uninstallFilter", [filterId], network);
};

/**
 * Tool configuration for uninstalling a filter in the Ethereum network using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_uninstallFilter",
      description: "Uninstalls a filter with the specified ID on a given network.",
      parameters: {
        type: "object",
        properties: {
          filterId: {
            type: "string",
            description: "The ID of the filter to uninstall.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["filterId"],
      },
    },
  },
};

export { apiTool };