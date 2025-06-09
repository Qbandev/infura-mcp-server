import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current client version from Infura Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the current client version.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("web3_clientVersion", [], network);
};

/**
 * Tool configuration for getting the current client version from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "web3_getClientVersion",
      description:
        "Returns the current client version from a specified Infura Ethereum network.",
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