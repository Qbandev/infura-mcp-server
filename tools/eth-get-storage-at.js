import { callInfura } from "../lib/infura-client.js";
import { validateAddress, isValidHexString, ValidationError } from "../lib/validators.js";

/**
 * Function to get the storage value at a specified address on the Ethereum network.
 *
 * @param {Object} args - Arguments for the storage retrieval.
 * @param {string} args.address - The 20-byte storage address.
 * @param {number|string} args.position - The integer index of the storage position or a block parameter.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the storage retrieval.
 */
const executeFunction = async ({ address, position, network = "mainnet" }) => {
  validateAddress(address);
  if (!isValidHexString(position)) {
    throw new ValidationError('Invalid position format. Expected hex string starting with 0x.', 'position');
  }
  return callInfura("eth_getStorageAt", [address, position, "latest"], network);
};

/**
 * Tool configuration for retrieving storage values on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getStorageAt",
      description:
        "Read the raw value from a specific storage slot of a contract.\n\nArgs:\n  - address (string): Contract address (20-byte hex, e.g., '0x...').\n  - position (string): Storage slot index as hex (e.g., '0x0' for slot 0).\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - 32-byte hexadecimal string representing the storage value at the given position.\n\nExamples:\n  - \"Read slot 0\": { \"address\": \"0xdAC17F958D2ee523a2206206994597C13D831ec7\", \"position\": \"0x0\" }\n  - \"Read mapping slot\": { \"address\": \"0x...\", \"position\": \"0x1\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When address or position format is invalid.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The 20-byte storage address.",
          },
          position: {
            type: "string",
            description:
              "The integer index of the storage position or a block parameter.",
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
        required: ["address", "position"],
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