#!/usr/bin/env node

/**
 * Node.js script to automate GitHub Release workflow
 * Alternative to the bash script for cross-platform compatibility
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`)
};

function printUsage() {
  console.log(`${colors.blue}Usage: node scripts/release.js [version_type] [prerelease_tag]${colors.reset}`);
  console.log('');
  console.log('Version types:');
  console.log('  patch     - Bug fixes (0.1.0 → 0.1.1)');
  console.log('  minor     - New features (0.1.0 → 0.2.0)');
  console.log('  major     - Breaking changes (0.1.0 → 1.0.0)');
  console.log('  prerelease - Prerelease version (0.1.0 → 0.1.1-beta.0)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/release.js patch');
  console.log('  node scripts/release.js minor');
  console.log('  node scripts/release.js prerelease beta');
  console.log('  node scripts/release.js prerelease alpha');
  process.exit(1);
}

function checkGitHubCli() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    log.success('GitHub CLI is available');
  } catch (error) {
    log.error('GitHub CLI is not installed');
    console.log('Please install GitHub CLI: https://cli.github.com/');
    process.exit(1);
  }
}

function checkAuth() {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    log.success('GitHub CLI authenticated');
  } catch (error) {
    log.error('Not authenticated with GitHub CLI');
    console.log('Please run: gh auth login');
    process.exit(1);
  }
}

function getCurrentVersion() {
  try {
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    log.info(`Current version: ${packageJson.version}`);
    return packageJson.version;
  } catch (error) {
    log.error('Failed to read package.json');
    process.exit(1);
  }
}

function validateVersionType(versionType) {
  const validTypes = ['patch', 'minor', 'major', 'prerelease'];
  if (!validTypes.includes(versionType)) {
    log.error(`Invalid version type: ${versionType}`);
    printUsage();
  }
}

async function triggerRelease(versionType, prereleaseTag = 'beta') {
  log.info('Triggering release workflow...');
  log.info(`Version type: ${versionType}`);
  
  try {
    let command = `gh workflow run release.yml --field version_type="${versionType}"`;
    
    if (versionType === 'prerelease') {
      log.info(`Prerelease tag: ${prereleaseTag}`);
      command += ` --field prerelease_tag="${prereleaseTag}"`;
    }
    
    execSync(command, { stdio: 'inherit' });
    log.success('Release workflow triggered successfully!');
    
    // Get repository info for URL
    const repoInfo = execSync('gh repo view --json owner,name', { encoding: 'utf8' });
    const { owner, name } = JSON.parse(repoInfo);
    log.info(`Monitor progress at: https://github.com/${owner.login}/${name}/actions`);
    
  } catch (error) {
    log.error('Failed to trigger release workflow');
    console.error(error.message);
    process.exit(1);
  }
}

async function monitorWorkflow() {
  log.info('Waiting for workflow to start...');
  
  // Wait a bit for the workflow to appear
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const output = execSync('gh run list --workflow=release.yml --limit=1 --json url', { encoding: 'utf8' });
    const runs = JSON.parse(output);
    
    if (runs.length > 0) {
      log.info(`Workflow started: ${runs[0].url}`);
      log.info('You can monitor the progress in your browser or run:');
      console.log('  gh run watch');
    }
  } catch (error) {
    log.warning('Could not fetch workflow status');
  }
}

function promptConfirmation(versionType, currentVersion, prereleaseTag) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('');
    log.warning('About to create a new release:');
    console.log(`  Current version: ${currentVersion}`);
    console.log(`  Version type: ${versionType}`);
    if (versionType === 'prerelease') {
      console.log(`  Prerelease tag: ${prereleaseTag}`);
    }
    console.log('');
    
    readline.question('Continue? (y/N): ', (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log(`${colors.blue}🚀 Infura MCP Server Release Automation${colors.reset}`);
  console.log('');
  
  // Parse arguments
  const args = process.argv.slice(2);
  const versionType = args[0];
  const prereleaseTag = args[1] || 'beta';
  
  // Show usage if no arguments
  if (!versionType) {
    printUsage();
  }
  
  // Validate inputs
  validateVersionType(versionType);
  
  // Check prerequisites
  checkGitHubCli();
  checkAuth();
  const currentVersion = getCurrentVersion();
  
  // Confirm the release
  const confirmed = await promptConfirmation(versionType, currentVersion, prereleaseTag);
  
  if (!confirmed) {
    log.info('Release cancelled');
    return;
  }
  
  // Trigger the release
  await triggerRelease(versionType, prereleaseTag);
  await monitorWorkflow();
  
  console.log('');
  log.success('Release process initiated!');
  log.info('The workflow will:');
  console.log('  1. Run tests');
  console.log('  2. Bump version in package.json');
  console.log('  3. Create git tag');
  console.log('  4. Create GitHub release');
  console.log('  5. Trigger npm publish');
}

// Run the script
main().catch((error) => {
  log.error(`Script failed: ${error.message}`);
  process.exit(1);
}); 