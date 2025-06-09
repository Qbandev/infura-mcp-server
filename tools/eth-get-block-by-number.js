import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get block information by block number from the Infura Ethereum JSON-RPC API.
 *
 * @param {Object} args - Arguments for the block retrieval.
 * @param {string} args.blockNumber - The block number in hexadecimal format (e.g., "0xF") or one of the string tags `latest`, `earliest`, or `pending`.
 * @param {boolean} args.fullTransactions - If true, returns the full transaction objects; if false, returns only the hashes of the transactions.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the block retrieval.
 */
const executeFunction = async ({
  blockNumber,
  fullTransactions,
  network = "mainnet",
}) => {
  return callInfura(
    "eth_getBlockByNumber",
    [blockNumber, fullTransactions],
    network
  );
};

/**
 * Tool configuration for retrieving block information from the Infura Ethereum JSON-RPC API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockByNumber",
      description:
        "Retrieve block information by block number from a specified Ethereum network.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description:
              "The block number in hexadecimal format or one of the string tags `latest`, `earliest`, or `pending`.",
          },
          fullTransactions: {
            type: "boolean",
            description:
              "If true, returns the full transaction objects; if false, returns only the hashes of the transactions.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockNumber", "fullTransactions"],
      },
    },
  },
};

export { apiTool };