#!/usr/bin/env bash

# Fail fast:
# -e  exit on any error
# -u  error on unset variables
# -o pipefail  fail if any command in a pipeline fails
set -euo pipefail

# Standard failure helper
fail() {
    echo "❌ $1" >&2
    exit 1
}

# Ensure required tools exist
require_cmd() {
    command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

# Prevent running during rebase (repo is in unstable state)
ensure_not_mid_rebase() {
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        fail "Rebase in progress. Complete or abort it first."
    fi
}

echo "🔍 Checking prerequisites..."

# Required tools for promotion
for cmd in git npm node rollup gh; do
    require_cmd "$cmd"
done

# Ensure we are inside a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not inside a git repository"
ensure_not_mid_rebase

# GitHub CLI must be authenticated for release creation
gh auth status >/dev/null 2>&1 || fail "GitHub CLI is not authenticated. Run: gh auth login"

# Promotion must always start from beta (source of truth)
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "beta" ] || fail "Must start on 'beta' branch. Current: $BRANCH"

# Ensure clean working tree to avoid leaking unintended changes into release
git diff --quiet || fail "Working tree has unstaged changes. Commit or stash them first."
git diff --cached --quiet || fail "Working tree has staged but uncommitted changes. Commit or unstage them first."

echo "🔄 Fetching remote state..."

# Fetch latest tags and branch state
git fetch origin --tags >/dev/null 2>&1 || fail "Unable to fetch origin"

# Ensure local beta exactly matches remote beta (no unpublished or missing changes)
LOCAL_BETA_HEAD="$(git rev-parse beta)"
REMOTE_BETA_HEAD="$(git rev-parse origin/beta)"
[ "$LOCAL_BETA_HEAD" = "$REMOTE_BETA_HEAD" ] || fail "Local beta is not in sync with origin/beta. Push or pull first."

# Read current version from package.json
CURRENT_VERSION="$(node -p "require('./package.json').version")"
[ -n "$CURRENT_VERSION" ] || fail "Unable to read version from package.json"

# Promotion only works from a beta version
if [[ "$CURRENT_VERSION" != *"-beta."* ]]; then
    fail "Current version ($CURRENT_VERSION) is not a beta version."
fi

# Derive stable version by stripping -beta.N
STABLE_VERSION="$(echo "$CURRENT_VERSION" | sed -E 's/-beta\.[0-9]+$//')"
[ -n "$STABLE_VERSION" ] || fail "Unable to derive stable version from $CURRENT_VERSION"

# Compute next beta version (increment patch, reset to beta.0)
NEXT_VERSION="$(echo "$STABLE_VERSION" | awk -F. '{printf "%d.%d.%d", $1, $2, $3+1}')"
NEXT_BETA_VERSION="${NEXT_VERSION}-beta.0"

# Construct stable tag
STABLE_TAG="v$STABLE_VERSION"

echo "📌 Current beta version : $CURRENT_VERSION"
echo "📌 Stable version       : $STABLE_VERSION"
echo "📌 Next beta version    : $NEXT_BETA_VERSION"

# Ensure we do not overwrite an existing stable tag
git rev-parse "$STABLE_TAG" >/dev/null 2>&1 && fail "Stable tag $STABLE_TAG already exists locally"
git ls-remote --tags origin | grep -q "refs/tags/$STABLE_TAG$" && fail "Stable tag $STABLE_TAG already exists on origin"

# Find the most recent stable tag (ignore beta tags)
LAST_STABLE_TAG="$(git tag --list 'v*' | grep -Ev -- '-beta\.' | sort -V | tail -n 1 || true)"

# Build release notes from last stable → current beta
# This ensures notes reflect real changes between stable releases
if [ -n "$LAST_STABLE_TAG" ]; then
    echo "📝 Building release notes from $LAST_STABLE_TAG..origin/beta"
    RELEASE_NOTES="$(git log "${LAST_STABLE_TAG}..origin/beta" --pretty=format:'- %s' --no-merges)"
else
    echo "📝 No previous stable tag found. Building release notes from repository history"
    RELEASE_NOTES="$(git log origin/beta --pretty=format:'- %s' --no-merges)"
fi

# Fallback if no commits are found
if [ -z "$RELEASE_NOTES" ]; then
    RELEASE_NOTES="- Stable release $STABLE_VERSION"
fi

# =========================
# PROMOTE beta → main
# =========================

echo "🚚 Promoting beta to main..."

# Switch to main and force it to match beta
# This enforces your rule: beta is the source of truth
git checkout main >/dev/null 2>&1 || fail "Unable to checkout main"
git fetch origin main beta --tags >/dev/null 2>&1 || fail "Unable to refresh origin/main or origin/beta"
git reset --hard origin/beta >/dev/null 2>&1

# Convert version to stable (remove beta suffix)
echo "📦 Converting version to stable..."
npm version "$STABLE_VERSION" --no-git-tag-version >/dev/null

# Build production bundle (fresh, do not trust beta build)
echo "🏗 Building production bundle..."
rm -rf dist
rollup -c --environment NODE_ENV:production

# Commit stable release
echo "💾 Committing stable release..."
git add -A
git commit -m "🔖 Release $STABLE_VERSION"

# Tag stable release
echo "🏷 Tagging $STABLE_TAG..."
git tag "$STABLE_TAG"

# Force push main (intentional destructive update)
echo "🚀 Force-pushing main..."
git push origin main --force

# Push tag
echo "🚀 Pushing stable tag..."
git push origin "$STABLE_TAG"

# Create GitHub release (consumed by HA / HACS)
echo "📣 Creating GitHub release..."
gh release create "$STABLE_TAG" --notes "$RELEASE_NOTES"

# =========================
# ADVANCE beta → next cycle
# =========================

echo "🔁 Advancing beta to next cycle..."

# Reset local beta to clean remote state
git checkout beta >/dev/null 2>&1 || fail "Unable to checkout beta"
git fetch origin beta --tags >/dev/null 2>&1 || fail "Unable to refresh origin/beta"
git reset --hard origin/beta >/dev/null 2>&1

# Bump to next beta version
echo "📦 Bumping beta to $NEXT_BETA_VERSION..."
npm version "$NEXT_BETA_VERSION" --no-git-tag-version >/dev/null

# Build new dev bundle so repo reflects correct version + artifacts
echo "🏗 Building next beta dev bundle..."
rm -rf dist
rollup -c

# Commit next beta cycle start
echo "💾 Committing next beta cycle..."
git add -A
git commit -m "🔖 Prepare beta branch for $NEXT_BETA_VERSION"

# Push updated beta branch
echo "🚀 Pushing beta..."
git push origin beta

echo "✅ Promotion complete"
echo "  promoted from   = $CURRENT_VERSION"
echo "  stable release  = $STABLE_VERSION"
echo "  stable tag      = $STABLE_TAG"
echo "  next beta       = $NEXT_BETA_VERSION"