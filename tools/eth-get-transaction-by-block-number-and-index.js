import { callInfura } from "../lib/infura-client.js";
import { validateBlockTag, isValidIndex, ValidationError } from "../lib/validators.js";

/**
 * Function to get transaction information by block number and index from Infura.
 *
 * @param {Object} args - Arguments for the transaction retrieval.
 * @param {string} args.blockNumber - The block number or tag (latest, earliest, pending).
 * @param {string} args.transactionIndex - The transaction index position.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The transaction information or null if not found.
 */
const executeFunction = async ({
  blockNumber,
  transactionIndex,
  network = "mainnet",
}) => {
  validateBlockTag(blockNumber, 'blockNumber');
  if (!isValidIndex(transactionIndex)) {
    throw new ValidationError('Invalid index format. Expected hex string (e.g., "0x0").', 'transactionIndex');
  }
  return callInfura(
    "eth_getTransactionByBlockNumberAndIndex",
    [blockNumber, transactionIndex],
    network
  );
};

/**
 * Tool configuration for retrieving transaction information from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionByBlockNumberAndIndex",
      description:
        "Retrieves a transaction by its position within a specific block using block number and transaction index.\n\nArgs:\n  - blockNumber (string): Block number as hex (e.g., '0x10d4f') or tag ('latest', 'earliest', 'pending')\n  - transactionIndex (string): Zero-based position of the transaction in the block as hex (e.g., '0x0')\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Transaction object with hash, from, to, value, gas, gasPrice, input, nonce, blockHash, blockNumber, transactionIndex; null if not found\n\nExamples:\n  - \"Get first transaction in latest block\": { \"blockNumber\": \"latest\", \"transactionIndex\": \"0x0\" }\n  - \"Get transaction at index 5 in specific block\": { \"blockNumber\": \"0x10d4f\", \"transactionIndex\": \"0x5\" }\n\nErrors:\n  - InvalidParams: When blockNumber or transactionIndex format is invalid\n  - InternalError: When Infura API is unavailable",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description: "The block number or tag (latest, earliest, pending).",
          },
          transactionIndex: {
            type: "string",
            description: "The transaction index position.",
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
        required: ["blockNumber", "transactionIndex"],
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