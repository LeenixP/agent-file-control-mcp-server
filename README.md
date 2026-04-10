# agent-file-control MCP Server

[English](#english) | 中文

完整的文件控制 MCP 服务器，基于 Node.js/TypeScript 实现。使用 base64 编码完全绕过 JSON 特殊字符解析问题。

## 安装

```bash
npm install agent-file-control-mcp-server
```

或者从源码构建：

```bash
git clone https://github.com/LeenixP/agent-file-control-mcp-server.git
cd agent-file-control-mcp-server
npm install
npm run build
```

## 使用方法

### 作为 stdio MCP 服务器

添加到你的 MCP 配置中：

```json
{
  "mcpServers": {
    "agent-file-control": {
      "command": "npx",
      "args": ["agent-file-control-mcp-server"]
    }
  }
}
```

或者使用本地路径：

```json
{
  "mcpServers": {
    "agent-file-control": {
      "command": "node",
      "args": ["/path/to/agent-file-control-mcp-server/dist/index.js"]
    }
  }
}
```

## 可用工具

### 文件操作

| 工具 | 描述 |
|------|------|
| `afc_write_file` | 写入 base64 编码内容到文件 |
| `afc_append_file` | 追加 base64 编码内容到文件 |
| `afc_read_file` | 读取文件内容（支持行范围、base64 输出）|
| `afc_search_replace` | 文件内搜索替换（base64 编码模式）|
| `afc_patch_lines` | 替换指定行范围内容 |

### 文件管理

| 工具 | 描述 |
|------|------|
| `afc_file_info` | 获取文件/目录元信息 |
| `afc_list_dir` | 列出目录内容（支持递归、过滤）|
| `afc_copy` | 复制文件或目录 |
| `afc_move` | 移动/重命名文件或目录 |
| `afc_delete` | 删除文件或目录 |
| `afc_mkdir` | 创建目录 |

### 编码工具

| 工具 | 描述 |
|------|------|
| `afc_encode_string` | 字符串转 base64 |
| `afc_decode_b64` | base64 转字符串 |

## Base64 编码

生成文件内容的 base64 编码：

**Linux/Mac:**
```bash
echo -n '内容' | base64
```

**Node.js:**
```javascript
Buffer.from('内容').toString('base64')
```

**Python:**
```python
import base64
print(base64.b64encode(b'内容').decode())
```

## 为什么使用 Base64？

OpenCode 和其他 MCP 客户端将文件内容作为 JSON 字符串传输，当内容包含以下字符时会出错：
- JSON 特殊字符（`"`、`\`、换行符）
- 二进制数据
- 包含引号和转义字符的复杂代码

Base64 编码将所有内容编码为安全的 ASCII 字符，完全绕过这些问题。

---

<a name="english"></a>
# agent-file-control MCP Server (English)

中文 | [English](#english)

Complete file control MCP server built with Node.js/TypeScript. Uses base64 encoding to completely bypass JSON special character parsing issues.

## Installation

```bash
npm install agent-file-control-mcp-server
```

Or build from source:

```bash
git clone https://github.com/LeenixP/agent-file-control-mcp-server.git
cd agent-file-control-mcp-server
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
      "command": "npx",
      "args": ["agent-file-control-mcp-server"]
    }
  }
}
```

Or use local path:

```json
{
  "mcpServers": {
    "agent-file-control": {
      "command": "node",
      "args": ["/path/to/agent-file-control-mcp-server/dist/index.js"]
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

## License

MIT © [LeenixP](https://github.com/LeenixP)