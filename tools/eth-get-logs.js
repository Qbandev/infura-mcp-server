import { callInfura } from "../lib/infura-client.js";
import { validateAddress, validateBlockTag } from "../lib/validators.js";

/**
 * Function to get logs from the Ethereum blockchain using Infura.
 *
 * @param {Object} args - Arguments for retrieving logs.
 * @param {string} args.fromBlock - The starting block number or block identifier.
 * @param {string} args.toBlock - The ending block number or block identifier.
 * @param {string} args.address - The address of the contract to filter logs.
 * @param {Array<string>} [args.topics=[]] - An array of topics to filter logs.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Array>} - The array of log objects matching the specified filter.
 */
const executeFunction = async ({
  fromBlock,
  toBlock,
  address,
  topics = [],
  network = "mainnet",
}) => {
  validateBlockTag(fromBlock, 'fromBlock');
  validateBlockTag(toBlock, 'toBlock');
  validateAddress(address);
  const params = [
    {
      fromBlock,
      toBlock,
      address,
      topics,
    },
  ];
  return callInfura("eth_getLogs", params, network);
};

/**
 * Tool configuration for retrieving logs from Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getLogs",
      description: "Retrieve logs from a specified Ethereum blockchain network.",
      parameters: {
        type: "object",
        properties: {
          fromBlock: {
            type: "string",
            description: "The starting block number or block identifier.",
          },
          toBlock: {
            type: "string",
            description: "The ending block number or block identifier.",
          },
          address: {
            type: "string",
            description: "The address of the contract to filter logs.",
          },
          topics: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of topics to filter logs.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["fromBlock", "toBlock", "address"],
      },
    },
  },
};

export { apiTool };