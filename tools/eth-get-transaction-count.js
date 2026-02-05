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
        "Returns the number of transactions sent from an address (nonce). Useful for determining the next nonce for sending transactions.\n\nArgs:\n  - address (string): 20-byte Ethereum address in hex format (e.g., '0x742d35Cc6634C0532925a3b844Bc9e7595f...')\n  - tag (string, optional): Block tag - 'latest', 'earliest', or 'pending', defaults to 'latest'\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Hex-encoded integer representing the number of transactions sent from the address\n\nExamples:\n  - \"Get current nonce for address\": { \"address\": \"0x742d35Cc6634C0532925a3b844Bc454e4438f44e\" }\n  - \"Get pending transaction count\": { \"address\": \"0x742d35Cc6634C0532925a3b844Bc454e4438f44e\", \"tag\": \"pending\" }\n\nErrors:\n  - InvalidParams: When address format is invalid or tag is not a valid block tag\n  - InternalError: When Infura API is unavailable",
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
          response_format: {
            type: "string",
            enum: ["json", "markdown"],
            description: "Output format: 'json' for structured data, 'markdown' for human-readable.",
            default: "json",
          },
        },
        required: ["address"],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
  },
};

export { apiTool };