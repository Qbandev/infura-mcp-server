import { callInfura } from "../lib/infura-client.js";
import { validateBlockTag } from "../lib/validators.js";

/**
 * Function to get the transaction count of a block by its number from the Ethereum network.
 *
 * @param {Object} args - Arguments for the transaction count request.
 * @param {string} args.blockNumber - The block number or tag (latest, earliest, pending) to query.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the transaction count request.
 */
const executeFunction = async ({ blockNumber, network = "mainnet" }) => {
  validateBlockTag(blockNumber, 'blockNumber');
  return callInfura(
    "eth_getBlockTransactionCountByNumber",
    [blockNumber],
    network
  );
};

/**
 * Tool configuration for getting the transaction count of a block on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockTransactionCountByNumber",
      description:
        "Get the number of transactions in a block identified by its number or tag.\n\nArgs:\n  - blockNumber (string): Block number as hex (e.g., '0x10d4f') or tag ('latest', 'earliest', 'pending').\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing transaction count (e.g., '0x10' for 16 transactions). Returns null if block not found.\n\nExamples:\n  - \"Count txs in latest block\": { \"blockNumber\": \"latest\" }\n  - \"Count txs in specific block\": { \"blockNumber\": \"0x10d4f\", \"network\": \"mainnet\" }\n\nErrors:\n  - InvalidParams: When blockNumber format is invalid.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description:
              "The block number or one of the string tags (latest, earliest, pending).",
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
        required: ["blockNumber"],
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