import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the transaction count of a block by its hash from the Infura Ethereum JSON-RPC API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockHash - The 32-byte block hash to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the number of transactions in the specified block.
 */
const executeFunction = async ({ blockHash, network = "mainnet" }) => {
  return callInfura("eth_getBlockTransactionCountByHash", [blockHash], network);
};

/**
 * Tool configuration for getting the transaction count of a block by its hash from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockTransactionCountByHash",
      description:
        "Returns the number of transactions in the block matching the given block hash on a specified network.",
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