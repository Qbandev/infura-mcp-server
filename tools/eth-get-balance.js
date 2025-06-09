import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the balance of an Ethereum account.
 *
 * @param {Object} args - Arguments for the balance query.
 * @param {string} args.address - The Ethereum address to check the balance for.
 * @param {string} args.tag - The block parameter to use (e.g., "latest", "earliest", "pending").
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The balance of the specified address in wei.
 */
const executeFunction = async ({ address, tag, network = "mainnet" }) => {
  return callInfura("eth_getBalance", [address, tag], network);
};

/**
 * Tool configuration for getting Ethereum account balance.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBalance",
      description: "Get the balance of an Ethereum account on a specified network.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The Ethereum address to check the balance for.",
          },
          tag: {
            type: "string",
            enum: ["latest", "earliest", "pending"],
            description: "The block parameter to use.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["address", "tag"],
      },
    },
  },
};

export { apiTool };