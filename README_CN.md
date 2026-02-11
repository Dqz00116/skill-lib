# Skill-Lib

> AI Agent 技能仓库 - 收集整理可复用的 Agent Skill

[![Skills](https://img.shields.io/badge/skills-11-blue)](./)
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

## 现有 Skills

| Skill | 描述 | 适用场景 |
|-------|------|----------|
| [code-analysis](./code-analysis) | 标准化代码分析流程，4步结构化输出 | 理解新代码模块、架构分析、设计模式识别 |
| [code-generator](./code-generator) | 分阶段代码生成，透明成本估算 | 根据设计文档生成代码、添加新功能 |
| [daily-log](./daily-log) | 结构化每日操作日志 | 记录工作、跟踪进度、知识沉淀 |
| [git-workflow](./git-workflow) | 安全的 Git 提交流程 | 提交代码前的检查与确认 |
| [hexo-blog-update](./hexo-blog-update) | Hexo 博客文章创建与发布 | 博客写作、内容管理 |
| [knowledge-base-cache](./knowledge-base-cache) | 分层知识库（热/冷/温缓存）| 管理大规模知识、降低 API 成本 |
| [msvc-build](./msvc-build) | MSVC 项目编译指南 | 编译 Visual Studio 项目、排查编译错误 |
| [mvp-design](./mvp-design) | MVP 设计规范，代码即文档 | 快速设计原型、建立架构决策 |
| [requirement-clarification](./requirement-clarification) | 指令澄清与安全确认，模糊度检测 | 执行前确认、需求收集、安全闸门 |
| [research-to-practice](./research-to-practice) | 学术论文转化为工作流优化 | 研究应用、创新改进 |
| [unity-mcp](./unity-mcp) | Unity MCP 集成用于 AI 控制 | Unity 游戏开发、AI 自动化 |

---

## 技能选择指南

| 你的需求 | 推荐的 Skill |
|----------|-------------|
| 需要理解陌生的代码模块 | [code-analysis](./code-analysis) |
| 要根据设计文档写代码 | [code-generator](./code-generator) |
| 要记录今天的工作 | [daily-log](./daily-log) |
| 要提交代码到 GitHub | [git-workflow](./git-workflow) |
| 要更新 Hexo 博客 | [hexo-blog-update](./hexo-blog-update) |
| 要管理大量知识文档 | [knowledge-base-cache](./knowledge-base-cache) |
| 要编译 C++ 项目 | [msvc-build](./msvc-build) |
| 要设计新系统架构 | [mvp-design](./mvp-design) |
| 要澄清模糊指令、执行前确认 | [requirement-clarification](./requirement-clarification) |
| 要将论文研究转化为工作流优化 | [research-to-practice](./research-to-practice) |
| 要 Unity AI 自动化 | [unity-mcp](./unity-mcp) |

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

*最后更新: 2026-02-11*
