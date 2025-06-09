import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current work details from the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the eth_getWork call.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_getWork", [], network);
};

/**
 * Tool configuration for getting current work details from Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getWork",
      description:
        "Returns the hash of the current block, the seed hash, and the required target boundary condition from a specified network.",
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