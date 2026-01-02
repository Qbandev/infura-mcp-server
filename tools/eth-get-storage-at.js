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
        "Retrieve the value of a storage position at a specified address on a given network.",
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
        },
        required: ["address", "position"],
      },
    },
  },
};

export { apiTool };