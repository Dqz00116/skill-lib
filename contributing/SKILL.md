---
name: contributing
description: Use when contributing new skills to the skill-lib repository, installing skills locally, or verifying skill compliance with repository standards
---

# Contributing to Skill-Lib

Guidelines for installing skills and contributing new ones to this repository.

## Overview

Skill-Lib is a curated collection of reusable AI Agent Skills. Each skill follows the `writing-skills` standard with standardized frontmatter, structure, and content guidelines.

## When to Use

- Adding a new skill to this repository
- Installing skills to your local workspace
- Updating existing skills to meet repository standards
- Understanding naming conventions and file structure requirements

## Quick Reference

| Action | Command / Step |
|--------|----------------|
| Install all skills | `git clone https://github.com/Dqz00116/skill-lib.git` then copy directories |
| Install single skill | Download `skill-name/SKILL.md` to `~/workspace/skills/skill-name/` |
| Add new skill | Create `skill-name/SKILL.md` following standards below |
| Update index | `python scripts/generate-summary.py --write` |

## Installation

### Install All Skills

```bash
git clone https://github.com/Dqz00116/skill-lib.git /tmp/skill-lib
mkdir -p ~/workspace/skills
cp -r /tmp/skill-lib/*/ ~/workspace/skills/
rm -rf /tmp/skill-lib
```

### Install Single Skill

```bash
mkdir -p ~/workspace/skills/code-analysis
curl -o ~/workspace/skills/code-analysis/SKILL.md \
  https://raw.githubusercontent.com/Dqz00116/skill-lib/main/code-analysis/SKILL.md
```

### Verify Installation

Each skill must contain:
```
skill-name/
└── SKILL.md          # Required
```

Optional: `README.md`, `templates/`, `examples/`, `scripts/`.

## Contributing

### Naming Conventions

| Item | Format | Example |
|------|--------|---------|
| Directory name | lowercase + hyphens | `code-analysis` |
| `SKILL.md` filename | uppercase | `SKILL.md` |
| `name` field | matches directory | `code-analysis` |
| `description` | starts with `Use when...` | `Use when analyzing unfamiliar code` |

### SKILL.md Standards

Required frontmatter:
```yaml
---
name: skill-name
description: Use when [triggering conditions]
---
```

Required sections:
- `## Overview` — 1-2 sentence summary
- `## When to Use` — triggering conditions and anti-cases

Recommended sections:
- `## Quick Reference` — tables for scanning
- `## Common Mistakes` — what goes wrong and fixes

### Content Guidelines

**Must sanitize:**
- Remove specific project paths
- Remove personal information
- Remove company-specific code
- Use generic examples

### Submission Process

1. Check for duplicate skills
2. Create `skill-name/SKILL.md` following standards
3. Sanitize all content
4. Run `python scripts/generate-summary.py --write` to update index
5. Submit via Pull Request

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing `## Overview` | Add 1-2 sentence summary after title |
| `description` describes workflow | Rewrite to start with `Use when...` |
| Directory name uses camelCase | Use lowercase + hyphens |
| Specific paths in examples | Replace with generic placeholders |
| Forgetting to update index | Run `generate-summary.py --write` |
