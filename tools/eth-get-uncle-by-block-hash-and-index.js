import { callInfura } from "../lib/infura-client.js";
import { validateHash, isValidIndex, ValidationError } from "../lib/validators.js";

/**
 * Function to get an uncle block by block hash and index from the Ethereum network.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockHash - The 32-byte block hash of the block.
 * @param {string} args.index - The index of the uncle.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the request to get the uncle block.
 */
const executeFunction = async ({ blockHash, index, network = "mainnet" }) => {
  validateHash(blockHash, 'blockHash');
  if (!isValidIndex(index)) {
    throw new ValidationError('Invalid index format. Expected hex string (e.g., "0x0").', 'index');
  }
  return callInfura(
    "eth_getUncleByBlockHashAndIndex",
    [blockHash, index],
    network
  );
};

/**
 * Tool configuration for getting an uncle block by block hash and index from Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleByBlockHashAndIndex",
      description:
        "Retrieves an uncle (ommer) block by block hash and uncle index position. Uncles are valid blocks that were not included in the main chain but are referenced by main chain blocks.\n\nArgs:\n  - blockHash (string): 32-byte hash of the block containing the uncle (e.g., '0xabc123...')\n  - index (string): Zero-based uncle index position as hex (e.g., '0x0' for first uncle)\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Uncle block object with hash, parentHash, sha3Uncles, miner, stateRoot, number, gasLimit, gasUsed, timestamp, difficulty, nonce; null if not found\n\nExamples:\n  - \"Get first uncle in block\": { \"blockHash\": \"0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35\", \"index\": \"0x0\" }\n\nErrors:\n  - InvalidParams: When blockHash or index format is invalid\n  - InternalError: When Infura API is unavailable",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte block hash of the block.",
          },
          index: {
            type: "string",
            description: "The index of the uncle.",
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