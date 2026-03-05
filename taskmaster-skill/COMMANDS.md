# TaskMaster Command Reference

> Complete command specifications for Agent execution.

---

## Command Index

| Category | Commands |
|----------|----------|
| Query | `plans`, `progress`, `list`, `ready`, `show`, `deps`, `logs`, `report` |
| Action | `start`, `done`, `verify`, `block`, `archive`, `unarchive` |
| Manage | `add`, `edit`, `delete`, `config` |

---

## Query Commands

### plans
```yaml
syntax: task plans
purpose: List all configured plans
parameters: none
output_fields:
  - plan_name
  - plan_path
  - description
  - progress_ratio
  - completion_percentage
```

### progress
```yaml
syntax: task progress {plan}
purpose: Show overall plan progress
parameters:
  plan:
    type: string
    required: true
    description: Plan name from config
output_fields:
  - overall_percentage
  - completed_count
  - total_count
  - status_distribution
  - phase_progress
  - pending_p0_tasks
example: task progress mvp_v1
```

### list
```yaml
syntax: task list {plan} [options]
purpose: List tasks with optional filters
parameters:
  plan:
    type: string
    required: true
  options:
    --phase:
      type: string
      description: Filter by phase
    --status:
      type: enum[pending, in_progress, completed, blocked]
      description: Filter by status
    --priority:
      type: enum[P0, P1, P2]
      description: Filter by priority
    --archived:
      type: boolean
      description: Include archived tasks
output_fields:
  - task_id
  - title
  - status
  - priority
  - phase
example: task list mvp_v1 --status pending --priority P0
```

### ready
```yaml
syntax: task ready {plan} [options]
purpose: List tasks that are ready to start (dependencies completed)
parameters:
  plan:
    type: string
    required: true
    description: Plan name from config
  options:
    -l, --limit:
      type: integer
      default: 10
      description: Maximum number of tasks to display
filter_logic:
  - status must be 'pending'
  - all dependencies must be 'completed'
  - archived tasks are excluded
output_fields:
  - task_id
  - title
  - phase
  - priority
  - hours
special_notes:
  - Shows "displayed/total" count if limit < total ready tasks
  - Displays hint to use --limit to see all tasks
  - Shows command hint for starting tasks
example: task ready mvp_v1 --limit 20
workflow_usage: |
  # Daily workflow - check what's ready to start
  task ready mvp_v1
  
  # If many tasks ready, view more
  task ready mvp_v1 --limit 50
  
  # Then start a task
  task start mvp_v1 TASK-010
```

### show
```yaml
syntax: task show {plan} {taskId}
purpose: Display task details
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
    pattern: TASK-\d+
output_fields:
  - id
  - title
  - description
  - status
  - priority
  - phase
  - dependencies
  - acceptance_criteria
  - artifacts
  - content.background
  - content.goals
example: task show mvp_v1 TASK-001
```

### deps
```yaml
syntax: task deps {plan} {taskId} [--recursive]
purpose: Show task dependencies
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
  --recursive:
    type: boolean
    description: Show nested dependencies
output_fields:
  - dependency_id
  - dependency_title
  - dependency_status
  - ready_to_start (boolean)
  - blocking_dependencies (list)
example: task deps mvp_v1 TASK-011 --recursive
```

### logs
```yaml
syntax: task logs [options]
purpose: Query operation logs
parameters:
  options:
    -p, --plan:
      type: string
      description: Filter by plan
    -o, --operation:
      type: string
      description: Filter by operation type
    -n, --limit:
      type: integer
      default: 20
      description: Number of entries to show
output_fields:
  - timestamp
  - operation
  - plan
  - taskId
  - result
example: task logs -p mvp_v1 -o VERIFY_TASK -n 10
```

### report
```yaml
syntax: task report {plan} [-o {outputPath}]
purpose: Export operation report
parameters:
  plan:
    type: string
    required: true
  -o, --output:
    type: string
    description: Output file path
output_format: JSON
output_fields:
  - generatedAt
  - plan
  - summary.totalOperations
  - summary.statusChanges
  - summary.tasksAdded
  - summary.tasksArchived
example: task report mvp_v1 -o ./report.json
```

---

## Action Commands

### start
```yaml
syntax: task start {plan} {taskId} [--force]
purpose: Change task status to in_progress
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
  --force:
    type: boolean
    description: Skip dependency check
    warning: Requires user confirmation
pre_check: Execute deps command to verify dependencies are completed
error_cases:
  - condition: Dependencies not ready
    action: List blocking dependencies, ask user for --force
example: task start mvp_v1 TASK-001
```

### done
```yaml
syntax: task done {plan} {taskId}
purpose: Change task status to completed
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
post_action: Suggest running verify command
example: task done mvp_v1 TASK-001
```

### verify
```yaml
syntax: task verify {plan} {taskId} [options]
purpose: Verify task completion criteria
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
  -v, --verbose:
    type: boolean
    description: Show artifact file paths
  --skip-artifacts:
    type: boolean
    description: Skip artifact file check
  -o, --output:
    type: string
    description: Save report to file
output_fields:
  - task_status
  - criteria_count
  - artifacts_total
  - artifacts_found
  - artifacts_missing (list)
  - can_archive (boolean)
parsing_rules:
  - If "artifacts: X/Y (100%)" → can_archive = true
  - If "Missing artifacts:" → can_archive = false, extract list
example: task verify mvp_v1 TASK-001 --verbose
```

### block
```yaml
syntax: task block {plan} {taskId}
purpose: Mark task as blocked
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
example: task block mvp_v1 TASK-001
```

### archive
```yaml
syntax: task archive {plan} {taskId} [--force]
purpose: Archive completed task
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
  --force:
    type: boolean
    description: Skip verification check
    warning: Requires user confirmation
pre_check: Must be verified (run verify first)
error_cases:
  - condition: Not verified
    action: Run verify first
  - condition: Not completed
    action: Run done first
example: task archive mvp_v1 TASK-001
```

### unarchive
```yaml
syntax: task unarchive {plan} {taskId}
purpose: Restore archived task
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
example: task unarchive mvp_v1 TASK-001
```

---

## Management Commands

### add
```yaml
syntax: task add {plan} -t {title} [options]
purpose: Create new task
parameters:
  plan:
    type: string
    required: true
  -t, --title:
    type: string
    required: true
    description: Task title
  -p, --phase:
    type: string
    default: "Phase 1"
    description: Task phase
  -P, --priority:
    type: enum[P0, P1, P2]
    default: P1
    description: Task priority
  -d, --description:
    type: string
    description: Task description
  --depends:
    type: string
    description: Comma-separated dependency task IDs
  --criteria:
    type: string
    description: Newline-separated acceptance criteria
  --artifacts:
    type: string
    description: Comma-separated artifact file paths
  --background:
    type: string
    description: Task background
  --goals:
    type: string
    description: Task goals
  --tech:
    type: string
    description: Technical requirements
  --steps:
    type: string
    description: Newline-separated implementation steps
  --notes:
    type: string
    description: Additional notes
  --references:
    type: string
    description: Reference materials
output: New task ID (e.g., TASK-030)
example: |
  task add mvp_v1 \
    -t "Implement authentication" \
    -p "Phase 2" \
    -P "P0" \
    --depends "TASK-001,TASK-002" \
    --criteria "Support JWT\nToken refresh" \
    --artifacts "src/auth.ts"
```

### edit
```yaml
syntax: task edit {plan} {taskId} [options]
purpose: Modify existing task
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
  options: Same as "add" command
note: Only provided fields will be updated
example: task edit mvp_v1 TASK-001 -P P0 --criteria "New criterion"
```

### delete
```yaml
syntax: task delete {plan} {taskId} [--force]
purpose: Delete task
parameters:
  plan:
    type: string
    required: true
  taskId:
    type: string
    required: true
  --force:
    type: boolean
    description: Skip confirmation
warning: Always confirm with user before executing
example: task delete mvp_v1 TASK-001 --force
```

### config
```yaml
syntax: task config <subcommand> [args]
purpose: Manage CLI configuration
subcommands:
  list:
    syntax: task config list
    purpose: Show all configurations
  add:
    syntax: task config add {name} {path} [--description {desc}]
    parameters:
      name: Plan identifier
      path: Absolute path to plan directory
  remove:
    syntax: task config remove {name}
    parameters:
      name: Plan identifier to remove
  set-default:
    syntax: task config set-default {name}
    parameters:
      name: Plan identifier to set as default
```

---

## Command Aliases

| Alias | Full Command |
|-------|--------------|
| `task ls` | `task list` |
| `task p` | `task progress` |

---

## Error Response Patterns

| Error Output | Cause | Resolution |
|--------------|-------|------------|
| "task does not exist" | Invalid taskId | Run `list` to get valid IDs |
| "not verified" | Missing verify step | Run `verify` first |
| "only completed tasks can be archived" | Wrong status | Run `done` first |
| "dependencies not ready" | Incomplete deps | Show deps status, ask for `--force` |
| "not found" | Missing artifacts | List missing files from verify output |
| "already archived" | Duplicate operation | Inform user current status |
