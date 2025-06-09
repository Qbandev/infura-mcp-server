import { callInfura } from "../lib/infura-client.js";

/**
 * Function to create a new block filter in Ethereum using Infura.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the filter ID.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_newBlockFilter", [], network);
};

/**
 * Tool configuration for creating a new block filter in Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_newBlockFilter",
      description: "Creates a filter to retrieve new block hashes on a specified network.",
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