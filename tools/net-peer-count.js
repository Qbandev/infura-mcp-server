import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the number of peers connected to the Ethereum client.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the peer count request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("net_peerCount", [], network);
};

/**
 * Tool configuration for getting the number of peers connected to the Ethereum client.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "net_getPeerCount",
      description:
        "Returns the number of peers currently connected to the Ethereum client on a specified network.",
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