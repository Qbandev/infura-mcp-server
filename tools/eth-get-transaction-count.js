import { callInfura } from "../lib/infura-client.js";
import { validateAddress, validateBlockTag } from "../lib/validators.js";

/**
 * Function to get the transaction count for a specified Ethereum address.
 *
 * @param {Object} args - Arguments for the transaction count request.
 * @param {string} args.address - The Ethereum address to query.
 * @param {string} [args.tag="latest"] - The block tag to use for the query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The transaction count for the specified address.
 */
const executeFunction = async ({
  address,
  tag = "latest",
  network = "mainnet",
}) => {
  validateAddress(address);
  validateBlockTag(tag);
  return callInfura("eth_getTransactionCount", [address, tag], network);
};

/**
 * Tool configuration for getting the transaction count on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionCount",
      description:
        "Get the transaction count for a specified Ethereum address on a given network.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The Ethereum address to query.",
          },
          tag: {
            type: "string",
            enum: ["latest", "earliest", "pending"],
            description: "The block tag to use for the query.",
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