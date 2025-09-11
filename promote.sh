#!/usr/bin/env bash
set -e

# Ensure we're on main
git checkout main

# Abort if main has uncommitted changes (other than version bumps)
#if ! git diff --quiet || ! git diff --cached --quiet; then
#  echo "❌ Main has local changes. Commit or stash them first."
#  git checkout beta
#  exit 1
#fi

# Abort if remote main has commits not in beta
#git fetch origin
#if ! git diff --quiet origin/beta origin/main -- . ':(exclude)package.json' ':(exclude)package-lock.json'; then
#  echo "❌ Main has changes that are not in beta (outside version files)."
#  echo "Merge or resolve these before promoting."
#  git checkout beta
#  exit 1
#fi

# Force main to match beta
git fetch origin
git reset --hard origin/beta

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
if [[ "$CURRENT_VERSION" != *"-beta."* ]]; then
  echo "❌ Current version ($CURRENT_VERSION) is not a beta. Nothing to promote."
  exit 1
fi

# Strip -beta.# → stable version
STABLE_VERSION=$(echo "$CURRENT_VERSION" | sed -E 's/-beta\.[0-9]+//')
npm version "$STABLE_VERSION" --no-git-tag-version
git add -A

# Build prod bundle 
rm -rf dist 
rollup -c --environment NODE_ENV=production

# Defaults
COMMIT_MSG="🔖 Release $STABLE_VERSION"
RELEASE_NOTES="Release $STABLE_VERSION – minor changes"

# === AI commentary (optional) ===
if [ -n "$OPENAI_API_KEY" ]; then
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -n "$LAST_TAG" ]; then
    DIFF_STAT=$(git diff --stat $LAST_TAG HEAD)
    GIT_LOG=$(git log $LAST_TAG..HEAD --pretty=format:"%h %s%n%b")
  else
    DIFF_STAT=$(git diff --stat HEAD)
    GIT_LOG=$(git log --pretty=format:"%h %s%n%b")
  fi

  # Commit message
  COMMIT_PAYLOAD=$(jq -n \
    --arg version "$STABLE_VERSION" \
    --arg diff "$DIFF_STAT" \
    '{
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "Write a short, imperative git commit message (max 70 chars)."},
        {role: "user", content: ("Suggest a commit message for release " + $version + ":\n" + $diff)}
      ],
      max_tokens: 50,
      temperature: 0.3
    }')
  RAW_COMMIT=$(echo "$COMMIT_PAYLOAD" | \
    curl -s https://api.openai.com/v1/chat/completions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -H "Content-Type: application/json" \
      -d @-)
  AI_COMMIT_MSG=$(echo "$RAW_COMMIT" | jq -r '.choices[0].message.content' || true)
  if [ -n "$AI_COMMIT_MSG" ] && [ "$AI_COMMIT_MSG" != "null" ]; then
    COMMIT_MSG="$AI_COMMIT_MSG"
  fi

  # Release notes
  NOTES_PAYLOAD=$(jq -n \
    --arg version "$STABLE_VERSION" \
    --arg log "$GIT_LOG" \
    '{
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "Write clear release notes with bullet points. Only use provided commit logs. Do not invent."},
        {role: "user", content: ("Generate release notes for version " + $version + ":\nCommits:\n" + $log)}
      ],
      max_tokens: 300,
      temperature: 0.2
    }')
  RAW_NOTES=$(echo "$NOTES_PAYLOAD" | \
    curl -s https://api.openai.com/v1/chat/completions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -H "Content-Type: application/json" \
      -d @-)
  AI_NOTES=$(echo "$RAW_NOTES" | jq -r '.choices[0].message.content' || true)
  if [ -n "$AI_NOTES" ] && [ "$AI_NOTES" != "null" ]; then
    RELEASE_NOTES="$AI_NOTES"
  fi
fi

# Commit + tag stable
git commit -m "$COMMIT_MSG"
git tag "v$STABLE_VERSION"

# Push stable
git push origin main --force
git push origin "v$STABLE_VERSION"

# GitHub Release
gh release create "v$STABLE_VERSION" --notes "$RELEASE_NOTES"

echo "✅ Promoted $CURRENT_VERSION → v$STABLE_VERSION"
echo "Commit message: $COMMIT_MSG"
echo "Release notes:"
echo "$RELEASE_NOTES"

# === Prep beta for next cycle ===
git checkout beta
git pull origin beta
NEXT_VERSION=$(echo "$STABLE_VERSION" | awk -F. '{printf "%d.%d.%d", $1, $2, $3+1}')
npm version "$NEXT_VERSION-beta.0" --no-git-tag-version
git add package.json package-lock.json
git commit -m "🔖 Prepare beta branch for $NEXT_VERSION-beta.0"
git tag "v$NEXT_VERSION-beta.0"
git push origin beta
git push origin "v$NEXT_VERSION-beta.0"

echo "ℹ️ Beta branch advanced to $NEXT_VERSION-beta.0"

