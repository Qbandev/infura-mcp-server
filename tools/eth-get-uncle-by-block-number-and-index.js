import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get an uncle block by block number and index from the Ethereum network.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockNumber - The block number in hexadecimal format.
 * @param {string} args.index - The index of the uncle in hexadecimal format.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the request to get the uncle block.
 */
const executeFunction = async ({ blockNumber, index, network = "mainnet" }) => {
  return callInfura(
    "eth_getUncleByBlockNumberAndIndex",
    [blockNumber, index],
    network
  );
};

/**
 * Tool configuration for getting an uncle block by block number and index from Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleByBlockNumberAndIndex",
      description:
        "Returns uncle specified by block number and index from a given network.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description: "The block number in hexadecimal format.",
          },
          index: {
            type: "string",
            description: "The index of the uncle in hexadecimal format.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockNumber", "index"],
      },
    },
  },
};

export { apiTool };