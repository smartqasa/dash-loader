#!/usr/bin/env bash

# Exit on error (-e), fail on unset vars (-u), and fail pipelines if any command fails
set -euo pipefail

# Standard failure helper: print message and exit
fail() {
    echo "❌ $1" >&2
    exit 1
}

# Ensure a required command exists in PATH
require_cmd() {
    command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

# Prevent running during a rebase (repo is in unstable/transitional state)
ensure_not_mid_rebase() {
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        fail "Rebase in progress. Complete or abort it first."
    fi
}

echo "🔍 Checking prerequisites..."

# Verify required tools are installed
for cmd in git npm node rollup; do
    require_cmd "$cmd"
done

# Ensure we are inside a git repository
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not inside a git repository"

# Ensure repo is not mid-rebase (avoids corrupting version bumps)
ensure_not_mid_rebase

# Enforce that all development happens on beta branch
# This keeps versioning and release flow consistent
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "beta" ] || fail "Must be on 'beta' branch. Current: $BRANCH"

# Bump the prerelease version in package.json
# Example: 6.2.7-beta.3 → 6.2.7-beta.4
# This is the version that will be committed next
echo "📦 Bumping beta prerelease version..."
npm version prerelease --preid=beta --no-git-tag-version >/dev/null

# Read the updated version from package.json (source of truth)
VERSION="$(node -p "require('./package.json').version")"
[ -n "$VERSION" ] || fail "Unable to read version from package.json"

# Build the development bundle
# This regenerates dist/ so it can be committed and tested
echo "🏗 Building dev bundle..."
rm -rf dist
rollup -c

# At this point:
# - package.json has the new beta version
# - dist/ contains the transpiled output
# Next step (outside this script) is to commit via VS Code

echo "✅ Build complete"
echo "  package.json = $VERSION"