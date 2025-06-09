import { callInfura } from "../lib/infura-client.js";

/**
 * Function to check if the Ethereum client is actively listening for network connections.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the net_listening method.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("net_listening", [], network);
};

/**
 * Tool configuration for checking if the Ethereum client is listening for network connections.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "net_isListening",
      description:
        "Check if the Ethereum client is actively listening for network connections on a specified network.",
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