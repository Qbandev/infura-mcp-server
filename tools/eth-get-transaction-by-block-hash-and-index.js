import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get transaction information by block hash and index from Infura.
 *
 * @param {Object} args - Arguments for the transaction retrieval.
 * @param {string} args.blockHash - The 32-byte hash of the block.
 * @param {number} args.index - The transaction index position.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object|null>} - The transaction object or null if not found.
 */
const executeFunction = async ({ blockHash, index, network = "mainnet" }) => {
  return callInfura(
    "eth_getTransactionByBlockHashAndIndex",
    [blockHash, index],
    network
  );
};

/**
 * Tool configuration for fetching transaction information from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionByBlockHashAndIndex",
      description:
        "Fetch transaction information by block hash and index from a specified network.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte hash of the block.",
          },
          index: {
            type: "integer",
            description: "The transaction index position.",
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