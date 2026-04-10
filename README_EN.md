# agent-file-control MCP Server

English | [中文](README.md)

Complete file control MCP server built with Node.js/TypeScript. Supports two content encoding modes for flexible file operations.

## Installation

```bash
npm install -g agent-file-control-mcp-server

# Or use npx without installation
npx -y agent-file-control-mcp-server
```

---

## Core Feature: Dual Encoding Modes

All write-type tools support two encoding modes:

| Encoding Mode | Description | Use Case |
|---------------|-------------|----------|
| `text` (default) | Plain string, JSON-RPC auto-handles escaping | Most text files, simple content |
| `base64` | Base64 encoded, bypasses all special character issues | Code with many quotes/escapes, binary files |

**Recommendation**: Use `text` mode (default) for daily work, switch to `base64` for complex content.

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

### File Writing

| Tool | Parameters | Description |
|------|------------|-------------|
| `afc_write_file` | path, content, content_encoding, file_encoding, executable, create_dirs | Write file, dual encoding |
| `afc_append_file` | path, content, content_encoding, create_if_missing | Append content, dual encoding |

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
| `afc_encode_string` | text | Encode string to base64 (Agent can call for complex content) |
| `afc_decode_b64` | b64, encoding | Decode base64 to string |

---

## Usage Examples

### Default Mode (text) - Recommended

```json
// Write simple text
{
  "path": "/home/user/test.txt",
  "content": "Hello World",
  "content_encoding": "text"
}
```

### Base64 Mode - Complex Content

When content contains many quotes or escape characters:

```json
// Write complex code
{
  "path": "/home/user/code.js",
  "content": "Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7",
  "content_encoding": "base64"
}
```

Agent can call `afc_encode_string` to generate base64:

```json
{
  "text": "const x = \"hello\";\nconsole.log(x);"
}
// Returns: Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7
```

---

## Why Dual Encoding?

| Layer | Description |
|-------|-------------|
| **JSON-RPC Transport** | Auto-handles escaping, most cases don't need concern |
| **Agent Internal Generation** | LLM may struggle with complex code, base64 as fallback |

**Recommendation**:
- Simple content → `text` mode (default)
- Complex code (many quotes, template strings) → `base64` mode
- Agent judges autonomously, calls `afc_encode_string` when needed

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