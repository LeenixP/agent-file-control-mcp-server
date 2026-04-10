# agent-file-control MCP Server

English | [中文](README.md)

Complete file control MCP server built with Node.js/TypeScript. Uses base64 encoding to completely bypass JSON special character parsing issues.

## Installation

```bash
npm install -g agent-file-control-mcp-server

# Or use npx without installation
npx -y agent-file-control-mcp-server
```

Or build from source:

```bash
git clone https://github.com/LeenixP/agent-file-control-mcp-server.git
cd agent-file-control-mcp-server
npm install
npm run build
```

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

Claude Code supports three configuration scopes:

#### User Scope (Recommended, available in all projects)

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

#### Project Scope (Team shared)

Create `.mcp.json` in project root:

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
claude mcp add --scope project agent-file-control -- npx -y agent-file-control-mcp-server
```

#### Local Scope (Current project only)

```bash
claude mcp add --scope local agent-file-control -- npx -y agent-file-control-mcp-server
```

### Using Local Path (Development)

```json
{
  "mcpServers": {
    "agent-file-control": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/agent-file-control-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

---

## Configuration File Locations

| Client | User Scope | Project Scope | Local Scope |
|--------|------------|---------------|-------------|
| **OpenCode** | `~/.config/opencode/opencode.json` (mcp field) | Not supported | Not supported |
| **Claude Code** | `~/.claude.json` (mcpServers) | Project root `.mcp.json` | `~/.claude.json` (projects field) |

---

## Available Tools

### File Operations

| Tool | Description |
|------|-------------|
| `afc_write_file` | Write base64-encoded content to file |
| `afc_append_file` | Append base64-encoded content to file |
| `afc_read_file` | Read file contents (supports line ranges, base64 output) |
| `afc_search_replace` | Search and replace in file (base64 encoded patterns) |
| `afc_patch_lines` | Replace specific line range in file |

### File Management

| Tool | Description |
|------|-------------|
| `afc_file_info` | Get file/directory metadata (size, permissions, line count) |
| `afc_list_dir` | List directory contents (recursive, filtering) |
| `afc_copy` | Copy file or directory |
| `afc_move` | Move/rename file or directory |
| `afc_delete` | Delete file or directory |
| `afc_mkdir` | Create directory |

### Encoding Utilities

| Tool | Description |
|------|-------------|
| `afc_encode_string` | Encode string to base64 |
| `afc_decode_b64` | Decode base64 to string |

---

## Base64 Encoding Examples

To generate base64 for file content:

**Linux/Mac:**
```bash
echo -n 'content' | base64
```

**Node.js:**
```javascript
Buffer.from('content').toString('base64')
```

**Python:**
```python
import base64
print(base64.b64encode(b'content').decode())
```

---

## Why Base64?

MCP clients transmit file content as JSON strings, which breaks when content contains:
- JSON special characters (`"`, `\`, newlines)
- Binary data
- Complex code with quotes and escapes

Base64 encoding completely bypasses these issues by encoding all content as safe ASCII characters.

---

## Management Commands

### Claude Code

```bash
# List all servers
claude mcp list

# Get server details
claude mcp get agent-file-control

# Remove server
claude mcp remove agent-file-control -s user

# Check status in Claude Code
/mcp
```

---

## License

MIT © [LeenixP](https://github.com/LeenixP)