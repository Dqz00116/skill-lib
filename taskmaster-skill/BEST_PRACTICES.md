# TaskMaster Best Practices

> Operational rules and constraints for Agent execution.

---

## Configuration Rules

### Rule 1: Config File Required
```yaml
requirement: config.json MUST exist before using TaskMaster
template_file: config.json.template
user_specific: true  # Should not be committed to version control
```

### Rule 2: Plan Path Must Be Absolute
```yaml
constraint: Plan path must be absolute path
valid_examples:
  - "E:\\Agent\\agent-fabric\\docs\\plans\\mvp_v1"  # Windows
  - "/home/user/projects/mvp_v1"                    # Linux/Mac

invalid_examples:
  - "./mvp_v1"       # Relative path
  - "../plans/mvp"   # Relative path
  - "mvp_v1"         # Just name

check_command: node cli/task.js config list
```

### Rule 3: Verify Config Before Operations
```yaml
pre_flight_check:
  1: Check config.json exists
  2: Run: node cli/task.js config list
  3: Verify plan path is accessible
  4: Check data.json exists in plan path

error_if_missing: |
  如果 config.json 不存在：
  1. cp config.json.template config.json
  2. 编辑配置
  3. 重新验证
```

---

## Task Granularity Rules

### Rule 1: Task Size
```yaml
constraint: Task duration must be 1-2 days
action_if_too_large: Split into subtasks
command_to_add_subtask: task add {plan} -t "{subtask_title}" --depends "{parent_task}"
```

### Rule 2: Task Decomposition Example
```yaml
bad_example: "实现用户系统"  # Too large, 1-2 weeks

good_examples:
  - "用户数据库设计"
  - "用户注册API实现"
  - "用户登录API实现"
  - "用户信息修改API实现"
```

---

## State Transition Rules

### Valid Transitions
```yaml
allowed_transitions:
  pending:
    - in_progress
    - blocked
  in_progress:
    - completed
    - blocked
  blocked:
    - in_progress
  completed:
    - archived  # ONLY after verification

forbidden_transitions:
  - pending → completed  # Must go through in_progress
  - in_progress → archived  # Must be completed first
  - blocked → archived  # Must go through in_progress → completed
```

### State Change Preconditions
```yaml
start_task:
  from: pending
  to: in_progress
  pre_check: task deps {plan} {taskId}
  condition: dependencies completed OR --force

complete_task:
  from: in_progress
  to: completed
  pre_check: none
  post_action: suggest verify

archive_task:
  from: completed
  to: archived
  pre_check: task verify {plan} {taskId}
  condition: verification passed OR --force
  warning: --force requires user confirmation
```

---

## Verification Gate Rules

### Archive Requirements
```yaml
gate_name: Archive Verification Gate
mandatory: true
cannot_skip: false  # Can use --force but must confirm

steps:
  1:
    action: task done {plan} {taskId}
    verify: status == "completed"
  2:
    action: task verify {plan} {taskId}
    verify: "artifacts: X/Y (100%)"
  3:
    action: task archive {plan} {taskId}
    verify: output contains "archived"

force_override:
  available: true
  flag: --force
  requirement: explicit user confirmation
  log_entry: records "verified: false" in archive log
```

### Verification Output Parsing
```yaml
verification_success_indicators:
  - "产物文件: X/Y (100%)"
  - "✅ 核验通过"
  - No "Missing artifacts" section

verification_failure_indicators:
  - "产物文件: X/Y (<100%)"
  - "❌ 缺失的产物文件"
  - List of missing files

required_parsing:
  - Extract: artifacts_total
  - Extract: artifacts_found
  - Calculate: completeness_ratio
  - Extract: missing_artifacts (if any)
```

---

## Dependency Management Rules

### Before Starting Task
```yaml
required_action: Check dependencies
command: task deps {plan} {taskId}

response_handling:
  if "所有依赖已完成":
    action: proceed with task start
  if "依赖未就绪":
    action:
      - List blocking dependencies
      - Present to user
      - Ask: "是否强制开始？(需要 --force)"
    if_user_confirms:
      action: task start --force
      log: records force flag
    else:
      action: stop, wait for dependencies
```

### Dependency Chain Integrity
```yaml
forbidden: Circular dependencies

valid_patterns:
  linear: "A → B → C"
  diamond: "A → B, A → C, B → D, C → D"

invalid_patterns:
  circular: "A → B → C → A"
```

---

## Priority Rules

### Priority Levels
```yaml
P0:
  description: Must complete in current phase
  blocks_other_tasks: true
  max_percentage_of_tasks: 30%
  daily_check: required

P1:
  description: Important, recommended to complete
  blocks_other_tasks: false
  weekly_check: recommended

P2:
  description: Optional, if time allows
  blocks_other_tasks: false
  as_needed: true
```

### Priority Assignment Guidelines
```yaml
criteria_for_P0:
  - "On critical path"
  - "Blocks other P0 tasks"
  - "Required for phase milestone"
  - "High business value"

criteria_for_P1:
  - "Important feature"
  - "Recommended but not blocking"

criteria_for_P2:
  - "Nice to have"
  - "Can be deferred"
```

---

## Acceptance Criteria Rules

### Good Criteria Characteristics
```yaml
verifiable: true  # Can be objectively checked
specific: true    # No vague terms like "good performance"
complete: true    # Covers function, test, docs

examples_good:
  - "单元测试覆盖率 >= 80%"
  - "API响应时间 < 200ms (p95)"
  - "Swagger文档已更新"
  - "代码通过ESLint检查"
  - "npm run build无错误"

examples_bad:
  - "功能正常"        # Too vague
  - "性能没问题"      # Not measurable
  - "文档齐全"        # Not specific
  - "测试通过"        # No coverage metric
```

### Artifact Declaration Rules
```yaml
required_in_artifacts:
  - Source code files
  - Test files
  - Documentation
  - Configuration files

path_format: relative_path
examples:
  - "src/services/auth.ts"
  - "tests/unit/auth.test.ts"
  - "docs/auth-api.md"
  - "config/auth.yaml"
```

---

## Logging Rules

### When to Log
```yaml
auto_logged_operations:
  - STATUS_CHANGE
  - VERIFY_TASK
  - TASK_ARCHIVED
  - TASK_ADDED
  - TASK_DELETED

manual_log_query:
  command: task logs
  use_cases:
    - "Investigate issues"
    - "Audit operations"
    - "Generate reports"
```

### Log Retention
```yaml
text_log: operations.log
structured_log: operations.jsonl
retention: automatic_append
overwrite: false
```

---

## Confirmation Required Operations

### Must Confirm with User
```yaml
operations:
  delete_task:
    command: task delete {plan} {taskId} [--force]
    confirm: always
    risk: "Permanent data loss"

  force_archive:
    command: task archive {plan} {taskId} --force
    confirm: always
    risk: "Skip quality verification"

  force_start:
    command: task start {plan} {taskId} --force
    confirm: when_dependencies_not_ready
    risk: "Start with incomplete dependencies"

confirmation_template: |
  操作: {operation}
  风险: {risk}
  请确认是否继续？(yes/no)
```

---

## Error Recovery Rules

### Common Error Patterns
```yaml
error_task_not_found:
  error: "任务不存在"
  cause: Invalid taskId
  recovery:
    - Run: task list {plan}
    - Extract: valid task IDs
    - Present: to user for selection

error_not_verified:
  error: "尚未通过核验"
  cause: Missing verification step
  recovery:
    - Run: task verify {plan} {taskId}
    - Check: verification result
    - If pass: retry archive
    - If fail: report missing artifacts

error_not_completed:
  error: "只有已完成的任务才能归档"
  cause: Wrong task status
  recovery:
    - Run: task done {plan} {taskId}
    - Then: task verify
    - Then: task archive

error_dependencies_not_ready:
  error: "依赖未就绪"
  cause: Incomplete dependencies
  recovery:
    - Run: task deps {plan} {taskId}
    - Extract: blocking dependencies
    - Present: to user
    - Ask: force start or wait
```

---

## Best Practices Checklist

### Before Any Operation
- [ ] Identify correct plan name
- [ ] Verify task ID exists (if applicable)

### Before Start
- [ ] Run deps check
- [ ] Verify dependencies status
- [ ] Ask for --force if needed

### Before Done
- [ ] Confirm user has completed work
- [ ] Code committed
- [ ] Tests passing

### Before Archive
- [ ] Verify status is "completed"
- [ ] Run verify command
- [ ] Confirm 100% artifacts found
- [ ] Ask for --force only if user explicitly requests

### After Any Operation
- [ ] Parse output for success/failure
- [ ] Report result to user
- [ ] Suggest next step if applicable
