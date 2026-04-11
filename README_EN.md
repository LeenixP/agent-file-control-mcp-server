# agent-file-control MCP Server

English | [中文](README.md)

Complete file control MCP server built with Node.js/TypeScript. Supports three content writing modes for flexible file operations, including Unicode character handling.

## Installation

```bash
npm install -g agent-file-control-mcp-server

# Or use npx without installation
npx -y agent-file-control-mcp-server
```

---

## Core Feature: Three Writing Modes

All write-type tools support three encoding modes:

| Encoding Mode | Tool | Use Case |
|---------------|------|----------|
| `text` (default) | `afc_write_file` | Simple text, no special characters |
| `base64` | `afc_write_file` + `afc_encode_string` | Complex code (many quotes/escapes), but **cannot solve Unicode issues** |
| **Generator Mode** | `afc_write_generated` | **Code with Unicode characters (Recommended)** |

### ⚠️ Unicode Character Problem

Unicode characters in Go/Python/TypeScript code (e.g., `\u25cf` → `●`, `\u2713` → `✓`) have issues during JSON-RPC transmission:

**Root Cause:**
- Agent generates `"value": "●"` → JSON serialization → `"value": "\\u25cf"` → incorrect file content
- Base64 mode cannot solve this because the problem occurs at JSON serialization stage, not transmission

**Solution: Generator Mode**
- Agent only passes simple key-value parameters (e.g., `{ "name": "radioOn", "value": "●" }`)
- MCP server generates file content internally
- Completely bypasses JSON serialization issues

---

## Configuration

### OpenCode Configuration

Edit `~/.config/opencode/opencode.json`, add to `mcp` field:

```json
{
  "mcp": {
    "agent-file-control": {
      "type": "local",
      "command": ["npx", "-y", "agent-file-control-mcp-server"],
      "enabled": true
    }
  }
}
```

### Claude Code Configuration

Edit `~/.claude.json`, add `mcpServers` field:

```json
{
  "mcpServers": {
    "agent-file-control": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "agent-file-control-mcp-server"],
      "env": {}
    }
  }
}
```

Or use CLI:

```bash
claude mcp add agent-file-control -- npx -y agent-file-control-mcp-server
```

---

## Available Tools

### File Generators (Priority)

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_write_generated` | path, generator, input, executable, create_dirs | Create file using generator, supports Unicode |
| `afc_list_generators` | detailed | List all available generators with details |

### File Writing

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_write_file` | path, content, content_encoding, file_encoding, executable, create_dirs | Write file, text/base64 encoding |
| `afc_append_file` | path, content, content_encoding, create_if_missing | Append content, text/base64 encoding |

### File Editing

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_search_replace` | path, old_text, old_encoding, new_text, new_encoding, count | Search and replace, dual encoding |
| `afc_patch_lines` | path, start_line, end_line, new_content, content_encoding | Line range replacement, dual encoding |

### File Reading

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_read_file` | path, as_b64, encoding, start_line, end_line | Read file, can return base64 |

### File Management

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_file_info` | path | Get file/directory metadata |
| `afc_list_dir` | path, recursive, max_depth, show_hidden, pattern | List directory contents |
| `afc_copy` | src, dst, overwrite | Copy file or directory |
| `afc_move` | src, dst, overwrite | Move/rename |
| `afc_delete` | path, recursive | Delete file or directory |
| `afc_mkdir` | path | Create directory |

### Encoding Utilities

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_encode_string` | text | Encode string to base64 (for complex code, no Unicode) |
| `afc_decode_b64` | b64, encoding | Decode base64 to string |

---

## Built-in Generators

| Generator | Purpose | Input Parameters |
|-----------|---------|------------------|
| `go-constants` | Go constant definitions (**Unicode support**) | package, constants (array) |
| `go-struct` | Go struct + JSON tags | package, structName, fields (array) |
| `go-interface` | Go interface definitions | package, interfaceName, methods (array) |
| `python-constants` | Python constants | constants (array) |
| `python-class` | Python class + `__init__` | className, fields (array) |
| `typescript-interface` | TypeScript interfaces | interfaceName, fields (array) |
| `typescript-constants` | TypeScript constants | constants (array) |
| `json-config` | JSON configuration files | data (object) |
| `yaml-config` | YAML configuration files | data (object) |
| `shell-script` | Shell scripts (auto executable) | commands (array) |
| `dockerfile` | Dockerfile (multi-stage support) | stages (array) |
| `gitignore` | .gitignore (language presets) | language |
| `html-template` | HTML documents | title, body (array) |
| `css-styles` | CSS stylesheets | rules (array) |
| `markdown-doc` | Markdown documents | title, sections (array) |

View generator details: call `afc_list_generators(detailed=true)`

---

## Usage Examples

### Generator Mode - Unicode Characters (Recommended)

```json
// Generate Go constants file with Unicode symbols
{
  "path": "/path/to/styles.go",
  "generator": "go-constants",
  "input": {
    "package": "tui",
    "constants": [
      { "name": "radioOn", "value": "●", "comment": "Selected" },
      { "name": "radioOff", "value": "○", "comment": "Unselected" },
      { "name": "cursorStr", "value": "▸ " },
      { "name": "checkMark", "value": "✓" }
    ]
  }
}

// Generated file content:
// package tui
// 
// const (
//     radioOn   = "●" // Selected
//     radioOff  = "○" // Unselected
//     cursorStr = "▸ "
//     checkMark = "✓"
// )
```

### Generator Mode - Structs

```json
// Generate Go struct
{
  "path": "/path/to/config.go",
  "generator": "go-struct",
  "input": {
    "package": "config",
    "structName": "Server",
    "fields": [
      { "name": "Host", "type": "string", "jsonTag": "host" },
      { "name": "Port", "type": "int", "jsonTag": "port" }
    ]
  }
}
```

### Text Mode - Simple Text

```json
// Write simple text
{
  "path": "/home/user/test.txt",
  "content": "Hello World",
  "content_encoding": "text"
}
```

### Base64 Mode - Complex Code (No Unicode)

```json
// Write complex JavaScript code
{
  "path": "/home/user/code.js",
  "content": "Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7",
  "content_encoding": "base64"
}

// First call afc_encode_string to generate base64:
{
  "text": "const x = \"hello\";\nconsole.log(x);"
}
// Returns: Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7
```

---

## Mode Selection Guide

| Scenario | Recommended Mode | Tool |
|----------|------------------|------|
| **Go/Python/TS constants/classes/interfaces** | Generator | `afc_write_generated` |
| **Contains Unicode characters** | Generator | `afc_write_generated` |
| Simple text | text | `afc_write_file(content_encoding="text")` |
| Complex code without Unicode | base64 | `afc_write_file(content_encoding="base64")` |
| Precise line editing | text | `afc_patch_lines` |
| Configuration files | Generator | `afc_write_generated(generator="json-config/yaml-config")` |

---

## How Generators Work

```
Agent calls afc_write_generated({ generator: "go-constants", input: {...} })
    ↓
MCP server receives parameters, generates file content internally
    ↓
Directly writes to file (bypassing JSON serialization)
```

**Key Benefits:**
- Agent only passes simple key-value data
- MCP server handles complex content generation internally
- Unicode characters written directly to file, no escaping issues

---

## Management Commands

```bash
# Claude Code
claude mcp list
claude mcp get agent-file-control
claude mcp remove agent-file-control -s user

# Check status in Claude Code
/mcp
```

---

## License

MIT © [LeenixP](https://github.com/LeenixP)