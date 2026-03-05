/**
 * TaskMaster CLI 操作日志模块
 * 记录所有任务操作行为，支持审计和追溯
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志文件路径
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'operations.log');
const JSON_LOG_FILE = path.join(LOG_DIR, 'operations.jsonl');

/**
 * 确保日志目录存在
 */
async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (e) {
    // 目录已存在或创建失败
  }
}

/**
 * 获取当前时间戳
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

/**
 * 获取当前用户信息（环境变量或系统信息）
 */
function getUserInfo() {
  return {
    username: process.env.USER || process.env.USERNAME || 'unknown',
    hostname: process.env.COMPUTERNAME || process.env.HOSTNAME || 'unknown',
  };
}

/**
 * 写入文本格式日志
 */
async function writeTextLog(entry) {
  await ensureLogDir();

  const { timestamp, level, operation, plan, taskId, user, details, result } = entry;
  const logLine =
    `[${timestamp}] [${level}] [${user.username}] ${operation}` +
    (plan ? ` [${plan}]` : '') +
    (taskId ? ` [${taskId}]` : '') +
    (result ? ` - ${result}` : '') +
    (details ? `: ${details}` : '') +
    '\n';

  await fs.appendFile(LOG_FILE, logLine, 'utf-8');
}

/**
 * 写入 JSON Lines 格式日志（结构化，便于程序解析）
 */
async function writeJsonLog(entry) {
  await ensureLogDir();

  const logEntry = {
    timestamp: entry.timestamp,
    level: entry.level,
    operation: entry.operation,
    plan: entry.plan || null,
    taskId: entry.taskId || null,
    user: entry.user,
    details: entry.details || null,
    result: entry.result || null,
    metadata: entry.metadata || {},
  };

  await fs.appendFile(JSON_LOG_FILE, JSON.stringify(logEntry) + '\n', 'utf-8');
}

/**
 * 记录操作日志
 */
export async function logOperation({
  level = 'INFO',
  operation,
  plan,
  taskId,
  details,
  result,
  metadata = {},
}) {
  const entry = {
    timestamp: getTimestamp(),
    level,
    operation,
    plan,
    taskId,
    user: getUserInfo(),
    details,
    result,
    metadata,
  };

  try {
    // 同时写入两种格式的日志
    await Promise.all([writeTextLog(entry), writeJsonLog(entry)]);
  } catch (error) {
    // 日志写入失败不应影响主程序，但应输出到 stderr
    console.error('Failed to write log:', error.message);
  }
}

/**
 * 快捷方法：记录任务状态变更
 */
export async function logStatusChange(plan, taskId, oldStatus, newStatus, options = {}) {
  await logOperation({
    operation: 'STATUS_CHANGE',
    plan,
    taskId,
    details: `${oldStatus} → ${newStatus}`,
    result: 'SUCCESS',
    metadata: {
      oldStatus,
      newStatus,
      force: options.force || false,
    },
  });
}

/**
 * 快捷方法：记录任务添加
 */
export async function logTaskAdded(plan, task, options = {}) {
  await logOperation({
    operation: 'TASK_ADDED',
    plan,
    taskId: task.id,
    details: task.title,
    result: 'SUCCESS',
    metadata: {
      phase: task.phase,
      priority: task.priority,
      dependencies: task.dependencies || [],
      hasDescription: !!task.description,
      hasCriteria: (task.acceptance_criteria || []).length > 0,
      hasArtifacts: (task.artifacts || []).length > 0,
    },
  });
}

/**
 * 快捷方法：记录任务归档
 */
export async function logTaskArchived(plan, taskId, options = {}) {
  await logOperation({
    operation: 'TASK_ARCHIVED',
    plan,
    taskId,
    result: 'SUCCESS',
    metadata: {
      verified: options.verified !== undefined ? options.verified : true,
    },
  });
}

/**
 * 快捷方法：记录错误
 */
export async function logError(operation, plan, taskId, error) {
  await logOperation({
    level: 'ERROR',
    operation,
    plan,
    taskId,
    details: error.message,
    result: 'FAILED',
    metadata: {
      errorStack: error.stack,
    },
  });
}

/**
 * 快捷方法：记录查询操作
 */
export async function logQuery(operation, plan, filters = {}) {
  await logOperation({
    operation,
    plan,
    details: Object.keys(filters).length > 0 ? JSON.stringify(filters) : 'no filters',
    result: 'SUCCESS',
  });
}

/**
 * 读取日志（用于查询历史）
 */
export async function readLogs(options = {}) {
  const { limit = 100, operation, plan, taskId, since, until } = options;

  try {
    const content = await fs.readFile(JSON_LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    let logs = lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // 过滤
    if (operation) {
      logs = logs.filter(l => l.operation === operation);
    }
    if (plan) {
      logs = logs.filter(l => l.plan === plan);
    }
    if (taskId) {
      logs = logs.filter(l => l.taskId === taskId);
    }
    if (since) {
      logs = logs.filter(l => new Date(l.timestamp) >= new Date(since));
    }
    if (until) {
      logs = logs.filter(l => new Date(l.timestamp) <= new Date(until));
    }

    // 倒序排列（最新的在前）
    logs.reverse();

    // 限制数量
    return logs.slice(0, limit);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return [];
    }
    throw e;
  }
}

/**
 * 导出日志为报告
 */
export async function exportReport(plan, outputPath) {
  const logs = await readLogs({ limit: 1000, plan });

  const report = {
    generatedAt: new Date().toISOString(),
    plan,
    summary: {
      totalOperations: logs.length,
      statusChanges: logs.filter(l => l.operation === 'STATUS_CHANGE').length,
      tasksAdded: logs.filter(l => l.operation === 'TASK_ADDED').length,
      tasksArchived: logs.filter(l => l.operation === 'TASK_ARCHIVED').length,
      errors: logs.filter(l => l.level === 'ERROR').length,
    },
    recentActivity: logs.slice(0, 50),
  };

  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  return report;
}

export default {
  logOperation,
  logStatusChange,
  logTaskAdded,
  logTaskArchived,
  logError,
  logQuery,
  readLogs,
  exportReport,
};
