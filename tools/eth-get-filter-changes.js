import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get filter changes from the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the filter changes.
 * @param {string} args.filterId - The filter ID to poll for changes.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Array>} - An array of changes that have occurred since the last poll.
 */
const executeFunction = async ({ filterId, network = "mainnet" }) => {
  return callInfura("eth_getFilterChanges", [filterId], network);
};

/**
 * Tool configuration for getting filter changes from the Ethereum network using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getFilterChanges",
      description:
        "Polls the specified filter and returns an array of changes that have occurred since the last poll on a given network.",
      parameters: {
        type: "object",
        properties: {
          filterId: {
            type: "string",
            description: "The filter ID to poll for changes.",
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