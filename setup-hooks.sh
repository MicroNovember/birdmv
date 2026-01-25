#!/bin/bash
# Setup Git hooks for SAMORN Movie project
# Run this script to install pre-commit, pre-push, and commit-msg hooks

echo "🔧 Setting up Git hooks for SAMORN Movie project..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ ERROR: Not in a Git repository"
    echo "   Please run this script from the root of the project"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy hooks from templates (if they don't exist)
if [ ! -f ".git/hooks/pre-commit" ]; then
    echo "📝 Installing pre-commit hook..."
    cp .git/hooks/pre-commit.sample .git/hooks/pre-commit 2>/dev/null || echo "#!/bin/sh" > .git/hooks/pre-commit
    # Add our pre-commit content
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook for SAMORN Movie project
# Prevents accidental commits and ensures code quality

echo "🔍 Running pre-commit checks..."

# Check for common mistakes
echo "📋 Checking for common issues..."

# 1. Check for console.log statements (should be removed in production)
if git diff --cached --name-only | xargs grep -l "console\.log" 2>/dev/null; then
    echo "❌ ERROR: Found console.log statements in staged files"
    echo "   Please remove console.log statements before committing"
    echo "   Use console.error() for errors or remove entirely"
    exit 1
fi

# 2. Check for alert() statements (should use Alert2)
if git diff --cached --name-only | xargs grep -l "alert(" 2>/dev/null; then
    echo "❌ ERROR: Found alert() statements in staged files"
    echo "   Please use Alert2 instead of alert() for better UX"
    echo "   Replace: alert('message') -> Alert2.info('message')"
    exit 1
fi

# 3. Check for merge conflict markers
if git diff --cached --name-only | xargs grep -l "^<<<<<<<\|^=======\|^>>>>>>>" 2>/dev/null; then
    echo "❌ ERROR: Found merge conflict markers"
    echo "   Please resolve merge conflicts before committing"
    exit 1
fi

echo "✅ Pre-commit checks passed!"
echo "🚀 Ready to commit your changes!"
exit 0
EOF
fi

if [ ! -f ".git/hooks/pre-push" ]; then
    echo "📝 Installing pre-push hook..."
    cp .git/hooks/pre-push.sample .git/hooks/pre-push 2>/dev/null || echo "#!/bin/sh" > .git/hooks/pre-push
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
# Pre-push hook for SAMORN Movie project
# Additional checks before pushing to remote

echo "🚀 Running pre-push checks..."

# 1. Check if we're pushing to main/master branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
target_branch=$(git rev-parse --abbrev-ref @{u} 2>/dev/null || echo "origin/master")

if [ "$target_branch" = "origin/master" ] || [ "$target_branch" = "origin/main" ]; then
    echo "🔒 Pushing to main branch - running additional checks..."
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "❌ ERROR: You have uncommitted changes"
        echo "   Please commit all changes before pushing to main branch"
        exit 1
    fi
    
    # Check for sensitive files that shouldn't be pushed
    sensitive_files=".env .env.local .env.production config/local.json"
    for file in $sensitive_files; do
        if [ -f "$file" ] && git ls-files | grep -q "$file"; then
            echo "❌ ERROR: Sensitive file $file is tracked"
            echo "   Please remove sensitive files from git tracking"
            echo "   Run: git rm --cached $file"
            exit 1
        fi
    done
fi

echo "✅ Pre-push checks passed!"
echo "🎯 Ready to push to remote repository!"
exit 0
EOF
fi

if [ ! -f ".git/hooks/commit-msg" ]; then
    echo "📝 Installing commit-msg hook..."
    cp .git/hooks/commit-msg.sample .git/hooks/commit-msg 2>/dev/null || echo "#!/bin/sh" > .git/hooks/commit-msg
    cat > .git/hooks/commit-msg << 'EOF'
#!/bin/sh
# Commit message hook for SAMORN Movie project
# Ensures commit messages follow guidelines

# Get the commit message
commit_msg_file="$1"
commit_msg=$(cat "$commit_msg_file")

# Check for minimum length
if [ ${#commit_msg} -lt 10 ]; then
    echo "❌ ERROR: Commit message too short (minimum 10 characters)"
    echo "   Please provide a more descriptive commit message"
    exit 1
fi

# Check for Thai language support (encourage Thai messages)
if echo "$commit_msg" | grep -qE "[ก-ฮ]"; then
    echo "✅ Thai language detected in commit message"
else
    echo "ℹ️  INFO: Consider using Thai language in commit messages"
fi

echo "✅ Commit message checks passed!"
exit 0
EOF
fi

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push  
chmod +x .git/hooks/commit-msg

echo "✅ Git hooks setup completed!"
echo "📋 Available hooks:"
echo "   - pre-commit: Checks code quality before committing"
echo "   - pre-push: Additional checks before pushing"
echo "   - commit-msg: Validates commit messages"
echo ""
echo "🎯 Your commits will now be automatically checked!"
echo "🚀 Ready to code with quality assurance!"
