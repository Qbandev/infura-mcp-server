import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Function to get transaction information by transaction hash from Infura.
 *
 * @param {Object} args - Arguments for the transaction query.
 * @param {string} args.transactionHash - The 32-byte transaction hash to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The transaction information or null if not found.
 */
const executeFunction = async ({ transactionHash, network = "mainnet" }) => {
  validateHash(transactionHash, 'transactionHash');
  return callInfura("eth_getTransactionByHash", [transactionHash], network);
};

/**
 * Tool configuration for getting transaction information by hash from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionByHash",
      description:
        "Get transaction information by transaction hash from a specified Infura network.",
      parameters: {
        type: "object",
        properties: {
          transactionHash: {
            type: "string",
            description: "The 32-byte transaction hash to query.",
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