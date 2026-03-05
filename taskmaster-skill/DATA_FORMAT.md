# TaskMaster Data Format

> JSON schema specifications for Agent parsing.

---

## Data File Location

```yaml
primary_file: {plan_path}/data.json
format: JSON
encoding: UTF-8
backup: Not automatic, manual recommended
```

---

## Root Schema

```json
{
  "version": "string",
  "created_at": "string (ISO date)",
  "meta": "object (MetaSchema)",
  "phases": "array (PhaseSchema)",
  "tasks": "array (TaskSchema)"
}
```

### Root Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | Yes | Data format version (e.g., "1.0.0") |
| created_at | string | Yes | Creation date (ISO 8601) |
| meta | object | Yes | Plan metadata |
| phases | array | Yes | Phase definitions |
| tasks | array | Yes | Task list |

---

## Meta Schema

```json
{
  "title": "string",
  "estimated_weeks": "number",
  "total_hours": "number",
  "total_tasks": "number"
}
```

| Field | Type | Description |
|-------|------|-------------|
| title | string | Plan name/title |
| estimated_weeks | number | Estimated duration in weeks |
| total_hours | number | Total estimated hours |
| total_tasks | number | Total task count (auto-calculated) |

---

## Phase Schema

```json
{
  "id": "string",
  "name": "string",
  "week": "string",
  "deliverable": "string",
  "task_count": "number",
  "hours": "number"
}
```

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Phase identifier | "phase_1" |
| name | string | Display name | "基础架构" |
| week | string | Timeframe | "Week 1" |
| deliverable | string | Phase output | "项目骨架、数据库" |
| task_count | number | Number of tasks | 6 |
| hours | number | Estimated hours | 26 |

**Phase ID Format:**
```yaml
pattern: "phase_{number}"
examples:
  - "phase_1"
  - "phase_2"
  - "phase_10"
```

**Task Phase Reference:**
```yaml
task.phase: "Phase {number}"
matches: phases[].id "phase_{number}"

example:
  task.phase: "Phase 1"
  matches: phase.id: "phase_1"
```

---

## Task Schema

```json
{
  "id": "string",
  "phase": "string",
  "title": "string",
  "description": "string",
  "hours": "number",
  "status": "enum",
  "priority": "enum",
  "archived": "boolean",
  "archived_at": "string (nullable)",
  "created_at": "string",
  "updated_at": "string",
  "dependencies": "array",
  "acceptance_criteria": "array",
  "artifacts": "array",
  "content": "object"
}
```

### Task Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Task identifier (TASK-NNN) |
| phase | string | Yes | Phase name (e.g., "Phase 1") |
| title | string | Yes | Task title |
| description | string | No | Task description |
| hours | number | No | Estimated hours |
| status | enum | Yes | Current status |
| priority | enum | Yes | Task priority |
| archived | boolean | Yes | Archive flag |
| archived_at | string | No | Archive timestamp (ISO 8601) |
| created_at | string | Yes | Creation timestamp |
| updated_at | string | Yes | Last update timestamp |
| dependencies | array | Yes | List of task IDs |
| acceptance_criteria | array | Yes | List of criteria strings |
| artifacts | array | Yes | List of file paths |
| content | object | Yes | Detailed content object |

### Status Enum

```yaml
allowed_values:
  - pending       # 待开始
  - in_progress   # 进行中
  - completed     # 已完成
  - blocked       # 已阻塞

transitions:
  pending:
    - in_progress
    - blocked
  in_progress:
    - completed
    - blocked
  blocked:
    - in_progress
  completed:
    - archived (via archive operation)
```

### Priority Enum

```yaml
allowed_values:
  - P0  # Must complete, blocks others
  - P1  # Important, recommended
  - P2  # Optional

default: P1
```

### Dependencies Array

```yaml
type: array of strings
item_pattern: "TASK-{number}"
example:
  - "TASK-001"
  - "TASK-002"

empty: []  # No dependencies
```

### Acceptance Criteria Array

```yaml
type: array of strings
item: Criterion description
example:
  - "npm run dev 可启动开发服务器"
  - "npm run build 无错误"
  - "单元测试覆盖率 >= 80%"

empty: []  # No criteria defined
```

### Artifacts Array

```yaml
type: array of strings
item: Relative file path
example:
  - "package.json"
  - "src/app.ts"
  - "tests/app.test.ts"
  - "docs/api.md"

path_formats:
  - Relative to plan directory
  - Relative to project root
  - Absolute path (less common)

empty: []  # No artifacts defined
```

### Content Object

```json
{
  "background": "string",
  "goals": "string",
  "technical_requirements": "string",
  "implementation_steps": "array",
  "notes": "string",
  "references": "string"
}
```

| Field | Type | Description |
|-------|------|-------------|
| background | string | Task context and background |
| goals | string | Task objectives |
| technical_requirements | string | Technical specs |
| implementation_steps | array | Step-by-step guide |
| notes | string | Additional notes |
| references | string | Reference materials |

---

## Config File Format

**Location:** `taskmaster-skill/config.json`

```json
{
  "version": "string",
  "plans": "object (PlanConfigMap)",
  "settings": "object (SettingsSchema)"
}
```

### PlanConfigMap

```json
{
  "plan_name": {
    "path": "string (absolute path)",
    "description": "string"
  }
}
```

**Example:**
```json
{
  "mvp_v1": {
    "path": "E:\\Agent\\agent-fabric\\docs\\plans\\mvp_v1",
    "description": "AgentFabric MVP v1 实施计划"
  }
}
```

### SettingsSchema

```json
{
  "defaultPlan": "string (plan name)",
  "autoCreatePlan": "boolean",
  "logRetentionDays": "number"
}
```

---

## Log Format

### Text Log

**Location:** `taskmaster-skill/logs/operations.log`

```
[{timestamp}] [{level}] [{user}] {operation} [{plan}] [{taskId}] - {result}: {details}
```

**Example:**
```
[2026-03-04T12:00:00.000Z] [INFO] [username] STATUS_CHANGE [mvp_v1] [TASK-001] - SUCCESS: pending → completed
```

### JSON Lines Log

**Location:** `taskmaster-skill/logs/operations.jsonl`

```json
{
  "timestamp": "string (ISO 8601)",
  "level": "enum[DEBUG,INFO,WARN,ERROR]",
  "operation": "string",
  "plan": "string (nullable)",
  "taskId": "string (nullable)",
  "user": {
    "username": "string",
    "hostname": "string"
  },
  "details": "string (nullable)",
  "result": "enum[SUCCESS,FAILED] (nullable)",
  "metadata": "object"
}
```

**Common Operation Types:**
- `STATUS_CHANGE` - Task status changed
- `VERIFY_TASK` - Task verification
- `TASK_ARCHIVED` - Task archived
- `TASK_ADDED` - New task created
- `TASK_DELETED` - Task deleted
- `SHOW_PROGRESS` - Progress viewed
- `LIST_TASKS` - Tasks listed

---

## Data Validation Rules

### Task ID Format
```yaml
pattern: "TASK-{number}"
regex: /^TASK-\d{3,}$/
examples:
  valid:
    - "TASK-001"
    - "TASK-010"
    - "TASK-100"
  invalid:
    - "task-001"      # lowercase
    - "TASK-1"        # too short
    - "TASK_001"      # underscore
    - "001"           # no prefix
```

### DateTime Format
```yaml
format: ISO 8601
example: "2026-03-04T12:00:00.000Z"
```

### Required Fields Check
```yaml
minimal_task:
  required:
    - id
    - phase
    - title
    - status
    - priority
    - archived
    - dependencies
    - acceptance_criteria
    - artifacts
    - created_at
    - updated_at
```

---

## Data Access Patterns

### Find Task by ID
```javascript
task = data.tasks.find(t => t.id === "TASK-001")
```

### Filter by Status
```javascript
tasks = data.tasks.filter(t => t.status === "completed" && !t.archived)
```

### Filter by Priority
```javascript
p0_tasks = data.tasks.filter(t => t.priority === "P0" && t.status === "pending")
```

### Check Dependencies
```javascript
deps_completed = task.dependencies.every(depId => {
  dep = data.tasks.find(t => t.id === depId)
  return dep && dep.status === "completed"
})
```
