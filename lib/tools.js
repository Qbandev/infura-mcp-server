import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const toolsDir = path.join(__dirname, "../tools");

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
 * Discovers and loads available tools from the tools directory
 * @returns {Promise<Array>} Array of tool objects
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
