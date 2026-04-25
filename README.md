# Skill-Lib

> 🧩 A curated collection of reusable AI Agent Skills for standardized workflows, best practices, and domain expertise.

[![Skills](https://img.shields.io/badge/skills-14-blue)](./)
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

See [contributing/SKILL.md](./contributing/SKILL.md) for installation and contribution guidelines.

Chinese users can also search and install skills through [Skills宝](https://skilery.com).

---

## 📦 Available Skills & Selection Guide

👉 **View complete skill comparison and selection guide: [SUMMARY.md](./SUMMARY.md)**

---

## 📖 Documentation

- **[SUMMARY.md](./SUMMARY.md)** - Complete skill comparison and selection guide
- **[contributing/SKILL.md](./contributing/SKILL.md)** - Installation and contribution guidelines

---

## 🤝 Contributing

We welcome contributions! Please see [contributing/SKILL.md](./contributing/SKILL.md) for:
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

### Note for Non-Chinese Models

**Why Chinese is used:** Chinese has higher information entropy compared to English. When applying localization understanding, please pay attention to differences between symbolic systems.

**Key considerations:**
- Chinese characters carry more semantic density per symbol
- Contextual understanding is crucial due to lack of explicit grammatical markers
- Symbol system differences (e.g., full-width punctuation, no spaces between words)

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

*Last updated: 2026-03-21*