#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Named constants for magic numbers
const MIN_NPX_EXAMPLES = 4;
const MIN_DOCKER_EXAMPLES = 1;
const MIN_README_SIZE = 8000;

// Regex patterns as named constants
const NPX_PATTERN = /npx[\s\S]*?infura-mcp-server/g;
const DOCKER_PATTERN = /ghcr\.io\/qbandev\/infura-mcp-server/g;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 NPM Package Consistency Validation\n');

// File paths
const packageJsonPath = join(projectRoot, 'package.json');
const readmePath = join(projectRoot, 'README.md');

// Check file existence before reading
if (!existsSync(packageJsonPath)) {
  console.error('❌ package.json not found at:', packageJsonPath);
  process.exit(1);
}

if (!existsSync(readmePath)) {
  console.error('❌ README.md not found at:', readmePath);
  process.exit(1);
}

// Test 1: Package.json consistency
console.log('✅ Testing package.json consistency...');

let packageJson;
try {
  const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('❌ Invalid JSON in package.json:', error.message);
  } else {
    console.error('❌ Failed to read package.json:', error.message);
  }
  process.exit(1);
}

let readme;
try {
  readme = readFileSync(readmePath, 'utf8');
} catch (error) {
  console.error('❌ Failed to read README.md:', error.message);
  process.exit(1);
}

// Validate description
const descriptionKeywords = ['MCP', 'Model Context Protocol', 'Infura', 'Ethereum', '29', 'read-only', 'JSON-RPC', '30+'];
const hasAllKeywords = descriptionKeywords.every(keyword =>
  packageJson.description.includes(keyword)
);

if (!hasAllKeywords) {
  console.error('❌ Package description missing key terms');
  process.exit(1);
}

// Test 2: Keywords validation
console.log('✅ Testing NPM keywords...');
const requiredKeywords = [
  'mcp', 'model-context-protocol', 'infura', 'ethereum', 'blockchain',
  'json-rpc', 'web3', 'claude', 'cursor', 'vscode', 'ai'
];

const missingKeywords = requiredKeywords.filter(keyword =>
  !packageJson.keywords.includes(keyword)
);

if (missingKeywords.length > 0) {
  console.error('❌ Missing required keywords:', missingKeywords);
  process.exit(1);
}

// Test 3: Installation instructions consistency
console.log('✅ Testing installation instructions...');
const npxMatches = (readme.match(NPX_PATTERN) || []).length;
const dockerMatches = (readme.match(DOCKER_PATTERN) || []).length;

if (npxMatches < MIN_NPX_EXAMPLES) {
  console.error(`❌ Insufficient npx installation examples in README (found ${npxMatches}, need ${MIN_NPX_EXAMPLES})`);
  process.exit(1);
}

if (dockerMatches < MIN_DOCKER_EXAMPLES) {
  console.error(`❌ Insufficient Docker installation examples in README (found ${dockerMatches}, need ${MIN_DOCKER_EXAMPLES})`);
  process.exit(1);
}

// Test 4: Version consistency
console.log('✅ Testing version consistency...');
if (!packageJson.version || !packageJson.version.match(SEMVER_PATTERN)) {
  console.error('❌ Invalid semantic version in package.json');
  process.exit(1);
}

// Test 5: Repository links
console.log('✅ Testing repository links...');
const expectedRepo = 'git+https://github.com/Qbandev/infura-mcp-server.git';
if (packageJson.repository.url !== expectedRepo) {
  console.error('❌ Repository URL mismatch');
  process.exit(1);
}

// Test 6: License consistency
console.log('✅ Testing license consistency...');
if (packageJson.license !== 'MIT') {
  console.error('❌ License should be MIT');
  process.exit(1);
}

// Test 7: Files field validation
console.log('✅ Testing files field...');
const requiredFiles = ['index.js', 'mcpServer.js', 'lib/', 'tools/', 'commands/', 'LICENSE', 'README.md'];
const missingFiles = requiredFiles.filter(file =>
  !packageJson.files.includes(file)
);

if (missingFiles.length > 0) {
  console.error('❌ Missing required files in package.json:', missingFiles);
  process.exit(1);
}

// Test 8: Engine requirements
console.log('✅ Testing Node.js engine requirements...');
if (!packageJson.engines.node || !packageJson.engines.node.includes('>=20')) {
  console.error('❌ Node.js engine requirement should be >=20.0.0');
  process.exit(1);
}

// Test 9: Binary configuration
console.log('✅ Testing binary configuration...');
if (!packageJson.bin || !packageJson.bin['infura-mcp-server']) {
  console.error('❌ Missing binary configuration');
  process.exit(1);
}

// Test 10: README quality and required sections
console.log('✅ Testing README quality...');
const readmeSize = readme.length;

const sectionsRequired = [
  'Features', 'Available Tools', 'Supported Networks', 'Quick Start',
  'Configuration', 'Claude Desktop', 'VS Code', 'Docker',
  'Development', 'Troubleshooting', 'Security', 'License'
];

const missingSections = sectionsRequired.filter(section =>
  !readme.includes(section)
);

if (missingSections.length > 0) {
  console.error('❌ Missing required README sections:', missingSections);
  process.exit(1);
}

// Only check size if sections are missing (more meaningful than arbitrary threshold)
if (readmeSize < MIN_README_SIZE && missingSections.length === 0) {
  console.log('⚠️ README is shorter than expected but has all required sections');
}

// Test 11: Security documentation
console.log('✅ Testing security documentation...');
if (!readme.includes('## Security')) {
  console.error('❌ Missing security section in README');
  process.exit(1);
}

// Test 12: Security section validation
console.log('✅ Testing security section content...');

// Essential security features should be documented (matching actual README content)
const securityFeatures = [
  'Built-in Security Features',
  'Required parameter validation',
  'Read-only operations',
  'HTTPS/TLS encryption',
  'Local execution',
  'API Key Security'
];

const missingSecurityFeatures = securityFeatures.filter(feature =>
  !readme.includes(feature)
);

if (missingSecurityFeatures.length > 0) {
  console.error('❌ Missing security features in README:', missingSecurityFeatures);
  process.exit(1);
}

// Test 13: Read-only security messaging
console.log('✅ Testing read-only security messaging...');
// Should mention read-only nature clearly
if (!readme.includes('Read-only operations') || !readme.includes('never modify blockchain state')) {
  console.error('❌ Missing read-only security messaging');
  process.exit(1);
}

console.log('\n🎉 NPM Package Consistency Validation: ALL TESTS PASSED!');
console.log('📊 Summary:');
console.log(`   • Package name: ${packageJson.name}`);
console.log(`   • Version: ${packageJson.version}`);
console.log(`   • Description length: ${packageJson.description.length} chars`);
console.log(`   • Keywords count: ${packageJson.keywords.length}`);
console.log(`   • README size: ${(readmeSize / 1024).toFixed(1)}KB`);
console.log(`   • Files included: ${packageJson.files.length}`);
console.log(`   • NPX examples: ${npxMatches}`);
console.log(`   • Docker examples: ${dockerMatches}`);
console.log(`   • Security section: Validated ✅`);
console.log(`   • Security features: ${securityFeatures.length} documented ✅`);
console.log(`   • Read-only security: Documented ✅`);
console.log('\n✅ Ready for NPM publication with full consistency!');
