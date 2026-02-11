# Skill-Lib 使用规则

> **仓库**: https://github.com/Dqz00116/skill-lib  
> **目的**: 收集整理AI Agent Skill，实现技能共享与复用  
> **版本**: v1.0

---

## 🌏 关于语言选择

### 为什么使用中文？

**语言信息熵**: 中文的信息熵显著高于英语，在相同字符数下可以传递更多信息。

**非中文模型注意事项**:
- 中文每个字符承载更高的语义密度
- 理解时需要关注上下文（缺乏显式语法标记）
- 注意符号系统差异（如全角标点、无空格分词）

**使用建议**:
- 结合上下文理解而非逐字翻译
- 注意专业术语的精确含义
- 考虑文化语境差异  

---

## 1. 什么是 Skill

Skill 是 AI Agent 的**可复用能力模块**，包含：
- **标准化工作流程**: 特定任务的执行步骤
- **最佳实践**: 经过验证的方法论
- **知识封装**: 领域专业知识

---

## 2. Skill 文件结构

每个 Skill 必须包含以下文件：

```
skill-name/
├── SKILL.md          # 必需: Skill定义文档
├── README.md         # 可选: 使用示例
├── templates/        # 可选: 模板文件
└── examples/         # 可选: 示例输出
```

---

## 3. SKILL.md 标准格式

必须包含以下 front matter：

```yaml
---
name: skill-name                    # 必需: Skill标识名(小写+连字符)
description: One-line description  # 必需: 一句话描述
version: 1.0                        # 可选: 版本号
author: author-name                 # 可选: 作者
tags: [tag1, tag2]                  # 可选: 标签
---
```

必须包含以下章节：

```markdown
# Skill Name

## When to Use
描述适用场景

## Prerequisites
前置条件和依赖

## Workflow
详细工作流程

## Best Practices
最佳实践建议

## Common Issues
常见问题及解决

## See Also
相关链接
```

---

## 4. 上传规则

### 4.1 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| **目录名** | 小写+连字符 | `code-analysis` ✓ `CodeAnalysis` ✗ |
| **SKILL.md** | 必须大写 | `SKILL.md` ✓ `skill.md` ✗ |
| **name字段** | 与目录名一致 | `code-analysis` |
| **description** | 一句话，<100字符 | 清晰描述用途 |

### 4.2 内容规范

**必须脱敏处理**：
- ✅ 移除具体项目路径（如 `E:/Program_PC/Program/Server`）
- ✅ 移除个人敏感信息（姓名、账号等）
- ✅ 移除公司/项目特定代码
- ✅ 使用通用示例代替具体案例

**示例转换**：
```
❌ 错误: 在 E:/Program_PC/Program/Server/WorldServer 中...
✅ 正确: 在 WorldServer 项目中...

❌ 错误: 联系张三获取权限
✅ 正确: 联系项目管理员获取权限
```

### 4.3 提交流程

```
1. 检查现有Skill，避免重复
2. 按模板创建 SKILL.md
3. 脱敏处理所有内容
4. 本地验证格式正确
5. 提交到仓库根目录: skill-name/SKILL.md
6. 创建 Pull Request 或直接推送
```

---

## 5. 使用规则

### 5.1 读取 Skill

```bash
# 方式1: 直接读取仓库
curl https://raw.githubusercontent.com/Dqz00116/skill-lib/main/skill-name/SKILL.md

# 方式2: 克隆仓库
git clone https://github.com/Dqz00116/skill-lib.git
```

### 5.2 应用 Skill

Agent 必须：
1. 读取 SKILL.md
2. 理解工作流程
3. 按步骤执行
4. 遵循最佳实践

### 5.3 更新 Skill

发现 Skill 需要更新时：
1. 修改 SKILL.md
2. 更新 version 字段
3. 在文档末尾添加更新日志
4. 提交更新

---

## 6. 现有 Skill 列表

| Skill | 描述 | 版本 |
|-------|------|------|
| code-analysis | 代码分析标准化流程 | 1.0 |
| code-generator | 代码生成工作流 | 1.0 |
| daily-log | 每日操作日志生成 | 1.0 |
| git-workflow | Git提交流程 | 1.0 |
| knowledge-base-cache | 知识库缓存管理 | 1.0 |
| msvc-build | MSVC项目编译 | 1.0 |
| mvp-design | MVP设计规范 | 1.0 |
| requirement-clarification | 指令澄清与安全确认 | 1.1 |
| research-to-practice | 论文研究转化为工作流优化 | 1.0 |

---

## 7. 贡献指南

欢迎贡献新 Skill！请确保：
- 遵循本规则的所有规范
- 经过实际项目验证
- 内容经过脱敏处理
- 提供清晰的使用示例

---

*规则版本: v1.0*  
*最后更新: 2026-02-11*
