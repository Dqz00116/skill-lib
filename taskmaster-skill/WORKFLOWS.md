# TaskMaster Workflows

> Standard operation procedures for Agent execution.

---

## Workflow Selection

| User Intent | Workflow | Entry Point |
|-------------|----------|-------------|
| "First-time use / Configuration" | Setup | [First-Time Setup Workflow](#first-time-setup-workflow) |
| "View progress / Get status" | Query | [Query Workflow](#query-workflow) |
| "Start day's work" | Daily | [Daily Workflow](#daily-workflow) |
| "Start task" | Start Task | [Start Task Workflow](#start-task-workflow) |
| "Complete task" | Complete Task | [Complete Task Workflow](#complete-task-workflow) |
| "Weekly summary" | Weekly | [Weekly Summary Workflow](#weekly-summary-workflow) |
| "Add task" | Add Task | [Add Task Workflow](#add-task-workflow) |
| "Troubleshoot" | Troubleshoot | [Audit Workflow](#audit-workflow) |

---

## First-Time Setup Workflow

### Trigger: User first time using TaskMaster or config error

```
Step 1: Check if config.json exists
  Command: ls config.json
  
  If exists:
    → Proceed to Step 3 (Verify)
  If not exists:
    → Proceed to Step 2 (Create)

Step 2: Create config from template
  Command: cp config.json.template config.json
  
  Inform user: 
    "First-time use requires configuring config.json"
    "Created config.json from template"

Step 3: Collect plan information from user
  Ask: "What is the plan name? (e.g., mvp_v1)"
  Receive: {plan-name}
  
  Ask: "What is the absolute path to the plan directory? (e.g., E:\\projects\\mvp_v1)"
  Receive: {plan-path}
  
  Ask: "What is the plan description?"
  Receive: {plan-description}

Step 4: Update config.json
  Write to config.json:
    {
      "version": "1.0.0",
      "plans": {
        "{plan-name}": {
          "path": "{plan-path}",
          "description": "{plan-description}"
        }
      },
      "settings": {
        "defaultPlan": "{plan-name}",
        "autoCreatePlan": false,
        "logRetentionDays": 30
      }
    }

Step 5: Verify configuration
  Command: node cli/task.js config list
  
  Check: Output shows the configured plan
  
  If successful:
    → "Configuration complete, TaskMaster is ready to use"
  If error:
    → Check TROUBLESHOOTING.md ERR_CONFIG_NOT_FOUND
```

---

## Query Workflow

### Intent: User asks for information

```
User: "View progress" / "What tasks are there" / "What is TASK-001"
  |
  v
Determine query type:
  |
  +-- "progress/overall status" → Execute: task progress {plan}
  |                       Parse: percentage, counts, phase progress
  |
  +-- "task list" → Execute: task list {plan} [filters]
  |                  Parse: task IDs, titles, statuses
  |
  +-- "ready tasks" → Execute: task ready {plan} [--limit N]
  |                      Parse: ready-to-start tasks list
  |
  +-- "specific task" → Extract taskId from user input
  |                  Execute: task show {plan} {taskId}
  |                  Parse: all task fields
  |
  +-- "dependencies" → Execute: task deps {plan} {taskId}
                     Parse: dependency list, ready status
```

---

## Daily Workflow

### Morning: Start Work

```
Step 1: Get ready-to-start tasks (recommended)
  Command: task ready {plan} [--limit 10]
  Parse: Extract ready task IDs, titles, priorities
  Action: Present to user for selection
  Note: Only shows tasks with all dependencies completed

Alternative Step 1: Get pending P0 tasks
  Command: task list {plan} --status pending --priority P0
  Parse: Extract task IDs and titles
  Action: Present to user for selection

Step 2: Check dependencies (if task selected from list, not ready)
  Command: task deps {plan} {taskId}
  Parse: Check "ready_to_start" status
  Action:
    - If ready: Proceed to Step 3
    - If not ready: Show blocking deps, ask for force start

Step 3: Start task
  Command: task start {plan} {taskId}
  Confirm: Output contains "status updated"
```

### Evening: End Work

```
Step 1: Check today's operations
  Command: task logs -p {plan} -n 20
  Parse: Recent status changes

Step 2: List in-progress tasks
  Command: task list {plan} --status in_progress
  Action: Report to user
```

---

## Start Task Workflow

```
Trigger: User wants to start working on a task

Step 1: Identify task
  IF user provides taskId:
    Use provided ID
  ELSE:
    Run: task list {plan} --status pending --priority P0
    Ask user to select from list

Step 2: Check dependencies
  Command: task deps {plan} {taskId}
  
  Parse output:
    IF contains "All dependencies completed":
      ready = true
    ELSE IF contains "Dependencies not ready":
      ready = false
      Extract: blocking dependency IDs

Step 3: Handle dependency status
  IF ready:
    Proceed to Step 4
  ELSE:
    Present blocking dependencies
    Ask: "Dependencies not completed. Force start? (requires --force)"
    IF user confirms:
      Add --force flag
    ELSE:
      Stop workflow

Step 4: Start task
  Command: task start {plan} {taskId} [--force]
  
  Verify success:
    Output contains "Status updated" OR "status updated"

Step 5: Report
  Confirm: "Task {taskId} started"
```

---

## Complete Task Workflow

```
Trigger: User says task is finished

Step 1: Identify and confirm task
  IF user provides taskId:
    Run: task show {plan} {taskId} (to verify status)
  ELSE:
    Run: task list {plan} --status in_progress
    Ask user to select

Step 2: Mark as done
  Command: task done {plan} {taskId}
  
  Verify:
    Output contains "Status updated" OR "status updated"

Step 3: Execute verification (REQUIRED)
  Command: task verify {plan} {taskId}
  
  Parse output:
    Extract: artifacts_found, artifacts_total
    Calculate: completeness = found / total
    
    IF completeness == 100%:
      can_archive = true
      missing_artifacts = []
    ELSE:
      can_archive = false
      Extract: missing_artifacts list

Step 4: Handle verification result
  IF can_archive:
    Ask: "Verification passed. Archive task?"
    IF user confirms:
      Proceed to Step 5
    ELSE:
      Report: "Task completed and verified, can be archived anytime"
  ELSE:
    Report: "Missing artifact files found"
    List: missing_artifacts
    Action: "Please add the above files and re-run verification"
    Stop workflow (wait for user)

Step 5: Archive (only if user confirmed)
  Command: task archive {plan} {taskId}
  
  Verify:
    Output contains "archived"

Step 6: Final report
  Summarize:
    - Task status: completed → archived
    - Verification: passed
    - Artifacts: all found
```

---

## Weekly Summary Workflow

```
Step 1: Overall progress
  Command: task progress {plan}
  Extract:
    - Overall percentage
    - Completed / Total
    - P0 pending count

Step 2: Weekly activity
  Command: task logs -p {plan} -n 50
  Extract:
    - Status changes
    - Tasks added
    - Tasks archived

Step 3: Generate report
  Command: task report {plan} -o ./reports/weekly_{date}.json

Step 4: Compile summary
  Report to user:
    - Progress change from last week
    - Tasks completed this week
    - Tasks in progress
    - Upcoming P0 tasks
```

---

## Add Task Workflow

```
Trigger: User wants to add new task

Step 1: Collect required parameters
  Required:
    - title: "What is the task title?"
  
  Optional (with defaults):
    - phase: "Which phase? (default: Phase 1)"
    - priority: "Priority P0/P1/P2? (default: P1)"
    - description: "Task description?"

Step 2: Collect optional parameters
  Optional:
    - depends: "Depends on which tasks? (comma-separated, optional)"
    - criteria: "Acceptance criteria? (one per line, optional)"
    - artifacts: "Output artifacts? (comma-separated paths, optional)"

Step 3: Build and execute command
  Command: task add {plan} -t {title} [other options]

Step 4: Confirm creation
  Parse output:
    Extract: new task ID (e.g., "TASK-030")
  Report: "Task {taskId} created"
```

---

## Audit Workflow

```
Trigger: User needs to investigate/troubleshoot

Step 1: Check operation logs
  Command: task logs -p {plan} [-o {operation_type}] [-n {limit}]
  
  Filter options:
    -o STATUS_CHANGE: Status changes
    -o VERIFY_TASK: Verification records
    -o TASK_ARCHIVED: Archive records

Step 2: Generate full report
  Command: task report {plan} -o ./audit/report_{date}.json

Step 3: Analyze
  Parse JSON report for:
    - Error patterns
    - Status change history
    - Verification failures
```

---

## Quality Gate Workflow

```
Trigger: Before archive operation (enforced)

Check 1: Is task completed?
  Run: task show {plan} {taskId}
  Verify: status == "completed"
  If not: Run task done first

Check 2: Is task verified?
  Run: task logs -p {plan} -o VERIFY_TASK | grep {taskId}
  Or: Run task verify to check
  
  If not verified:
    Run: task verify {plan} {taskId}
    Parse: Can archive?
    
    If verification fails:
      Stop: Report missing artifacts

Proceed: Only if both checks pass
```

---

## Workflow Decision Tree

```
User Request
    |
    +-- Informational ──┬── "progress" → progress command
    |                   ├── "list" → list command
    |                   ├── "show" → show command
    |                   └── "deps" → deps command
    |
    +-- Operational ────┬── "start" → Start Task Workflow
    |                   ├── "done" → Complete Task Workflow
    |                   ├── "verify" → verify command
    |                   ├── "archive" → Check verify → archive
    |                   └── "block" → block command
    |
    +-- Managerial ─────┬── "add" → Add Task Workflow
    |                   ├── "edit" → edit command
    |                   └── "delete" → delete command (confirm!)
    |
    +-- Administrative ─┬── "logs" → logs command
                        ├── "report" → report command
                        └── "config" → config subcommands
```
