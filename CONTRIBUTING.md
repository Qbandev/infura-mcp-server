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

If you want to contribute code, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feat/your-feature-name`).
3. Make your changes.
4. Follow the commit message guidelines above.
5. Add or update tests if applicable.
6. Commit your changes using conventional commits format.
7. Push to the branch (`git push origin feat/your-feature-name`).
8. Open a new Pull Request.

## Branch Naming

Please use descriptive branch names that follow this pattern:
- `feat/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `test/description` - for test additions/fixes
- `chore/description` - for maintenance tasks

## Pull Request Guidelines

- Ensure all tests pass
- Update documentation if needed
- Use conventional commit messages
- Keep PRs focused on a single feature/fix
- Provide clear description of changes in the PR 