#!/usr/bin/env bash
set -e

# Ensure we're on beta branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "beta" ]; then
  echo "❌ Must be on 'beta' branch. Current: $BRANCH"
  exit 1
fi

# Bump prerelease version (semver: 6.1.2-beta.N)
npm version prerelease --preid=beta --no-git-tag-version

# Get new version
VERSION=$(node -p "require('./package.json').version")

# Build dev bundle (for testing via HACS)
rm -rf dist
rollup -c

# Stage everything (src, config, dist) for commit
git add -A

# Defaults
COMMIT_MSG="🔖 Beta release $VERSION"

# Try AI-generated commit message
if [ -n "$OPENAI_API_KEY" ]; then
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -n "$LAST_TAG" ]; then
    DIFF_STAT=$(git diff --stat $LAST_TAG HEAD)
  else
    DIFF_STAT=$(git diff --stat HEAD)
  fi

  COMMIT_PAYLOAD=$(jq -n \
    --arg version "$VERSION" \
    --arg diff "$DIFF_STAT" \
    '{
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "Write a concise git commit message for a beta prerelease."},
        {role: "user", content: ("Generate a commit message for beta release " + $version + ":\n" + $diff)}
      ],
      max_tokens: 50,
      temperature: 0.3
    }')

  RAW=$(echo "$COMMIT_PAYLOAD" | \
    curl -s https://api.openai.com/v1/chat/completions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -H "Content-Type: application/json" \
      -d @-)

  AI_MSG=$(echo "$RAW" | jq -r '.choices[0].message.content' || true)
  if [ -n "$AI_MSG" ] && [ "$AI_MSG" != "null" ]; then
    COMMIT_MSG="$AI_MSG"
  fi
fi

# Commit + tag
git commit -m "$COMMIT_MSG"
git tag "v$VERSION"

# Push branch + tag
git push origin beta
git push origin "v$VERSION"

# Create GitHub prerelease for HACS
gh release create "v$VERSION" --prerelease --notes "Beta release $VERSION – for testing"

echo "✅ Beta released"
echo "  package.json = $VERSION"
echo "  tag          = v$VERSION"
echo "  commit msg   = $COMMIT_MSG"
