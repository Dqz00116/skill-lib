# Skill-Lib

> 🧩 A curated collection of reusable AI Agent Skills for standardized workflows, best practices, and domain expertise.

[![Skills](https://img.shields.io/badge/skills-7-blue)](./)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**Skill-Lib** is a community-driven repository that empowers AI Agents with battle-tested, reusable capabilities. Each Skill encapsulates proven workflows, eliminating repetitive setup and enabling Agents to focus on delivering value.

---

## ✨ Why Skill-Lib?

- **🚀 Ready to Use** - Pre-built, validated workflows for common tasks
- **📚 Well Documented** - Clear instructions with examples and best practices
- **🔄 Reusable** - Install once, use across multiple projects
- **🌍 Community** - Open source, contributions welcome

---

## 🚀 Quick Start

### Install a Skill

```bash
# Clone the repository
git clone https://github.com/Dqz00116/skill-lib.git

# Copy desired Skills to your workspace
cp -r skill-lib/code-analysis ~/my-agent/skills/

# Start using it!
cat ~/my-agent/skills/code-analysis/SKILL.md
```

### For AI Agents

Agents can automatically install and use Skills:

```python
# Example: Agent reading and applying a Skill
skill_content = read_file("skills/code-analysis/SKILL.md")
execute_workflow(skill_content)
```

See [INSTALL.md](./INSTALL.md) for detailed installation options.

---

## 📦 Available Skills

| Skill | Description | Use Cases | Complexity |
|-------|-------------|-----------|------------|
| [code-analysis](./code-analysis) | 4-step structured code analysis | Understanding code, architecture review | ⭐⭐ Medium |
| [code-generator](./code-generator) | Phase-based code generation | Implementation from design docs | ⭐⭐⭐ Complex |
| [daily-log](./daily-log) | Structured daily operation logs | Work tracking, knowledge retention | ⭐ Simple |
| [git-workflow](./git-workflow) | Safe Git commit workflow | Code submission, version control | ⭐ Simple |
| [knowledge-base-cache](./knowledge-base-cache) | 3-tier knowledge management | Large-scale knowledge, cost reduction | ⭐⭐⭐ Complex |
| [msvc-build](./msvc-build) | MSVC C++ compilation guide | Build projects, debug errors | ⭐⭐ Medium |
| [mvp-design](./mvp-design) | MVP design specification | Rapid prototyping, architecture | ⭐⭐ Medium |

---

## 🎯 Quick Selection Guide

| If you need to... | Use this Skill |
|-------------------|----------------|
| Understand unfamiliar code | [code-analysis](./code-analysis) |
| Generate code from design | [code-generator](./code-generator) |
| Record daily work | [daily-log](./daily-log) |
| Commit code safely | [git-workflow](./git-workflow) |
| Manage knowledge base | [knowledge-base-cache](./knowledge-base-cache) |
| Compile C++ projects | [msvc-build](./msvc-build) |
| Design system architecture | [mvp-design](./mvp-design) |

---

## 📖 Documentation

- **[SUMMARY.md](./SUMMARY.md)** - Complete skill comparison and selection guide
- **[INSTALL.md](./INSTALL.md)** - Installation guide for local workspaces
- **[RULES.md](./RULES.md)** - Contribution guidelines and standards

---

## 🤝 Contributing

We welcome contributions! Please see [RULES.md](./RULES.md) for:
- Naming conventions
- Content guidelines
- Submission process

### Quick Contribution Template

```markdown
---
name: your-skill-name
description: One-line description of what it does
version: 1.0
---

# Your Skill Name

## When to Use
Describe when to use this skill

## Prerequisites
What is needed before using

## Workflow
Step-by-step instructions

## Best Practices
Tips for effective use
```

---

## 🌏 Languages

- **English** (Current)
- [中文](./README_CN.md) - Chinese version

---

## 📄 License

MIT License - See [LICENSE](./LICENSE)

---

<p align="center">
  <i>Built by Agents, for Agents 🤖</i>
</p>

<p align="center">
  <a href="https://github.com/Dqz00116/skill-lib">⭐ Star us on GitHub</a>
</p>

*Last updated: 2026-02-11*
