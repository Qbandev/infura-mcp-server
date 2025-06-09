# GitHub Actions Setup Guide

This guide explains how to set up the automated workflows for the infura-mcp-server repository.

## Required Secrets

To enable automatic npm publishing, you need to configure the following GitHub repository secret:

### NPM_TOKEN

1. **Create an npm Access Token:**
   - Go to [npmjs.com](https://www.npmjs.com) and log in to your account
   - Click on your profile picture → "Access Tokens"
   - Click "Generate New Token" → "Granular Access Token"
   - Configure the token:
     - **Name:** `GitHub Actions - infura-mcp-server`
     - **Expiration:** Choose an appropriate duration (90 days or custom)
     - **Packages and scopes:** Select your account/organization
     - **Permissions:** 
       - Packages: `Read and write`
       - Organizations: `Read` (if applicable)

2. **Add the Token to GitHub:**
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `NPM_TOKEN`
   - Value: Paste the npm token you just created
   - Click **"Add secret"**

## Workflows Overview

### 1. CI Workflow (`.github/workflows/ci.yml`)
- **Triggers:** Push to main/develop, Pull Requests
- **Purpose:** Run tests, validate package structure, check for issues
- **Node versions:** 18, 20, 22
- **Actions:**
  - Install dependencies
  - Validate package.json
  - Run tests (if available)
  - Verify package structure
  - Test package installation
  - Check for security vulnerabilities

### 2. Release Workflow (`.github/workflows/release.yml`)
- **Triggers:** Manual workflow dispatch
- **Purpose:** Create new releases with version bumping
- **Options:**
  - Version bump type: patch, minor, major, prerelease
  - Prerelease tag (for prerelease versions)
- **Actions:**
  - Run tests
  - Bump version in package.json
  - Create/update CHANGELOG.md
  - Create Git tag
  - Create GitHub release

### 3. NPM Publish Workflow (`.github/workflows/npm-publish.yml`)
- **Triggers:** 
  - GitHub releases (published)
  - Git tags starting with 'v'
- **Purpose:** Automatically publish to npm when releases are created
- **Actions:**
  - Run tests on multiple Node versions
  - Verify package can be built
  - Check if version needs publishing
  - Publish to npm registry
  - Create GitHub release (if triggered by tag)

## Usage Instructions

### Creating a New Release

1. **Option A: Using the Release Workflow (Recommended)**
   - Go to **Actions** tab in your GitHub repository
   - Click on **"Release"** workflow
   - Click **"Run workflow"**
   - Select the version bump type (patch, minor, major, prerelease)
   - Click **"Run workflow"**
   - This will automatically:
     - Bump the version
     - Create a Git tag
     - Create a GitHub release
     - Trigger the npm publish workflow

2. **Option B: Manual Release**
   ```bash
   # Bump version locally
   npm version patch  # or minor, major
   
   # Push changes and tags
   git push origin main --follow-tags
   
   # Create a GitHub release manually
   # This will trigger the npm publish workflow
   ```

### Monitoring Workflows

- **CI Status:** Check the green/red badges on Pull Requests
- **Release Status:** Monitor the Actions tab after triggering a release
- **npm Publish Status:** Verify on [npmjs.com/package/infura-mcp-server](https://www.npmjs.com/package/infura-mcp-server)

## Troubleshooting

### NPM Publish Fails

1. **Check NPM_TOKEN:**
   - Ensure the token is valid and not expired
   - Verify the token has proper permissions
   - Check if 2FA is required for publishing

2. **Version Conflicts:**
   - The workflow checks if the version already exists on npm
   - Make sure you've bumped the version number
   - Use semantic versioning (x.y.z format)

3. **Package Validation:**
   - Ensure package.json is valid
   - Check that all required files are included
   - Verify the package can be built/tested

### Common Issues

- **Workflow not triggering:** Check the trigger conditions in the YAML files
- **Permission errors:** Ensure repository secrets are properly configured
- **Test failures:** Fix any failing tests before releases
- **Git authentication:** Ensure proper GitHub token permissions

## Security Best Practices

1. **Token Management:**
   - Use granular access tokens with minimal required permissions
   - Set reasonable expiration dates
   - Rotate tokens regularly

2. **Workflow Security:**
   - Don't expose secrets in logs
   - Use official GitHub Actions when possible
   - Pin action versions for security

3. **Release Process:**
   - Always run tests before publishing
   - Review changes before creating releases
   - Use semantic versioning consistently

## Support

If you encounter issues with the workflows:

1. Check the Actions tab for detailed logs
2. Verify all secrets are properly configured
3. Ensure your npm account has proper permissions
4. Review the workflow YAML files for any syntax errors

For npm-specific issues, refer to the [npm documentation](https://docs.npmjs.com/). 