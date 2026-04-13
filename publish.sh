#!/usr/bin/env bash

# Exit immediately on error (-e), treat unset variables as errors (-u),
# and fail pipelines if any command fails (pipefail)
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

# Prevent running during a rebase (repo is in unstable state)
ensure_not_mid_rebase() {
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        fail "Rebase in progress. Complete or abort it first."
    fi
}

echo "🔍 Checking prerequisites..."

# Verify required tools are installed
for cmd in git node gh; do
    require_cmd "$cmd"
done

# Ensure we are inside a git repository
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not inside a git repository"

# Ensure repo is not mid-rebase
ensure_not_mid_rebase

# Verify we are on the beta branch (publish is only allowed from beta)
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "beta" ] || fail "Must be on 'beta' branch. Current: $BRANCH"

# Ensure GitHub CLI is authenticated (needed for release creation)
gh auth status >/dev/null 2>&1 || fail "GitHub CLI is not authenticated. Run: gh auth login"

# Enforce clean working tree:
# - no unstaged changes
# - no staged but uncommitted changes
# This ensures publish reflects a deliberate commit
git diff --quiet || fail "Working tree has unstaged changes. Commit or stash them first."
git diff --cached --quiet || fail "Working tree has staged but uncommitted changes. Commit or unstage them first."

echo "🔄 Fetching remote state..."

# Fetch latest remote beta and tags for accurate comparison
git fetch origin beta --tags >/dev/null 2>&1 || fail "Unable to fetch origin/beta"

# Read current version from package.json (source of truth)
VERSION="$(node -p "require('./package.json').version")"
[ -n "$VERSION" ] || fail "Unable to read version from package.json"

# Construct tag name (e.g., v6.2.7-beta.4)
TAG="v$VERSION"

# Ensure tag does not already exist locally
if git rev-parse "$TAG" >/dev/null 2>&1; then
    fail "Tag $TAG already exists locally"
fi

# Ensure tag does not already exist on remote
if git ls-remote --tags origin | grep -q "refs/tags/$TAG$"; then
    fail "Tag $TAG already exists on origin"
fi

# Capture commit pointers
LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse origin/beta)"

# Ensure remote beta is an ancestor of local HEAD
# This guarantees we are only moving forward (no divergence)
if ! git merge-base --is-ancestor origin/beta HEAD; then
    fail "Local beta has diverged from origin/beta. Pull/rebase before publishing."
fi

# Ensure there is at least one new commit to publish
# (i.e., local HEAD is ahead of origin/beta)
if git merge-base --is-ancestor HEAD origin/beta; then
    fail "No new local commit to publish."
fi

echo "🚀 Pushing beta branch..."

# Push latest commits to remote beta branch
git push origin beta

echo "🏷 Creating tag $TAG..."

# Create a tag pointing to current commit
git tag "$TAG"

echo "🚀 Pushing tag $TAG..."

# Push the tag to GitHub
git push origin "$TAG"

echo "📣 Creating GitHub prerelease..."

# Create a GitHub prerelease for this tag
# This is what HACS / external systems will consume
gh release create "$TAG" \
    --prerelease \
    --notes "Beta release $VERSION - for testing"

echo "✅ Beta published"
echo "  branch       = beta"
echo "  package.json = $VERSION"
echo "  tag          = $TAG"