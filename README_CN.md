# Skill-Lib

> AI Agent 技能仓库 - 收集整理可复用的 Agent Skill

[![Skills](https://img.shields.io/badge/skills-14-blue)](./)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 什么是 Skill

Skill 是 AI Agent 的**可复用能力模块**，包含标准化工作流程、最佳实践和领域知识。

每个 Skill 都经过实际项目验证，可以直接应用到你的 Agent 中。

---

## 快速开始

### 使用 Skill

```bash
# 克隆仓库
git clone https://github.com/Dqz00116/skill-lib.git

# 阅读 Skill 文档
cat skill-lib/code-analysis/SKILL.md
```

### 集成到 Agent

Agent 读取 Skill 文件后，按照文档中的工作流程执行任务。

---

## 技能列表与选择指南

👉 **查看完整技能对比和选择指南：[SUMMARY.md](./SUMMARY.md)**

---

## 详细文档

- [SUMMARY.md](./SUMMARY.md) - 完整技能对比表
- [INSTALL.md](./INSTALL.md) - 安装 Skill 到本地工作空间
- [RULES.md](./RULES.md) - 贡献 Skill 的规则

---

## 使用规则

详细规则请阅读 [RULES.md](./RULES.md)

### 核心原则

1. **命名规范**: 小写+连字符，如 `code-analysis`
2. **脱敏处理**: 移除具体路径和个人信息
3. **标准化格式**: 遵循 SKILL.md 模板
4. **验证可用**: 经过实际项目验证

---

## 贡献 Skill

欢迎贡献你的 Skill！

### 提交流程

1. 按 [RULES.md](./RULES.md) 创建 SKILL.md
2. 脱敏处理所有内容
3. 提交到 `skill-name/SKILL.md`
4. 创建 Pull Request

### Skill 模板

```markdown
---
name: skill-name
description: One-line description
version: 1.0
---

# Skill Name

## When to Use
描述适用场景

## Prerequisites
前置条件

## Workflow
详细工作流程

## Best Practices
最佳实践
```

---

## English Version

See [README.md](./README.md) for English documentation.

### 关于语言选择

**中文的信息熵优势**: 中文相比英文具有更高的信息密度，相同字符数下可传递更多信息。

**非中文模型注意事项**:
- 中文字符承载更高语义密度
- 需结合上下文理解（无显式语法标记）
- 符号系统差异（全角标点、无空格分词）

---

## 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

*最后更新: 2026-03-21*
