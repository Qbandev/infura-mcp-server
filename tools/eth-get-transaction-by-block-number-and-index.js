import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get transaction information by block number and index from Infura.
 *
 * @param {Object} args - Arguments for the transaction retrieval.
 * @param {string} args.blockNumber - The block number or tag (latest, earliest, pending).
 * @param {string} args.transactionIndex - The transaction index position.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The transaction information or null if not found.
 */
const executeFunction = async ({
  blockNumber,
  transactionIndex,
  network = "mainnet",
}) => {
  return callInfura(
    "eth_getTransactionByBlockNumberAndIndex",
    [blockNumber, transactionIndex],
    network
  );
};

/**
 * Tool configuration for retrieving transaction information from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionByBlockNumberAndIndex",
      description:
        "Retrieve transaction information by block number and index from a specified network.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description: "The block number or tag (latest, earliest, pending).",
          },
          transactionIndex: {
            type: "string",
            description: "The transaction index position.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockNumber", "transactionIndex"],
      },
    },
  },
};

export { apiTool };