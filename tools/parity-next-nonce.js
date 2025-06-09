import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get the next nonce for a given Ethereum address using Infura.
 *
 * @param {Object} args - Arguments for the nonce retrieval.
 * @param {string} args.address - The Ethereum address for which to retrieve the next nonce.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the nonce retrieval.
 */
const executeFunction = async ({ address, network = "mainnet" }) => {
  return callInfura("parity_nextNonce", [address], network);
};

/**
 * Tool configuration for retrieving the next nonce for an Ethereum address using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "parity_getNextNonce",
      description:
        "Retrieve the next nonce for a given Ethereum address on a specified network.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description:
              "The Ethereum address for which to retrieve the next nonce.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["address"],
      },
    },
  },
};

export { apiTool };