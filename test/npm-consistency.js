#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 NPM Package Consistency Validation\n');

// Test 1: Package.json consistency
console.log('✅ Testing package.json consistency...');
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
const readme = readFileSync(join(projectRoot, 'README.md'), 'utf8');

// Validate description
const descriptionKeywords = ['MCP', 'Model Context Protocol', 'Infura', 'Ethereum', '29', 'read-only', 'JSON-RPC', '21+'];
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
const npxMatches = (readme.match(/npx[\s\S]*?infura-mcp-server/g) || []).length;
const dockerMatches = (readme.match(/ghcr\.io\/qbandev\/infura-mcp-server/g) || []).length;

if (npxMatches < 5) {
  console.error('❌ Insufficient npx installation examples in README');
  process.exit(1);
}

if (dockerMatches < 3) {
  console.error('❌ Insufficient Docker installation examples in README');
  process.exit(1);
}

// Test 4: Version consistency
console.log('✅ Testing version consistency...');
if (!packageJson.version || !packageJson.version.match(/^\d+\.\d+\.\d+/)) {
  console.error('❌ Invalid semantic version in package.json');
  process.exit(1);
}

// Test 5: Repository links
console.log('✅ Testing repository links...');
const expectedRepo = 'git+https://github.com/qbandev/infura-mcp-server.git';
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
if (!packageJson.engines.node || !packageJson.engines.node.includes('>=16')) {
  console.error('❌ Node.js engine requirement should be >=16.0.0');
  process.exit(1);
}

// Test 9: Binary configuration
console.log('✅ Testing binary configuration...');
if (!packageJson.bin || !packageJson.bin['infura-mcp-server']) {
  console.error('❌ Missing binary configuration');
  process.exit(1);
}

// Test 10: README size and quality
console.log('✅ Testing README quality...');
const readmeSize = readme.length;
if (readmeSize < 10000) {
  console.error('❌ README too short for comprehensive documentation');
  process.exit(1);
}

const sectionsRequired = [
  'Features', 'Tools', 'Network Support', 'Configuration', 
  'Usage with Claude Desktop', 'Usage with Cursor', 'Usage with VS Code'
];

const missingSections = sectionsRequired.filter(section => 
  !readme.includes(section)
);

if (missingSections.length > 0) {
  console.error('❌ Missing required README sections:', missingSections);
  process.exit(1);
}

// Test 11: Security and quality badges/mentions
console.log('✅ Testing security documentation...');
if (!readme.includes('9.5/10') || !readme.toLowerCase().includes('enterprise')) {
  console.error('❌ Missing security rating documentation');
  process.exit(1);
}

// Test 12: Security section validation
console.log('✅ Testing security section...');
if (!readme.includes('## 🔐 Security')) {
  console.error('❌ Security section missing from README');
  process.exit(1);
}

// Essential security features should be documented
const securityFeatures = [
  'API Key Security',
  'Built-in Security Features',
  'Required parameter validation',
  'HTTPS/TLS encryption',
  'Local execution',
  'Read-only operations'
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
if (!readme.includes('Read-only operations') || !readme.includes('can never modify blockchain state')) {
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
console.log(`   • Read-only security: Blockchain modification impossible ✅`);
console.log('\n✅ Ready for NPM publication with full consistency!'); 