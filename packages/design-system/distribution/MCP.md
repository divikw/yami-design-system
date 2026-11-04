# YAMI 只读 MCP 候选包

`@yami/design-system-mcp@0.1.0-candidate.1` 是本地 stdio MCP 服务，绑定
`@yami/design-system@0.1.0-candidate.4` 的知识快照。两个包均为 private 本地候选包，
尚未发布。MCP SDK 与 Zod 只安装在配套服务中，不进入 React 组件运行时。

## 安装与启动

在 YAMI 仓库运行 `pnpm pack:design-system-candidate`，会同时生成两个 `.tgz`。
在消费项目中安装两者及 lockfile，不使用源码链接，也不使用 `npx -y` 下载未发布的包：

```bash
npm install /absolute/path/to/yami-design-system-0.1.0-candidate.4.tgz /absolute/path/to/yami-design-system-mcp-0.1.0-candidate.1.tgz
```

需要 Node 24。服务命令入口为消费项目的
`node_modules/.bin/yami-design-system-mcp`；也可用 Node 定位真实入口：

```bash
node -p "require.resolve('@yami/design-system-mcp/cli')"
```

将解析结果填入 MCP 客户端的 stdio 配置。下面是通用 JSON 配置示例，需替换为消费项目
实际路径；客户端配置格式以其文档为准。此文件不会自动修改全局配置或启用服务。

```json
{
  "mcpServers": {
    "yami-design-system": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/consumer/node_modules/@yami/design-system-mcp/cli.mjs"]
    }
  }
}
```

服务从自身安装位置解析组件包 peer，不从工作目录、另一个 checkout 或全局 Skill
读取知识，因此可以在其他目录启动。无需 API key、登录、端口或模型服务。
不能直接启动源码仓库的 `tooling/mcp/cli.mjs`，它需要打包后的目录布局。

## 查询接口

| Tool | 参数 | 返回内容 |
|---|---|---|
| `list_design_documents` | 无 | 文档 ID、标题、总行数和 Resource URI |
| `search_design_documents` | `query`，可选 `id`、`limit` | 字面量忽略大小写搜索，命中文档、行号和片段 |
| `read_design_document` | `id`，可选 `startLine`、`maxLines` | 分页原文及 `nextLine` |
| `list_components` | 无 | 当前包完整公开清单、导入路径及契约/用法/示例 URI |
| `get_component_contract` | `component` | 属性、Token 绑定、无障碍等完整元数据 |
| `get_component_example` | `component`，可选 `example` 导出名 | 可复制 TSX 原文与导出名 |

先列文档，再使用返回的 ID；例如 `DESIGN.compact`、`DESIGN`、`content/voice`、
`components/Button/usage`。先搜索定位规则，再按返回行号读取上下文。分页最多 200 行，
搜索最多 20 项；`truncated` 表示仍有命中，可缩小到特定文档继续查询。
目前组件范围仍为 Button、Input、Card、ProductCard、ProductList。

每个成功 Tool 返回 `snapshot`：包名、包版本、源码提交、工作树状态和内容指纹。
标准 MCP `resources/list` / `resources/read` 同时提供索引、Skill、规范、Token、
契约和示例原文；URI 含候选包版本，内容的 `_meta["yami.design/snapshot"]` 提供相同身份。
Resources 保留原文字节，不在示例代码中插入版本前缀。客户端支持 Resources 的方式不同，
只支持 Tool 的客户端也可完成上述三类查询。

## 只读边界与失败行为

服务启动时校验组件包版本、知识 schema、来源身份、公开清单，以及索引和所有暴露文件
的 SHA-256。缺文件、摘要不符、混用版本或路径逃逸时启动失败，错误仅输出到 stderr；
stdout 专用于 MCP 协议。摘要用于发现内容不一致，不是发布者签名。

知识查询只读取索引列出的本地文件，并保存在内存中作为本次进程的固定快照。它不读取任意
请求路径、不跟随包外软链接、不抓取上游网页，也不执行示例或写入消费项目。
更新安装包后需重启服务；进程运行中修改磁盘文件不会改变已加载快照。
未知组件、文档、示例、URI 和越界参数会报错，不回退到其他版本或全量源码组件库。

只读标记用于描述接口；实际边界由参数校验、文件白名单和实现共同保证。
本服务不提供设计校验、组件安装、代码生成、HTTP 托管、MCP 配置写入或 shadcn 适配。

## 验证

`pnpm test:distribution` 检查两个实际 tarball 的内容契约，以及摘要、版本和路径错误。
`pnpm verify:design-system-candidate` 在独立 Next.js/Vite 消费项目安装两个 tarball，
由官方 MCP Client 启动真实 stdio 进程，完成握手、Tool/Resource 发现、规范搜索分页、
五个组件契约和示例读取及错误查询，再验证组件类型、构建和浏览器交互。
协议结果写入 `dist/candidate-verification/result.json`；验证不会发布包。

实现采用[官方 TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)，
使用其 stdio 服务、协议校验和旧客户端兼容层；验证固定 SDK 2.4.0、Zod 4.6.7。
