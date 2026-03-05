# TaskMaster Troubleshooting

> Error codes and resolution procedures for Agent execution.

---

## Error Code Reference

| Error Pattern | Error Code | Cause | Resolution | Auto-fixable |
|---------------|------------|-------|------------|--------------|
| "任务不存在" / "task does not exist" | ERR_TASK_NOT_FOUND | Invalid taskId | Run `list` to get valid IDs | Yes |
| "尚未通过核验" / "not verified" | ERR_NOT_VERIFIED | Missing verify step | Run `verify` first | Yes |
| "只有已完成的任务才能归档" | ERR_NOT_COMPLETED | Status not "completed" | Run `done` first | Yes |
| "依赖未就绪" / "dependencies not ready" | ERR_DEPS_NOT_READY | Dependencies incomplete | Show deps, ask for force | No (needs user) |
| "未找到" / "not found" (artifacts) | ERR_ARTIFACT_MISSING | Missing output files | List missing, wait for fix | No (needs user) |
| "已归档" / "already archived" | ERR_ALREADY_ARCHIVED | Duplicate archive op | Inform user | Yes |
| "命令未找到" / "command not found" | ERR_CLI_NOT_FOUND | CLI not in PATH | Check installation | Yes |
| "data.json 不存在" | ERR_DATA_NOT_FOUND | Missing data file | Check plan path | Yes |
| "config.json 不存在" / "Plan not found" | ERR_CONFIG_NOT_FOUND | Missing or invalid config | Copy template and configure | No (needs user) |
| "未配置计划" / "No plans configured" | ERR_NO_PLANS | Empty plans in config | Add plan configuration | No (needs user) |

---

## Error Resolution Procedures

### ERR_TASK_NOT_FOUND

```yaml
detection: Output contains "任务不存在" OR "task does not exist"
cause: Provided taskId does not exist in plan

resolution_steps:
  1:
    action: Run task list {plan}
    purpose: Get valid task IDs
  2:
    action: Parse output
    extract: List of task IDs
  3:
    action: Present to user
    format: "可用任务: TASK-001, TASK-002, ..."
  4:
    action: Ask user to select correct ID
    
auto_resolution: false  # Requires user input
```

### ERR_NOT_VERIFIED

```yaml
detection: Output contains "尚未通过核验" OR "not verified"
cause: Attempting to archive without verification

check_state:
  command: task logs -p {plan} -o VERIFY_TASK | grep {taskId}
  purpose: Check if ever verified

resolution_steps:
  1:
    action: Run task verify {plan} {taskId}
    purpose: Execute verification
  2:
    action: Parse verify output
    check: Can archive?
  3:
    if can_archive:
      action: Retry task archive
    else:
      action: Report missing artifacts
      
auto_resolution: partial  # Can run verify automatically
```

### ERR_NOT_COMPLETED

```yaml
detection: Output contains "只有已完成的任务才能归档"
cause: Task status is not "completed"

check_state:
  command: task show {plan} {taskId}
  extract: current status

resolution_steps:
  1:
    if status == "in_progress":
      action: Run task done {plan} {taskId}
  2:
    action: Run task verify {plan} {taskId}
  3:
    action: Retry task archive

required_sequence:
  - done
  - verify
  - archive
```

### ERR_DEPS_NOT_READY

```yaml
detection: Output contains "依赖未就绪" OR "dependencies not ready"
cause: Task dependencies not all completed

check_state:
  command: task deps {plan} {taskId}
  purpose: Get detailed dependency status

resolution_steps:
  1:
    action: Parse deps output
    extract: List of incomplete dependencies
  2:
    action: Present to user
    format: |
      以下依赖未完成:
      - TASK-XXX: 进行中
      - TASK-YYY: 待开始
  3:
    action: Ask user
    question: "依赖未完成，是否强制开始？(需要 --force)"
  4:
    if user_confirms:
      action: Run task start {plan} {taskId} --force
    else:
      action: Stop, inform user to complete dependencies first

auto_resolution: false  # Requires user decision
```

### ERR_ARTIFACT_MISSING

```yaml
detection: Output contains "未找到" OR "missing" (in verify output)
cause: Declared artifacts not found on filesystem

check_state:
  command: task verify {plan} {taskId} --verbose
  purpose: Get detailed artifact paths

resolution_steps:
  1:
    action: Parse verify output
    extract: List of missing artifact files
  2:
    action: Present to user
    format: |
      缺失产物文件:
      - {artifact_path_1}
      - {artifact_path_2}
  3:
    action: Wait for user to create files
  4:
    action: Re-run verify after user confirms

auto_resolution: false  # Requires user action
```

### ERR_CLI_NOT_FOUND

```yaml
detection: "command not found: task" OR "node: command not found"
cause: CLI not installed or not in PATH

resolution_steps:
  1:
    action: Check Node.js
    command: node --version
    expect: v22+
  2:
    action: Check CLI file exists
    command: ls taskmaster-skill/cli/task.js
  3:
    action: Use full path
    command: node taskmaster-skill/cli/task.js --version
  4:
    if works:
      action: Use full path for all commands
    else:
      action: Report installation issue

auto_resolution: true
```

### ERR_DATA_NOT_FOUND

```yaml
detection: Output contains "data.json" AND "not found" OR "ENOENT"
cause: Plan path incorrect or data file missing

resolution_steps:
  1:
    action: Check config
    command: task config list
  2:
    action: Verify plan path
    check: Does path exist?
  3:
    if path_wrong:
      action: Fix config
      command: task config remove {wrong_name}
      command: task config add {name} {correct_path}
    if file_missing:
      action: Report data corruption

auto_resolution: partial
```

### ERR_CONFIG_NOT_FOUND

```yaml
detection: 
  - Output contains "config.json" AND "not found"
  - Output contains "Plan not found" OR "未找到计划"
cause: Missing or invalid configuration file

resolution_steps:
  1:
    action: Check if config.json exists
    command: ls config.json
  2:
    if not exists:
      action: Copy from template
      command: cp config.json.template config.json
  3:
    action: Edit config.json
    instructions: |
      Replace placeholders with actual values:
      - {plan-name}: Your plan identifier (e.g., "mvp_v1")
      - {absolute-path-to-plan}: Full path to plan directory
      - {plan-description}: Description of the plan
  4:
    action: Verify configuration
    command: node cli/task.js config list

user_action_required: true
message_to_user: |
  首次使用需要配置 config.json：
  1. cp config.json.template config.json
  2. 编辑 config.json，设置正确的计划路径
  3. 路径必须是绝对路径（如 E:\\projects\\mvp_v1）
```

### ERR_NO_PLANS

```yaml
detection: Output contains "No plans configured" OR "未配置计划"
cause: Config file exists but plans section is empty

resolution_steps:
  1:
    action: Show current config
    command: node cli/task.js config list
  2:
    action: Add plan
    command: node cli/task.js config add {name} {path} --description "{desc}"
  3:
    action: Verify
    command: node cli/task.js config list

example:
  command: node cli/task.js config add mvp_v1 E:\\Agent\\agent-fabric\\docs\\plans\\mvp_v1 --description "MVP v1"
```

---

## Diagnostic Commands

### Verify Installation
```bash
# Check Node.js
node --version

# Check CLI
node taskmaster-skill/cli/task.js --version

# Check config
task config list

# Check data file
ls {plan_path}/data.json

# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('{plan_path}/data.json'))"
```

### Debug Task Operations
```bash
# Check task exists
task show {plan} {taskId}

# Check dependencies
task deps {plan} {taskId}

# Check current status
task list {plan} | grep {taskId}

# Check operation history
task logs -p {plan} | grep {taskId}
```

### Verify System State
```bash
# List all plans
task plans

# Check overall progress
task progress {plan}

# View recent operations
task logs -n 50
```

---

## Common Issue Patterns

### Issue: Cannot start task
```yaml
symptoms: 
  - "依赖未就绪" error
  - deps shows incomplete dependencies

diagnosis:
  1. Run task deps {plan} {taskId}
  2. Check which dependencies are not completed
  3. Determine if blocking dependencies are critical

solutions:
  - option_1: "等待依赖完成" (recommended)
    action: Inform user which tasks to complete first
  - option_2: "强制开始"
    action: Use --force flag (requires confirmation)
```

### Issue: Cannot archive task
```yaml
symptoms:
  - "尚未通过核验" error
  - "只有已完成的任务才能归档" error

diagnosis:
  1. Run task show {plan} {taskId}
  2. Check status field
  3. If status == "completed":
       Run task verify to check artifacts
  4. If status != "completed":
       Need to run done first

solutions:
  - if_status_not_completed:
      - Run task done
      - Run task verify
      - Run task archive
  - if_verification_failed:
      - List missing artifacts
      - Wait for user to create them
      - Re-run verify
      - Then archive
```

### Issue: Task not appearing in list
```yaml
symptoms:
  - Task exists but not in list output

diagnosis:
  1. Check if archived: task list --archived
  2. Check filter parameters
  3. Check phase filter if applied

solutions:
  - if_archived:
      action: task unarchive {plan} {taskId}
  - if_filtered_out:
      action: Remove filters or adjust parameters
```

---

## Recovery Procedures

### Full Recovery Check
```bash
# 1. Verify CLI
task --version

# 2. Check config
task config list

# 3. Validate data
node -e "JSON.parse(require('fs').readFileSync('mvp_v1/data.json'))"

# 4. Check logs
task logs -n 20

# 5. Test basic operations
task plans
task progress mvp_v1
task list mvp_v1 --status pending
```

### Data Corruption Recovery
```yaml
if: data.json is corrupted
steps:
  1: Stop all operations
  2: Check for backup files (*.backup, *.bak)
  3: If backup exists:
       - Restore from backup
  4: If no backup:
       - Report data loss
       - Recommend manual recovery
  5: Validate restored data
```

---

## Prevention Checklist

### Before Operations
- [ ] Verify task ID exists
- [ ] Check current status
- [ ] Validate dependencies

### During Operations
- [ ] Parse output for errors
- [ ] Confirm success indicators
- [ ] Log unexpected outputs

### After Errors
- [ ] Identify error code
- [ ] Follow resolution procedure
- [ ] Verify fix worked
