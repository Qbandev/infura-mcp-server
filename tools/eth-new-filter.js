import { callInfura } from "../lib/infura-client.js";

/**
 * Function to create a new log filter in the Infura Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the filter creation.
 * @param {string} [args.fromBlock="earliest"] - The block from which to start filtering logs.
 * @param {string} [args.toBlock="latest"] - The block until which to filter logs.
 * @param {Array} [args.topics=[]] - An array of topics to filter logs by.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result containing the filter ID.
 */
const executeFunction = async ({
  fromBlock = "earliest",
  toBlock = "latest",
  topics = [],
  network = "mainnet",
}) => {
  const params = [
    {
      fromBlock,
      toBlock,
      topics,
    },
  ];
  return callInfura("eth_newFilter", params, network);
};

/**
 * Tool configuration for creating a new log filter in Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_newFilter",
      description:
        "Creates a new log filter in the Infura Ethereum JSON-RPC on a specified network.",
      parameters: {
        type: "object",
        properties: {
          fromBlock: {
            type: "string",
            description: "The block from which to start filtering logs.",
            default: "earliest",
          },
          toBlock: {
            type: "string",
            description: "The block until which to filter logs.",
            default: "latest",
          },
          topics: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of topics to filter logs by.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: [],
      },
    },
  },
};

export { apiTool };