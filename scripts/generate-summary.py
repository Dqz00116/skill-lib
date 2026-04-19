#!/usr/bin/env python3
"""
Skill-Lib Summary Generator

Automatically scans all skill directories and generates SUMMARY.md.
Run this after adding or updating any skill.

Usage:
    python scripts/generate-summary.py              # Generate and print to stdout
    python scripts/generate-summary.py --write      # Write to SUMMARY.md directly
"""

import os
import re
import argparse
from pathlib import Path


def parse_frontmatter(content: str) -> dict:
    """Parse YAML frontmatter from SKILL.md content."""
    result = {"name": "", "description": "", "version": "", "author": "", "tags": []}
    
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return result
    
    frontmatter = match.group(1)
    
    for line in frontmatter.split('\n'):
        line = line.strip()
        if ':' in line and not line.startswith('#'):
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            
            if key == 'tags':
                tags = re.findall(r'[\w-]+', value)
                result['tags'] = tags
            elif key in result:
                result[key] = value
    
    return result


def get_complexity(skill_dir: Path) -> str:
    """Infer complexity from skill content."""
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return "Unknown"
    
    content = skill_md.read_text(encoding='utf-8')
    
    if '⭐⭐⭐' in content:
        return "⭐⭐⭐ Complex"
    elif '⭐⭐' in content:
        return "⭐⭐ Medium"
    elif '⭐' in content:
        return "⭐ Simple"
    
    lines = len(content.split('\n'))
    if lines > 300:
        return "⭐⭐⭐ Complex"
    elif lines > 150:
        return "⭐⭐ Medium"
    else:
        return "⭐ Simple"


def get_complexity_stars_only(skill_dir: Path) -> str:
    """Get just the star rating."""
    c = get_complexity(skill_dir)
    if 'Complex' in c:
        return "⭐⭐⭐"
    elif 'Medium' in c:
        return "⭐⭐"
    else:
        return "⭐"


def scan_skills(repo_root: Path) -> list:
    """Scan repository and extract skill metadata."""
    skills = []
    
    for item in sorted(repo_root.iterdir()):
        if not item.is_dir():
            continue
        if item.name.startswith('.') or item.name in ['scripts', 'contributing']:
            continue
        if not (item / "SKILL.md").exists():
            continue
        
        content = (item / "SKILL.md").read_text(encoding='utf-8')
        meta = parse_frontmatter(content)
        
        skills.append({
            "dir": item.name,
            "name": meta.get("name", item.name) or item.name,
            "description": meta.get("description", ""),
            "version": meta.get("version", ""),
            "complexity": get_complexity(item),
            "complexity_stars": get_complexity_stars_only(item),
        })
    
    return skills


def generate_summary(skills: list) -> str:
    """Generate complete SUMMARY.md content."""
    
    lines = []
    lines.append("# Skill Summary")
    lines.append("")
    lines.append("> Auto-generated index of all available skills. Run `python scripts/generate-summary.py --write` to regenerate after adding new skills.")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Overview table
    lines.append("## Skill Overview")
    lines.append("")
    lines.append("| Skill | Description | Version |")
    lines.append("|-------|-------------|---------|")
    
    for skill in skills:
        name = skill["name"]
        desc = skill["description"][:70] + "..." if len(skill["description"]) > 70 else skill["description"]
        ver = skill["version"]
        lines.append(f"| [{name}](./{skill['dir']}) | {desc} | {ver} |")
    
    lines.append("")
    lines.append(f"**Total: {len(skills)} skills**")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Quick Selection
    lines.append("## Quick Selection")
    lines.append("")
    lines.append("| If you need to... | Use this Skill |")
    lines.append("|-------------------|----------------|")
    
    selection_map = [
        ("Analyze unfamiliar code", "code-analysis"),
        ("Generate code from design docs", "code-generator"),
        ("Record work sessions", "daily-log"),
        ("Safely commit/push code", "git-workflow"),
        ("Publish Hexo blog posts", "hexo-blog-update"),
        ("Manage knowledge with caching", "knowledge-base-cache"),
        ("Compile MSVC C++ projects", "msvc-build"),
        ("Design MVP prototypes", "mvp-design"),
        ("Clarify ambiguous requirements", "requirement-clarification"),
        ("Apply research to practice", "research-to-practice"),
        ("Automate Unity development", "unity-mcp"),
        ("Track project tasks", "taskmaster-skill"),
        ("Understand academic papers", "paper-first-principles"),
        ("Explain complex concepts", "layered-first-principles-teaching"),
    ]
    
    for need, skill_name in selection_map:
        skill = next((s for s in skills if s["name"] == skill_name), None)
        if skill:
            lines.append(f"| {need} | [{skill['name']}](./{skill['dir']}) |")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Skill Combinations
    lines.append("## Recommended Skill Combinations")
    lines.append("")
    lines.append("| Scenario | Skill Chain |")
    lines.append("|----------|-------------|")
    lines.append("| New feature development | `mvp-design` -> `code-generator` -> `msvc-build` -> `git-workflow` |")
    lines.append("| Maintain existing system | `code-analysis` -> `msvc-build` -> `daily-log` |")
    lines.append("| Knowledge management | `knowledge-base-cache` -> `daily-log` |")
    lines.append("| Technical blogging | `hexo-blog-update` -> `git-workflow` |")
    lines.append("| Complex project management | `taskmaster-skill` -> `mvp-design` -> `code-generator` -> `git-workflow` -> `daily-log` |")
    lines.append("| Research application | `paper-first-principles` -> `research-to-practice` |")
    lines.append("| Teaching / explaining | `layered-first-principles-teaching` |")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    lines.append(f"*Last updated: Auto-generated*")
    lines.append("")
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Generate skill-lib SUMMARY.md")
    parser.add_argument("--write", action="store_true", help="Write directly to SUMMARY.md")
    args = parser.parse_args()
    
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    skills = scan_skills(repo_root)
    summary = generate_summary(skills)
    
    if args.write:
        output_path = repo_root / "SUMMARY.md"
        output_path.write_text(summary, encoding='utf-8')
        print(f"Written to: {output_path}")
        print(f"Indexed {len(skills)} skills.")
    else:
        print(summary)
        print(f"\n<!-- Indexed {len(skills)} skills. Use --write to save to SUMMARY.md -->")


if __name__ == "__main__":
    main()
