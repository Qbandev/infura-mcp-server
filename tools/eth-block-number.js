import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the latest block number from the Ethereum network using Infura.
 * @param {object} args The arguments for the function.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the block number request.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_blockNumber", [], network);
};

/**
 * Tool configuration for fetching the latest block number from Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockNumber",
      description:
        "Fetch the latest block number from a specified Ethereum network.",
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