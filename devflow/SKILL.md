---
name: devflow
description: Use when working in a DevFlow project with .devflow/ directory and gate-based step-by-step workflows
version: 2.0
---

# DevFlow

CLI-driven progressive disclosure workflow. Advance one verified step at a time.

## Overview

DevFlow enforces a disciplined development process where each step must be completed and verified before advancing. It uses TOML workflow definitions, gate-based verification, and a `devflow done` checkpoint system.

## When to Use

- Project has `.devflow/workflows/*.toml` files
- You see `devflow` commands in project docs
- Task requires writing requirements, design docs, or code in stages
- You need gate-based verification (tests must pass before advancing)

**When NOT to use:** Project has no `.devflow/` directory — this is a standard project, use normal development.

## Quick Start

```bash
devflow --help          # Verify CLI is installed
```

If `devflow` is not found, install first:

```bash
pip install agent-devflow     # From PyPI
```

Then start the workflow:

```bash
devflow list-workflows              # See available workflows
devflow select-workflow MODE-A      # Pick one
devflow current                     # Read current step
```

## Core Loop (ALWAYS follow this)

```
1. devflow current     -> Read what to do
2. Execute the step    -> Write code, create docs, run tests
3. devflow done        -> Check gates -> advance or retry
4. Repeat until "Workflow complete!"
```

**Core rule: Only advance through `devflow done`. Never skip steps. Never create files for future steps.**

## Commands

| Command | Purpose |
|---------|---------|
| `devflow current` | Show current step instruction |
| `devflow done` | Check gates and advance |
| `devflow back` | Go back one step |
| `devflow approve ITEM` | Mark item as user-approved |
| `devflow set KEY VALUE` | Set state variable |
| `devflow list-workflows` | List available workflows |
| `devflow select-workflow ID` | Select and start a workflow |
| `devflow run` | Start autonomous Ralph Loop |

## Gate Types

Gates block advancement until satisfied:

- `file_exists:path` — File must exist
- `file_contains:path:content` — File must contain text
- `command_success:{test_command}` — Command exits 0
- `user_approved:ITEM` — Requires `devflow approve ITEM`
- `state_set:var` — State variable must be set

## Fail Routes

When gates fail, the workflow may route based on failure count:

```
fails 1-2 -> retry or fallback step
fails 3+  -> escalate to human
```

Fail count persists across visits (resets only when gates pass).

## Built-in Workflows

| Workflow | Steps |
|----------|-------|
| MODE-A (Feature) | req-create -> req-approve -> brainstorm -> write-plan -> implement-sdd -> code-review -> test-run -> verify -> finish |
| MODE-B (Debug) | debug-root-cause -> debug-pattern -> debug-hypothesis -> debug-fix -> debug-question -> debug-verify -> debug-finish -> (auto -> MODE-A:write-plan) |

Cross-workflow references use `WORKFLOW-ID:STEP-ID` format.

## 5 Iron Laws

| # | Law | Severity |
|---|-----|----------|
| 1 | Read `using-superpowers` skill first | Rigid |
| 2 | TDD: Test before code | Rigid |
| 3 | Verify before claim | Rigid |
| 4 | Root cause before fix | Strong |
| 5 | Debug -> Repeat full cycle | Strong |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Writing code before `devflow current` | Stop. Run `devflow current` first |
| Creating files for future steps | Only create what the current step asks for |
| Skipping `devflow done` | All advancement must go through `devflow done` |
| Ignoring gate failures | Fix the issue, then `devflow done` again |

## Project Context

**Language**: {{ project.language }}
**Stack**: {{ project.stack }}
**Version**: {{ project.version }}

## Constraints

{% if constraints.zero_warnings %}- **ZERO warnings** — All builds must have zero warnings{% endif %}
{% if constraints.zero_mocks %}- **ZERO mocks** — Use real instances only in tests{% endif %}
{% if constraints.nullable %}- **Nullable enabled** — Use nullable reference types{% endif %}

## Project Structure

```
{{ project.name }}/
├── .devflow/              # DevFlow configuration
│   ├── workflows/         # Workflow definitions (TOML)
│   ├── prompts/           # Reusable prompt files
│   ├── config.toml        # Project config
│   └── state.toml         # Current state (gitignored)
├── {{ paths.src }}/       # Source code
├── {{ paths.tests }}/     # Tests
├── {{ paths.docs }}/      # Documentation
│   ├── requirements/      # REQ files
│   ├── features/          # FEAT files
│   ├── superpowers/specs/ # Design docs
│   ├── superpowers/plans/ # Implementation plans
│   ├── evidence/          # Verification evidence
│   ├── debug/             # Debug analysis
│   └── completion/        # Workflow completion summaries
└── SKILL.md               # This file
```

## Commands Reference

```bash
# Build
{{ commands.build }}

# Test
{{ commands.test }}
{{ commands.test_unit }}
{{ commands.test_integration }}

# Lint
{{ commands.lint }}
```

_Generated by DevFlow v2.0_
