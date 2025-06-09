import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the Ethereum chain ID from Infura.
 * @param {object} args The arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the chain ID in hexadecimal.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_chainId", [], network);
};

/**
 * Tool configuration for getting the Ethereum chain ID from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_chainId",
      description: "Get the Ethereum chain ID from a specified Infura network.",
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