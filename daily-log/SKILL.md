---
name: daily-log
description: Generate structured daily operation logs following standardized format for memory persistence and progress tracking.
version: 1.0
---

# Daily Log Skill

Generate comprehensive daily operation logs to track work, decisions, and lessons learned.

## When to Use

Use this skill at the end of a work session or day to:
- Record completed tasks and their outcomes
- Track token usage and time spent
- Document key decisions and their rationale
- Capture lessons learned and mistakes
- Maintain continuity across sessions

## Log Format Template

```markdown
# YYYY-MM-DD 操作日志

## 📅 会话概览

- **启动时间**: HH:MM GMT+8
- **主要任务**: [一句话概括]
- **关键成果**: [核心产出]

---

## 📝 详细记录

### [N]. [任务名称] (时间段)

**操作内容:**
- [具体做了什么]
- [使用了哪些文件/工具]
- [产出了什么]

**状态:** [✅ 完成 / ⚠️ 有问题 / ❌ 失败]

**Token 消耗:** ~X,XXX

---

[重复上述格式记录每个主要任务]

---

## 📊 今日统计

| 项目 | 数值 |
|------|------|
| 技术文档产出 | X 份 |
| 代码文件创建 | X 个 |
| 代码文件修改 | X 个 |
| Skill 创建 | X 个 |
| Token 消耗 | ~XX,XXX |
| Git 提交 | X 次 |
| 错误修正 | X 处 |

---

## 🎯 遗留任务

### [优先级]: [任务名称]
- **状态**: [等待/进行中/阻塞]
- **预计**: [时间和 Token]
- **交付**: [具体产出]

---

## 💡 经验教训

### 今日最大 [进步/教训]: [标题]

**背景**: [发生了什么]

**事件**: [具体描述]

**根本原因**: [为什么发生]

**改进措施**: [如何改进]

**验证**: [改进后的效果]

---

## 🔗 相关文件位置

### 技术文档
- `path/to/doc1.md`
- `path/to/doc2.md`

### Skills
- `skills/name/SKILL.md`

### 记忆文件
- `memory/YYYY-MM-DD.md` (本文件)

---

## 🎓 [今日确立的原则/模式]

[如果有新的设计原则、命名规范、工作流程等，在此记录]

---

*日志生成时间: YYYY-MM-DD HH:MM GMT+8*  
*状态: [当前状态]*  
*待执行: [待办事项]*
```

## Workflow

### Step 1: Review Session

At end of session/day:
1. Review conversation history
2. Identify major tasks completed
3. Note any interruptions or context switches
4. Check for unfinished work

### Step 2: Gather Metrics

Collect:
- Number of files created/modified
- Approximate token usage per task
- Time spent per task
- Any errors or corrections made

### Step 3: Identify Lessons

Ask:
- What went well?
- What could be improved?
- Any surprising discoveries?
- User feedback received?

### Step 4: Generate Log

Write to `memory/YYYY-MM-DD.md` using the template

### Step 5: Update Long-term Memory (Optional)

If significant decisions made, update MEMORY.md

## Best Practices

### ✅ Do
- Log immediately after session ends (while memory fresh)
- Be specific about file paths and names
- Quantify work (tokens, time, files)
- Be honest about mistakes and lessons
- Link to relevant skill files

### ❌ Don't
- Wait too long (forget details)
- Skip lessons learned section
- Be vague about metrics
- Omit file paths
- Forget to mention user feedback

## Version History

- v1.0 (2026-02-10) - Initial release
  - Standardized log format
  - 7-section structure
  - Statistics tracking
  - Lessons learned framework
