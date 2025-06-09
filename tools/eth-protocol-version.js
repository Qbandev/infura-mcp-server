import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the current Ethereum protocol version from Infura.
 *
 * @param {Object} args - Arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the Ethereum protocol version request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_protocolVersion", [], network);
};

/**
 * Tool configuration for getting the Ethereum protocol version from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getProtocolVersion",
      description: "Returns current Ethereum protocol version from a specified network.",
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