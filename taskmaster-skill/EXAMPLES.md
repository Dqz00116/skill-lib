# TaskMaster Examples

> Scenario-based execution patterns for Agent reference.

---

## Example Index

| Scenario | User Intent | Reference |
|----------|-------------|-----------|
| [新成员加入](#scenario-1-new-member-onboarding) | "如何开始" | Multi-step guidance |
| [开发流程](#scenario-2-development-workflow) | "开始任务" → "完成任务" | Standard workflow |
| [项目经理检查](#scenario-3-project-manager-check) | "进度如何" | Progress + reporting |
| [查看可开始任务](#scenario-4-view-ready-tasks) | "有哪些任务可以开始" | Ready task query |
| [添加任务](#scenario-5-adding-new-task) | "添加任务" | Parameter collection |
| [质量核验](#scenario-6-quality-verification) | "核验任务" | Verify workflow |
| [问题排查](#scenario-7-troubleshooting) | "无法归档" | Error recovery |

---

## Scenario 1: New Member Onboarding

### User Input
> "我刚加入项目，想了解情况"

### Agent Execution Flow

```
Step 1: List available plans
  Command: task plans
  Parse: Show all plans with progress
  Output to user:
    "可用计划:
     - mvp_v1: AgentFabric MVP v1 (8/29 完成)"

Step 2: Show plan overview
  Command: task progress mvp_v1
  Parse: Extract key metrics
  Output to user:
    "项目概况:
     - 总体进度: 27.6%
     - 已完成: 8/29 任务
     - 待开始: 21 任务
     - P0 待办: 5 任务"

Step 3: List pending P0 tasks
  Command: task list mvp_v1 --status pending --priority P0
  Parse: Task IDs and titles
  Output to user:
    "可开始的 P0 任务:
     - TASK-008: API 认证机制
     - TASK-009: 限流与熔断
     - TASK-013: Agent Registry 实现"

Step 4: Provide next steps
  Suggest: "使用 '查看 TASK-008 详情' 了解具体任务"
```

---

## Scenario 2: Development Workflow

### Phase A: Starting Task

#### User Input
> "我要开始开发 TASK-011"

#### Agent Execution

```
Step 1: Check dependencies
  Command: task deps mvp_v1 TASK-011
  
  Parse output:
    IF "所有依赖已完成":
      Proceed to Step 2
    IF "依赖未就绪":
      Extract: TASK-008 (待开始)
      Ask: "依赖 TASK-008 未完成，是否强制开始？(需要 --force)"
      
Step 2: Start task
  Command: task start mvp_v1 TASK-011
  Verify: Output contains "状态已更新"
  Confirm: "TASK-011 已开始"
```

### Phase B: Completing Task

#### User Input
> "TASK-011 完成了"

#### Agent Execution

```
Step 1: Verify current status
  Command: task show mvp_v1 TASK-011
  Check: status is "in_progress"

Step 2: Mark complete
  Command: task done mvp_v1 TASK-011
  Verify: Output contains "状态已更新"

Step 3: Execute verification (REQUIRED)
  Command: task verify mvp_v1 TASK-011
  
  Parse:
    IF "产物文件: X/Y (100%)":
      can_archive = true
    IF "缺失的产物文件":
      can_archive = false
      Extract: missing files list

Step 4: Handle result
  IF can_archive:
    Ask: "核验通过，是否归档？"
    IF yes:
      Command: task archive mvp_v1 TASK-011
      Confirm: "已归档"
  ELSE:
    Report: "发现缺失文件: [list]
             请补充后重新核验"
```

---

## Scenario 3: Project Manager Check

### User Input
> "这周项目进展如何"

### Agent Execution

```
Step 1: Get overall progress
  Command: task progress mvp_v1
  Extract:
    - Overall percentage
    - Completed/Total
    - Phase progress
    - P0 pending count

Step 2: Get weekly activity
  Command: task logs -p mvp_v1 -n 50
  Parse:
    - Status changes this week
    - Tasks completed
    - Verifications done

Step 3: Generate report
  Command: task report mvp_v1 -o ./reports/week_$(date).json

Step 4: Compile summary
  Output to user:
    "本周项目进展:
     - 总体进度: 27.6% (+5%)
     - 本周完成: 3 任务
     - 进行中: 2 任务
     - 待开始 P0: 5 任务
     
     详细报告已保存至: ./reports/week_xxx.json"
```

---

## Scenario 4: View Ready Tasks

### User Input
> "有哪些任务可以开始？"

### Agent Execution

```
Step 1: Query ready tasks (default 10)
  Command: task ready mvp_v1
  
  Output example:
    "🚀 AgentFabric MVP v1 - 可开始的任务
    
     ID        | 阶段     | 任务                    | 优先级 | 工时
     ----------|----------|------------------------|--------|------
     TASK-010  | Phase 2  | 健康检查接口            | P1     | 4h
     TASK-018  | Phase 4  | 中间件链框架            | P0     | 6h
     TASK-022  | Phase 5  | 上下文管理              | P1     | 6h
     
     显示 3/8 个可开始任务 (mvp_v1)
     
     💡 开始任务: task start mvp_v1 <task-id>"

Step 2: If user wants to see more
  Command: task ready mvp_v1 --limit 20

Step 3: User selects task to start
  Command: task start mvp_v1 TASK-018
  Confirm: "TASK-018 已开始"
```

### Alternative User Input
> "列出前5个可以开始的任务"

### Agent Execution
```
Command: task ready mvp_v1 --limit 5
Output: Top 5 ready tasks with details
```

---

## Scenario 5: Adding New Task

### User Input
> "需要添加一个缓存预热功能"

### Agent Execution

```
Step 1: Collect required parameters
  Ask: "任务标题是什么？"
  Receive: "实现缓存预热功能"

Step 2: Collect optional parameters
  Ask: "所属阶段？(默认: Phase 4)"
  Receive: "Phase 4"
  
  Ask: "优先级？(默认: P1)"
  Receive: "P1"
  
  Ask: "任务描述？"
  Receive: "在应用启动时预加载热点数据到 Redis"
  
  Ask: "依赖哪些任务？(逗号分隔)"
  Receive: "TASK-004"
  
  Ask: "验收标准？(每项一行)"
  Receive: "启动时自动预热\n支持配置预热策略\n预热失败不影响启动"
  
  Ask: "输出产物？(逗号分隔路径)"
  Receive: "src/services/cache-warmer.ts"

Step 3: Build command
  Command: |
    task add mvp_v1 \
      -t "实现缓存预热功能" \
      -p "Phase 4" \
      -P "P1" \
      -d "在应用启动时预加载热点数据到 Redis" \
      --depends "TASK-004" \
      --criteria "启动时自动预热\n支持配置预热策略\n预热失败不影响启动" \
      --artifacts "src/services/cache-warmer.ts"

Step 4: Execute and confirm
  Parse output: Extract new task ID (e.g., "TASK-030")
  Confirm: "任务 TASK-030 已创建"
```

---

## Scenario 6: Quality Verification

### User Input
> "帮我检查 TASK-001 是否满足归档条件"

### Agent Execution

```
Step 1: Check current status
  Command: task show mvp_v1 TASK-001
  Extract: status field

Step 2: If not completed, report
  IF status != "completed":
    Output: "任务状态为 {status}，需先标记完成 (task done)"
    Stop

Step 3: Run verification
  Command: task verify mvp_v1 TASK-001 --verbose
  
  Parse output:
    - Task status: completed
    - Artifacts: X/Y (Z%)
    - Missing artifacts: [list or empty]

Step 4: Analyze result
  IF artifacts == 100%:
    Output: |
      "核验通过！
       - 所有产物文件存在
       - 验收标准已定义
       - 可执行归档: task archive mvp_v1 TASK-001"
  ELSE:
    Output: |
      "核验未通过！
       - 产物完整度: Z%
       - 缺失文件: [list]
       - 请补充文件后重新核验"
```

---

## Scenario 7: Troubleshooting

### User Input
> "为什么 TASK-003 无法归档"

### Agent Execution

```
Step 1: Attempt archive to see error
  Command: task archive mvp_v1 TASK-003
  Capture error: "尚未通过核验"

Step 2: Identify root cause
  Analysis: Missing verification step
  
Step 3: Execute resolution
  Command: task verify mvp_v1 TASK-003
  
  Parse:
    IF verification passes:
      Command: task archive mvp_v1 TASK-003
      Confirm: "已归档"
    IF verification fails:
      Extract: missing artifacts
      Output: "核验失败，缺失文件: [list]
               请补充后重新尝试"

Step 4: Document resolution
  Output: |
    "问题原因: 未执行核验
     解决方案: 已执行核验并归档
     建议流程: done → verify → archive"
```

---

## Common Command Sequences

### Sequence: Daily Standup
```bash
# 1. Get progress
task progress mvp_v1

# 2. Get in-progress tasks
task list mvp_v1 --status in_progress

# 3. Get ready-to-start tasks
task ready mvp_v1

# 4. Get pending P0
task list mvp_v1 --status pending --priority P0
```

### Sequence: Task Handoff
```bash
# 1. Check dependencies
task deps mvp_v1 TASK-XXX --recursive

# 2. View task details
task show mvp_v1 TASK-XXX

# 3. Start task
task start mvp_v1 TASK-XXX
```

### Sequence: Sprint Review
```bash
# 1. Overall progress
task progress mvp_v1

# 2. Completed this sprint
task logs -p mvp_v1 -o STATUS_CHANGE -n 50

# 3. Generate report
task report mvp_v1 -o ./sprint_report.json
```

### Sequence: Audit Investigation
```bash
# 1. Check task history
task logs -p mvp_v1 | grep TASK-XXX

# 2. Check verification history
task logs -p mvp_v1 -o VERIFY_TASK | grep TASK-XXX

# 3. Check archive history
task logs -p mvp_v1 -o TASK_ARCHIVED | grep TASK-XXX
```

---

## Error Recovery Examples

### Error: Task Not Found
```
User: "开始 TASK-999"
Agent:
  Command: task start mvp_v1 TASK-999
  Error: "任务不存在"
  Recovery:
    Command: task list mvp_v1 --status pending
    Output to user: "可用任务: TASK-001, TASK-002, ..."
    Ask: "请选择正确的任务ID"
```

### Error: Dependencies Not Ready
```
User: "开始 TASK-011"
Agent:
  Command: task deps mvp_v1 TASK-011
  Output: "依赖未就绪: TASK-008 (待开始)"
  Ask: "依赖未完成，是否强制开始？(需要 --force)"
  
  IF user confirms:
    Command: task start mvp_v1 TASK-011 --force
  ELSE:
    Output: "请先完成依赖任务 TASK-008"
```

### Error: Archive Without Verify
```
User: "归档 TASK-001"
Agent:
  Command: task archive mvp_v1 TASK-001
  Error: "尚未通过核验"
  Recovery:
    Command: task verify mvp_v1 TASK-001
    IF passes:
      Command: task archive mvp_v1 TASK-001
      Confirm: "已归档"
    ELSE:
      Output: "核验失败，请补充缺失文件"
```
