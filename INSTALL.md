# Skill 安装指南

> 如何将 Skill-Lib 中的 Skill 安装到本地工作空间

---

## 方法一：一键安装（推荐）

### 安装所有 Skills

```bash
# 克隆仓库到临时目录
git clone https://github.com/Dqz00116/skill-lib.git /tmp/skill-lib

# 复制到工作空间的 skills 目录
mkdir -p ~/workspace/skills
cp -r /tmp/skill-lib/*/ ~/workspace/skills/

# 清理临时文件
rm -rf /tmp/skill-lib

echo "✅ 安装完成！已安装 $(ls ~/workspace/skills | wc -l) 个 Skills"
```

### Windows PowerShell 版本

```powershell
# 克隆仓库
$tempPath = "$env:TEMP\skill-lib"
git clone https://github.com/Dqz00116/skill-lib.git $tempPath

# 复制到工作空间
$skillPath = "$env:USERPROFILE\workspace\skills"
New-Item -ItemType Directory -Force -Path $skillPath

Get-ChildItem -Path $tempPath -Directory | Where-Object { $_.Name -notmatch '^\.' } | ForEach-Object {
    $dest = Join-Path $skillPath $_.Name
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

# 清理
Remove-Item -Path $tempPath -Recurse -Force

Write-Host "✅ 安装完成！"
```

---

## 方法二：安装单个 Skill

### 步骤

```bash
# 1. 进入工作空间的 skills 目录
cd ~/workspace/skills

# 2. 创建 Skill 目录
mkdir code-analysis

# 3. 下载 SKILL.md
curl -o code-analysis/SKILL.md \
  https://raw.githubusercontent.com/Dqz00116/skill-lib/main/code-analysis/SKILL.md

# 4. 验证安装
ls code-analysis/SKILL.md
```

### Windows PowerShell 版本

```powershell
# 1. 进入工作空间
$skillPath = "$env:USERPROFILE\workspace\skills"
New-Item -ItemType Directory -Force -Path $skillPath
Set-Location $skillPath

# 2. 创建目录并下载
$skillName = "code-analysis"
New-Item -ItemType Directory -Force -Path $skillName

Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Dqz00116/skill-lib/main/$skillName/SKILL.md" `
  -OutFile "$skillName/SKILL.md"

# 3. 验证
Test-Path "$skillName/SKILL.md"
```

---

## 方法三：手动安装

### 步骤

1. **下载仓库**
   - 访问 https://github.com/Dqz00116/skill-lib
   - 点击 "Code" → "Download ZIP"
   - 解压到本地

2. **选择需要的 Skill**
   - 浏览解压后的目录
   - 选择需要的 Skill 文件夹

3. **复制到工作空间**
   ```
   你的工作空间/
   └── skills/
       ├── code-analysis/
       │   └── SKILL.md
       ├── git-workflow/
       │   └── SKILL.md
       └── ...
   ```

---

## 验证安装

### 检查 Skill 结构

```bash
# 每个 Skill 应该包含
code-analysis/
└── SKILL.md          # 必需

# 可选文件
code-analysis/
├── SKILL.md          # 必需
├── README.md         # 可选：额外说明
├── examples/         # 可选：示例
└── templates/        # 可选：模板
```

### 测试 Skill 可用性

```python
# Python 测试脚本
import os

def check_skill(skill_path):
    skill_md = os.path.join(skill_path, "SKILL.md")
    if os.path.exists(skill_md):
        print(f"✅ {os.path.basename(skill_path)} - 可用")
        return True
    else:
        print(f"❌ {os.path.basename(skill_path)} - 缺少 SKILL.md")
        return False

# 检查所有 Skills
skills_dir = "~/workspace/skills"
skills = [d for d in os.listdir(skills_dir) if os.path.isdir(os.path.join(skills_dir, d))]

valid = sum(check_skill(os.path.join(skills_dir, s)) for s in skills)
print(f"\n总计: {valid}/{len(skills)} 个 Skill 可用")
```

---

## 更新 Skills

### 更新所有 Skills

```bash
# 1. 备份现有配置
cp -r ~/workspace/skills ~/workspace/skills.backup.$(date +%Y%m%d)

# 2. 重新克隆并覆盖
git clone https://github.com/Dqz00116/skill-lib.git /tmp/skill-lib
cp -r /tmp/skill-lib/*/ ~/workspace/skills/

# 3. 清理
rm -rf /tmp/skill-lib
```

### 更新单个 Skill

```bash
# 直接下载最新版本
curl -o ~/workspace/skills/code-analysis/SKILL.md \
  https://raw.githubusercontent.com/Dqz00116/skill-lib/main/code-analysis/SKILL.md
```

---

## Agent 自动安装指令

如果你是 AI Agent，使用以下流程自动安装：

```
1. 检查工作空间是否有 skills/ 目录
2. 如果没有，创建 skills/ 目录
3. 从 GitHub 获取 SKILL.md
4. 保存到 skills/<skill-name>/SKILL.md
5. 验证文件存在
```

### Agent 伪代码

```python
def install_skill(skill_name, workspace_path):
    skill_dir = os.path.join(workspace_path, "skills", skill_name)
    skill_md = os.path.join(skill_dir, "SKILL.md")
    
    # 创建目录
    os.makedirs(skill_dir, exist_ok=True)
    
    # 下载 SKILL.md
    url = f"https://raw.githubusercontent.com/Dqz00116/skill-lib/main/{skill_name}/SKILL.md"
    download_file(url, skill_md)
    
    # 验证
    if os.path.exists(skill_md):
        print(f"✅ {skill_name} 安装成功")
        return True
    else:
        print(f"❌ {skill_name} 安装失败")
        return False
```

---

## 常见问题

### Q: Skills 安装在哪里？
**A**: 推荐安装在 `~/workspace/skills/` 或 `{workspace}/skills/`

### Q: 可以只安装部分 Skills 吗？
**A**: 可以，复制你需要的 Skill 文件夹即可

### Q: 如何知道安装成功了？
**A**: 检查 `skills/{skill-name}/SKILL.md` 文件是否存在

### Q: 更新会覆盖我的修改吗？
**A**: 会。如果你有本地修改，请先备份

---

## 目录结构示例

安装完成后，你的工作空间应该像这样：

```
~/workspace/
├── skills/                     # Skill 目录
│   ├── code-analysis/
│   │   └── SKILL.md
│   ├── code-generator/
│   │   └── SKILL.md
│   ├── daily-log/
│   │   └── SKILL.md
│   ├── git-workflow/
│   │   └── SKILL.md
│   ├── knowledge-base-cache/
│   │   └── SKILL.md
│   ├── msvc-build/
│   │   └── SKILL.md
│   └── mvp-design/
│       └── SKILL.md
├── memory/                     # 你的记忆文件
├── docs/                       # 你的文档
└── ...                         # 其他项目文件
```

---

*最后更新: 2026-02-11*
