---
name: daily-log
description: Use when recording work sessions, tracking decisions and outcomes, or documenting lessons learned
version: 1.1
---

# Daily Log Skill

## Overview

Generate comprehensive daily operation logs to track work, decisions, and lessons learned.

## When to Use

Use this skill at the end of a work session or day to:
- Record completed tasks and their outcomes
- Track token usage and time spent
- Document key decisions and their rationale
- Capture lessons learned and mistakes
- Maintain continuity across sessions

---

## Log Format Templates

### Template A: Full Detail (Legacy)
Use for: Important milestones, detailed project records
See: [FULL_TEMPLATE](./FULL_TEMPLATE.md)

### Template B: Attention-Driven (Recommended)
Use for: Daily work logging, quick review
See below ⬇️

---

## Attention-Driven Log Format (v1.1)

```markdown
# YYYY-MM-DD Operation Log

## 📅 Session Overview
- **Date**: YYYY-MM-DD
- **Work Period**: HH:MM - HH:MM (X hours X minutes)
- **Core Outcomes**: [One-sentence summary of the day's most important output]
- **Key Decisions**: [X]
- **Lessons Learned**: [X]
- **Token Consumption**: ~XX,XXX

---

## ⏱️ Time Distribution

| Time Slot | Task | Duration | Attention Weight |
|-----------|------|----------|-----------------|
| HH:MM-HH:MM | [Task 1] | X min | 9/10 |
| HH:MM-HH:MM | [Task 2] | X min | 7/10 |
| ... | ... | ... | ... |

**Time Analysis**:
- High-attention task time: X% (mainly XX:XX-XX:XX)
- Interruptions/switches: X
- Peak efficiency period: XX:XX-XX:XX

---

## 🎯 High-Attention Tasks (Weight 8-10)

### [Task Name] (Weight: X/10, Time Slot: HH:MM-HH:MM, Duration: X min)

**One-sentence Summary**: [Core outcome or decision]

**Key Details**:
- [Specific data/numbers]
- [File paths/names]
- [Decision rationale]
- [Verification results]

**Lessons Learned** (if applicable):
- [Key takeaways]

---

## 📋 Medium-Attention Tasks (Weight 5-7)

| Task | Weight | Time Slot | Key Outcome |
|------|--------|-----------|-------------|
| [Task name] | 7/10 | HH:MM-HH:MM | [One-sentence description] |
| [Task name] | 6/10 | HH:MM-HH:MM | [One-sentence description] |

---

## 📝 Low-Attention Tasks (Weight 0-4)

- [HH:MM-HH:MM] [Task name] - [Status]
- [HH:MM-HH:MM] [Task name] - [Status]

---

## 📊 Today's Statistics

| Item | Value |
|------|-------|
| High-attention tasks | X |
| Medium-attention tasks | X |
| Low-attention tasks | X |
| Code files created | X |
| Code files modified | X |
| Skill created/updated | X |
| Token consumption | ~XX,XXX |
| Git commits | X |

---

## 💡 Today's Biggest Lesson

**One-sentence Summary**: [Core lesson]

**Background**: [What happened]
**Root Cause**: [Why it happened]
**Improvement Measures**: [How to improve]

---

## 🔗 Key File Locations

### High-Value Outputs
- `path/to/key/file1` - [One-sentence description]
- `path/to/key/file2` - [One-sentence description]

---

*Log generated at: YYYY-MM-DD HH:MM*  
*Attention score: High[X] Medium[X] Low[X]*
```

---

## Attention Scoring System

### How to Score Task Attention (0-10)

| Factor | Weight | Indicator | Examples |
|--------|--------|-----------|----------|
| **Key Decision** | +3 | Changed direction or approach | Choose plan B, approve implementation, confirm specification |
| **Lesson/Mistake** | +3 | Discovered and fixed issues | Violate rules, compile error, logic bug |
| **Milestone** | +2 | Important milestone completed | MVP completion, release, feature acceptance |
| **File Changes** | +1/ea | Create/modify/delete files | Create new Skill, modify config, refactor code |
| **Routine Operations** | 0 | Routine queries or checks | Check status, read files, check logs |

### Attention Level Guidelines

```
Score 8-10 (High): 
  → Full detail: summary + key details + lessons
  
Score 5-7 (Medium): 
  → Brief: one sentence summary + key outcomes
  
Score 0-4 (Low): 
  → Minimal: title + status only
```

### Examples

**Task: "Design MissionSystem Architecture"**
- Key decision: +3 (Chose TK_SERIAL plan)
- Milestone: +2 (Design completed)
- **Score: 8/10** → High attention

**Task: "Fix Compile Error"**
- Lesson: +3 (Learned BinaryReader→TK conversion)
- File changes: +8 files modified = +1 (max)
- **Score: 9/10** → High attention

**Task: "Check git status"**
- Routine operation: 0
- **Score: 2/10** → Low attention

---

## Workflow

### Step 1: Review Session

At end of session/day:
1. List all tasks completed
2. Identify major decisions made
3. Note any mistakes or lessons
4. Check for milestones reached

### Step 2: Score Each Task

Apply attention scoring:
```
For each task:
  - Did it involve a key decision? (+3)
  - Was there a mistake/lesson? (+3)
  - Was it a milestone? (+2)
  - How many files changed? (+1 per, max 2)
  - Sum → Attention Score (0-10)
```

### Step 3: Categorize by Attention Level

- **High (8-10)**: Write detailed section
- **Medium (5-7)**: Add to table
- **Low (0-4)**: List as bullet points

### Step 4: Extract Key Information

For high-attention tasks, extract:
- One-sentence summary
- Key details (numbers, paths, outcomes)
- Lessons learned (if applicable)

### Step 5: Generate Log

Write to `memory/YYYY-MM-DD.md` using attention-driven template

### Step 6: Update Long-term Memory (Optional)

If significant decisions or patterns emerged, update MEMORY.md

---

## Best Practices

### ✅ Do
- **Score honestly** - Not every task is high attention
- **Focus on value** - What would you want to remember in a month?
- **Quantify** - Use numbers, file counts, token estimates
- **Link key files** - Only high-value outputs need paths
- **One lesson max** - Focus on the most important lesson of the day

### ❌ Don't
- Don't over-document low-attention tasks
- Don't skip lessons learned section
- Don't include full conversation transcripts
- Don't log routine checks (git status, etc.) unless relevant
- Don't wait too long (score while memory is fresh)

---

## Comparison: Full Detail vs Attention-Driven

### Scenario: MissionSystem MVP Implementation Day

**Full Detail Version**: ~500 lines, ~95,000 tokens to read
- Every task fully documented
- All file paths listed
- Complete error descriptions
- Full conversation context

**Attention-Driven Version**: ~150 lines, ~20,000 tokens to read
- 2-3 high-attention tasks detailed
- 3-4 medium tasks in table
- 5+ low tasks as bullets
- Key decisions and lessons highlighted

**Review Time**:
- Full Detail: 10-15 minutes to scan
- Attention-Driven: 2-3 minutes to understand

---

## Version History

- **v1.1** (2026-02-12) - Added Attention-Driven logging
  - Attention scoring system (0-10)
  - Three-level detail format
  - Focus on high-value information
  - Reduced log size by 60-70%

- **v1.0** (2026-02-10) - Initial release
  - Standardized log format
  - 7-section structure
  - Statistics tracking
  - Lessons learned framework
