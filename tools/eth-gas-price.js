import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current gas price from the Infura Ethereum JSON-RPC.
 *
 * @param {object} args The arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The gas price in Wei as a hexadecimal value.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_gasPrice", [], network);
};

/**
 * Tool configuration for fetching gas price from Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getGasPrice",
      description:
        "Fetch the current gas price from a specified Infura Ethereum network.",
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