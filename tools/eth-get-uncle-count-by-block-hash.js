import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the number of uncles in a block from Ethereum using Infura.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockHash - The 32-byte block hash to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the number of uncles in the specified block.
 */
const executeFunction = async ({ blockHash, network = "mainnet" }) => {
  return callInfura("eth_getUncleCountByBlockHash", [blockHash], network);
};

/**
 * Tool configuration for getting the number of uncles in a block from Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleCountByBlockHash",
      description:
        "Returns the number of uncles in a block from a block matching the given block hash on a specified network.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte block hash to query.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockHash"],
      },
    },
  },
};

export { apiTool };