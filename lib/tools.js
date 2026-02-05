/**
 * Tool Discovery Module
 *
 * This module provides automatic discovery and loading of MCP tool definitions
 * from the tools directory. It enables a plugin-style architecture where new
 * tools can be added simply by creating new files in the tools directory.
 *
 * Each tool file must export an `apiTool` object containing:
 * - `name`: Unique tool identifier
 * - `description`: Human-readable description
 * - `inputSchema`: JSON Schema for input validation
 * - `handler`: Async function to execute the tool
 *
 * @module tools
 *
 * @example
 * import { discoverTools } from './lib/tools.js';
 *
 * // Load all available tools at server startup
 * const tools = await discoverTools();
 * console.log(`Loaded ${tools.length} tools`);
 *
 * // Register tools with MCP server
 * for (const tool of tools) {
 *   server.registerTool(tool.name, tool);
 * }
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Absolute path to the tools directory.
 * @constant {string}
 * @private
 */
const toolsDir = path.join(__dirname, "../tools");

/**
 * Finds all JavaScript tool files in a directory.
 *
 * Scans the specified directory for files with `.js` extension.
 * This is a non-recursive scan - only files directly in the directory
 * are returned (not subdirectories).
 *
 * @async
 * @function findToolFiles
 * @private
 * @param {string} dir - The directory path to scan
 * @returns {Promise<string[]>} Array of relative file paths from toolsDir
 *
 * @example
 * // Internal usage
 * const files = await findToolFiles('/path/to/tools');
 * // Returns: ['eth_getBalance.js', 'eth_blockNumber.js', ...]
 */
async function findToolFiles(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(path.relative(toolsDir, fullPath));
    }
  }
  return files;
}

/**
 * Discovers and loads all available tools from the tools directory.
 *
 * This function performs the following steps:
 * 1. Scans the tools directory for JavaScript files
 * 2. Dynamically imports each tool module
 * 3. Extracts the `apiTool` export from each module
 * 4. Adds the file path to each tool object for debugging
 *
 * Tool files must export an `apiTool` object with the following structure:
 * ```javascript
 * export const apiTool = {
 *   name: 'tool_name',
 *   description: 'What the tool does',
 *   inputSchema: { type: 'object', properties: {...} },
 *   handler: async (params) => { ... }
 * };
 * ```
 *
 * @async
 * @function discoverTools
 * @returns {Promise<Array<Object>>} Array of tool objects, each containing:
 * - `name` {string} - Tool identifier
 * - `description` {string} - Tool description
 * - `inputSchema` {Object} - JSON Schema for input validation
 * - `handler` {Function} - Tool execution function
 * - `path` {string} - Relative path to the tool file
 *
 * @throws {Error} If a tool file cannot be imported or lacks apiTool export
 *
 * @example
 * // Discover all tools at server startup
 * const tools = await discoverTools();
 *
 * // Find a specific tool
 * const balanceTool = tools.find(t => t.name === 'eth_getBalance');
 *
 * // Execute a tool
 * const result = await balanceTool.handler({
 *   address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
 *   network: 'mainnet'
 * });
 *
 * @example
 * // List all available tool names
 * const tools = await discoverTools();
 * const toolNames = tools.map(t => t.name);
 * console.log('Available tools:', toolNames.join(', '));
 */
export async function discoverTools() {
  const toolPaths = await findToolFiles(toolsDir);
  const toolPromises = toolPaths.map(async (file) => {
    // Ensure consistent path separators, especially for Windows
    const normalizedFile = file.replace(/\\\\/g, "/");
    const module = await import(`../tools/${normalizedFile}`);
    return {
      ...module.apiTool,
      path: normalizedFile,
    };
  });
  return Promise.all(toolPromises);
}
