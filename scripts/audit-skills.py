#!/usr/bin/env python3
"""Audit all skills for writing-skills compliance."""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

REQUIRED_SECTIONS = ["overview", "when to use"]

def check_skill(skill_dir: Path) -> dict:
    result = {
        "dir": skill_dir.name,
        "issues": [],
    }
    
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        result["issues"].append("Missing SKILL.md")
        return result
    
    content = skill_md.read_text(encoding='utf-8')
    lines = content.split('\n')
    
    # Check frontmatter
    if lines and lines[0].strip() == '---':
        close_idx = -1
        for i, line in enumerate(lines[1:], 1):
            if line.strip() == '---':
                close_idx = i
                break
        
        if close_idx > 0:
            frontmatter = '\n'.join(lines[1:close_idx])
            
            name_match = re.search(r'^name:\s*(.+)$', frontmatter, re.MULTILINE)
            if name_match:
                name = name_match.group(1).strip().strip('"').strip("'")
                if not re.match(r'^[a-z0-9-]+$', name):
                    result["issues"].append(f"Name format invalid: '{name}'")
            else:
                result["issues"].append("Missing 'name' in frontmatter")
            
            desc_match = re.search(r'^description:\s*(.+)$', frontmatter, re.MULTILINE)
            if desc_match:
                desc = desc_match.group(1).strip().strip('"').strip("'")
                if not desc.lower().startswith("use when"):
                    result["issues"].append(f"Description does not start with 'Use when': '{desc[:60]}...'")
            else:
                result["issues"].append("Missing 'description' in frontmatter")
        else:
            result["issues"].append("No frontmatter closing marker")
    else:
        result["issues"].append("No frontmatter found")
    
    # Check sections
    content_lower = content.lower()
    for section in REQUIRED_SECTIONS:
        if not re.search(rf'##\s+{section.replace(" ", r"[\s_]")}', content_lower):
            result["issues"].append(f"Missing required section: '{section}'")
    
    return result

def main():
    skills = []
    for item in sorted(REPO_ROOT.iterdir()):
        if not item.is_dir() or item.name.startswith('.') or item.name in ['scripts', 'contributing']:
            continue
        if (item / "SKILL.md").exists():
            skills.append(check_skill(item))
    
    print(f"Audited {len(skills)} skills\n")
    print("=" * 70)
    
    total_issues = 0
    for skill in skills:
        issues = skill["issues"]
        status = "PASS" if not issues else f"{len(issues)} issues"
        print(f"\n{skill['dir']:35s} {status}")
        for issue in issues:
            print(f"    - {issue}")
        total_issues += len(issues)
    
    print("\n" + "=" * 70)
    print(f"Total: {len(skills)} skills, {total_issues} issues found")

if __name__ == "__main__":
    main()
