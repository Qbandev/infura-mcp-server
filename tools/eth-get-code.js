import { callInfura } from "../lib/infura-client.js";
import { validateAddress } from "../lib/validators.js";

/**
 * Function to get the code of a smart contract at a specified address on the Ethereum network.
 *
 * @param {Object} args - Arguments for the contract code retrieval.
 * @param {string} args.contractAddress - The 20-byte contract address to retrieve the code from.
 * @param {string} [args.network="mainnet"] The Ethereum network to connect to (e.g., 'mainnet').
 * @returns {Promise<Object>} - The result of the contract code retrieval.
 */
const executeFunction = async ({ contractAddress, network = "mainnet" }) => {
  validateAddress(contractAddress, 'contractAddress');
  return callInfura("eth_getCode", [contractAddress, "latest"], network);
};

/**
 * Tool configuration for retrieving smart contract code on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getCode",
      description:
        "Get the deployed bytecode of a smart contract.\n\nArgs:\n  - contractAddress (string): Contract address (20-byte hex, e.g., '0x...').\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string containing the contract bytecode. Returns '0x' if address is not a contract or has no code.\n\nExamples:\n  - \"Get USDT contract code\": { \"contractAddress\": \"0xdAC17F958D2ee523a2206206994597C13D831ec7\" }\n  - \"Check Sepolia contract\": { \"contractAddress\": \"0x...\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When contractAddress format is invalid.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          contractAddress: {
            type: "string",
            description:
              "The 20-byte contract address to retrieve the code from.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to connect to (e.g., 'mainnet' or 'sepolia').",
            default: "mainnet",
          },
          response_format: {
            type: "string",
            enum: ["json", "markdown"],
            description: "Output format: 'json' for structured data, 'markdown' for human-readable.",
            default: "json",
          },
        },
        required: ["contractAddress"],
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