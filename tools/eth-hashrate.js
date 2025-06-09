import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the hashrate of the Ethereum node.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the hashrate request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_hashrate", [], network);
};

/**
 * Tool configuration for getting the Ethereum node hashrate.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getHashrate",
      description:
        "Returns the number of hashes per second with which the node is mining on a specified network.",
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