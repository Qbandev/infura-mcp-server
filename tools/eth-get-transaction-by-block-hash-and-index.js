import { callInfura } from "../lib/infura-client.js";
import { validateHash, isValidIndex, ValidationError } from "../lib/validators.js";

/**
 * Function to get transaction information by block hash and index from Infura.
 *
 * @param {Object} args - Arguments for the transaction retrieval.
 * @param {string} args.blockHash - The 32-byte hash of the block.
 * @param {number} args.index - The transaction index position.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object|null>} - The transaction object or null if not found.
 */
const executeFunction = async ({ blockHash, index, network = "mainnet" }) => {
  validateHash(blockHash, 'blockHash');
  if (!isValidIndex(index)) {
    throw new ValidationError('Invalid index format. Expected hex string (e.g., "0x0").', 'index');
  }
  return callInfura(
    "eth_getTransactionByBlockHashAndIndex",
    [blockHash, index],
    network
  );
};

/**
 * Tool configuration for fetching transaction information from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getTransactionByBlockHashAndIndex",
      description:
        "Get a transaction by its position within a block identified by hash.\n\nArgs:\n  - blockHash (string): 32-byte block hash (66 chars with 0x prefix).\n  - index (string): Transaction index position as hex (e.g., '0x0' for first tx).\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Transaction object with hash, from, to, value, gas, gasPrice, input, nonce, etc. Returns null if not found.\n\nExamples:\n  - \"Get first tx in block\": { \"blockHash\": \"0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238\", \"index\": \"0x0\" }\n  - \"Get third tx on Sepolia\": { \"blockHash\": \"0x...\", \"index\": \"0x2\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When blockHash or index format is invalid.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte hash of the block.",
          },
          index: {
            type: "integer",
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
        required: ["blockHash", "index"],
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