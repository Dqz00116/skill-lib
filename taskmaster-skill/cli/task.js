#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  logOperation,
  logStatusChange,
  logTaskAdded,
  logTaskArchived,
  logError,
  logQuery,
  readLogs,
  exportReport,
} from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

// 全局配置
let config = null;

/**
 * 加载配置文件
 */
async function loadConfig() {
  if (config) return config;

  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    config = JSON.parse(content);
    return config;
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(chalk.yellow('⚠️  配置文件不存在，创建默认配置'));
      config = createDefaultConfig();
      await saveConfig(config);
      return config;
    }
    throw e;
  }
}

/**
 * 保存配置文件
 */
async function saveConfig(cfg) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

/**
 * 创建默认配置
 */
function createDefaultConfig() {
  return {
    version: '1.0.0',
    description: 'TaskMaster CLI 配置文件',
    plans: {},
    settings: {
      defaultPlan: null,
      autoCreatePlan: false,
      logRetentionDays: 30,
    },
  };
}

/**
 * 获取 Plan 路径
 */
async function getPlanPath(planName) {
  const cfg = await loadConfig();

  if (cfg.plans[planName]) {
    return cfg.plans[planName].path;
  }

  // 如果配置中没有，尝试使用默认路径（向后兼容）
  const defaultPath = path.join(__dirname, '..', '..', planName);
  try {
    await fs.access(path.join(defaultPath, 'data.json'));
    return defaultPath;
  } catch {
    throw new Error(
      `Plan "${planName}" 未找到。请使用 "task config add ${planName} <path>" 添加配置。`
    );
  }
}

/**
 * 获取数据文件路径
 */
async function getDataFile(planName) {
  const planPath = await getPlanPath(planName);
  return path.join(planPath, 'data.json');
}

/**
 * 列出所有已配置的 plans
 */
async function listConfiguredPlans() {
  const cfg = await loadConfig();
  return Object.entries(cfg.plans).map(([name, info]) => ({
    name,
    ...info,
  }));
}

// 读取数据
async function loadData(planName) {
  const dataFile = await getDataFile(planName);
  const content = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(content);
}

// 保存数据
async function saveData(planName, data) {
  const dataFile = await getDataFile(planName);
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
}

// 状态映射
const STATUS_MAP = {
  pending: { icon: '🔵', label: '待开始', color: chalk.gray },
  in_progress: { icon: '🟡', label: '进行中', color: chalk.yellow },
  completed: { icon: '🟢', label: '已完成', color: chalk.green },
  blocked: { icon: '🔴', label: '已阻塞', color: chalk.red },
};

const PRIORITY_MAP = {
  P0: chalk.red.bold('P0'),
  P1: chalk.yellow('P1'),
  P2: chalk.gray('P2'),
};

// 格式化状态
function formatStatus(status) {
  const config = STATUS_MAP[status] || STATUS_MAP['pending'];
  return `${config.icon} ${config.color(config.label)}`;
}

// 格式化优先级
function formatPriority(priority) {
  return PRIORITY_MAP[priority] || priority;
}

// 检查依赖是否完成
function checkDependencies(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return { ready: true, pending: [] };
  }

  const pending = task.dependencies.filter(depId => {
    const dep = allTasks.find(t => t.id === depId);
    return !dep || dep.status !== 'completed';
  });

  return {
    ready: pending.length === 0,
    pending,
  };
}

// 列出可开始的任务
async function listReadyTasks(planName, options = {}) {
  const data = await loadData(planName);
  const allTasks = data.tasks;
  
  // 获取限制数量，默认10条
  const limit = parseInt(options.limit, 10) || 10;
  
  // 过滤出可开始的任务：pending 状态且所有依赖都已完成
  const readyTasks = allTasks
    .filter(task => {
      // 只显示待开始的任务
      if (task.status !== 'pending') return false;
      // 排除已归档的任务
      if (task.archived) return false;
      // 检查依赖是否全部完成
      const depCheck = checkDependencies(task, allTasks);
      return depCheck.ready;
    })
    .slice(0, limit);
  
  if (readyTasks.length === 0) {
    console.log(chalk.yellow('\n⚠️  当前没有可开始的任务\n'));
    console.log(chalk.gray('提示：'));
    console.log(chalk.gray('  - 使用 "task list <plan> --status pending" 查看所有待开始任务'));
    console.log(chalk.gray('  - 使用 "task progress <plan>" 查看整体进度'));
    console.log('');
    return;
  }
  
  console.log(chalk.bold(`\n🚀 ${data.meta.title} - 可开始的任务\n`));
  
  // 表格输出
  const table = new Table({
    head: ['ID', '阶段', '任务', '优先级', '工时'],
    colWidths: [12, 10, 45, 8, 8],
    style: { head: ['cyan'] },
  });
  
  readyTasks.forEach(task => {
    const hours = task.hours ? `${task.hours}h` : '-';
    table.push([
      chalk.cyan(task.id),
      task.phase,
      task.title.length > 42 ? task.title.substring(0, 40) + '...' : task.title,
      formatPriority(task.priority),
      chalk.gray(hours),
    ]);
  });
  
  console.log(table.toString());
  
  // 统计信息
  const totalReady = allTasks.filter(t => {
    if (t.status !== 'pending' || t.archived) return false;
    return checkDependencies(t, allTasks).ready;
  }).length;
  
  console.log(chalk.gray(`\n显示 ${readyTasks.length}/${totalReady} 个可开始任务 (${planName})`));
  
  if (totalReady > readyTasks.length) {
    console.log(chalk.gray(`使用 --limit ${totalReady} 查看全部`));
  }
  
  console.log(chalk.cyan('\n💡 开始任务:'));
  console.log(chalk.gray(`   task start ${planName} <task-id>`));
  console.log('');
  
  // 记录查询日志
  await logQuery('LIST_READY_TASKS', planName, { 
    displayed: readyTasks.length,
    total: totalReady,
    limit
  });
}

// 列出任务
async function listTasks(planName, options) {
  const data = await loadData(planName);
  let tasks = data.tasks;

  // 默认不显示已归档任务，除非指定 --archived
  if (!options.archived) {
    tasks = tasks.filter(t => !t.archived);
  }

  // 过滤
  if (options.phase) {
    tasks = tasks.filter(
      t => t.phase.toLowerCase().replace(' ', '_') === options.phase.toLowerCase()
    );
  }
  if (options.status) {
    tasks = tasks.filter(t => t.status === options.status);
  }
  if (options.priority) {
    tasks = tasks.filter(t => t.priority === options.priority);
  }

  // 表格输出
  const table = new Table({
    head: ['ID', '阶段', '任务', '优先级', '状态'],
    colWidths: [12, 10, 40, 8, 12],
    style: { head: ['cyan'] },
  });

  tasks.forEach(task => {
    const archivedMark = task.archived ? chalk.gray(' [已归档]') : '';
    table.push([
      chalk.cyan(task.id),
      task.phase,
      task.title.length > 37 ? task.title.substring(0, 35) + '...' : task.title + archivedMark,
      formatPriority(task.priority),
      formatStatus(task.status),
    ]);
  });

  console.log(table.toString());
  const archivedInfo = options.archived ? '（包含已归档）' : '';
  console.log(chalk.gray(`\n共 ${tasks.length} 个任务 ${archivedInfo}(${planName})`));
}

// 显示任务详情
async function showTask(planName, taskId) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    process.exit(1);
  }

  const depCheck = checkDependencies(task, data.tasks);

  console.log(chalk.bold('\n╔════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold(`║ ${task.id}: ${task.title.padEnd(44)}║`));
  console.log(chalk.bold('╚════════════════════════════════════════════════════════╝\n'));

  console.log(chalk.cyan('📋 描述:'));
  console.log(`  ${task.description}\n`);

  console.log(chalk.cyan('📊 基本信息:'));
  console.log(`  阶段:     ${task.phase}`);
  console.log(`  优先级:   ${formatPriority(task.priority)}`);
  console.log(`  状态:     ${formatStatus(task.status)}`);
  if (task.archived) {
    console.log(`  归档:     ${chalk.gray('✓ 已归档')}`);
  }
  if (task.hours) {
    console.log(`  工时:     ${task.hours}h`);
  }

  if (task.dependencies && task.dependencies.length > 0) {
    console.log(chalk.cyan('\n🔗 依赖任务:'));
    task.dependencies.forEach(depId => {
      const dep = data.tasks.find(t => t.id === depId);
      if (dep) {
        const status = dep.status === 'completed' ? chalk.green('✓') : chalk.yellow('○');
        console.log(`  ${status} ${depId}: ${dep.title}`);
      }
    });
    if (!depCheck.ready) {
      console.log(
        chalk.yellow(`\n  ⚠️  有 ${depCheck.pending.length} 个依赖未完成，暂不能开始此任务`)
      );
    }
  }

  console.log(chalk.cyan('\n🎯 验收标准:'));
  task.acceptance_criteria.forEach((criteria, idx) => {
    console.log(`  ${idx + 1}. ${criteria}`);
  });

  console.log(chalk.cyan('\n📁 输出产物:'));
  task.artifacts.forEach(artifact => {
    console.log(`  • ${artifact}`);
  });

  // 显示详细内容（如果存在）
  if (task.content) {
    if (task.content.background) {
      console.log(chalk.cyan('\n🎯 背景:'));
      console.log(`  ${task.content.background}`);
    }
    if (task.content.goals) {
      console.log(chalk.cyan('\n🎯 目标:'));
      console.log(`  ${task.content.goals}`);
    }
    if (task.content.technical_requirements) {
      console.log(chalk.cyan('\n🔧 技术要求:'));
      console.log(`  ${task.content.technical_requirements}`);
    }
    if (task.content.implementation_steps) {
      console.log(chalk.cyan('\n📝 实现步骤:'));
      task.content.implementation_steps.forEach((step, idx) => {
        console.log(`  ${idx + 1}. ${step}`);
      });
    }
    if (task.content.notes) {
      console.log(chalk.cyan('\n📝 备注:'));
      console.log(`  ${task.content.notes}`);
    }
    if (task.content.references) {
      console.log(chalk.cyan('\n📚 参考资料:'));
      console.log(`  ${task.content.references}`);
    }
  }

  console.log('');

  // 记录查看详情日志
  await logQuery('SHOW_TASK', planName, { taskId });
}

// 更新任务状态
async function updateTaskStatus(planName, taskId, newStatus, options = {}) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    process.exit(1);
  }

  // 检查依赖
  if (newStatus === 'in_progress' && !options.force) {
    const depCheck = checkDependencies(task, data.tasks);
    if (!depCheck.ready) {
      console.log(chalk.yellow('⚠️  以下依赖任务未完成:'));
      depCheck.pending.forEach(depId => {
        const dep = data.tasks.find(t => t.id === depId);
        console.log(`   - ${depId}: ${dep?.title || '未知任务'}`);
      });
      console.log(chalk.gray('\n使用 --force 强制开始'));
      process.exit(1);
    }
  }

  const oldStatus = task.status;
  task.status = newStatus;
  await saveData(planName, data);

  console.log(chalk.green(`✅ ${task.id} 状态已更新`));
  console.log(`   ${formatStatus(oldStatus)} → ${formatStatus(newStatus)}`);

  // 记录状态变更日志
  await logStatusChange(planName, taskId, oldStatus, newStatus, options);

  // 如果完成，提示归档
  if (newStatus === 'completed') {
    console.log(chalk.cyan(`\n💡 提示: 使用 'task archive ${planName} ${taskId}' 归档此任务`));
  }
}

// 归档任务（改为设置 archived 标志）
async function archiveTask(planName, taskId, options = {}) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    await logError('ARCHIVE_TASK', planName, taskId, new Error('任务不存在'));
    process.exit(1);
  }

  if (task.status !== 'completed') {
    console.log(chalk.yellow('⚠️  只有已完成的任务才能归档'));
    console.log(`   当前状态: ${formatStatus(task.status)}`);
    console.log(chalk.gray('   提示: 使用 task done 命令标记完成'));
    process.exit(1);
  }

  if (task.archived) {
    console.log(chalk.yellow(`⚠️  任务 ${taskId} 已归档`));
    return;
  }

  // 检查是否已通过核验
  if (!options.force) {
    // 读取日志检查是否已核验
    const logs = await readLogs({ plan: planName, operation: 'VERIFY_TASK', limit: 100 });
    const verified = logs.some(log => log.taskId === taskId && log.result === 'SUCCESS');
    
    if (!verified) {
      console.log(chalk.yellow(`\n⚠️  任务 ${taskId} 尚未通过核验`));
      console.log(chalk.cyan('\n📋 归档前必须通过核验检查'));
      console.log(chalk.gray('   核验命令: task verify ' + planName + ' ' + taskId));
      console.log(chalk.gray('   跳过核验: task archive ' + planName + ' ' + taskId + ' --force'));
      console.log('');
      console.log(chalk.cyan('💡 建议流程：'));
      console.log('   1. 运行核验: task verify ' + planName + ' ' + taskId);
      console.log('   2. 检查产物文件和验收标准');
      console.log('   3. 确认无误后归档\n');
      process.exit(1);
    }
  }

  task.archived = true;
  task.archived_at = new Date().toISOString();
  await saveData(planName, data);

  console.log(chalk.green(`✅ ${taskId} 已归档`));
  if (options.force) {
    console.log(chalk.yellow('   ⚠️  注意: 跳过了核验检查'));
  }

  // 记录归档日志
  await logTaskArchived(planName, taskId, { verified: !options.force });
}

// 取消归档
async function unarchiveTask(planName, taskId) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    process.exit(1);
  }

  if (!task.archived) {
    console.log(chalk.yellow(`⚠️  任务 ${taskId} 未归档`));
    return;
  }

  task.archived = false;
  delete task.archived_at;
  await saveData(planName, data);

  console.log(chalk.green(`✅ ${taskId} 已取消归档`));
}

// 显示进度
async function showProgress(planName) {
  const data = await loadData(planName);
  const tasks = data.tasks;
  const activeTasks = tasks.filter(t => !t.archived);

  // 进度统计包含所有任务（包括已归档），归档任务也算已完成
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = activeTasks.filter(t => t.status === 'in_progress').length;
  const pending = activeTasks.filter(t => t.status === 'pending').length;
  const blocked = activeTasks.filter(t => t.status === 'blocked').length;
  const archived = tasks.filter(t => t.archived).length;

  const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  console.log(chalk.bold(`\n📊 ${data.meta.title} 进度\n`));

  // 总体进度条 - 根据进度显示不同颜色
  const width = 40;
  const filled = Math.round((completed / total) * width);
  const empty = width - filled;

  // 进度条颜色：0%灰色，1-99%青色，100%绿色
  let barColor;
  if (percentage == 0) {
    barColor = chalk.gray;
  } else if (percentage >= 100) {
    barColor = chalk.green;
  } else {
    barColor = chalk.cyan;
  }

  const bar = barColor('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  console.log(`总体进度: [${bar}] ${percentage}%`);
  console.log(`          ${chalk.green(completed)}/${total} 任务完成\n`);

  // 状态统计
  console.log(chalk.cyan('状态分布:'));
  console.log(`  🟢 已完成:   ${chalk.green(completed)}`);
  console.log(`  🟡 进行中:   ${chalk.yellow(inProgress)}`);
  console.log(`  🔵 待开始:   ${chalk.gray(pending)}`);
  console.log(`  🔴 已阻塞:   ${chalk.red(blocked)}`);
  if (archived > 0) {
    console.log(`  📦 已归档:   ${chalk.gray(archived)}`);
  }

  // 阶段进度（包含所有任务，包括已归档）
  // 阶段名称映射：Phase 1 -> 基础架构
  const phaseNameMap = {};
  data.phases.forEach(phase => {
    // 从 phase.id (如 "phase_1") 提取数字
    const match = phase.id.match(/phase_(\d+)/);
    if (match) {
      phaseNameMap[`Phase ${parseInt(match[1], 10)}`] = phase.name;
      phaseNameMap[phase.name] = phase.name;
    }
  });

  console.log(chalk.cyan('\n阶段进度:'));
  data.phases.forEach(phase => {
    // 匹配任务的 phase 字段（如 "Phase 1"）
    const match = phase.id.match(/phase_(\d+)/);
    const phaseNumber = match ? parseInt(match[1], 10) : 0;
    const phaseTasks = tasks.filter(t => {
      // 支持 "Phase 1" 格式或直接使用阶段名
      return t.phase === `Phase ${phaseNumber}` || t.phase === phase.name;
    });
    const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;
    const phaseArchived = phaseTasks.filter(t => t.archived).length;
    const phasePercent =
      phaseTasks.length > 0 ? ((phaseCompleted / phaseTasks.length) * 100).toFixed(0) : 0;
    const bar = '█'.repeat(phasePercent / 5) + '░'.repeat(20 - phasePercent / 5);
    const archivedInfo = phaseArchived > 0 ? chalk.gray(` 已归档${phaseArchived}`) : '';
    console.log(
      `  ${phase.name.padEnd(8)} [${bar}] ${phasePercent}% (${phaseCompleted}/${phaseTasks.length})${archivedInfo}`
    );
  });

  // 待办任务
  const todoTasks = activeTasks.filter(t => t.status === 'pending' && t.priority === 'P0');
  if (todoTasks.length > 0) {
    console.log(chalk.cyan('\n🔥 待办 P0 任务:'));
    todoTasks.slice(0, 5).forEach(task => {
      const depCheck = checkDependencies(task, tasks);
      // 使用不同符号表示依赖状态：▶ 可开始，⏸ 有依赖阻塞
      const readyMark = depCheck.ready ? chalk.green('▶') : chalk.yellow('⏸');
      const statusText = depCheck.ready ? chalk.gray('(可开始)') : chalk.gray('(有依赖)');
      console.log(`  ${readyMark} ${task.id}: ${task.title} ${statusText}`);
    });
  }

  console.log('');

  // 记录进度查询日志
  await logQuery('SHOW_PROGRESS', planName, {
    total,
    completed,
    percentage,
  });
}

// 显示任务依赖关系
async function showTaskDependencies(planName, taskId, options = {}) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    await logError('SHOW_DEPS', planName, taskId, new Error('任务不存在'));
    process.exit(1);
  }

  console.log(chalk.bold(`\n🔗 ${taskId} 依赖关系\n`));
  console.log(`任务: ${task.title}`);
  console.log(`状态: ${formatStatus(task.status)}`);
  console.log('');

  const dependencies = task.dependencies || [];
  
  if (dependencies.length === 0) {
    console.log(chalk.yellow('⚠️  该任务没有依赖'));
    await logQuery('SHOW_DEPS', planName, { taskId, depCount: 0 });
    return;
  }

  console.log(chalk.cyan(`依赖任务 (${dependencies.length} 个):\n`));

  // 获取所有依赖任务的详细信息
  const depTasks = dependencies.map(depId => {
    const depTask = data.tasks.find(t => t.id === depId);
    return {
      id: depId,
      task: depTask,
      exists: !!depTask,
    };
  });

  // 统计
  let completed = 0;
  let inProgress = 0;
  let pending = 0;
  let blocked = 0;
  let notFound = 0;

  depTasks.forEach(({ id, task: depTask, exists }) => {
    if (!exists) {
      console.log(`  ${chalk.red('✗')} ${id}: ${chalk.red('任务不存在')}`);
      notFound++;
      return;
    }

    const isCompleted = depTask.status === 'completed';
    const isArchived = depTask.archived;

    if (isCompleted) {
      if (isArchived) {
        console.log(`  ${chalk.green('✓')} ${id}: ${depTask.title} ${chalk.gray('(已完成 · 已归档)')}`);
      } else {
        console.log(`  ${chalk.green('✓')} ${id}: ${depTask.title} ${chalk.gray('(已完成)')}`);
      }
      completed++;
    } else if (depTask.status === 'in_progress') {
      console.log(`  ${chalk.yellow('▶')} ${id}: ${depTask.title} ${chalk.gray('(进行中)')}`);
      inProgress++;
    } else if (depTask.status === 'blocked') {
      console.log(`  ${chalk.red('⏸')} ${id}: ${depTask.title} ${chalk.gray('(已阻塞)')}`);
      blocked++;
    } else {
      console.log(`  ${chalk.gray('○')} ${id}: ${depTask.title} ${chalk.gray('(待开始)')}`);
      pending++;
    }

    // 递归显示依赖（如果启用）
    if (options.recursive && depTask.dependencies && depTask.dependencies.length > 0) {
      const nestedDeps = depTask.dependencies;
      nestedDeps.forEach((nestedId, index) => {
        const nestedTask = data.tasks.find(t => t.id === nestedId);
        const isLast = index === nestedDeps.length - 1;
        const prefix = isLast ? '    └─ ' : '    ├─ ';
        
        if (nestedTask) {
          const status = nestedTask.status === 'completed' 
            ? chalk.green('✓') 
            : chalk.gray('○');
          console.log(`  ${prefix}${status} ${nestedId}: ${nestedTask.title}`);
        } else {
          console.log(`  ${prefix}${chalk.red('✗')} ${nestedId}: ${chalk.red('任务不存在')}`);
        }
      });
    }
  });

  console.log('');

  // 依赖就绪状态
  const depCheck = checkDependencies(task, data.tasks);
  
  if (depCheck.ready) {
    console.log(chalk.green('✅ 所有依赖已完成，任务可以开始'));
  } else {
    console.log(chalk.yellow('⏳ 依赖未就绪，暂不能开始'));
    if (depCheck.blocking && depCheck.blocking.length > 0) {
      console.log(chalk.gray(`   阻塞项: ${depCheck.blocking.join(', ')}`));
    }
  }

  console.log('');

  // 摘要
  console.log(chalk.cyan('📊 依赖状态摘要:'));
  console.log(`  ${chalk.green('✓')} 已完成: ${completed}`);
  if (inProgress > 0) console.log(`  ${chalk.yellow('▶')} 进行中: ${inProgress}`);
  if (pending > 0) console.log(`  ${chalk.gray('○')} 待开始: ${pending}`);
  if (blocked > 0) console.log(`  ${chalk.red('⏸')} 已阻塞: ${blocked}`);
  if (notFound > 0) console.log(`  ${chalk.red('✗')} 不存在: ${notFound}`);
  
  console.log('');

  await logQuery('SHOW_DEPS', planName, { 
    taskId, 
    depCount: dependencies.length,
    completed,
    ready: depCheck.ready 
  });
}

// 核验任务验收标准
async function verifyTask(planName, taskId, options = {}) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    await logError('VERIFY_TASK', planName, taskId, new Error('任务不存在'));
    process.exit(1);
  }

  console.log(chalk.bold(`\n🔍 核验任务: ${taskId} - ${task.title}\n`));

  // 显示任务基本信息
  console.log(chalk.cyan('任务信息:'));
  console.log(`  状态: ${formatStatus(task.status)}`);
  console.log(`  优先级: ${formatPriority(task.priority)}`);
  console.log(`  阶段: ${task.phase}`);
  console.log('');

  // 检查验收标准
  const criteria = task.acceptance_criteria || [];
  if (criteria.length === 0) {
    console.log(chalk.yellow('⚠️  该任务没有定义验收标准'));
    return;
  }

  console.log(chalk.cyan(`验收标准 (${criteria.length} 项):`));
  console.log('');

  // 自动检查产物文件
  const artifacts = task.artifacts || [];
  const artifactStatus = [];
  
  if (artifacts.length > 0 && !options.skipArtifacts) {
    console.log(chalk.cyan('📦 产物文件检查:'));
    const planPath = await getPlanPath(planName);
    
    for (const artifact of artifacts) {
      // 尝试多种路径解析方式
      const possiblePaths = [
        path.join(planPath, artifact),
        path.join(planPath, '..', '..', '..', artifact),
        path.resolve(artifact),
      ];
      
      let found = false;
      let foundPath = '';
      
      for (const tryPath of possiblePaths) {
        try {
          await fs.access(tryPath);
          found = true;
          foundPath = tryPath;
          break;
        } catch {
          continue;
        }
      }
      
      artifactStatus.push({
        artifact,
        exists: found,
        path: foundPath,
      });
      
      if (found) {
        console.log(`  ${chalk.green('✓')} ${artifact}`);
        if (options.verbose) {
          console.log(`    ${chalk.gray('路径: ' + foundPath)}`);
        }
      } else {
        console.log(`  ${chalk.red('✗')} ${artifact} ${chalk.gray('(未找到)')}`);
      }
    }
    console.log('');
  }

  // 显示验收标准清单
  console.log(chalk.cyan('📋 验收标准清单:'));
  criteria.forEach((criterion, index) => {
    console.log(`  ${index + 1}. ${criterion}`);
  });
  console.log('');

  // 如果是交互模式，让用户确认每项标准
  let verifiedCount = 0;
  let failedCount = 0;

  if (options.interactive) {
    console.log(chalk.yellow('⚠️  交互模式需要在 CLI 中安装 inquirer 包'));
    console.log(chalk.gray('   运行: npm install inquirer\n'));
  }

  // 生成核验报告
  const report = {
    taskId,
    taskTitle: task.title,
    status: task.status,
    verifiedAt: new Date().toISOString(),
    criteria: {
      total: criteria.length,
      verified: verifiedCount,
      failed: failedCount,
    },
    artifacts: {
      total: artifacts.length,
      found: artifactStatus.filter(a => a.exists).length,
      missing: artifactStatus.filter(a => !a.exists).length,
      details: artifactStatus,
    },
  };

  // 显示核验摘要
  console.log(chalk.cyan('📊 核验摘要:'));
  console.log(`  验收标准: ${criteria.length} 项`);
  
  if (artifacts.length > 0) {
    const foundCount = artifactStatus.filter(a => a.exists).length;
    const artifactPercent = Math.round((foundCount / artifacts.length) * 100);
    
    if (foundCount === artifacts.length) {
      console.log(`  产物文件: ${chalk.green(`${foundCount}/${artifacts.length} (${artifactPercent}%)`)}`);
    } else {
      console.log(`  产物文件: ${chalk.yellow(`${foundCount}/${artifacts.length} (${artifactPercent}%)`)}`);
    }
  }
  
  console.log('');

  // 根据状态给出建议
  if (task.status !== 'completed') {
    console.log(chalk.yellow('⚠️  注意: 该任务尚未标记为完成'));
    console.log(chalk.gray('   使用: task done ' + planName + ' ' + taskId));
    console.log('');
  }

  // 如果有缺失的产物文件
  const missingArtifacts = artifactStatus.filter(a => !a.exists);
  if (missingArtifacts.length > 0) {
    console.log(chalk.red('❌ 缺失的产物文件:'));
    missingArtifacts.forEach(a => {
      console.log(`   - ${a.artifact}`);
    });
    console.log('');
  }

  // 记录核验操作
  await logOperation({
    operation: 'VERIFY_TASK',
    plan: planName,
    taskId: taskId,
    result: 'SUCCESS',
    metadata: {
      criteriaCount: criteria.length,
      artifactCount: artifacts.length,
      foundArtifacts: artifactStatus.filter(a => a.exists).length,
    },
  });

  // 如果指定了输出文件，保存报告
  if (options.output) {
    await fs.writeFile(options.output, JSON.stringify(report, null, 2), 'utf-8');
    console.log(chalk.green(`✅ 核验报告已保存: ${options.output}`));
  }

  return report;
}

// 添加新任务
async function addTask(planName, options) {
  const data = await loadData(planName);

  // 生成任务ID
  const taskNumber = data.tasks.length + 1;
  const taskId = `TASK-${String(taskNumber).padStart(3, '0')}`;

  // 处理验收标准（支持换行分隔）
  let acceptanceCriteria = [];
  if (options.criteria) {
    acceptanceCriteria = options.criteria.split(/\r?\n/).filter(c => c.trim());
  }

  // 处理实现步骤
  let implementationSteps = [];
  if (options.steps) {
    implementationSteps = options.steps.split(/\r?\n/).filter(s => s.trim());
  }

  // 处理输出产物
  let artifacts = [];
  if (options.artifacts) {
    artifacts = options.artifacts
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
  }

  // 处理依赖
  let dependencies = [];
  if (options.depends) {
    dependencies = options.depends
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
  }

  // 构建任务对象
  const newTask = {
    id: taskId,
    phase: options.phase || 'Phase 1',
    title: options.title,
    description: options.description || '',
    hours: options.hours ? parseInt(options.hours, 10) : undefined,
    priority: options.priority || 'P1',
    status: 'pending',
    archived: false,
    dependencies,
    acceptance_criteria: acceptanceCriteria,
    artifacts,
    created_at: new Date().toISOString(),
    // 详细内容存储在 content 字段
    content: {
      background: options.background || '',
      goals: options.goals || '',
      technical_requirements: options.tech || '',
      implementation_steps: implementationSteps,
      notes: options.notes || '',
      references: options.references || '',
    },
  };

  // 添加到数据
  data.tasks.push(newTask);
  data.meta.total_tasks = data.tasks.length;

  await saveData(planName, data);

  console.log(chalk.green(`✅ 任务 ${taskId} 已创建`));
  console.log(`   标题: ${newTask.title}`);
  console.log(`   阶段: ${newTask.phase}`);
  console.log(`   优先级: ${formatPriority(newTask.priority)}`);

  if (newTask.dependencies.length > 0) {
    console.log(chalk.yellow(`\n🔗 依赖: ${newTask.dependencies.join(', ')}`));
  }

  // 记录添加任务日志
  await logTaskAdded(planName, newTask, options);
}

// 编辑任务
async function editTask(planName, taskId, options) {
  const data = await loadData(planName);
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    process.exit(1);
  }

  // 更新字段
  if (options.title) task.title = options.title;
  if (options.phase) task.phase = options.phase;
  if (options.priority) task.priority = options.priority;
  if (options.description) task.description = options.description;
  if (options.hours) task.hours = parseInt(options.hours, 10);

  // 更新 content 中的字段
  if (!task.content) task.content = {};
  if (options.background) task.content.background = options.background;
  if (options.goals) task.content.goals = options.goals;
  if (options.tech) task.content.technical_requirements = options.tech;
  if (options.notes) task.content.notes = options.notes;
  if (options.references) task.content.references = options.references;

  // 更新数组字段（追加模式）
  if (options.criteria) {
    const newCriteria = options.criteria.split(/\r?\n/).filter(c => c.trim());
    task.acceptance_criteria = [...(task.acceptance_criteria || []), ...newCriteria];
  }
  if (options.artifacts) {
    const newArtifacts = options.artifacts
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
    task.artifacts = [...(task.artifacts || []), ...newArtifacts];
  }
  if (options.steps) {
    const newSteps = options.steps.split(/\r?\n/).filter(s => s.trim());
    task.content.implementation_steps = [...(task.content.implementation_steps || []), ...newSteps];
  }

  task.updated_at = new Date().toISOString();
  await saveData(planName, data);

  console.log(chalk.green(`✅ 任务 ${taskId} 已更新`));
}

// 删除任务
async function deleteTask(planName, taskId, options) {
  const data = await loadData(planName);
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    console.log(chalk.red(`❌ 任务 ${taskId} 不存在`));
    process.exit(1);
  }

  const task = data.tasks[taskIndex];

  if (!options.force) {
    console.log(chalk.yellow(`⚠️  确认删除任务 ${taskId}: ${task.title}?`));
    console.log(chalk.gray('使用 --force 强制删除'));
    process.exit(1);
  }

  data.tasks.splice(taskIndex, 1);
  data.meta.total_tasks = data.tasks.length;
  await saveData(planName, data);

  console.log(chalk.green(`✅ 任务 ${taskId} 已删除`));

  await logOperation({
    operation: 'TASK_DELETED',
    plan: planName,
    taskId,
    result: 'SUCCESS',
  });
}

// 列出所有计划
async function listPlans() {
  const cfg = await loadConfig();
  const planEntries = Object.entries(cfg.plans);
  const plans = [];

  for (const [name, info] of planEntries) {
    try {
      const data = await loadData(name);
      const activeTasks = data.tasks.filter(t => !t.archived);
      const completed = activeTasks.filter(t => t.status === 'completed').length;
      const total = activeTasks.length;
      plans.push({
        name,
        title: data.meta?.title || info.description || name,
        path: info.path,
        progress: `${completed}/${total}`,
        percentage: total > 0 ? ((completed / total) * 100).toFixed(0) : 0,
      });
    } catch (e) {
      // 计划配置存在但数据文件无法访问
      plans.push({
        name,
        title: info.description || name,
        path: info.path,
        progress: 'N/A',
        percentage: 'N/A',
        error: true,
      });
    }
  }

  console.log(chalk.bold('\n📁 可用计划项目:\n'));

  const table = new Table({
    head: ['名称', '描述/标题', '路径', '进度', '完成率'],
    colWidths: [15, 30, 35, 10, 10],
    style: { head: ['cyan'] },
  });

  plans.forEach(plan => {
    table.push([
      chalk.cyan(plan.name),
      plan.title,
      chalk.gray(plan.path),
      plan.progress,
      plan.percentage !== 'N/A' ? plan.percentage + '%' : chalk.gray('N/A'),
    ]);
  });

  console.log(table.toString());
  console.log(chalk.gray(`\n共 ${plans.length} 个计划项目`));
  console.log(chalk.cyan('\n使用: task <plan-name> <command>'));
  console.log(chalk.gray('使用: task config add <name> <path> 添加新计划'));

  // 记录查询日志
  await logQuery('LIST_PLANS', null, { count: plans.length });
  console.log('');
}

// 主程序
const program = new Command();

program.name('task').description('AgentFabric 任务管理 CLI').version('1.0.0');

// 默认列出计划
program.command('plans').description('列出所有计划项目').action(listPlans);

// 使用方式: task <plan> <command>
program
  .command('list <plan>')
  .description('列出任务')
  .option('-p, --phase <phase>', '按阶段过滤')
  .option('-s, --status <status>', '按状态过滤')
  .option('-P, --priority <priority>', '按优先级过滤')
  .option('-a, --archived', '显示已归档任务')
  .action(async (plan, options) => {
    await listTasks(plan, options);
  });

program
  .command('show <plan> <taskId>')
  .description('显示任务详情')
  .action(async (plan, taskId) => {
    await showTask(plan, taskId);
  });

program
  .command('start <plan> <taskId>')
  .description('开始任务')
  .option('-f, --force', '强制开始（忽略依赖检查）')
  .action(async (plan, taskId, options) => {
    await updateTaskStatus(plan, taskId, 'in_progress', options);
  });

program
  .command('done <plan> <taskId>')
  .description('标记任务完成')
  .action(async (plan, taskId) => {
    await updateTaskStatus(plan, taskId, 'completed');
  });

program
  .command('block <plan> <taskId>')
  .description('标记任务阻塞')
  .action(async (plan, taskId) => {
    await updateTaskStatus(plan, taskId, 'blocked');
  });

program
  .command('archive <plan> <taskId>')
  .description('归档任务')
  .option('-f, --force', '强制归档（跳过核验检查）')
  .action(async (plan, taskId, options) => {
    await archiveTask(plan, taskId, options);
  });

program
  .command('unarchive <plan> <taskId>')
  .description('取消归档任务')
  .action(async (plan, taskId) => {
    await unarchiveTask(plan, taskId);
  });

program
  .command('progress <plan>')
  .description('显示整体进度')
  .action(async plan => {
    await showProgress(plan);
  });

program
  .command('add <plan>')
  .description('添加新任务')
  .requiredOption('-t, --title <title>', '任务标题（必填）')
  .option('-p, --phase <phase>', '所属阶段', 'Phase 1')
  .option('-P, --priority <priority>', '优先级 (P0/P1/P2)', 'P1')
  .option('-d, --description <desc>', '任务描述')
  .option('--hours <hours>', '工时')
  .option('--depends <deps>', '依赖任务，逗号分隔（如：TASK-001,TASK-002）')
  .option('--criteria <criteria>', '验收标准，每行一条（使用\\n分隔）')
  .option('--artifacts <artifacts>', '输出产物，逗号分隔（如：file1.ts,file2.ts）')
  .option('--background <bg>', '任务背景')
  .option('--goals <goals>', '任务目标')
  .option('--tech <tech>', '技术要求')
  .option('--steps <steps>', '实现步骤，每行一条')
  .option('--notes <notes>', '备注')
  .option('--references <refs>', '参考资料')
  .action(async (plan, options) => {
    await addTask(plan, options);
  });

program
  .command('edit <plan> <taskId>')
  .description('编辑任务')
  .option('-t, --title <title>', '任务标题')
  .option('-p, --phase <phase>', '所属阶段')
  .option('-P, --priority <priority>', '优先级')
  .option('-d, --description <desc>', '任务描述')
  .option('--hours <hours>', '工时')
  .option('--criteria <criteria>', '追加验收标准')
  .option('--artifacts <artifacts>', '追加输出产物')
  .option('--background <bg>', '任务背景')
  .option('--goals <goals>', '任务目标')
  .option('--tech <tech>', '技术要求')
  .option('--steps <steps>', '追加实现步骤')
  .option('--notes <notes>', '备注')
  .option('--references <refs>', '参考资料')
  .action(async (plan, taskId, options) => {
    await editTask(plan, taskId, options);
  });

program
  .command('delete <plan> <taskId>')
  .description('删除任务')
  .option('-f, --force', '强制删除')
  .action(async (plan, taskId, options) => {
    await deleteTask(plan, taskId, options);
  });

// 配置管理命令
program
  .command('config')
  .description('配置管理')
  .addCommand(
    new Command('list').description('列出所有配置').action(async () => {
      const cfg = await loadConfig();
      console.log(chalk.bold('\n⚙️  当前配置:\n'));
      console.log(`配置文件: ${CONFIG_FILE}`);
      console.log(`版本: ${cfg.version}`);
      console.log(`默认计划: ${cfg.settings.defaultPlan || '未设置'}`);
      console.log(chalk.cyan('\n已配置的计划:'));

      const table = new Table({
        head: ['名称', '路径', '描述'],
        colWidths: [15, 50, 30],
        style: { head: ['cyan'] },
      });

      Object.entries(cfg.plans).forEach(([name, info]) => {
        table.push([name, info.path, info.description || '']);
      });

      console.log(table.toString());
      console.log('');
    })
  )
  .addCommand(
    new Command('add <name> <path>')
      .description('添加计划配置')
      .option('-d, --description <desc>', '计划描述')
      .action(async (name, planPath, options) => {
        const cfg = await loadConfig();
        const resolvedPath = path.resolve(planPath);

        // 检查路径是否存在
        try {
          await fs.access(resolvedPath);
        } catch {
          console.log(chalk.yellow(`⚠️  警告: 路径 ${resolvedPath} 不存在`));
        }

        cfg.plans[name] = {
          path: resolvedPath,
          description: options.description || '',
        };

        await saveConfig(cfg);
        console.log(chalk.green(`✅ 计划 "${name}" 已添加到配置`));
        console.log(`   路径: ${resolvedPath}`);
      })
  )
  .addCommand(
    new Command('remove <name>').description('移除计划配置').action(async name => {
      const cfg = await loadConfig();
      if (!cfg.plans[name]) {
        console.log(chalk.red(`❌ 计划 "${name}" 不存在`));
        return;
      }
      delete cfg.plans[name];
      await saveConfig(cfg);
      console.log(chalk.green(`✅ 计划 "${name}" 已从配置中移除`));
    })
  )
  .addCommand(
    new Command('set-default <name>').description('设置默认计划').action(async name => {
      const cfg = await loadConfig();
      if (!cfg.plans[name]) {
        console.log(chalk.red(`❌ 计划 "${name}" 不存在，请先添加配置`));
        return;
      }
      cfg.settings.defaultPlan = name;
      await saveConfig(cfg);
      console.log(chalk.green(`✅ 默认计划已设置为 "${name}"`));
    })
  );

// 快捷命令
program
  .command('ls <plan>')
  .description('列出任务（list 别名）')
  .action(async plan => {
    await listTasks(plan, {});
  });

program
  .command('p <plan>')
  .description('显示进度（progress 别名）')
  .action(async plan => {
    await showProgress(plan);
  });

// 日志和报告命令
program
  .command('logs')
  .description('查看操作日志')
  .option('-n, --limit <number>', '显示条数', '20')
  .option('-p, --plan <plan>', '按计划过滤')
  .option('-o, --operation <op>', '按操作类型过滤')
  .action(async options => {
    const logs = await readLogs({
      limit: parseInt(options.limit, 10),
      plan: options.plan,
      operation: options.operation,
    });

    if (logs.length === 0) {
      console.log(chalk.yellow('暂无操作日志'));
      return;
    }

    console.log(chalk.bold(`\n📜 最近 ${logs.length} 条操作日志\n`));

    const table = new Table({
      head: ['时间', '操作', '计划', '任务', '详情'],
      colWidths: [22, 16, 12, 12, 35],
      style: { head: ['cyan'] },
    });

    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      table.push([
        chalk.gray(time),
        log.operation,
        log.plan || '-',
        log.taskId || '-',
        log.details || log.result || '-',
      ]);
    });

    console.log(table.toString());
    console.log('');
  });

program
  .command('deps <plan> <taskId>')
  .description('列出任务的依赖任务')
  .option('-r, --recursive', '递归显示依赖的依赖')
  .action(async (plan, taskId, options) => {
    await showTaskDependencies(plan, taskId, options);
  });

program
  .command('ready <plan>')
  .description('列出可开始的任务（依赖已完成）')
  .option('-l, --limit <number>', '显示条数上限', '10')
  .action(async (plan, options) => {
    await listReadyTasks(plan, options);
  });

program
  .command('verify <plan> <taskId>')
  .description('核验任务验收标准')
  .option('-o, --output <path>', '导出核验报告到文件')
  .option('-v, --verbose', '显示详细信息')
  .option('--skip-artifacts', '跳过产物文件检查')
  .option('--interactive', '交互式确认每项标准（需安装 inquirer）')
  .action(async (plan, taskId, options) => {
    await verifyTask(plan, taskId, options);
  });

program
  .command('report <plan>')
  .description('导出操作报告')
  .option('-o, --output <path>', '输出路径')
  .action(async (plan, options) => {
    const outputPath = options.output || `${plan}_report_${Date.now()}.json`;
    try {
      const report = await exportReport(plan, outputPath);
      console.log(chalk.green(`✅ 报告已导出: ${outputPath}`));
      console.log(chalk.cyan(`\n📊 ${plan} 操作统计:`));
      console.log(`   总操作数: ${report.summary.totalOperations}`);
      console.log(`   状态变更: ${report.summary.statusChanges}`);
      console.log(`   新增任务: ${report.summary.tasksAdded}`);
      console.log(`   归档任务: ${report.summary.tasksArchived}`);
      console.log(`   错误次数: ${report.summary.errors}`);
    } catch (e) {
      console.log(chalk.red(`❌ 导出失败: ${e.message}`));
    }
  });

program.parse();

// 如果没有参数，显示帮助
if (process.argv.length <= 2) {
  listPlans();
}
