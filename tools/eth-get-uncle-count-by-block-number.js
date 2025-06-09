import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the number of uncles in a block by block number using Infura's Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} [args.blockNumber="latest"] - The block number or tag (latest, earliest, pending) to get the uncle count for.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the uncle count request.
 */
const executeFunction = async ({
  blockNumber = "latest",
  network = "mainnet",
}) => {
  return callInfura("eth_getUncleCountByBlockNumber", [blockNumber], network);
};

/**
 * Tool configuration for getting the uncle count by block number on Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleCountByBlockNumber",
      description:
        "Returns the number of uncles in a block matching the specified block number on a given network.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description:
              "The block number or tag (latest, earliest, pending) to get the uncle count for.",
            default: "latest",
          },
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