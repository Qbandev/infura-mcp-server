import { callInfura } from "../lib/infura-client.js";
import { validateBlockTag, isValidIndex, ValidationError } from "../lib/validators.js";

/**
 * Function to get an uncle block by block number and index from the Ethereum network.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.blockNumber - The block number in hexadecimal format.
 * @param {string} args.index - The index of the uncle in hexadecimal format.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the request to get the uncle block.
 */
const executeFunction = async ({ blockNumber, index, network = "mainnet" }) => {
  validateBlockTag(blockNumber, 'blockNumber');
  if (!isValidIndex(index)) {
    throw new ValidationError('Invalid index format. Expected hex string (e.g., "0x0").', 'index');
  }
  return callInfura(
    "eth_getUncleByBlockNumberAndIndex",
    [blockNumber, index],
    network
  );
};

/**
 * Tool configuration for getting an uncle block by block number and index from Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getUncleByBlockNumberAndIndex",
      description:
        "Retrieves an uncle (ommer) block by block number and uncle index position. Uncles are valid blocks that were not included in the main chain but are referenced by main chain blocks.\n\nArgs:\n  - blockNumber (string): Block number as hex (e.g., '0x10d4f') or tag ('latest', 'earliest', 'pending')\n  - index (string): Zero-based uncle index position as hex (e.g., '0x0' for first uncle)\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - Uncle block object with hash, parentHash, sha3Uncles, miner, stateRoot, number, gasLimit, gasUsed, timestamp, difficulty, nonce; null if not found\n\nExamples:\n  - \"Get first uncle in specific block\": { \"blockNumber\": \"0x29c\", \"index\": \"0x0\" }\n  - \"Get uncle from latest block\": { \"blockNumber\": \"latest\", \"index\": \"0x0\" }\n\nErrors:\n  - InvalidParams: When blockNumber or index format is invalid\n  - InternalError: When Infura API is unavailable",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description: "The block number in hexadecimal format.",
          },
          index: {
            type: "string",
            description: "The index of the uncle in hexadecimal format.",
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
        required: ["blockNumber", "index"],
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