# agent-file-control MCP Server

[English](README_EN.md) | 中文

完整的文件控制 MCP 服务器，基于 Node.js/TypeScript 实现。支持三种内容写入模式，灵活处理各种文件操作场景，包括 Unicode 字符问题。

## 安装

```bash
npm install -g agent-file-control-mcp-server

# 或使用 npx 无需安装
npx -y agent-file-control-mcp-server
```

---

## 核心特性：三种写入模式

所有写入类工具支持三种编码方式：

| 编码模式 | 工具 | 适用场景 |
|----------|------|----------|
| `text`（默认） | `afc_write_file` | 简单文本，无特殊字符 |
| `base64` | `afc_write_file` + `afc_encode_string` | 复杂代码（大量引号、反斜杠），但**无法解决 Unicode 问题** |
| **生成器模式** | `afc_write_generated` | **包含 Unicode 字符的代码（推荐）** |

### ⚠️ Unicode 字符问题

Go/Python/TypeScript 代码中的 Unicode 字符（如 `\u25cf` → `●`、`\u2713` → `✓`）在 JSON-RPC 传输时会出问题：

**问题根源：**
- Agent 生成的 `"value": "●"` → JSON 序列化 → `"value": "\\u25cf"` → 文件内容错误
- Base64 模式也无法解决，因为问题发生在 JSON 序列化阶段，而非传输阶段

**解决方案：生成器模式**
- Agent 只传递简单的 key-value 参数（如 `{ "name": "radioOn", "value": "●" }`）
- MCP server 在内部生成文件内容
- 完全绕过 JSON 序列化问题

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

### 文件生成器（优先使用）

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_write_generated` | path, generator, input, executable, create_dirs | 使用生成器创建文件，支持 Unicode |
| `afc_list_generators` | detailed | 列出所有可用生成器及其详情 |

### 文件写入

| 工具 | 参数 | 说明 |
|------|------|------|
| `afc_write_file` | path, content, content_encoding, file_encoding, executable, create_dirs | 写入文件，支持 text/base64 编码 |
| `afc_append_file` | path, content, content_encoding, create_if_missing | 追加内容，支持 text/base64 编码 |

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
| `afc_encode_string` | text | 字符串转 base64（用于复杂代码，不含 Unicode） |
| `afc_decode_b64` | b64, encoding | base64 转字符串 |

---

## 内置生成器

| 生成器 | 用途 | 输入参数 |
|--------|------|----------|
| `go-constants` | Go 常量定义（**Unicode 字符支持**） | package, constants（数组） |
| `go-struct` | Go 结构体 + JSON tags | package, structName, fields（数组） |
| `go-interface` | Go 接口定义 | package, interfaceName, methods（数组） |
| `python-constants` | Python 常量 | constants（数组） |
| `python-class` | Python 类 + `__init__` | className, fields（数组） |
| `typescript-interface` | TypeScript 接口 | interfaceName, fields（数组） |
| `typescript-constants` | TypeScript 常量 | constants（数组） |
| `json-config` | JSON 配置文件 | data（对象） |
| `yaml-config` | YAML 配置文件 | data（对象） |
| `shell-script` | Shell 脚本（自动设置 executable） | commands（数组） |
| `dockerfile` | Dockerfile（多阶段支持） | stages（数组） |
| `gitignore` | .gitignore（语言预设） | language |
| `html-template` | HTML 文档 | title, body（数组） |
| `css-styles` | CSS 样式表 | rules（数组） |
| `markdown-doc` | Markdown 文档 | title, sections（数组） |

查看生成器详情：调用 `afc_list_generators(detailed=true)`

---

## 使用示例

### 生成器模式 - Unicode 字符（推荐）

```json
// 生成 Go 常量文件，包含 Unicode 符号
{
  "path": "/path/to/styles.go",
  "generator": "go-constants",
  "input": {
    "package": "tui",
    "constants": [
      { "name": "radioOn", "value": "●", "comment": "选中状态" },
      { "name": "radioOff", "value": "○", "comment": "未选中状态" },
      { "name": "cursorStr", "value": "▸ " },
      { "name": "checkMark", "value": "✓" }
    ]
  }
}

// 生成的文件内容：
// package tui
// 
// const (
//     radioOn   = "●" // 选中状态
//     radioOff  = "○" // 未选中状态
//     cursorStr = "▸ "
//     checkMark = "✓"
// )
```

### 生成器模式 - 结构体

```json
// 生成 Go 结构体
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

### Text 模式 - 简单文本

```json
// 写入简单文本
{
  "path": "/home/user/test.txt",
  "content": "Hello World",
  "content_encoding": "text"
}
```

### Base64 模式 - 复杂代码（无 Unicode）

```json
// 写入复杂 JavaScript 代码
{
  "path": "/home/user/code.js",
  "content": "Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7",
  "content_encoding": "base64"
}

// 先调用 afc_encode_string 生成 base64：
{
  "text": "const x = \"hello\";\nconsole.log(x);"
}
// 返回: Y29uc3QgeCA9ICJoZWxsbztcblxuY29uc29sZS5sb2coeCk7
```

---

## 模式选择决策

| 场景 | 推荐模式 | 工具 |
|------|----------|------|
| **Go/Python/TS 常量/类/接口** | 生成器 | `afc_write_generated` |
| **包含 Unicode 字符** | 生成器 | `afc_write_generated` |
| 简单文本 | text | `afc_write_file(content_encoding="text")` |
| 复杂代码但无 Unicode | base64 | `afc_write_file(content_encoding="base64")` |
| 精确行编辑 | text | `afc_patch_lines` |
| 配置文件 | 生成器 | `afc_write_generated(generator="json-config/yaml-config")` |

---

## 生成器工作原理

```
Agent 调用 afc_write_generated({ generator: "go-constants", input: {...} })
    ↓
MCP server 接收参数，在内部生成文件内容
    ↓
直接写入文件（绕过 JSON 序列化）
```

**关键优势：**
- Agent 只传简单 key-value 数据
- MCP server 内部处理复杂内容生成
- Unicode 字符直接写入文件，无转义问题

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