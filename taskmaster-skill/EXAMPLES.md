# TaskMaster Examples

> Scenario-based execution patterns for Agent reference.

---

## Example Index

| Scenario | User Intent | Reference |
|----------|-------------|-----------|
| [New Member Onboarding](#scenario-1-new-member-onboarding) | "How to get started" | Multi-step guidance |
| [Development Workflow](#scenario-2-development-workflow) | "Start task" → "Complete task" | Standard workflow |
| [Project Manager Check](#scenario-3-project-manager-check) | "How is progress" | Progress + reporting |
| [View Ready Tasks](#scenario-4-view-ready-tasks) | "Which tasks can I start" | Ready task query |
| [Adding New Task](#scenario-5-adding-new-task) | "Add task" | Parameter collection |
| [Quality Verification](#scenario-6-quality-verification) | "Verify task" | Verify workflow |
| [Troubleshooting](#scenario-7-troubleshooting) | "Cannot archive" | Error recovery |

---

## Scenario 1: New Member Onboarding

### User Input
> "I just joined the project and want to get up to speed"

### Agent Execution Flow

```
Step 1: List available plans
  Command: task plans
  Parse: Show all plans with progress
  Output to user:
    "Available plans:
     - mvp_v1: AgentFabric MVP v1 (8/29 completed)"

Step 2: Show plan overview
  Command: task progress mvp_v1
  Parse: Extract key metrics
  Output to user:
    "Project overview:
     - Overall progress: 27.6%
     - Completed: 8/29 tasks
     - Ready to start: 21 tasks
     - P0 pending: 5 tasks"

Step 3: List pending P0 tasks
  Command: task list mvp_v1 --status pending --priority P0
  Parse: Task IDs and titles
  Output to user:
    "Ready-to-start P0 tasks:
     - TASK-008: API Authentication Mechanism
     - TASK-009: Rate Limiting and Circuit Breaker
     - TASK-013: Agent Registry Implementation"

Step 4: Provide next steps
  Suggest: "Use 'view TASK-008 details' to learn about the specific task"
```

---

## Scenario 2: Development Workflow

### Phase A: Starting Task

#### User Input
> "I want to start developing TASK-011"

#### Agent Execution

```
Step 1: Check dependencies
  Command: task deps mvp_v1 TASK-011
  
  Parse output:
    IF "All dependencies completed":
      Proceed to Step 2
    IF "Dependencies not ready":
      Extract: TASK-008 (pending)
      Ask: "Dependency TASK-008 is not completed. Force start? (requires --force)"
      
Step 2: Start task
  Command: task start mvp_v1 TASK-011
  Verify: Output contains "Status updated"
  Confirm: "TASK-011 started"
```

### Phase B: Completing Task

#### User Input
> "TASK-011 is completed"

#### Agent Execution

```
Step 1: Verify current status
  Command: task show mvp_v1 TASK-011
  Check: status is "in_progress"

Step 2: Mark complete
  Command: task done mvp_v1 TASK-011
  Verify: Output contains "Status updated"

Step 3: Execute verification (REQUIRED)
  Command: task verify mvp_v1 TASK-011
  
  Parse:
    IF "Artifact files: X/Y (100%)":
      can_archive = true
    IF "Missing artifact files":
      can_archive = false
      Extract: missing files list

Step 4: Handle result
  IF can_archive:
    Ask: "Verification passed. Archive?"
    IF yes:
      Command: task archive mvp_v1 TASK-011
      Confirm: "Archived"
  ELSE:
    Report: "Missing files found: [list]
             Please add them and re-verify"
```

---

## Scenario 3: Project Manager Check

### User Input
> "How is the project progressing this week"

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
    "This week's project progress:
     - Overall progress: 27.6% (+5%)
     - Completed this week: 3 tasks
     - In progress: 2 tasks
     - P0 ready to start: 5 tasks
     
     Detailed report saved to: ./reports/week_xxx.json"
```

---

## Scenario 4: View Ready Tasks

### User Input
> "Which tasks can I start?"

### Agent Execution

```
Step 1: Query ready tasks (default 10)
  Command: task ready mvp_v1
  
  Output example:
    "🚀 AgentFabric MVP v1 - Ready-to-start Tasks
    
     ID        | Phase    | Task                       | Priority | Hours
     ----------|----------|----------------------------|----------|-------
     TASK-010  | Phase 2  | Health Check Interface     | P1       | 4h
     TASK-018  | Phase 4  | Middleware Chain Framework | P0       | 6h
     TASK-022  | Phase 5  | Context Management         | P1       | 6h
     
     Showing 3/8 ready-to-start tasks (mvp_v1)
     
     💡 Start task: task start mvp_v1 <task-id>"

Step 2: If user wants to see more
  Command: task ready mvp_v1 --limit 20

Step 3: User selects task to start
  Command: task start mvp_v1 TASK-018
  Confirm: "TASK-018 started"
```

### Alternative User Input
> "List the top 5 ready-to-start tasks"

### Agent Execution
```
Command: task ready mvp_v1 --limit 5
Output: Top 5 ready tasks with details
```

---

## Scenario 5: Adding New Task

### User Input
> "Need to add a cache warming feature"

### Agent Execution

```
Step 1: Collect required parameters
  Ask: "What is the task title?"
  Receive: "Implement cache warming feature"

Step 2: Collect optional parameters
  Ask: "Which phase? (default: Phase 4)"
  Receive: "Phase 4"
  
  Ask: "Priority? (default: P1)"
  Receive: "P1"
  
  Ask: "Task description?"
  Receive: "Preload hot data to Redis on application startup"
  
  Ask: "Depends on which tasks? (comma-separated)"
  Receive: "TASK-004"
  
  Ask: "Acceptance criteria? (one per line)"
  Receive: "Auto-warm on startup\nSupport configurable warming strategy\nWarming failure does not affect startup"
  
  Ask: "Output artifacts? (comma-separated paths)"
  Receive: "src/services/cache-warmer.ts"

Step 3: Build command
  Command: |
    task add mvp_v1 \
      -t "Implement cache warming feature" \
      -p "Phase 4" \
      -P "P1" \
      -d "Preload hot data to Redis on application startup" \
      --depends "TASK-004" \
      --criteria "Auto-warm on startup\nSupport configurable warming strategy\nWarming failure does not affect startup" \
      --artifacts "src/services/cache-warmer.ts"

Step 4: Execute and confirm
  Parse output: Extract new task ID (e.g., "TASK-030")
  Confirm: "Task TASK-030 created"
```

---

## Scenario 6: Quality Verification

### User Input
> "Help me check if TASK-001 meets the archive conditions"

### Agent Execution

```
Step 1: Check current status
  Command: task show mvp_v1 TASK-001
  Extract: status field

Step 2: If not completed, report
  IF status != "completed":
    Output: "Task status is {status}, needs to be marked done first (task done)"
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
      "Verification passed!
       - All artifact files exist
       - Acceptance criteria defined
       - Can archive: task archive mvp_v1 TASK-001"
  ELSE:
    Output: |
      "Verification failed!
       - Artifact completeness: Z%
       - Missing files: [list]
       - Please add files and re-verify"
```

---

## Scenario 7: Troubleshooting

### User Input
> "Why can't TASK-003 be archived"

### Agent Execution

```
Step 1: Attempt archive to see error
  Command: task archive mvp_v1 TASK-003
  Capture error: "Not yet verified"

Step 2: Identify root cause
  Analysis: Missing verification step
  
Step 3: Execute resolution
  Command: task verify mvp_v1 TASK-003
  
  Parse:
    IF verification passes:
      Command: task archive mvp_v1 TASK-003
      Confirm: "Archived"
    IF verification fails:
      Extract: missing artifacts
      Output: "Verification failed, missing files: [list]
               Please add them and retry"

Step 4: Document resolution
  Output: |
    "Problem cause: Verification not executed
     Solution: Verification executed and archived
     Recommended workflow: done → verify → archive"
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
User: "Start TASK-999"
Agent:
  Command: task start mvp_v1 TASK-999
  Error: "Task does not exist"
  Recovery:
    Command: task list mvp_v1 --status pending
    Output to user: "Available tasks: TASK-001, TASK-002, ..."
    Ask: "Please select the correct task ID"
```

### Error: Dependencies Not Ready
```
User: "Start TASK-011"
Agent:
  Command: task deps mvp_v1 TASK-011
  Output: "Dependencies not ready: TASK-008 (pending)"
  Ask: "Dependencies not completed. Force start? (requires --force)"
  
  IF user confirms:
    Command: task start mvp_v1 TASK-011 --force
  ELSE:
    Output: "Please complete dependency task TASK-008 first"
```

### Error: Archive Without Verify
```
User: "Archive TASK-001"
Agent:
  Command: task archive mvp_v1 TASK-001
  Error: "Not yet verified"
  Recovery:
    Command: task verify mvp_v1 TASK-001
    IF passes:
      Command: task archive mvp_v1 TASK-001
      Confirm: "Archived"
    ELSE:
      Output: "Verification failed, please add missing files"
```
