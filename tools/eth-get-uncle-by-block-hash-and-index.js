import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get an uncle block by block hash and index from the Ethereum network.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockHash - The 32-byte block hash of the block.
 * @param {string} args.index - The index of the uncle.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the request to get the uncle block.
 */
const executeFunction = async ({ blockHash, index, network = "mainnet" }) => {
  return callInfura(
    "eth_getUncleByBlockHashAndIndex",
    [blockHash, index],
    network
  );
};

/**
 * Tool configuration for getting an uncle block by block hash and index from Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleByBlockHashAndIndex",
      description:
        "Get an uncle block by block hash and index from a specified Ethereum network.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte block hash of the block.",
          },
          index: {
            type: "string",
            description: "The index of the uncle.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockHash", "index"],
      },
    },
  },
};

export { apiTool };