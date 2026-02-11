# Skill-Lib Usage Rules

> **Repository**: https://github.com/Dqz00116/skill-lib  
> **Purpose**: Collect and organize AI Agent Skills for sharing and reuse  
> **Version**: v1.0  

---

## 1. What is a Skill

A **Skill** is a **reusable capability module** for AI Agents, containing:
- **Standardized Workflow**: Execution steps for specific tasks
- **Best Practices**: Validated methodologies
- **Knowledge Encapsulation**: Domain-specific expertise

---

## 2. Skill File Structure

Each Skill must contain the following files:

```
skill-name/
├── SKILL.md          # Required: Skill definition document
├── README.md         # Optional: Usage examples
├── templates/        # Optional: Template files
└── examples/         # Optional: Example outputs
```

---

## 3. SKILL.md Standard Format

Must include the following front matter:

```yaml
---
name: skill-name                    # Required: Skill identifier (lowercase+hyphen)
description: One-line description  # Required: One-line description
version: 1.0                        # Optional: Version number
author: author-name                 # Optional: Author
tags: [tag1, tag2]                  # Optional: Tags
---
```

Must include the following sections:

```markdown
# Skill Name

## When to Use
Describe applicable scenarios

## Prerequisites
Prerequisites and dependencies

## Workflow
Detailed workflow steps

## Best Practices
Best practice recommendations

## Common Issues
Common problems and solutions

## See Also
Related links
```

---

## 4. Upload Rules

### 4.1 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| **Directory name** | lowercase + hyphen | `code-analysis` ✓ `CodeAnalysis` ✗ |
| **SKILL.md** | Must be uppercase | `SKILL.md` ✓ `skill.md` ✗ |
| **name field** | Same as directory name | `code-analysis` |
| **description** | One sentence, <100 chars | Clear description of purpose |

### 4.2 Content Guidelines

**Must desensitize**:
- ✅ Remove specific project paths (e.g., `E:/Program_PC/Program/Server`)
- ✅ Remove personal sensitive information (names, accounts, etc.)
- ✅ Remove company/project-specific code
- ✅ Use generic examples instead of specific cases

**Example transformations**:
```
❌ Wrong: In E:/Program_PC/Program/Server/WorldServer...
✅ Correct: In the WorldServer project...

❌ Wrong: Contact John Doe for permissions
✅ Correct: Contact the project administrator for permissions
```

### 4.3 Submission Process

```
1. Check existing Skills to avoid duplication
2. Create SKILL.md according to template
3. Desensitize all content
4. Verify format locally
5. Submit to repository root: skill-name/SKILL.md
6. Create Pull Request or push directly
```

---

## 5. Usage Rules

### 5.1 Reading Skills

```bash
# Method 1: Direct read from repository
curl https://raw.githubusercontent.com/Dqz00116/skill-lib/main/skill-name/SKILL.md

# Method 2: Clone repository
git clone https://github.com/Dqz00116/skill-lib.git
```

### 5.2 Applying Skills

Agents must:
1. Read SKILL.md
2. Understand the workflow
3. Execute steps in order
4. Follow best practices

### 5.3 Updating Skills

When a Skill needs updating:
1. Modify SKILL.md
2. Update the version field
3. Add changelog at end of document
4. Submit the update

---

## 6. Existing Skills List

| Skill | Description | Version |
|-------|-------------|---------|
| code-analysis | Standardized code analysis workflow | 1.1 |
| code-generator | Code generation workflow | 1.0 |
| daily-log | Daily operation logging | 1.0 |
| git-workflow | Git commit workflow | 1.0 |
| knowledge-base-cache | Knowledge base cache management | 1.0 |
| msvc-build | MSVC project compilation | 1.0 |
| mvp-design | MVP design specification | 1.0 |

---

## 7. Contribution Guidelines

New Skills are welcome! Please ensure:
- Follow all conventions in this document
- Validated in real projects
- Content is desensitized
- Clear usage examples provided

---

*Rules version: v1.0*  
*Last updated: 2026-02-11*
