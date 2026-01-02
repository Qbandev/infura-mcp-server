import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Function to get block information by hash from the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the block retrieval.
 * @param {string} args.blockHash - The 32-byte hash of the block to retrieve.
 * @param {boolean} args.fullTransactions - If true, returns full transaction objects; if false, returns transaction hashes.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the block retrieval.
 */
const executeFunction = async ({
  blockHash,
  fullTransactions,
  network = "mainnet",
}) => {
  validateHash(blockHash, 'blockHash');
  return callInfura(
    "eth_getBlockByHash",
    [blockHash, fullTransactions],
    network
  );
};

/**
 * Tool configuration for retrieving block information by hash from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockByHash",
      description:
        "Retrieve block information by hash from a specified Ethereum network.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte hash of the block to retrieve.",
          },
          fullTransactions: {
            type: "boolean",
            description:
              "If true, returns full transaction objects; if false, returns transaction hashes.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["blockHash", "fullTransactions"],
      },
    },
  },
};

export { apiTool };