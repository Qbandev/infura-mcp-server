#!/usr/bin/env node

/**
 * Basic package validation test
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('✅ Testing package validation...');
  
  // Read and parse package.json
  const packagePath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  // Validate required fields
  if (!packageJson.name) {
    throw new Error('Package name is required');
  }
  
  if (!packageJson.version) {
    throw new Error('Package version is required');
  }
  
  if (!packageJson.description) {
    throw new Error('Package description is required');
  }
  
  if (!packageJson.main) {
    throw new Error('Package main entry point is required');
  }
  
  console.log(`✅ Package validation passed for ${packageJson.name}@${packageJson.version}`);
  
} catch (error) {
  console.error('❌ Package validation failed:', error.message);
  process.exit(1);
} 