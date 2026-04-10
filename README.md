# agent-file-control MCP Server

[English](README_EN.md) | 中文

完整的文件控制 MCP 服务器，基于 Node.js/TypeScript 实现。使用 base64 编码完全绕过 JSON 特殊字符解析问题。

## 安装

```bash
npm install -g agent-file-control-mcp-server

# 或使用 npx 无需安装
npx -y agent-file-control-mcp-server
```

或者从源码构建：

```bash
git clone https://github.com/LeenixP/agent-file-control-mcp-server.git
cd agent-file-control-mcp-server
npm install
npm run build
```

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

Claude Code 支持三种配置范围：

#### 用户范围（推荐，所有项目可用）

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

#### 项目范围（团队共享）

在项目根目录创建 `.mcp.json`：

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
claude mcp add --scope project agent-file-control -- npx -y agent-file-control-mcp-server
```

#### 本地范围（仅当前项目）

```bash
claude mcp add --scope local agent-file-control -- npx -y agent-file-control-mcp-server
```

### 使用本地路径（开发测试）

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

## 配置文件位置对比

| 客户端 | 用户范围 | 项目范围 | 本地范围 |
|--------|----------|----------|----------|
| **OpenCode** | `~/.config/opencode/opencode.json` (mcp 字段) | 暂不支持 | 暂不支持 |
| **Claude Code** | `~/.claude.json` (mcpServers) | 项目根目录 `.mcp.json` | `~/.claude.json` (projects 字段下) |

---

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
| `afc_file_info` | 获取文件/目录元信息（大小、权限、行数）|
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

---

## Base64 编码示例

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

---

## 为什么使用 Base64？

MCP 客户端将文件内容作为 JSON 字符串传输，当内容包含以下字符时会出错：
- JSON 特殊字符（`"`、`\`、换行符）
- 二进制数据
- 包含引号和转义字符的复杂代码

Base64 编码将所有内容编码为安全的 ASCII 字符，完全绕过这些问题。

---

## 管理命令

### Claude Code

```bash
# 查看服务器列表
claude mcp list

# 查看服务器详情
claude mcp get agent-file-control

# 删除服务器
claude mcp remove agent-file-control -s user

# 在 Claude Code 中检查状态
/mcp
```

---

## License

MIT © [LeenixP](https://github.com/LeenixP)