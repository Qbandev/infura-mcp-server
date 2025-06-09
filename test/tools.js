#!/usr/bin/env node

/**
 * Tools discovery test
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('✅ Testing tools discovery...');
  
  // Import the tools module dynamically
  const toolsPath = join(__dirname, '../lib/tools.js');
  const { discoverTools } = await import(toolsPath);
  
  // Discover tools
  const tools = await discoverTools();
  
  // Validate tools
  if (!Array.isArray(tools)) {
    throw new Error('discoverTools should return an array');
  }
  
  if (tools.length === 0) {
    throw new Error('No tools discovered');
  }
  
  // Validate tool structure
  for (const tool of tools) {
    if (!tool.function || typeof tool.function !== 'function') {
      throw new Error(`Tool missing function: ${JSON.stringify(tool)}`);
    }
    
    if (!tool.definition || !tool.definition.function) {
      throw new Error(`Tool missing definition: ${JSON.stringify(tool)}`);
    }
    
    if (!tool.definition.function.name) {
      throw new Error(`Tool missing name: ${JSON.stringify(tool)}`);
    }
  }
  
  console.log(`✅ Tools discovery passed: discovered ${tools.length} valid tools`);
  
} catch (error) {
  console.error('❌ Tools discovery failed:', error.message);
  process.exit(1);
} 