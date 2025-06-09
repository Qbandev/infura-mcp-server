# Security Policy

## Release Security

This repository implements strict security controls for automated releases to prevent unauthorized publishing.

### 🔒 **Access Control**

Only the following users can trigger releases:

1. **Repository Owner**: `Qbandev` (automatically authorized)
2. **Authorized Collaborators**: Listed in the workflow configuration

### 🛡️ **Security Measures**

#### **1. Authorization Check**
- Every release workflow starts with an authorization verification
- Checks if the triggering user is the repository owner or in the authorized users list
- Fails immediately if unauthorized user attempts to trigger release

#### **2. User Verification**
- Compares `github.actor` (who triggered the workflow) against authorized list
- Logs all authorization attempts for audit trail
- Provides clear error messages for unauthorized attempts

#### **3. Workflow Dependencies** 
- Release job only runs after successful authorization
- Uses GitHub's `needs` and `if` conditions for enforcement
- Cannot be bypassed or skipped

### ⚙️ **Configuration**

#### **Adding Authorized Users**

To authorize additional users to trigger releases:

1. Edit `.github/workflows/release.yml`
2. Find the `AUTHORIZED_USERS` variable in the authorize job:
   ```bash
   AUTHORIZED_USERS="Qbandev additional_user another_user"
   ```
3. Add GitHub usernames separated by spaces
4. Commit and push the changes

#### **Security Best Practices**

- ✅ Only add trusted collaborators who should have release privileges
- ✅ Regularly review the authorized users list
- ✅ Monitor GitHub Actions logs for unauthorized attempts
- ✅ Use branch protection rules on `main` branch
- ✅ Require signed commits (currently enforced)

### 🚨 **Incident Response**

If you suspect unauthorized release attempts:

1. Check GitHub Actions logs for failed authorization attempts
2. Review the commit history for unauthorized changes to the workflow
3. Rotate the `NPM_TOKEN` secret if compromised
4. Consider enabling GitHub's security alerts

### 📋 **Security Audit Log**

The authorization check logs the following information:
- Repository owner
- Workflow actor (who triggered it)
- Authorized users list
- Authorization result (success/failure)
- Timestamp (via GitHub Actions)

### 🔐 **Additional Security Options**

For enhanced security, consider:

1. **Environment Protection** (manual setup in GitHub Settings):
   - Go to Settings → Environments
   - Create a `production` environment
   - Add required reviewers
   - Set deployment restrictions

2. **Branch Protection**:
   - Require pull request reviews
   - Require status checks
   - Restrict pushes to main branch

3. **Repository Secrets**:
   - Regularly rotate `NPM_TOKEN`
   - Monitor secret usage in Actions logs
   - Use least-privilege principle

### 📞 **Contact**

For security concerns or questions:
- Create a private GitHub issue
- Contact repository owner: `Qbandev`

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities privately through GitHub's security advisory feature or by creating a private issue. 