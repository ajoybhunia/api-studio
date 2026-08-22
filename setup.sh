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

# Make all hooks executable
chmod +x .githooks/pre-commit
chmod +x .githooks/pre-merge-commit
chmod +x .githooks/pre-push
chmod +x .githooks/pre-rebase

echo "✓ Git hooks installed"
echo "  Hooks: pre-commit, pre-merge-commit, pre-push, pre-rebase"
