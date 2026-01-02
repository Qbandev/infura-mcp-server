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
        "Retrieve the code of a smart contract at a specified address on a given network.",
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
        },
        required: ["contractAddress"],
      },
    },
  },
};

export { apiTool };