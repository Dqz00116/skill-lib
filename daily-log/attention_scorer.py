"""
Attention Scorer for Daily Logs
计算任务注意力权重 (0-10)
"""

def calculate_task_attention(task_description, details=""):
    """
    计算任务的注意力权重
    
    Args:
        task_description: 任务描述
        details: 任务详情（可选）
    
    Returns:
        score (0-10), level (High/Medium/Low), reasons (list)
    """
    score = 0
    reasons = []
    text = (task_description + " " + details).lower()
    
    # 关键决策 (+3)
    decision_keywords = ["决策", "确认", "方案", "批准", "选择", "确定", "规范"]
    if any(kw in text for kw in decision_keywords):
        score += 3
        reasons.append("关键决策 (+3)")
    
    # 教训/错误 (+3)
    lesson_keywords = ["错误", "教训", "违反", "修复", "问题", "bug", "失败"]
    if any(kw in text for kw in lesson_keywords):
        score += 3
        reasons.append("教训/错误 (+3)")
    
    # 里程碑 (+2)
    milestone_keywords = ["完成", "发布", "部署", "上线", "mvp", "验收", "通过"]
    if any(kw in text for kw in milestone_keywords):
        score += 2
        reasons.append("里程碑 (+2)")
    
    # 文件变更 (+1 per file, max 2)
    file_keywords = ["创建", "修改", "删除", "新增", "更新", "重构"]
    file_changes = sum(1 for kw in file_keywords if kw in text)
    file_score = min(file_changes, 2)
    if file_score > 0:
        score += file_score
        reasons.append(f"文件变更 (+{file_score})")
    
    # 限制最大10
    score = min(score, 10)
    
    # 确定级别
    if score >= 8:
        level = "High"
    elif score >= 5:
        level = "Medium"
    else:
        level = "Low"
    
    return score, level, reasons


def format_task_by_attention(task_name, score, level, summary, key_details=None, lesson=None):
    """
    根据注意力级别格式化任务输出
    """
    if level == "High":
        output = f"### {task_name} (权重: {score}/10)\n\n"
        output += f"**一句话总结**: {summary}\n\n"
        
        if key_details:
            output += "**关键细节**:\n"
            for detail in key_details:
                output += f"- {detail}\n"
            output += "\n"
        
        if lesson:
            output += f"**经验教训**: {lesson}\n\n"
        
        return output
    
    elif level == "Medium":
        return f"| {task_name} | {score}/10 | {summary} |\n"
    
    else:  # Low
        return f"- {task_name} - {summary}\n"


def extract_key_details(content, max_items=4):
    """
    从内容中提取关键细节
    
    寻找包含以下特征的内容：
    - 具体数字/数据
    - 文件路径
    - 决策原因
    - 验证结果
    """
    import re
    
    details = []
    sentences = content.replace("\n", " ").split("。")
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        score = 0
        detail = sentence
        
        # 包含数字
        if re.search(r'\d+', sentence):
            score += 2
        
        # 包含路径
        if '/' in sentence or '\\' in sentence:
            score += 2
        
        # 包含关键词
        key_keywords = ["决策", "原因", "验证", "结果", "使用", "改为", "添加"]
        if any(kw in sentence for kw in key_keywords):
            score += 1
        
        if score >= 2 and len(detail) < 100:  # 限制长度
            details.append(detail)
    
    return details[:max_items]


def generate_attention_log(date, tasks, total_tokens, git_commits=0, start_time="--:--", end_time="--:--"):
    """
    生成注意力驱动的日志
    
    Args:
        date: 日期字符串 YYYY-MM-DD
        tasks: [(name, time_range, description, details), ...]  # time_range: "HH:MM-HH:MM"
        total_tokens: 总token消耗
        git_commits: git提交次数
        start_time: 开始时间 HH:MM
        end_time: 结束时间 HH:MM
    """
    high_tasks = []
    medium_tasks = []
    low_tasks = []
    
    for task_data in tasks:
        if len(task_data) == 4:
            task_name, time_range, desc, details = task_data
        else:
            task_name, desc, details = task_data
            time_range = ""
        
        score, level, reasons = calculate_task_attention(desc, details)
        key_details = extract_key_details(details) if details else []
        
        # 简单提取可能的教训（包含"教训"的句子）
        lesson = None
        if "教训" in details or "错误" in details:
            sentences = details.split("。")
            for s in sentences:
                if "教训" in s or "错误" in s or "改进" in s:
                    lesson = s.strip()
                    break
        
        if level == "High":
            high_tasks.append((task_name, time_range, score, desc, key_details, lesson))
        elif level == "Medium":
            medium_tasks.append((task_name, time_range, score, desc))
        else:
            low_tasks.append((task_name, time_range, score, desc))
    
    # 生成日志
    log = f"# {date} 操作日志\n\n"
    log += "## 📅 会话概览\n"
    log += f"- **日期**: {date}\n"
    log += f"- **工作时段**: {start_time} - {end_time}\n"
    
    # 核心成果：最高注意力任务的总结
    if high_tasks:
        core_result = high_tasks[0][3][:50] + "..." if len(high_tasks[0][3]) > 50 else high_tasks[0][3]
        log += f"- **核心成果**: {core_result}\n"
    
    log += f"- **关键决策**: {len([t for t in high_tasks if '决策' in t[3]])} 个\n"
    log += f"- **经验教训**: {len([t for t in high_tasks if t[5]])} 个\n"
    log += f"- **Token 消耗**: ~{total_tokens:,}\n\n"
    
    log += "---\n\n"
    
    # 时间分布
    log += "## ⏱️ 时间分布\n\n"
    log += "| 时段 | 任务 | 注意力权重 |\n"
    log += "|------|------|-----------|\n"
    
    all_tasks = []
    for task in high_tasks:
        all_tasks.append((task[1], task[0], task[2], "High"))  # (time_range, name, score)
    for task in medium_tasks:
        all_tasks.append((task[1], task[0], task[2], "Medium"))
    for task in low_tasks:
        all_tasks.append((task[1], task[0], task[2], "Low"))
    
    # 按时间排序
    all_tasks.sort(key=lambda x: x[0] if x[0] else "")
    
    for time_range, task_name, score, level in all_tasks:
        time_display = time_range if time_range else "--:--"
        log += f"| {time_display} | {task_name} | {score}/10 |\n"
    
    log += "\n---\n\n"
    
    # 高注意力任务
    if high_tasks:
        log += "## 🎯 高注意力任务 (权重 8-10)\n\n"
        for task_name, time_range, score, summary, key_details, lesson in high_tasks:
            time_str = f"时段: {time_range}" if time_range else ""
            log += f"### {task_name} (权重: {score}/10, {time_str})\n\n"
            log += f"**一句话总结**: {summary}\n\n"
            
            if key_details:
                log += "**关键细节**:\n"
                for detail in key_details:
                    log += f"- {detail}\n"
                log += "\n"
            
            if lesson:
                log += f"**经验教训**: {lesson}\n\n"
            
            log += "---\n\n"
    
    # 中注意力任务
    if medium_tasks:
        log += "## 📋 中注意力任务 (权重 5-7)\n\n"
        log += "| 任务 | 权重 | 时段 | 关键成果 |\n"
        log += "|------|------|------|----------|\n"
        for task_name, time_range, score, summary in medium_tasks:
            time_str = time_range if time_range else "--:--"
            log += f"| {task_name} | {score}/10 | {time_str} | {summary} |\n"
        log += "\n---\n\n"
    
    # 低注意力任务
    if low_tasks:
        log += "## 📝 低注意力任务 (权重 0-4)\n\n"
        for task_name, time_range, score, summary in low_tasks:
            time_str = f"[{time_range}] " if time_range else ""
            log += f"- {time_str}{task_name} - {summary}\n"
        log += "\n---\n\n"
    
    # 统计
    log += "## 📊 今日统计\n\n"
    log += "| 项目 | 数值 |\n"
    log += "|------|------|\n"
    log += f"| 高注意力任务 | {len(high_tasks)} |\n"
    log += f"| 中注意力任务 | {len(medium_tasks)} |\n"
    log += f"| 低注意力任务 | {len(low_tasks)} |\n"
    log += f"| Token 消耗 | ~{total_tokens:,} |\n"
    log += f"| Git 提交 | {git_commits} |\n\n"
    
    # 最大教训
    if high_tasks and any(t[4] for t in high_tasks):
        log += "---\n\n"
        log += "## 💡 今日最大教训\n\n"
        for _, _, _, _, lesson in high_tasks:
            if lesson:
                log += f"**一句话总结**: {lesson[:80]}...\n\n" if len(lesson) > 80 else f"**一句话总结**: {lesson}\n\n"
                break
    
    log += "\n"
    log += f"*日志生成时间: {date}*  "
    log += f"*注意力评分: 高{len(high_tasks)} 中{len(medium_tasks)} 低{len(low_tasks)}*\n"
    
    return log


# 示例用法
if __name__ == "__main__":
    # 测试示例
    tasks = [
        ("查看系统状态", "检查了OpenClaw状态，运行正常", ""),
        ("MissionSystem MVP代码生成", "完成6个新文件+8个修改文件，创建PlayerMissionSystem", "静态数据表使用RTS_PACK + ParseMapEntry特化。编译错误修复: BinaryReader→TK::FMemReader。使用TK_SERIAL简化序列化。"),
        ("设计规范确认", "确认了命名规范和接口规范", "选择了方案B，使用TK_SERIAL。确认PlayerSubsystem类名规范。"),
        ("编译修复", "修复了10+处编译错误", "发现了BinaryReader使用错误，教训是必须先检查依赖。改进了错误处理流程。"),
        ("git status检查", "查看了git状态", ""),
    ]
    
    log = generate_attention_log("2026-02-11", tasks, 80000, 5)
    print(log)
