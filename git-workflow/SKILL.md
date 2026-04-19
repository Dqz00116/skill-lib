---
name: git-workflow
description: Use when committing code, pushing changes, or managing Git operations that require safety checks
version: 1.0
---

# Git Workflow Skill

## Overview

Automate Git operations with safety checks and user confirmation. This skill ensures changes are reviewed and explicitly approved before committing or pushing.

## When to Use

1. **Checks Workspace Status**
   - Shows modified files
   - Lists untracked files
   - Detects conflicts or merge states

2. **Smart Confirmation Prompt**
   - Lists all changes clearly
   - Asks for explicit approval
   - Provides multiple options (commit all, specific files, ignore, skip)

3. **Safe Commit & Push**
   - Only commits after confirmation
   - Handles GitHub authentication
   - Reports success or failure

4. **Conflict Detection**
   - Detects merge conflicts
   - Suggests resolution steps
   - Prevents force pushes

**When NOT to use:**
- When you need automated/unattended commits without user interaction
- When performing complex Git operations beyond standard commit/push workflows
- When a different skill or tool is explicitly designated for Git operations

## Quick Start

### Simple Commit

```bash
python scripts/git_commit.py
```

The script will:
1. Show `git status`
2. Ask for confirmation
3. Commit and push if approved

### Interactive Mode

```bash
python scripts/git_commit.py --interactive
```

Step-by-step confirmation for each file.

## Confirmation Format

```
📋 **Git Status Summary:**
Modified:
  - SOUL.md (41 insertions)
  - README.md (5 deletions)

Untracked:
  - new-feature.md
  - temp.log (should be ignored?)

✅ **Confirm:** 
  Reply:
  - "yes" → commit all modified
  - "commit with untracked" → commit all including untracked
  - "only SOUL.md" → commit specific file
  - "ignore temp.log" → add to .gitignore
  - "skip" → do nothing
```

## Safety Rules

### Never
- ❌ Commit without checking status first
- ❌ Commit without user confirmation
- ❌ Force push (`git push -f`)
- ❌ Commit binary/temporary files without asking

### Always
- ✅ Check `git status` before any operation
- ✅ Show list of changes for approval
- ✅ Respect `.gitignore`
- ✅ Handle errors gracefully
- ✅ Report what was done

## Usage Examples

### Example 1: Simple Workflow

```bash
$ python scripts/git_commit.py

📊 Git Status:
 M SOUL.md
?? new-file.md

📋 Changes Summary:
Modified: SOUL.md
Untracked: new-file.md

✅ Confirm: Reply "yes" to commit modified, "commit with untracked" for all, or specify files
> yes

📝 Commit message: Update SOUL.md

✅ Committed: a1b2c3d Update SOUL.md
🚀 Pushed to origin/main
```

### Example 2: With Untracked Files

```bash
$ python scripts/git_commit.py

📊 Git Status:
 M README.md
?? temp.log
?? important.md

📋 Changes Summary:
Modified: README.md
Untracked: temp.log, important.md

✅ Confirm: What to commit?
> commit with untracked

⚠️  temp.log looks like a temporary file. Add to .gitignore instead?
> yes

📝 Commit message: Update README and add important docs

✅ Committed: b2c3d4e Update README and add important docs
🚀 Pushed to origin/main
```

### Example 3: Skip Everything

```bash
$ python scripts/git_commit.py

📊 Git Status:
 M SOUL.md

📋 Changes Summary:
Modified: SOUL.md

✅ Confirm: Reply "yes" to commit
> skip

⏹️  Skipped. No changes committed.
```

## Handling Edge Cases

### Merge Conflicts

```
⚠️  **Merge Conflict Detected!**

Conflicted files:
  - README.md
  - config.yaml

Cannot commit until conflicts are resolved.

Suggested steps:
1. Edit files to resolve conflicts
2. Run: git add <resolved-files>
3. Run this script again
```

### Diverged Branches

```
⚠️  **Local branch is behind remote**

Run: git pull origin main first?
> yes

Pulling latest changes...
[...]

✅ Now you can commit your changes.
```

### Authentication Issues

```
❌ **Push Failed: Authentication Error**

Possible causes:
- SSH key not configured
- Token expired
- Wrong remote URL

Suggested fixes:
1. Check: git remote -v
2. Test: ssh -T git@github.com
3. Or use HTTPS with token
```

## Best Practices

1. **Check before committing**: Always review changes
2. **Write clear messages**: Describe what and why
3. **Commit related changes**: One logical change per commit
4. **Don't commit secrets**: Check for API keys, passwords
5. **Keep commits small**: Easier to review and revert

## Troubleshooting

### "nothing to commit"
```bash
# Check if files are actually modified
git status

# Check if in git repository
git rev-parse --git-dir
```

### "Permission denied"
```bash
# Check SSH key
ssh -T git@github.com

# Or use HTTPS
git remote set-url origin https://github.com/username/repo.git
```

### "failed to push"
```bash
# Pull first
git pull origin main

# Resolve any conflicts
# Then commit again
```
