#!/bin/bash
echo "Setting up API Studio development environment..."

# Check if gitleaks is installed
if ! command -v gitleaks &> /dev/null; then
  echo "⚠️  gitleaks is not installed."
  echo "   Install it with: brew install gitleaks"
  echo "   Then run ./setup.sh again."
  exit 1
fi

# Configure git to use custom hooks directory
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "✓ Pre-commit hooks installed"
echo "  Gitleaks will now run before every commit"
