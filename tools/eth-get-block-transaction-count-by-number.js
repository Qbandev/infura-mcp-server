import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the transaction count of a block by its number from the Ethereum network.
 *
 * @param {Object} args - Arguments for the transaction count request.
 * @param {string} args.blockNumber - The block number or tag (latest, earliest, pending) to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the transaction count request.
 */
const executeFunction = async ({ blockNumber, network = "mainnet" }) => {
  return callInfura(
    "eth_getBlockTransactionCountByNumber",
    [blockNumber],
    network
  );
};

/**
 * Tool configuration for getting the transaction count of a block on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockTransactionCountByNumber",
      description:
        "Returns the number of transactions in a block matching the specified block number on a given network.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description:
              "The block number or one of the string tags (latest, earliest, pending).",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockNumber"],
      },
    },
  },
};

export { apiTool };