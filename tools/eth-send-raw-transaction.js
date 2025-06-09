import { callInfura } from "../lib/infura-client.js";

/**
 * Function to send a signed transaction to the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the transaction.
 * @param {string} args.signedTransaction - The signed transaction serialized to hexadecimal format.
 * @param {string} [args.network='mainnet'] - The Ethereum network to connect to (e.g., mainnet, ropsten).
 * @returns {Promise<Object>} - The result of the transaction submission, including the transaction hash.
 */
const executeFunction = async ({
  signedTransaction,
  network = "mainnet",
}) => {
  return callInfura("eth_sendRawTransaction", [signedTransaction], network);
};

/**
 * Tool configuration for sending signed transactions to Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_sendRawTransaction",
      description: "Send a signed transaction to a specified Ethereum network.",
      parameters: {
        type: "object",
        properties: {
          signedTransaction: {
            type: "string",
            description:
              "The signed transaction serialized to hexadecimal format.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to connect to (e.g., 'mainnet' or 'sepolia').",
            default: "mainnet",
          },
        },
        required: ["signedTransaction"],
      },
    },
  },
};

export { apiTool };