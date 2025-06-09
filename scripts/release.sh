#!/usr/bin/env bash

# Automated Release Script for infura-mcp-server
# This script triggers the GitHub Release workflow to create a new version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_usage() {
    echo -e "${BLUE}Usage: $0 [version_type] [prerelease_tag]${NC}"
    echo ""
    echo "Version types:"
    echo "  patch     - Bug fixes (0.1.0 → 0.1.1)"
    echo "  minor     - New features (0.1.0 → 0.2.0)" 
    echo "  major     - Breaking changes (0.1.0 → 1.0.0)"
    echo "  prerelease - Prerelease version (0.1.0 → 0.1.1-beta.0)"
    echo ""
    echo "Examples:"
    echo "  $0 patch"
    echo "  $0 minor"
    echo "  $0 prerelease beta"
    echo "  $0 prerelease alpha"
    exit 1
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if user is authenticated with GitHub CLI
check_auth() {
    log_info "Checking GitHub CLI authentication..."
    if ! gh auth status &>/dev/null; then
        log_error "Not authenticated with GitHub CLI"
        echo "Please run: gh auth login"
        exit 1
    fi
    log_success "GitHub CLI authenticated"
}

# Get current version from package.json
get_current_version() {
    if [ -f "package.json" ]; then
        VERSION=$(node -p "require('./package.json').version")
        log_info "Current version: $VERSION"
    else
        log_error "package.json not found"
        exit 1
    fi
}

# Validate version type
validate_version_type() {
    case $1 in
        patch|minor|major|prerelease)
            return 0
            ;;
        *)
            log_error "Invalid version type: $1"
            print_usage
            ;;
    esac
}

# Trigger the release workflow
trigger_release() {
    local version_type=$1
    local prerelease_tag=${2:-"beta"}
    
    log_info "Triggering release workflow..."
    log_info "Version type: $version_type"
    
    if [ "$version_type" = "prerelease" ]; then
        log_info "Prerelease tag: $prerelease_tag"
        
        # Trigger workflow with prerelease tag
        gh workflow run release.yml \
            --field version_type="$version_type" \
            --field prerelease_tag="$prerelease_tag"
    else
        # Trigger workflow without prerelease tag
        gh workflow run release.yml \
            --field version_type="$version_type"
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Release workflow triggered successfully!"
        log_info "Monitor progress at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
    else
        log_error "Failed to trigger release workflow"
        exit 1
    fi
}

# Wait for workflow to start and show status
monitor_workflow() {
    log_info "Waiting for workflow to start..."
    sleep 5
    
    # Get the latest workflow run
    WORKFLOW_URL=$(gh run list --workflow=release.yml --limit=1 --json url -q '.[0].url')
    
    if [ -n "$WORKFLOW_URL" ]; then
        log_info "Workflow started: $WORKFLOW_URL"
        log_info "You can monitor the progress in your browser or run:"
        echo "  gh run watch"
    fi
}

# Main script
main() {
    echo -e "${BLUE}🚀 Infura MCP Server Release Automation${NC}"
    echo ""
    
    # Parse arguments
    VERSION_TYPE=${1:-""}
    PRERELEASE_TAG=${2:-"beta"}
    
    # Show usage if no arguments
    if [ -z "$VERSION_TYPE" ]; then
        print_usage
    fi
    
    # Validate inputs
    validate_version_type "$VERSION_TYPE"
    
    # Check prerequisites
    check_auth
    get_current_version
    
    # Confirm the release
    echo ""
    log_warning "About to create a new release:"
    echo "  Current version: $VERSION"
    echo "  Version type: $VERSION_TYPE"
    if [ "$VERSION_TYPE" = "prerelease" ]; then
        echo "  Prerelease tag: $PRERELEASE_TAG"
    fi
    echo ""
    
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Release cancelled"
        exit 0
    fi
    
    # Trigger the release
    trigger_release "$VERSION_TYPE" "$PRERELEASE_TAG"
    monitor_workflow
    
    echo ""
    log_success "Release process initiated!"
    log_info "The workflow will:"
    echo "  1. Run tests"
    echo "  2. Bump version in package.json"
    echo "  3. Create git tag"
    echo "  4. Create GitHub release"
    echo "  5. Trigger npm publish"
}

# Run main function with all arguments
main "$@" 