---
name: code-analysis
description: Use when analyzing unfamiliar code modules, understanding system architecture, or preparing for refactoring
version: 1.2
---

# Code Analysis Skill

## Overview

Standardized workflow for reading, analyzing, and documenting codebases with attention-driven focus.

## When to Use

Use this skill when you need to:
- Understand a new code module or system
- Analyze architecture and design patterns
- Document technical implementation details
- Prepare for code refactoring or integration
- Create technical documentation for teams
- **Focus on core components** (high-attention code analysis)

---

## Attention-Driven Code Analysis (NEW in v1.2)

Identify core components in code using heuristic rules, optimizing analysis focus.

### Attention Scoring System

```python
# Use the attention_focus.py module
from attention_focus import CodeAttentionScorer

scorer = CodeAttentionScorer()
components = scorer.analyze_code_structure(file_content, file_name)
focus = scorer.get_analysis_focus(components)
```

### Scoring Criteria

| Factor | Weight | Description |
|--------|--------|-------------|
| **Core Keywords** | +3 | Manager, Controller, Handler, System, Core |
| **Important Keywords** | +2 | Helper, Util, Factory, Provider |
| **Lines of Code** | +2 (>100 lines) / +1 (50-100 lines) | Scale metric |
| **Reference Count** | +2 (>5 refs) / +1 (2-5 refs) | Dependency metric |
| **Complexity** | +1 | Methods>10 or Conditional statements>5 |

### Attention Levels

| Level | Score | Analysis Depth |
|-------|-------|----------------|
| **High** | 8-10 | Detailed analysis + Full code + Design principles |
| **Medium** | 5-7 | Focused analysis + Key code snippets |
| **Low** | 0-4 | Brief mention + Function description |

### Workflow with Attention Focus

```
1. Read code file
       ↓
2. Run attention_focus.py analysis
       ↓
3. Get prioritized component list
       ↓
4. Analyze HIGH attention components in detail
5. Analyze MEDIUM attention components briefly
6. Reference LOW attention components as needed
       ↓
7. Generate focused documentation
```

### Benefits

- **Reduce token consumption**: Focus on 20% core code that provides 80% value
- **Faster analysis**: Skip boilerplate and utility code
- **Better documentation**: Highlight architectural decisions and critical paths
- **Estimated improvement**: 20-30% token reduction, 30% faster analysis

## Workflow Template

Every code analysis task MUST follow this 4-step structure:

### 1. Objective

**Definition**: Clear statement of what needs to be understood

**Format**:
```
Objective: [What specifically needs to be understood]
Scope: [Boundaries of the analysis]
Depth: [Overview/Core logic/Detailed implementation]
```

**Examples**:
- Understand how the Tinker serialization library works
- Analyze the architecture design of PlayerSubsystem
- Master the SharedTable data table loading mechanism

### 2. Deliverables

**Definition**: Concrete outputs that will be produced

**Format**:
```
Documentation:
- [Doc name 1] - [Path] - [Content description]
- [Doc name 2] - [Path] - [Content description]

Additional outputs:
- [Code examples/Flowcharts/Architecture diagrams]
```

**Documentation Standards**:
- Place in `repository/projects/[Project]/docs/` or `docs/`
- Use descriptive filenames: `[Topic]-[Type].md`
- Include code snippets and diagrams

### 3. Content

**Definition**: What will be covered in the analysis

**Format**:
```
Analysis content:
1. [Module A] - [Point 1, Point 2, Point 3]
2. [Module B] - [Point 1, Point 2, Point 3]
3. [Inter-module relationships] - [Interaction flow]

Include elements:
□ Core class/interface design
□ Data flow/Control flow
□ Key algorithms/Logic
□ Design patterns
□ Dependencies
```

### 4. Token Estimation

**Definition**: Estimated token consumption for the analysis

**Format**:
```
Token estimation:
- Code reading: ~[X,000] tokens
- Documentation: ~[X,000] tokens
- Total: ~[X,000]-[Y,000] tokens
- Estimated time: [X]-[Y] minutes
```

**Estimation Guidelines**:
| Complexity | Code reading | Documentation | Total | Time |
|--------|----------|----------|------|------|
| Simple (1-2 files) | 3K-5K | 2K-3K | 5K-8K | 15-20min |
| Medium (module-level) | 10K-20K | 5K-10K | 15K-30K | 30-50min |
| Complex (system-level) | 30K-50K | 15K-25K | 45K-75K | 60-90min |

## Execution Flow

```
1. User Request
       │
       ▼
2. Clarify Requirements (if needed)
       │
       ├── Confirm analysis scope boundaries
       ├── Confirm key class definition locations (file paths)
       └── ⚠️ If definition locations are unclear, must ask the requester to explicitly specify
       │
       ▼
3. Output Analysis Plan (4-step structure)
       │
       ├── 1. Objective
       ├── 2. Deliverables  
       ├── 3. Content
       └── 4. Token Estimation
       │
       ▼
4. Wait for "Plan Approval" Confirmation
       │
       ▼
5. Execute Analysis
       │
       ├── Read relevant code
       ├── Understand logic
       └── Extract key points
       │
       ▼
6. Produce Documentation
       │
       ├── Write technical doc
       ├── Include code examples
       └── Create diagrams if needed
       │
       ▼
7. Report Completion
       └── Summary of findings
```

## Usage Examples

### Example 1: Simple Module Analysis

**User**: "Analyze PlayerQuest's progress update mechanism"

**Plan Output**:
```
## Code Analysis Plan

### 1. Objective
Understand PlayerQuest's progress update mechanism, including:
- How progress is stored and updated
- Task completion determination logic
- Interaction with the medal system

### 2. Deliverables
- `PlayerQuest-Progress-Analysis.md` 
  - Path: `repository/projects/BattleCore/docs/`
  - Contains: Flowchart + Core code + Data flow

### 3. Content
1. PlayerQuest class structure
2. updateProgress() / accumulateProgress() implementation
3. Task completion determination logic
4. Coupling relationship with PlayerMedal

### 4. Token Estimation
- Code reading: ~5,000 tokens
- Documentation: ~3,000 tokens
- Total: ~8,000 tokens
- Estimated time: 15-20 minutes
```

### Example 2: Complex System Analysis

**User**: "Understand the overall skill system architecture"

**Plan Output**:
```
## Code Analysis Plan

### 1. Objective
Fully understand the FAbility skill system architecture:
- Core class hierarchy
- State machine implementation
- Skill lifecycle
- Integration with the battle core

### 2. Deliverables
- `FAbility-Architecture.md`
  - Path: `repository/projects/BattleCore/docs/`
  - Contains: Architecture diagram + Class diagram + Real-world examples
- `Skill-Lifecycle-Flow.md`
  - Complete skill lifecycle flow

### 3. Content
1. FAbility base class design
2. State machine (EAbilityState)
3. Concrete skill implementation examples
4. CD/Cost system
5. Event system

### 4. Token Estimation
- Code reading: ~30,000 tokens
- Documentation: ~15,000 tokens
- Total: ~45,000 tokens
- Estimated time: 60-80 minutes
```

## Important Rules

### Definition Location Confirmation Rule (Critical)

**Rule**: When definition locations are unclear during code analysis, must ask the requester to explicitly specify the location in advance

**Execution Steps**:
1. After receiving an analysis request, first attempt to locate the definition files of key classes/functions
2. If the location cannot be determined through file name or class name search, **immediately stop analysis**
3. Ask the requester: **"Please provide the definition file path for [ClassName]"**
4. After receiving a clear path, continue analysis

**Example**:
```
❌ Incorrect approach:
User: "Analyze NetMessage implementation"
AI: (Blindly search, can't find correct location, analyze based on assumptions)

✅ Correct approach:
User: "Analyze NetMessage implementation"
AI: "Please provide the definition file path for NetMessage,
       Search found possible locations:
       - Server/Network/NetMessage.h
       - Server/Common/NetMessage.h
       Please confirm which file?"
User: "In Server/Network/NetMessage.h"
AI: (Start analysis based on explicit path)
```

---

## Best Practices

### Do's
✅ Define clear scope boundaries, avoid over-analysis
✅ Provide specific file paths and line numbers
✅ Include actual code snippets
✅ Use diagrams to aid understanding (text descriptions)
✅ Estimates should be conservative, leave buffer

### Don'ts
❌ Don't use vague scopes ("analyze the entire project")
❌ Don't omit key deliverable information
❌ Don't underestimate token consumption for complex systems
❌ Don't mix multiple unrelated objectives
❌ Don't blindly guess when definition locations are unclear (**must ask the requester to explicitly specify file paths**)

## Integration with Other Skills

- **knowledge-base-cache**: Store analysis results in knowledge base
- **git-workflow**: Commit analysis documents
- **skill-creator**: Create specialized analysis skills from patterns

## Template Quick Reference

```markdown
## Code Analysis Plan

### 1. Objective
[Specific objective description]
Scope: [Scope boundaries]
Depth: [Overview/Core/Detailed]

### 2. Deliverables
- [Doc name] - [Path] - [Description]

### 3. Content
1. [Module A] - [Key points]
2. [Module B] - [Key points]
3. [Relationships] - [Flow]

### 4. Token Estimation
- Code reading: ~[X,000] tokens
- Documentation: ~[X,000] tokens
- Total: ~[X,000]-[Y,000] tokens
- Estimated time: [X]-[Y] minutes
```

## Version History

- **v1.2** (2026-02-12) - Added Attention-Driven Analysis
  - Added: attention_focus.py module
  - Added: Heuristic code attention scoring
  - Added: Three-level analysis depth (High/Medium/Low)
  - Optimized: 20-30% token reduction
  - Optimized: 30% faster analysis speed

- v1.1 (2026-02-10) - Added critical rule
  - Added: Definition location confirmation rule
  - Added: Important Rules section
  - Updated: Execution Flow added path confirmation step
  - Updated: Best Practices added Don'ts rules

- v1.0 (2026-02-10) - Initial release
  - 4-step workflow structure
  - Token estimation guidelines
  - Usage examples and templates
