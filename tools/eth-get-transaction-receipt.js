import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the transaction receipt from Infura Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the transaction receipt request.
 * @param {string} args.transactionHash - The 32-byte hash of the transaction.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object|null>} - The transaction receipt object or null if not found.
 */
const executeFunction = async ({ transactionHash, network = "mainnet" }) => {
  return callInfura("eth_getTransactionReceipt", [transactionHash], network);
};

/**
 * Tool configuration for getting transaction receipts from Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionReceipt",
      description:
        "Get the transaction receipt by transaction hash from a specified network.",
      parameters: {
        type: "object",
        properties: {
          transactionHash: {
            type: "string",
            description: "The 32-byte hash of the transaction.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["transactionHash"],
      },
    },
  },
};

export { apiTool };