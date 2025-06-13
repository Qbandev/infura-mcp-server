# Contributing

Contributions are welcome!

## Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must be formatted as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies
- **revert**: Reverts a previous commit

### Examples

```
feat: add new Ethereum tool for getting transaction receipts
fix: resolve ES module compatibility in test scripts
docs: update README with new installation instructions
test: add comprehensive validation for tools discovery
chore: update dependencies to latest versions
ci: add commitlint validation to PR workflow
```

### Scope (Optional)

The scope should be the name of the package affected:
- `tools` - for changes to the tools directory
- `server` - for changes to the main server
- `tests` - for changes to test files
- `docs` - for documentation changes
- `deps` - for dependency updates

Examples with scope:
```
feat(tools): add eth_getTransactionReceipt tool
fix(server): resolve SSE connection timeout issues
test(tools): add validation for all tool definitions
```

### Validation

Commit messages are automatically validated using [commitlint](https://commitlint.js.org/). You can validate your commit message locally:

```bash
# Validate the last commit
npm run commitlint:last

# Validate during commit (if using git hooks)
npm run commitlint
```

## Development Workflow

If you have a suggestion or find a bug, please open an issue to discuss it.

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- (Optional) Infura API key for full testing - get one at [MetaMask Developer Portal](https://developer.metamask.io/)

If you want to contribute code, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feat/your-feature-name`).
3. Make your changes.
4. Follow the commit message guidelines above.
5. Run tests to ensure everything works (`npm test` at minimum).
6. Commit your changes using conventional commits format.
7. Push to the branch (`git push origin feat/your-feature-name`).
8. Open a new Pull Request.

## Building

### Docker
```bash
docker build -t infura-mcp-server .
```

### NPM
```bash
npm install
npm test
```

## Testing

The server includes a comprehensive testing framework that validates all 29 Ethereum tools:

### Test Types
- **Structure Validation** - Tool definitions and schemas (no API key required)
- **API Validation** - Real Infura API calls for all 29 tools (requires API key)
- **Integration Testing** - End-to-end functionality validation
- **SSE Transport** - Server-Sent Events testing

### Quick Start
```bash
# Basic validation (no API key needed)
npm test

# Test all 29 tools with real API calls
INFURA_API_KEY=your_key npm run test:comprehensive

# Full test suite (structure + API + SSE + integration)
INFURA_API_KEY=your_key npm run test:full
```

### CI/CD Integration
Tests run automatically in GitHub Actions using repository secrets:
1. Go to Settings → Secrets → Actions
2. Add `INFURA_API_KEY` secret
3. All PRs and releases will validate with real API calls

### Testing Your Changes
When contributing, please ensure:
- All existing tests pass (`npm test`)
- If adding new tools, add corresponding tests
- If fixing bugs, add tests to prevent regression
- For API-dependent features, test with a real `INFURA_API_KEY`

## Branch Naming

Please use descriptive branch names that follow this pattern:
- `feat/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `test/description` - for test additions/fixes
- `chore/description` - for maintenance tasks

## Pull Request Guidelines

- Ensure all tests pass (`npm test` minimum, `npm run test:full` preferred)
- Update documentation if needed
- Use conventional commit messages
- Keep PRs focused on a single feature/fix
- Provide clear description of changes in the PR
- Include test results in PR description if relevant
- For tool additions/changes, show example usage 