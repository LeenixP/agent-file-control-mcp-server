# agent-file-control MCP Server

Complete file control MCP server using Node.js/TypeScript. Uses base64 encoding to completely bypass JSON parsing issues with special characters.

## Installation

```bash
npm install
npm run build
```

## Usage

### As stdio MCP server

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "agent-file-control": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

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
| `afc_file_info` | Get file/directory metadata |
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

## Base64 Encoding

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

## Why Base64?

OpenCode and other MCP clients transmit file content as JSON strings, which breaks when content contains:
- JSON special characters (`"`, `\`, newlines)
- Binary data
- Complex code with quotes and escapes

Base64 encoding completely bypasses these issues by encoding all content as safe ASCII characters.