# Release Process Documentation

## Overview

This project uses [Release Please](https://github.com/googleapis/release-please) for automated releases based on [Conventional Commits](https://www.conventionalcommits.org/).

## Current Setup

### Automated Release Please (Recommended)
- **Workflow**: `.github/workflows/release-please.yml`
- **Trigger**: Automatically on every push to `main`
- **Process**: Creates a PR with version bumps and changelog updates

### Legacy Manual Release (Being Phased Out)
- **Workflow**: `.github/workflows/release.yml`
- **Trigger**: Manual workflow dispatch
- **Process**: Manual version bump and release

### Manual NPM Publish (Backup)
- **Workflow**: `.github/workflows/npm-publish.yml`
- **Trigger**: Manual workflow dispatch only
- **Purpose**: Emergency backup for manual npm publishing if Release Please fails
- **Use Cases**:
  - Recovery from failed Release Please publish
  - Publishing specific tags manually
  - Publishing with custom npm dist-tags (beta, next, etc.)

## How Release Please Works

1. **Commit Convention**: Use conventional commit messages:
   ```
   feat: add new feature        # Minor version bump
   fix: fix a bug              # Patch version bump
   feat!: breaking change      # Major version bump
   ```

2. **Automatic PR Creation**: Release Please creates/updates a PR with:
   - Version bump in `package.json`
   - Updated `CHANGELOG.md`
   - Release notes

3. **Release on Merge**: When you merge the Release PR:
   - Creates a GitHub release
   - Tags the commit
   - Publishes to npm

## Migration from Manual Releases

### Before (Manual Process)
1. Manually trigger `release.yml` workflow
2. Choose version type (patch/minor/major)
3. Workflow bumps version and creates release

### After (Automated with Release Please)
1. Make commits with conventional commit messages
2. Release Please automatically creates a PR
3. Review and merge the PR to release

## Commit Message Examples

### Features (Minor Version Bump)
```bash
git commit -m "feat: add support for new Ethereum network"
git commit -m "feat(tools): implement eth_getProof method"
```

### Fixes (Patch Version Bump)
```bash
git commit -m "fix: resolve connection timeout issue"
git commit -m "fix(auth): correct API key validation"
```

### Breaking Changes (Major Version Bump)
```bash
git commit -m "feat!: change API response format"
git commit -m "fix!: remove deprecated methods"
```

### Other Commits (No Version Bump)
```bash
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "test: add unit tests"
```

## Configuration Files

### `release-please-config.json`
- Configures Release Please behavior
- Sets changelog path, version tag format, etc.

### `.release-please-manifest.json`
- Tracks current version
- Updated automatically by Release Please

## Benefits of Release Please

1. **Automated**: No manual intervention needed
2. **Consistent**: Follows semantic versioning rules
3. **Transparent**: Creates PRs for review before release
4. **Comprehensive**: Auto-generates changelogs from commits
5. **Flexible**: Can be customized via configuration

## Troubleshooting

### Release PR Not Created
- Ensure commits follow conventional format
- Check GitHub Actions for errors
- Verify `main` branch protection rules allow PR creation

### Version Not Bumping Correctly
- Review commit messages for proper format
- Check `release-please-config.json` settings
- Ensure no conflicting manual version changes

### NPM Publish Failing
- Verify `NPM_TOKEN` secret is set correctly
- Check npm permissions for the package
- Review test results in the workflow

## Best Practices

1. **Always use conventional commits** for clear version management
2. **Review Release PRs** before merging to ensure accuracy
3. **Don't manually edit** version in package.json
4. **Keep changelogs clean** by writing good commit messages
5. **Test thoroughly** before merging release PRs

## Using the Manual NPM Publish Backup

The manual NPM publish workflow is available for emergency situations:

1. **Go to Actions** → "Manual NPM Publish (Backup)"
2. **Click "Run workflow"** and provide:
   - Git tag to publish (e.g., `v1.0.0`)
   - NPM dist-tag (default: `latest`, options: `beta`, `next`)
3. **Workflow will**:
   - Verify authorization
   - Check out the specific tag
   - Verify version consistency
   - Run tests
   - Publish to npm if not already published

## Removing Legacy Workflows

Once comfortable with Release Please, you can:
1. Delete `.github/workflows/release.yml` (manual release)
2. Keep `.github/workflows/npm-publish.yml` as emergency backup (recommended)
3. Remove manual release scripts from `package.json`

## Resources

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/) 