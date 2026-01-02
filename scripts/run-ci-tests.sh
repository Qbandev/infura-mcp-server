#!/bin/bash

# CI Test Suite - Shared script for consistent testing across workflows
# Used by: release.yml, npm-publish.yml

set -e

echo "🧪 Running comprehensive CI test suite..."

# Check if this is a release context or publish context
CONTEXT=${1:-"general"}
echo "📋 Test context: $CONTEXT"

# Run basic validation tests
echo "📋 Running validation tests..."
npm test

# Run comprehensive tool testing (all 29 tools)
echo "🔧 Running comprehensive tool validation (29 tools)..."
TEST_COMMAND="npm run test:comprehensive"
if [ -n "$INFURA_API_KEY" ]; then
  echo "🔑 Using real API key for comprehensive testing..."
else
  echo "⚠️ No API key available, running structure validation only..."
fi
$TEST_COMMAND

# Run HTTP transport tests  
echo "🌐 Running HTTP transport tests..."
npm run test:http

# Run integration tests if API key is available
if [ -n "$INFURA_API_KEY" ]; then
  echo "🔗 Running integration tests with real API..."
  npm run test:integration
  echo "✅ All tests including real API validation passed - ready for $CONTEXT!"
else
  echo "⚠️ $CONTEXT proceeding without API validation (no secret configured)"
fi

echo "🎉 CI test suite completed successfully!" 