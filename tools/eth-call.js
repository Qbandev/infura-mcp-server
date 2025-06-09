import { callInfura } from "../lib/infura-client.js";

/**
 * Function to make an Ethereum call using Infura's JSON-RPC API.
 *
 * @param {Object} args - Arguments for the Ethereum call.
 * @param {string} args.to - The address of the contract to call.
 * @param {string} args.data - The data to send with the call.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the Ethereum call.
 */
const executeFunction = async ({ to, data, network = "mainnet" }) => {
  const params = [
    {
      to,
      data,
    },
    "latest",
  ];
  return callInfura("eth_call", params, network);
};

/**
 * Tool configuration for making Ethereum calls using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_call",
      description: "Make an Ethereum call using Infura on a specified network.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "The address of the contract to call.",
          },
          data: {
            type: "string",
            description: "The data to send with the call.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["to", "data"],
      },
    },
  },
};

export { apiTool };