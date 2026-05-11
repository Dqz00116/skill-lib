---
name: kimicode-vision-bridge
description: Use when the current Agent LLM cannot process images directly and visual analysis is needed — bridges images through KimiCode CLI print mode to a multimodal Kimi model for text description
version: 1.0
---

# KimiCode Vision Bridge

## Overview

Routes images through KimiCode CLI's print mode (`kimi --print`) to give a non-vision Agent LLM visual understanding. Kimi is a multimodal model; print mode provides a non-interactive, programmatic pipe — the Agent submits an image + question via CLI, Kimi returns a text description on stdout.

```
Agent (no vision)                KimiCode CLI                  Kimi multimodal model
     │                                │                              │
     │  image + question              │                              │
     ├───────────────────────────────→│                              │
     │  kimi --print -p "..."         │                              │
     │                                ├─────────────────────────────→│
     │                                │     API call with image      │
     │                                │←─────────────────────────────┤
     │                                │     text response            │
     │←───────────────────────────────┤                              │
     │  text on stdout                │                              │
     ▼                                ▼                              ▼
```

Print mode docs: https://www.kimi-cli.com/en/customization/print-mode.html

## When to Use

Use this skill when:
- The current Agent LLM cannot process images directly (no vision capability)
- An image needs to be read or analyzed — screenshots, photos, diagrams, charts, document scans, UI mockups
- KimiCode CLI is installed and configured with a vision-capable model on the system

Do NOT use when:
- The Agent already has native image input — this skill adds an unnecessary hop
- The task is pure text analysis with no visual component
- KimiCode is not installed or lacks a vision model

## Prerequisites (MUST verify before proceeding)

Both checks must pass. If either fails, stop and report the failure.

### Check 1: KimiCode CLI (`kimi`) is installed

**Windows (PowerShell):**
```powershell
Get-Command kimi -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
```

**macOS / Linux:**
```bash
which kimi || command -v kimi
```

| Result | Action |
|--------|--------|
| Found | Pass |
| Not found | Fail. "KimiCode CLI not found. Install from https://www.kimi-cli.com" |

### Check 2: A multimodal (vision-capable) model is configured

Locate the config file and verify an API key and a vision model are set.

**Config locations (try in order):**

| Windows | macOS | Linux |
|---------|-------|-------|
| `%APPDATA%\kimi\config.json` | `~/Library/Application Support/kimi/config.json` | `~/.config/kimi/config.json` |
| `%USERPROFILE%\.kimi\config.json` | `~/.kimi/config.json` | `~/.kimi/config.json` |

**Verify:**
1. A non-empty API key (fields: `apiKey`, `token`, `api_key`, or under `providers`)
2. A model name (fields: `model`, `defaultModel`) — must be vision-capable
3. If config uses env vars (e.g., `$KIMI_API_KEY`), verify those are set

| Result | Action |
|--------|--------|
| API key + vision model set | Pass |
| API key missing | Fail. "No API key configured. Run `kimi config set` or edit the config file." |
| Model missing or text-only | Fail. "No vision model configured. Set a multimodal model via `kimi config set model <name>` (e.g., moonshot-v1-vision, gpt-4o, claude-3.5-sonnet)." |

## The Pipe: Core Workflow

Once prerequisites pass, the bridge has two steps.

### Step A: Submit image + question to Kimi via print mode

The Agent already has an image (from the user, from a file, from a prior tool call). Combine it with a clear instruction and pipe it through `kimi --print`.

**Approach 1 — File reference (recommended)**

Point Kimi at the image file on disk. KimiCode's file-read tool loads and analyzes it.

```bash
kimi --quiet -p "Describe every visible element in this image in detail: /path/to/image.png"
```

**Approach 2 — Inline base64 via JSONL stdin (fully programmatic)**

Pipe the image as base64 directly — no temp file needed.

```bash
BASE64=$(base64 -w 0 /path/to/image.png)
echo "{\"role\":\"user\",\"content\":[{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:image/png;base64,$BASE64\"}},{\"type\":\"text\",\"text\":\"Describe every visible element in this image in detail.\"}]}" \
  | kimi --print --input-format=stream-json --output-format=stream-json
```

Windows PowerShell equivalent:
```powershell
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\image.png"))
$msg = '{"role":"user","content":[{"type":"image_url","image_url":{"url":"data:image/png;base64,' + $base64 + '"}},{"type":"text","text":"Describe every visible element in this image in detail."}]}'
$msg | kimi --print --input-format=stream-json --output-format=stream-json
```

**Effective prompts for the image question:**

| Scenario | Prompt |
|----------|--------|
| Generic | "Describe every visible element — text, layout, colors, positions, any errors or warnings." |
| UI/dialog | "Read every label, button text, input field value, and error message in this screenshot." |
| Code | "Read all visible code including line numbers, syntax highlighting, and any squiggly/error indicators." |
| Chart/graph | "Describe the chart type, axes labels, data ranges, trend direction, and any annotations." |
| Document | "Transcribe the visible text exactly. Note any formatting (bold, headers, tables)." |

### Step B: Read the text result and feed into Agent context

| Flags | Output format | How to parse |
|-------|--------------|--------------|
| `--quiet` | Plain text, final message only | Read directly |
| `--output-format=stream-json` | JSONL, one JSON per line | `grep '"role":"assistant"' \| tail -1 \| jq -r '.content'` |

**Inject into Agent context:**

```
[Vision bridge: KimiCode print mode]
<text from stdout>
[End vision bridge]
```

### Complete pipeline example

```bash
IMAGE="/path/to/image.png"
RESULT=$(kimi --quiet -p "Describe every visible element in $IMAGE in detail" 2>/dev/null)
echo "[Vision bridge: KimiCode print mode]"
echo "$RESULT"
echo "[End vision bridge]"
```

## Image Sources

The bridge works with any image the Agent can reference. Common sources:

- **User-provided file path** — `kimi --quiet -p "Describe ~/Downloads/screenshot.png"`
- **Screenshot captured on-the-fly** — capture with OS tool first, then feed the saved file (macOS: `screencapture`, Windows: PowerShell GDI+, Linux: ImageMagick/gnome-screenshot)
- **Image from a prior tool call** — pass the path from a previous download/generation step
- **Clipboard image** — save to temp file first, then bridge

Screenshot capture is not part of the bridge skill itself — use platform-native tools.

## Iterative Refinement

1. **Narrow the question**: `"Focus only on reading every text string in the dialog box."`
2. **Compare states**: Submit two images and ask `"Compare these two screenshots and describe what changed."`
3. **Crop and retry**: Crop to a sub-region with OS tools and re-submit

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using a text-only model | Run `kimi config set model <vision-model>` to switch |
| Image path contains spaces or special chars | Wrap path in quotes or use a temp file with a simple name |
| Expecting KimiCode to take screenshots | Use OS tools; KimiCode is the analysis pipe, not the capture tool |
| Forgetting to verify prerequisites first | Always run Check 1 and Check 2 before attempting the bridge |
| Not checking exit codes | 0=success, 1=permanent error (auth/config), 75=transient (rate limit, retry) |

## Error Recovery

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| `kimi: command not found` | CLI not on PATH | Install from https://www.kimi-cli.com |
| Exit code 75 | Rate limit / transient | Wait 10s, retry |
| Exit code 1 | Auth or config error | Run `kimi config` to check API key and model |
| Empty or nonsensical output | Model may not be vision-capable | Verify the model supports multimodal input |
| "Image input not supported" in output | Model is text-only | Switch to a vision model in KimiCode config |
| Base64 too large for stdin | Image too big | Use file-reference approach (Approach 1) |
| Output appears truncated | Long response | Use `--output-format=stream-json` for reliable capture |
