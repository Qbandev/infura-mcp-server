import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get filter logs from the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the log retrieval.
 * @param {string} args.filterId - The filter ID to retrieve logs for.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the log retrieval.
 */
const executeFunction = async ({ filterId, network = "mainnet" }) => {
  return callInfura("eth_getFilterLogs", [filterId], network);
};

/**
 * Tool configuration for retrieving filter logs from Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getFilterLogs",
      description:
        "Retrieve logs for a specified filter ID from a given Ethereum network.",
      parameters: {
        type: "object",
        properties: {
          filterId: {
            type: "string",
            description: "The filter ID to retrieve logs for.",
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