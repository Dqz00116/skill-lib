---
name: unity-mcp
description: Use when controlling Unity editor via AI, automating scene operations, or programmatically generating Unity assets and scripts
---

# SKILL: unity-mcp

## Overview

A reference guide for deploying and using the Unity MCP Server, covering API operations, data type formats, and common issue resolution.

Complete deployment guide, API usage tips, and troubleshooting manual for the Unity MCP (Model Context Protocol) Server.

## Description

This skill covers:
- Starting and connecting the Unity MCP Server
- Common API operations (GameObject, Component, Scene, Asset)
- Parameter format specifications (Color, Vector3, and other special types)
- Common problem troubleshooting and resolution approaches

## When to Use

- You need to control the Unity editor via AI automation
- You are batch-creating or modifying GameObjects, components, or scenes
- You are programmatically generating Unity assets or scripts
- You encounter connection issues, session errors, or data type format problems with Unity MCP
- You need to remotely debug or inspect a Unity scene

**Do not use when:**
- The task is purely about Unity game logic coding without MCP integration
- You only need general Unity scripting help without editor automation
- You are working with a different MCP server or game engine

## When to Invoke

Usage scenarios:
- Need to control the Unity editor via AI to perform automated operations
- Batch create/modify scene objects, components
- Procedurally generate assets or scripts
- Remote debugging and scene inspection
- Automated testing workflows

## Prerequisites

**Environment requirements:**
- Unity 6000+ (or other supported versions)
- Unity MCP plugin/package installed
- Python uvx tool

### 1. Check if MCP Plugin is Installed

Check in the Unity editor:
- Whether the menu bar has **MCP** or **Window → MCP**
- Whether the Project window has `MCP` or `McpForUnity` related folders

**If the MCP plugin is not installed:**

1. **Install via Unity Asset Store:**
   - Open **Window → Package Manager**
   - Select **Unity Registry** or **My Assets**
   - Search for **"MCP"** or **"MCP for Unity"**
   - Click **Install**

2. **Or install via Git URL:**
   - Package Manager → **+** → **Add package from git URL**
   - Enter: `https://github.com/anthropics/unity-mcp.git`
   - Click **Add**

3. **Restart Unity after installation**

### 2. Check if uvx is Installed

```powershell
# Windows
Test-Path "$env:USERPROFILE\.local\bin\uvx.exe"

# macOS/Linux
which uvx
```

**If not installed:**
1. In the Unity editor, open **Window → MCP → Local Setup**
2. Click **"Install"** or **"Setup Environment"**
3. Wait for automatic download and installation of uvx and related dependencies
4. Restart the terminal/IDE to load the new environment variables

**Plugin source:**
- Unity MCP Server: `mcpforunityserver>=0.0.0a0`

## Deployment

### 1. Start the MCP Server

#### Check uvx Installation Location

uvx is usually installed in the following locations:

**Windows:**
```powershell
# Standard installation path
$env:USERPROFILE\.local\bin\uvx.exe
# Or
C:\Users\<Username>\.local\bin\uvx.exe

# Check if it exists
Test-Path "$env:USERPROFILE\.local\bin\uvx.exe"
```

**macOS/Linux:**
```bash
~/.local/bin/uvx
# Or
/usr/local/bin/uvx
```

#### If uvx Does Not Exist

**⚠️ Prompt the user:**
```
uvx tool not found. Please do the following in the Unity editor:
1. Open Window → MCP → Local Setup
2. Click "Install Dependencies" or "Setup Local Environment"
3. Wait for the installation to complete
4. Try starting the MCP Server again
```

#### Start Command

**Windows (dynamic path):**
```powershell
$uvxPath = "$env:USERPROFILE\.local\bin\uvx.exe"
if (Test-Path $uvxPath) {
    & $uvxPath --prerelease explicit --from "mcpforunityserver>=0.0.0a0" mcp-for-unity --transport http --http-url http://localhost:8080 --project-scoped-tools
} else {
    Write-Host "Error: uvx not found. Please install dependencies by clicking MCP → Local Setup in Unity."
}
```

**macOS/Linux:**
```bash
~/.local/bin/uvx --prerelease explicit --from "mcpforunityserver>=0.0.0a0" mcp-for-unity --transport http --http-url http://localhost:8080 --project-scoped-tools
```

**Note:**
- First launch will download Python dependencies (approx. 30MB, takes 1-2 minutes)
- Keep it running, do not close the terminal
- Use `--project-scoped-tools` to enable project-level tools

### 2. Connection Flow

```
1. Initialize session
   POST http://localhost:8080/mcp
   Headers: Accept: application/json, text/event-stream
   Body: {"jsonrpc":"2.0","id":1,"method":"initialize",...}
   ↓
2. Extract Session ID (from response header mcp-session-id)
   ↓
3. Set active Unity instance
   ↓
4. Execute tool calls
```

**PowerShell Example:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json, text/event-stream"
    "mcp-session-id" = "your-session-id"
}

# Initialize
$init = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"openclaw","version":"1.0"}}}'
$response = Invoke-WebRequest -Uri "http://localhost:8080/mcp" -Method Post -Headers $headers -Body $init
$sessionId = $response.Headers["mcp-session-id"]

# Set active instance
$setInstance = '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"set_active_instance","arguments":{"instance":"ProjectName@hash"}}}'
```

## Common Operations

### GameObject Management

```json
// Create empty object
{
  "name": "manage_gameobject",
  "arguments": {
    "action": "create",
    "name": "MyObject",
    "position": [0, 0, 0]
  }
}

// Create Sprite object (2D)
{
  "action": "create",
  "name": "Tree2D",
  "position": [1, 2, 0]
}
// Then add SpriteRenderer component

// Delete object
{
  "action": "delete",
  "name": "MyObject"
}
```

### Component Management

```json
// Add component
{
  "name": "manage_components",
  "arguments": {
    "action": "add",
    "target": "Tree2D",
    "component_type": "SpriteRenderer"
  }
}

// Set property ⚠️ Pay attention to type format
{
  "action": "set_property",
  "target": "Tree2D",
  "component_type": "SpriteRenderer",
  "property": "color",
  "value": {"r": 0.1, "g": 0.5, "b": 0.2, "a": 1.0}  // ✅ Object format
  // ❌ Incorrect: [0.1, 0.5, 0.2, 1]
}
```

### Scene Management

```json
// Create scene
{
  "name": "manage_scene",
  "arguments": {
    "action": "create",
    "name": "MyScene",
    "path": "MyFolder"
  }
}

// Save scene
{
  "action": "save"
}

// Get hierarchy
{
  "action": "get_hierarchy",
  "page_size": 50
}
```

### Asset Management

```json
// Create folder
{
  "name": "manage_asset",
  "arguments": {
    "action": "create_folder",
    "path": "MyFolder"
  }
}

// Create texture
{
  "action": "create",
  "width": 64,
  "height": 64,
  "path": "MyFolder/Texture.png"
}

// Search assets
{
  "action": "search",
  "path": "MyFolder",
  "page_size": 50
}
```

## Critical Data Types

### ⚠️ Color Format

**Incorrect format (array):**
```json
"value": [0.1, 0.5, 0.2, 1.0]
```

**Correct format (object):**
```json
"value": {"r": 0.1, "g": 0.5, "b": 0.2, "a": 1.0}
```

**PowerShell construction:**
```powershell
$color = @{r=0.1; g=0.5; b=0.2; a=1.0} | ConvertTo-Json -Compress
# Result: {"r":0.1,"g":0.5,"b":0.2,"a":1}
```

### Vector3 Format

```json
"position": [1, 2, 3]
"scale": [1.5, 2, 1]
"rotation": [0, 90, 0]
```

## Common Issues & Solutions

### Issue -1: MCP Plugin Not Installed

**Symptoms:**
- No **MCP** or **Window → MCP** in the Unity menu
- No MCP-related folders in the Project
- Unable to find the MCP settings interface

**Resolution steps:**
1. **Open Unity Asset Store:**
   - `Window → Package Manager`
   - Switch to the **Unity Registry** tab
   - Search for **"MCP"** or **"MCP for Unity"**

2. **Install the plugin:**
   - Find the `MCP for Unity` package
   - Click **Install**
   - Wait for the installation to complete

3. **Restart the Unity editor**

4. **Verify installation:**
   - Check if the menu bar has `MCP` or `Window → MCP`
   - Check if the Project window has the `MCP` folder

### Issue 0: uvx Not Found / Command Does Not Exist

**Symptoms:**
```powershell
The term 'uvx' is not recognized as a cmdlet, function, operable program, or script file.
# Or
Cannot find part of the path "C:\Users\xxx\.local\bin\uvx.exe"
```

**Cause:**
- uvx is a dependency tool for Unity MCP and has not been installed yet
- The installation path varies depending on the system/user

**Resolution steps:**
1. **Install in Unity:**
   - Menu: `Window → MCP → Local Setup`
   - Click: `Install Dependencies` or `Setup Local Environment`
   - Wait for the installation to complete (may take a few minutes)

2. **Verify installation:**
   ```powershell
   # Windows
   Get-Command uvx
   # Or
   Test-Path "$env:USERPROFILE\.local\bin\uvx.exe"
   
   # macOS/Linux
   which uvx
   ```

3. **Restart the terminal** to load the new PATH environment variable

**Dynamic path detection script:**
```powershell
function Get-UvxPath {
    # Try common paths
    $paths = @(
        "$env:USERPROFILE\.local\bin\uvx.exe",
        "$env:LOCALAPPDATA\uv\uvx.exe",
        "C:\Program Files\uv\uvx.exe"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) { return $path }
    }
    
    # Try to find from PATH
    $uvx = Get-Command uvx -ErrorAction SilentlyContinue
    if ($uvx) { return $uvx.Source }
    
    return $null
}

$uvxPath = Get-UvxPath
if (-not $uvxPath) {
    Write-Host "❌ uvx not found. Please install it by clicking Window → MCP → Local Setup in Unity."
    exit 1
}
Write-Host "✅ Found uvx: $uvxPath"
```

### Issue 1: Unable to Set SpriteRenderer.sprite

**Symptoms:**
```
Failed to convert value for property 'sprite' to type 'Sprite'
```

**Cause:**
- `manage_texture` creates a `Texture2D`, but `SpriteRenderer` requires a `Sprite` type
- The API does not support directly converting a path string to a Sprite reference

**Solutions:**
1. **Manual method** (recommended): Drag the texture onto the SpriteRenderer's Sprite field in Unity, and Unity will automatically convert it
2. **Editor script**: Write a tool script under the `Editor` folder to batch assign values
3. **Pre-create Sprite**: Use Unity's Sprite Editor to convert the texture into a Sprite asset

### Issue 2: Color Format Error

**Symptoms:**
```
Error converting token to UnityEngine.Color: Error reading JObject from JsonReader
```

**Solution:** Use the object format `{"r":x,"g":y,"b":z,"a":w}` instead of the array `[x,y,z,w]`

### Issue 3: Session Expired

**Symptoms:**
```
Missing session ID
Bad Request: Missing session ID
```

**Solution:**
- Re-initialize to get a new Session ID
- Ensure every request includes the `mcp-session-id` Header

### Issue 4: Unity Instance Not Found / Cannot Find Active Instance

**Symptoms:**
```json
{
  "instance_count": 0,
  "instances": []
}
```
Or
```
Active instance set to ... : false
```

**Cause:**
- The MCP Server has started, but the Unity editor has not yet established a connection with the Server
- The MCP Session in Unity has not been started

**Resolution steps:**

1. **Ensure the Unity editor is open** (and the project is loaded)

2. **Start the MCP Session in Unity:**
   - Menu: `Window → MCP` or `MCP → Session`
   - In the MCP window, find the **Session** or **Connection** section
   - Click the **"Start Session"** or **"Connect"** button
   - Wait for the status to change to **"Connected"** or **"Running"**

3. **Check connection status:**
   - The MCP window should display: `Status: Connected` or `Transport: HTTP`
   - Or display the currently connected Server address: `http://localhost:8080`

4. **Re-fetch the instance list:**
   ```json
   {
     "name": "resources/read",
     "params": {
       "uri": "mcpforunity://instances"
     }
   }
   ```

**Full startup flow chart:**
```
User Machine
├─ [1] Start MCP Server (uvx command)
│     └─ Waiting for connection...
│
└─ [2] Open Unity Editor
       └─ [3] Window → MCP → Start Session
              └─ Establish connection
                     ↓
              MCP Server detects instance
                     ↓
              instance_count: 1
```

**Common Questions:**
- **Q: Nothing happens after clicking Start Session?**
  - Check if the MCP Server is running (is the terminal window still open)
  - Check if port 8080 is occupied
  - Try restarting Unity and the MCP Server

- **Q: Shows "Connection Failed"?**
  - Confirm the MCP Server address is configured correctly (default: `http://localhost:8080`)
  - Check if the firewall is blocking the connection

### Issue 5: Property Parameter Error

**Symptoms:**
```
Unexpected keyword argument 'xxx'
```

**Solution:** Check the API documentation and use the correct parameter names:
- ❌ `"component": "SpriteRenderer"` → ✅ `"component_type": "SpriteRenderer"`
- ❌ `"filter": "All"` → ✅ Not supported, omit or use the correct parameter

## Workflow Patterns

### Pattern 1: Complete Workflow for Creating a 2D Object

```
1. Create GameObject (empty object)
   manage_gameobject: create
   
2. Add SpriteRenderer component
   manage_components: add, component_type=SpriteRenderer
   
3. Set color
   manage_components: set_property, property=color, value={r,g,b,a}
   
4. Manually assign Sprite (API limitation)
   Or drag and drop the texture onto the Sprite field in Unity
```

### Pattern 2: Batch Create Objects

```powershell
$objects = @(
    @{name="Obj1"; pos=@(1,2,0); color=@{r=1;g=0;b=0;a=1}},
    @{name="Obj2"; pos=@(-1,1,0); color=@{r=0;g=1;b=0;a=1}}
)

foreach ($obj in $objects) {
    # Create object
    # Add component
    # Set property
}
```

### Pattern 3: Error Checking Workflow

```
1. Execute operation
2. Check console logs
   read_console: get
3. Verify result
   manage_scene: get_hierarchy
4. If there is an error, read specific component information
   resources/read: mcpforunity://scene/gameobject/{id}/components
```

## API Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Sprite assignment | Cannot set Sprite directly via API | Manual drag-and-drop or editor script |
| Texture import settings | Cannot modify Texture Import Settings | Pre-configure or set manually in Unity |
| Complex components | Some component properties are not supported | Configure manually using the Unity editor |
| Script creation | Content needs escaping | Use simple scripts or templates |

## Best Practices

1. **Always save the scene** Execute `manage_scene: save` after batch operations
2. **Check the console** Regularly use `read_console` to view errors
3. **Use Instance ID** Use the Instance ID instead of the name when operating on specific objects
4. **Batch operations** Use loops for batch creation to reduce the number of API calls
5. **Error handling** Check the `success` field after each operation

## Quick Reference

### Common Tool List

| Tool | Purpose |
|------|---------|
| `manage_gameobject` | CRUD GameObjects |
| `manage_components` | Add/remove/set components |
| `manage_scene` | Scene operations |
| `manage_asset` | Asset operations |
| `manage_texture` | Create textures |
| `read_console` | Get Unity console logs |
| `set_active_instance` | Set target Unity instance |

### HTTP Headers (Required)

```
Content-Type: application/json
Accept: application/json, text/event-stream
mcp-session-id: <session-id>
```

### Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"success\": true, ...}"
    }]
  }
}
```

## References

- [Unity MCP Server Docs](https://github.com/anthropics/unity-mcp)
- MCP Protocol: https://modelcontextprotocol.io
- Unity Scripting API: https://docs.unity3d.com/ScriptReference/

## Changelog

### v1.0.0 (2026-02-11)
- Initial release
- Documented Color format issue
- Documented Sprite assignment limitation
- Added workflow patterns
