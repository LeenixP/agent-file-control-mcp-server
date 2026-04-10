# agent-file-control MCP Server

[English](README_EN.md) | 中文

完整的文件控制 MCP 服务器，基于 Node.js/TypeScript 实现。支持两种内容编码方式，灵活处理各种文件操作场景。

## 安装

```bash
npm install -g agent-file-control-mcp-server

# 或使用 npx 无需安装
npx -y agent-file-control-mcp-server
```

---

## 核心特性：双编码模式

所有写入类工具支持两种编码方式：

|编码模式 | 说明 | 适用场景 |
|----------|------|----------|
| `text`（默认） | 直接字符串，JSON-RPC 自动处理转义 | 大多数文本文件、简单内容 |
| `base64` | Base64 编码，绕过所有特殊字符问题 | 包含大量引号/转义的代码、二进制文件 |

**推荐**：日常使用 `text` 模式（默认），遇到复杂内容时切换 `base64`。

---

## 配置方法

### OpenCode 配置

编辑 `~/.config/opencode/opencode.json`，在 `mcp` 字段中添加：

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

### Claude Code 配置

编辑 `~/.claude.json`，添加 `mcpServers` 字段：

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

或使用命令行：

```bash
claude mcp add agent-file-control -- npx -y agent-file-control-mcp-server
```

---

## 可用工具

### 文件写入

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_write_file` | path, content, content_encoding, file_encoding, executable, create_dirs | 写入文件，支持双编码 |
| `afc_append_file` | path, content, content_encoding, create_if_missing | 追加内容，支持双编码 |

### 文件编辑

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_search_replace` | path, old_text, old_encoding, new_text, new_encoding, count | 搜索替换，支持双编码 |
| `afc_patch_lines` | path, start_line, end_line, new_content, content_encoding | 行范围替换，支持双编码 |

### 文件读取

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_read_file` | path, as_b64, encoding, start_line, end_line | 读取文件，可返回 base64 |

### 文件管理

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_file_info` | path | 获取文件/目录元信息 |
| `afc_list_dir` | path, recursive, max_depth, show_hidden, pattern | 列出目录内容 |
| `afc_copy` | src, dst, overwrite | 复制文件或目录 |
| `afc_move` | src, dst, overwrite | 移动/重命名 |
| `afc_delete` | path, recursive | 删除文件或目录 |
| `afc_mkdir` | path | 创建目录 |

### 编码工具

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_encode_string` | text | 字符串转 base64（Agent遇到复杂内容时可调用） |
| `afc_decode_b64` | b64, encoding | base64 转字符串 |

---

## 使用示例

### 默认模式（text）- 推荐

```json
// 写入简单文本
{
  "path": "/home/user/test.txt",
  "content": "Hello World",
  "content_encoding": "text"
}
```

### Base64 模式 - 复杂内容

当内容包含大量引号、转义符时：

```json
// 写入复杂代码
{
  "path": "/home/user/code.js",
  "content": "Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7",// base64 编码
  "content_encoding": "base64"
}
```

Agent 可调用 `afc_encode_string` 生成 base64：

```json
{
  "text": "const x = \"hello\";\nconsole.log(x);"
}
// 返回: Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7
```

---

## 为什么提供两种模式？

| 层面 | 说明 |
|------|------|
| **JSON-RPC传输** | 自动处理转义，大多数场景无需担心 |
| **Agent 内部生成** | LLM生成复杂代码时可能混乱，base64 模式作为备选 |

**建议**：
- 简单内容 → `text` 模式（默认）
- 复杂代码（多引号、模板字符串）→ `base64` 模式
- Agent 自主判断，遇到问题时调用 `afc_encode_string`

---

## 管理命令

```bash
# Claude Code
claude mcp list
claude mcp get agent-file-control
claude mcp remove agent-file-control -s user

# 在 Claude Code 中检查状态
/mcp
```

---

## License

MIT © [LeenixP](https://github.com/LeenixP)