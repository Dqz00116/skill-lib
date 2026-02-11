# Skill-Lib

> AI Agent Skill Repository - Collecting and organizing reusable Agent Skills

[![Skills](https://img.shields.io/badge/skills-7-blue)](./)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## What is a Skill

A **Skill** is a reusable capability module for AI Agents, containing standardized workflows, best practices, and domain knowledge.

Each Skill has been validated in real projects and can be directly applied to your Agent.

---

## Quick Start

### Using Skills

```bash
# Clone the repository
git clone https://github.com/Dqz00116/skill-lib.git

# Read a Skill document
cat skill-lib/code-analysis/SKILL.md
```

### Integrating into Your Agent

After reading a Skill file, the Agent follows the workflow described in the document to execute tasks.

---

## Available Skills

| Skill | Description | Use Cases |
|-------|-------------|-----------|
| [code-analysis](./code-analysis) | Standardized code analysis workflow with 4-step structured output | Understanding new code modules, architecture analysis, pattern recognition |
| [code-generator](./code-generator) | Phase-based code generation with transparent cost estimation | Generating code from design documents, adding new features |
| [daily-log](./daily-log) | Structured daily operation logging | Work recording, progress tracking, knowledge preservation |
| [git-workflow](./git-workflow) | Safe Git commit and push workflow | Pre-commit checks and confirmation |
| [knowledge-base-cache](./knowledge-base-cache) | Layered knowledge base (hot/cold/warm cache) | Managing large-scale knowledge, reducing API costs |
| [msvc-build](./msvc-build) | MSVC C++ project compilation guide | Compiling Visual Studio projects, troubleshooting errors |
| [mvp-design](./mvp-design) | MVP design specification, code-as-documentation | Rapid prototyping, establishing architecture decisions |

---

## Skill Selection Guide

| Your Need | Recommended Skill |
|-----------|-------------------|
| Need to understand unfamiliar code | [code-analysis](./code-analysis) |
| Need to write code from design docs | [code-generator](./code-generator) |
| Need to record today's work | [daily-log](./daily-log) |
| Need to commit code to GitHub | [git-workflow](./git-workflow) |
| Need to manage large knowledge base | [knowledge-base-cache](./knowledge-base-cache) |
| Need to compile C++ project | [msvc-build](./msvc-build) |
| Need to design new system architecture | [mvp-design](./mvp-design) |

---

## Documentation

- [SUMMARY.md](./SUMMARY.md) - Complete skill comparison table
- [INSTALL.md](./INSTALL.md) - Installing Skills to local workspace
- [RULES.md](./RULES.md) - Rules for contributing Skills

---

## Usage Rules

See [RULES.md](./RULES.md) for detailed rules.

### Core Principles

1. **Naming Convention**: lowercase with hyphens, e.g., `code-analysis`
2. **Desensitization**: Remove specific paths and personal information
3. **Standardized Format**: Follow the SKILL.md template
4. **Validation**: Must be validated in real projects

---

## Contributing Skills

Contributions are welcome!

### Contribution Process

1. Create SKILL.md following [RULES.md](./RULES.md)
2. Desensitize all content
3. Submit to `skill-name/SKILL.md`
4. Create a Pull Request

### Skill Template

```markdown
---
name: skill-name
description: One-line description
version: 1.0
---

# Skill Name

## When to Use
Describe applicable scenarios

## Prerequisites
Prerequisites

## Workflow
Detailed workflow steps

## Best Practices
Best practices
```

---

## 中文文档

See [README.md](./README.md) for Chinese documentation.

---

## License

MIT License - See [LICENSE](./LICENSE)

---

*Last updated: 2026-02-11*
