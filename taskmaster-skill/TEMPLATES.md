# TaskMaster Command Templates

> Copy-paste ready command templates for Agent execution.

---

## Template Usage

Replace placeholders:
- `{plan}` - Plan name (e.g., `mvp_v1`)
- `{taskId}` - Task ID (e.g., `TASK-001`)
- `{title}` - Task title
- Other parameters as specified

## Command Prefix

All commands use this prefix:
```bash
node cli/task.js <command>
```

Or via shortcut scripts (Windows/Linux/Mac):
```bash
taskmaster-skill\task.bat <plan> <command>    # Windows
./taskmaster-skill/task.sh <plan> <command>  # Linux/Mac
```

In templates below, `task` is shorthand for `node cli/task.js`.

---

## Configuration Template (REQUIRED)

**Step 1: Create config.json from template**
```bash
cp config.json.template config.json
```

**Step 2: Edit config.json with your plan path**
```json
{
  "version": "1.0.0",
  "plans": {
    "{plan-name}": {
      "path": "{absolute-path-to-plan}",
      "description": "{plan-description}"
    }
  },
  "settings": {
    "defaultPlan": "{plan-name}",
    "autoCreatePlan": false,
    "logRetentionDays": 30
  }
}
```

**Example config.json:**
```json
{
  "version": "1.0.0",
  "plans": {
    "mvp_v1": {
      "path": "E:\\Agent\\agent-fabric\\docs\\plans\\mvp_v1",
      "description": "AgentFabric MVP v1"
    }
  },
  "settings": {
    "defaultPlan": "mvp_v1",
    "autoCreatePlan": false,
    "logRetentionDays": 30
  }
}
```

**Note:** `config.json` is user-specific and should not be committed to version control.

---

## Query Templates

### View Plans
```bash
task plans
```

### View Progress
```bash
# Basic
task progress {plan}

# Example
task progress mvp_v1
```

### List Tasks
```bash
# All tasks
task list {plan}

# Pending P0 tasks (high priority)
task list {plan} --status pending --priority P0

# In progress tasks
task list {plan} --status in_progress

# Completed tasks
task list {plan} --status completed

# By phase
task list {plan} --phase "Phase 1"

# Include archived
task list {plan} --archived

# Combined filters
task list {plan} --phase "Phase 1" --priority P0 --status pending
```

### View Task Details
```bash
task show {plan} {taskId}

# Example
task show mvp_v1 TASK-001
```

### View Dependencies
```bash
# Basic
task deps {plan} {taskId}

# Recursive (show nested deps)
task deps {plan} {taskId} --recursive

# Examples
task deps mvp_v1 TASK-011
task deps mvp_v1 TASK-011 --recursive
```

### View Logs
```bash
# Recent logs
task logs

# More entries
task logs -n 50

# By plan
task logs -p {plan}

# By operation type
task logs -o STATUS_CHANGE
task logs -o VERIFY_TASK
task logs -o TASK_ARCHIVED

# Combined
task logs -p {plan} -o VERIFY_TASK -n 20
```

### Export Report
```bash
# Default output
task report {plan}

# Custom path
task report {plan} -o ./reports/{plan}_weekly.json

# Example
task report mvp_v1 -o ./reports/mvp_v1_$(date +%Y%m%d).json
```

---

## Action Templates

### Start Task
```bash
# Standard (checks dependencies)
task start {plan} {taskId}

# Force (skip dependency check)
task start {plan} {taskId} --force

# Examples
task start mvp_v1 TASK-001
task start mvp_v1 TASK-001 --force
```

### Complete Task
```bash
task done {plan} {taskId}

# Example
task done mvp_v1 TASK-001
```

### Verify Task
```bash
# Basic
task verify {plan} {taskId}

# Verbose (show file paths)
task verify {plan} {taskId} --verbose

# Skip artifact check
task verify {plan} {taskId} --skip-artifacts

# Export report
task verify {plan} {taskId} --output ./reports/{taskId}_verify.json

# Examples
task verify mvp_v1 TASK-001
task verify mvp_v1 TASK-001 --verbose
task verify mvp_v1 TASK-001 --output ./verify_report.json
```

### Block Task
```bash
task block {plan} {taskId}

# Example
task block mvp_v1 TASK-001
```

### Archive Task
```bash
# Standard (requires verification)
task archive {plan} {taskId}

# Force (skip verification)
task archive {plan} {taskId} --force

# Examples
task archive mvp_v1 TASK-001
task archive mvp_v1 TASK-001 --force
```

### Unarchive Task
```bash
task unarchive {plan} {taskId}

# Example
task unarchive mvp_v1 TASK-001
```

---

## Management Templates

### Add Task
```bash
# Minimal (title only)
task add {plan} -t "{title}"

# Standard
task add {plan} \
  -t "{title}" \
  -p "{phase}" \
  -P "{priority}" \
  -d "{description}"

# Full
task add {plan} \
  -t "{title}" \
  -p "{phase}" \
  -P "{priority}" \
  -d "{description}" \
  --depends "{dep1},{dep2}" \
  --criteria "{criterion1}
{criterion2}
{criterion3}" \
  --artifacts "{file1},{file2},{file3}" \
  --background "{background}" \
  --goals "{goals}" \
  --tech "{technical_requirements}" \
  --steps "{step1}
{step2}
{step3}" \
  --notes "{notes}" \
  --references "{references}"

# Example
task add mvp_v1 \
  -t "实现 JWT 认证" \
  -p "Phase 2" \
  -P "P0" \
  -d "实现基于 JWT 的 API 认证" \
  --depends "TASK-002,TASK-007" \
  --criteria "支持 Bearer Token
支持 Token 刷新
错误返回 401" \
  --artifacts "src/middleware/auth.ts,src/services/jwt.ts"
```

### Edit Task
```bash
# Edit basic fields
task edit {plan} {taskId} -t "{new_title}" -P {new_priority}

# Add criteria
task edit {plan} {taskId} --criteria "{new_criterion}"

# Add artifacts
task edit {plan} {taskId} --artifacts "{new_file}"

# Example
task edit mvp_v1 TASK-001 -P P0 --criteria "新增标准"
```

### Delete Task
```bash
# With confirmation (recommended)
task delete {plan} {taskId}

# Force (no confirmation)
task delete {plan} {taskId} --force

# Example
task delete mvp_v1 TASK-001 --force
```

---

## Config Templates

### View Config
```bash
task config list
```

### Add Plan
```bash
task config add {name} {path} --description "{description}"

# Example
task config add mvp_v2 E:\projects\mvp_v2 --description "MVP v2 计划"
```

### Remove Plan
```bash
task config remove {name}

# Example
task config remove mvp_v2
```

### Set Default
```bash
task config set-default {name}

# Example
task config set-default mvp_v1
```

---

## Workflow Templates

### Daily Standup
```bash
# 1. Check progress
task progress {plan}

# 2. Check in-progress
task list {plan} --status in_progress

# 3. Check pending P0
task list {plan} --status pending --priority P0
```

### Start New Task
```bash
# 1. Check dependencies
task deps {plan} {taskId}

# 2. View details (if needed)
task show {plan} {taskId}

# 3. Start
task start {plan} {taskId}
```

### Complete and Archive
```bash
# 1. Mark done
task done {plan} {taskId}

# 2. Verify
task verify {plan} {taskId}

# 3. Archive (if verification passes)
task archive {plan} {taskId}
```

### Weekly Report
```bash
# 1. Get progress
task progress {plan}

# 2. Get recent activity
task logs -p {plan} -n 50

# 3. Export report
task report {plan} -o ./reports/weekly_$(date +%Y%m%d).json
```

### Batch Operations
```bash
# Complete multiple tasks
for task in TASK-001 TASK-002 TASK-003; do
  task done {plan} $task
  task verify {plan} $task
done

# Archive verified tasks
for task in TASK-001 TASK-002 TASK-003; do
  task archive {plan} $task
done
```

---

## Aliases

| Alias | Full Command |
|-------|--------------|
| `task ls {plan}` | `task list {plan}` |
| `task p {plan}` | `task progress {plan}` |

---

## Parameter Quick Reference

### Status Values
- `pending` - 待开始
- `in_progress` - 进行中
- `completed` - 已完成
- `blocked` - 已阻塞

### Priority Values
- `P0` - Must complete
- `P1` - Important (default)
- `P2` - Optional

### Operation Types (for logs)
- `STATUS_CHANGE`
- `VERIFY_TASK`
- `TASK_ARCHIVED`
- `TASK_ADDED`
- `TASK_DELETED`
