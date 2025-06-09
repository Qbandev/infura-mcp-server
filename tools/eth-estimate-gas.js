import { callInfura } from "../lib/infura-client.js";

/**
 * Function to estimate gas for a transaction on the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the gas estimation.
 * @param {string} args.from - The address from which the transaction is sent.
 * @param {string} args.to - The address to which the transaction is sent.
 * @param {string} args.value - The amount of Ether to send (in wei).
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The estimated gas required for the transaction.
 */
const executeFunction = async ({ from, to, value, network = "mainnet" }) => {
  const params = [
    {
      from,
      to,
      value,
    },
    "latest",
  ];
  return callInfura("eth_estimateGas", params, network);
};

/**
 * Tool configuration for estimating gas for a transaction on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_estimateGas",
      description:
        "Estimate gas for a transaction on a specified Ethereum network.",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "The address from which the transaction is sent.",
          },
          to: {
            type: "string",
            description: "The address to which the transaction is sent.",
          },
          value: {
            type: "string",
            description: "The amount of Ether to send (in wei).",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["from", "to", "value"],
      },
    },
  },
};

export { apiTool };