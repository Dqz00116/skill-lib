"""
Code Analysis Attention Focus Module
代码分析注意力聚焦模块

基于启发式规则识别代码中的核心组件
"""

import re
from typing import List, Tuple, Dict

class CodeAttentionScorer:
    """代码注意力评分器"""
    
    # 高权重关键词（核心组件标识）
    HIGH_WEIGHT_KEYWORDS = [
        'manager', 'controller', 'handler', 'system', 'core',
        'engine', 'service', 'manager', 'subsystem', 'manager',
        '主', '核心', '管理器', '控制器', '处理器', '系统'
    ]
    
    # 中权重关键词（重要组件标识）
    MEDIUM_WEIGHT_KEYWORDS = [
        'helper', 'util', 'factory', 'provider', 'repository',
        '策略', '工厂', '提供者', '存储库'
    ]
    
    def __init__(self):
        self.score_weights = {
            'keyword_match': 3,      # 关键词匹配
            'line_count': 2,         # 代码行数
            'reference_count': 2,    # 被引用次数
            'complexity': 1,         # 复杂度指标
        }
    
    def score_class_or_function(self, name: str, code: str, references: List[str] = None) -> Tuple[int, List[str]]:
        """
        为类或函数计算注意力分数
        
        Args:
            name: 类名或函数名
            code: 代码内容
            references: 引用此组件的其他文件列表
            
        Returns:
            (score, reasons) - 分数(0-10)和原因列表
        """
        score = 0
        reasons = []
        
        name_lower = name.lower()
        
        # 1. 关键词匹配
        for keyword in self.HIGH_WEIGHT_KEYWORDS:
            if keyword in name_lower:
                score += self.score_weights['keyword_match']
                reasons.append(f"核心关键词匹配 '{keyword}' (+{self.score_weights['keyword_match']})")
                break
        
        for keyword in self.MEDIUM_WEIGHT_KEYWORDS:
            if keyword in name_lower:
                score += self.score_weights['keyword_match'] - 1
                reasons.append(f"重要关键词匹配 '{keyword}' (+{self.score_weights['keyword_match']-1})")
                break
        
        # 2. 代码行数
        line_count = len(code.split('\n'))
        if line_count > 100:
            score += self.score_weights['line_count']
            reasons.append(f"代码行数较多 ({line_count}行) (+{self.score_weights['line_count']})")
        elif line_count > 50:
            score += self.score_weights['line_count'] - 1
            reasons.append(f"代码行数中等 ({line_count}行) (+{self.score_weights['line_count']-1})")
        
        # 3. 被引用次数
        if references:
            ref_count = len(references)
            if ref_count > 5:
                score += self.score_weights['reference_count']
                reasons.append(f"被多处引用 ({ref_count}处) (+{self.score_weights['reference_count']})")
            elif ref_count > 2:
                score += self.score_weights['reference_count'] - 1
                reasons.append(f"被少量引用 ({ref_count}处) (+{self.score_weights['reference_count']-1})")
        
        # 4. 简单复杂度指标（方法数、条件语句数）
        method_count = len(re.findall(r'(void|int|string|bool|float|double)\s+\w+\s*\(', code))
        if_condition_count = code.count('if (') + code.count('if(')
        
        if method_count > 10 or if_condition_count > 5:
            score += self.score_weights['complexity']
            reasons.append(f"复杂度较高 (方法:{method_count}, 条件:{if_condition_count}) (+{self.score_weights['complexity']})")
        
        # 限制最大10分
        score = min(score, 10)
        
        return score, reasons
    
    def analyze_code_structure(self, file_content: str, file_name: str = "") -> List[Dict]:
        """
        分析代码结构，识别核心组件
        
        Args:
            file_content: 文件内容
            file_name: 文件名（可选，用于额外评分）
            
        Returns:
            组件列表，按注意力分数排序
        """
        components = []
        
        # 提取类定义（简化版，基于常见模式）
        class_pattern = r'class\s+(\w+)\s*(?::\s*\w+)?\s*\{'
        classes = re.findall(class_pattern, file_content)
        
        for class_name in classes:
            # 提取类内容（简化提取，实际应该用AST）
            class_start = file_content.find(f'class {class_name}')
            class_end = file_content.find('};', class_start)
            if class_end == -1:
                class_end = len(file_content)
            class_code = file_content[class_start:class_end]
            
            score, reasons = self.score_class_or_function(class_name, class_code)
            
            components.append({
                'name': class_name,
                'type': 'class',
                'score': score,
                'reasons': reasons,
                'code': class_code[:500] + '...' if len(class_code) > 500 else class_code
            })
        
        # 提取主要函数
        func_pattern = r'(void|int|string|bool|float|double)\s+([A-Z]\w+)\s*\([^)]*\)\s*\{'
        functions = re.findall(func_pattern, file_content)
        
        for ret_type, func_name in functions:
            # 跳过简单getter/setter
            if func_name.startswith('Get') or func_name.startswith('Set'):
                continue
            
            func_start = file_content.find(f'{ret_type} {func_name}')
            # 简化提取函数体
            brace_count = 0
            func_end = func_start
            for i, char in enumerate(file_content[func_start:]):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        func_end = func_start + i + 1
                        break
            
            func_code = file_content[func_start:func_end]
            score, reasons = self.score_class_or_function(func_name, func_code)
            
            components.append({
                'name': func_name,
                'type': 'function',
                'score': score,
                'reasons': reasons,
                'code': func_code[:300] + '...' if len(func_code) > 300 else func_code
            })
        
        # 按分数排序
        components.sort(key=lambda x: x['score'], reverse=True)
        
        return components
    
    def get_analysis_focus(self, components: List[Dict]) -> Dict:
        """
        获取分析重点
        
        Returns:
            {
                'high_attention': [...],  # 8-10分
                'medium_attention': [...], # 5-7分
                'low_attention': [...],    # 0-4分
                'focus_summary': str       # 分析重点摘要
            }
        """
        high = [c for c in components if c['score'] >= 8]
        medium = [c for c in components if 5 <= c['score'] < 8]
        low = [c for c in components if c['score'] < 5]
        
        # 生成摘要
        summary_parts = []
        if high:
            summary_parts.append(f"核心组件 ({len(high)}个): {', '.join(c['name'] for c in high[:3])}")
        if medium:
            summary_parts.append(f"重要组件 ({len(medium)}个): {', '.join(c['name'] for c in medium[:3])}")
        
        return {
            'high_attention': high,
            'medium_attention': medium,
            'low_attention': low,
            'focus_summary': '；'.join(summary_parts) if summary_parts else '未识别到核心组件'
        }


# 使用示例
def demo():
    """演示用法"""
    
    # 示例代码（简化版 PlayerMissionSystem）
    sample_code = '''
class PlayerMissionSystem : public PlayerSubsystem
{
public:
    void Participate(uint32_t missionId);
    void AddProgress(uint32_t missionId, int32_t progress);
    void AcceptReward(uint32_t missionId);
    bool IsMissionActive(uint32_t missionId) const;
    
private:
    std::map<uint32_t, MissionInstance> m_missions;
    void LoadMissionsFromDB();
    void SaveMissionToDB(const MissionInstance& mission);
    void CheckMissionComplete(uint32_t missionId);
    void NotifyMissionUpdate(uint32_t missionId);
};

void PlayerMissionSystem::Participate(uint32_t missionId)
{
    if (IsMissionActive(missionId)) {
        return;
    }
    
    auto& config = GetMissionConfig(missionId);
    if (!config) {
        return;
    }
    
    MissionInstance instance;
    instance.missionId = missionId;
    instance.status = EMissionStatus::InProgress;
    instance.progress = 0;
    
    m_missions[missionId] = instance;
    SaveMissionToDB(instance);
    NotifyMissionUpdate(missionId);
}

void PlayerMissionSystem::AddProgress(uint32_t missionId, int32_t progress)
{
    auto it = m_missions.find(missionId);
    if (it == m_missions.end()) {
        return;
    }
    
    auto& instance = it->second;
    instance.progress += progress;
    
    CheckMissionComplete(missionId);
    SaveMissionToDB(instance);
}
'''
    
    scorer = CodeAttentionScorer()
    components = scorer.analyze_code_structure(sample_code, "PlayerMissionSystem.h")
    focus = scorer.get_analysis_focus(components)
    
    print("=" * 60)
    print("代码注意力分析结果")
    print("=" * 60)
    print(f"\n分析重点: {focus['focus_summary']}\n")
    
    if focus['high_attention']:
        print("🎯 高注意力组件 (8-10分):")
        for c in focus['high_attention']:
            print(f"  • {c['name']} ({c['type']}) - 权重: {c['score']}/10")
            for reason in c['reasons']:
                print(f"    └─ {reason}")
    
    if focus['medium_attention']:
        print("\n📋 中注意力组件 (5-7分):")
        for c in focus['medium_attention']:
            print(f"  • {c['name']} ({c['type']}) - 权重: {c['score']}/10")


if __name__ == "__main__":
    demo()
