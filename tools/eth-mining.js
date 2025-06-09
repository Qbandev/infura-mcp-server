import { callInfura } from "../lib/infura-client.js";

/**
 * Function to check if the Ethereum client is actively mining new blocks.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the mining status check.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_mining", [], network);
};

/**
 * Tool configuration for checking Ethereum mining status.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_isMining",
      description:
        "Check if the Ethereum client is actively mining new blocks on a specified network.",
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