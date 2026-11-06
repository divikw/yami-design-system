# 跨项目消费试点复验

本轮使用原始本地候选包，覆盖已有界面修改、缺组件时的处理、Codex 原生 MCP 调用，以及补货台的
接入和版本切换。整页试点、业务素材和原始 tarball 保存在内部归档中。

## 已有榜单修改与缺组件用例

从 PR #205 留存的 Vite 首页建立两个独立副本，安装组件包 0.2.0-candidate.4、MCP 0.1.0-candidate.8
和 CLI 0.1.0-candidate.1。两个副本均通过 init、doctor、类型检查和生产构建。Codex CLI 0.155.0
使用 gpt-6-astra，各保留一次首次完成结果。

| 用例 | 首次结果 |
|---|---|
| 增加可清除的榜单筛选 | 桌面 1440 × 900 和手机 402 × 844 均验证了「抹茶」匹配 1 件、清除恢复 6 件及输入焦点、分类切换和无匹配提示。商品跳转、加购和滚动后的全站搜索通过。手机首张商品图露出由 82px 变为 22px。 |
| 请求复用 Pagination | MCP 公开清单无该组件，契约与示例查询返回参数校验错误。模型报告缺口后停止，副本文件哈希前后一致，生产构建与基线一致。 |

筛选用例中模型自行修正了一处标题类型错误。人工复核保留首次源码。两次会话均读取随包中文 Skill
并通过本地 stdio 查询实际 MCP 服务。截图、事件、首次差异与已验证的重建命令见内部归档
`dist/product-list-refinement-pilot/REPORT.md`。

## Codex 原生 MCP 工具复验

OpenAI Docs 说明项目级 `.codex/config.toml` 由受信任的项目加载。本轮在全新 Git 消费项目执行 init，
保留生成的配置和 Skill。以相同项目、包和模型对照两种启动方式。正常加载项目配置时，模型直接调用
`yami_design_system` 的 `list_components`。使用 `--ignore-user-config` 的对照会话未显示该工具。
[OpenAI MCP 配置文档](https://learn.chatgpt.com/docs/extend/mcp)

成功事件的 `snapshot` 与同项目 `doctor --json` 一致，组件版本为 `0.2.0-candidate.4`，
源码提交为 `1c5183a1a5dfa3b4f064b0dde5606d37219ee78d`，内容摘要为
`8c6904a50c2d2c8af246f1a7b2bb13080e0060b349956a6b94fd372ed9dab5a5`。只读复验也得到相同快照。
CLI 生成文件和依赖清单的 SHA-256 前后一致。

在已审查且完成 init 的独立 Git 项目根目录运行以下命令，需要已登录的 Codex CLI 和 jq。信任设置
只传给本次进程。脚本要求至少一次真实的 MCP 调用，并核对所有调用的快照与 doctor 回执一致。

~~~sh
set -e
consumer_dir=$(pwd -P)
probe_dir=$(mktemp -d "${TMPDIR:-/tmp}/yami-native-mcp.XXXXXX")
project_key=$(jq -n --arg path "$consumer_dir" '$path')
trust="projects={$project_key={trust_level=\"trusted\"}}"
./node_modules/.bin/yami-design-cli doctor --json > "$probe_dir/doctor.json"
codex -C "$consumer_dir" -c "$trust" -c analytics.enabled=false \
  --disable apps --disable plugins --disable hooks --disable multi_agent --disable shell_tool \
  -a never exec --ephemeral --ignore-rules --sandbox read-only --model gpt-6-astra \
  -c 'web_search="disabled"' --json --color never \
  '只使用项目的 yami_design_system 原生 MCP 工具直接调用 list_components，返回 snapshot 的包版本、源码提交和内容摘要。' \
  </dev/null > "$probe_dir/events.jsonl"
jq -es --slurpfile doctor "$probe_dir/doctor.json" '
  ($doctor[0] | .status == "pass" and (.snapshot | type == "object")) and
  ([.[] | select(.type == "item.completed" and .item.type == "mcp_tool_call") | .item
    | .server == "yami_design_system" and .tool == "list_components" and
      .status == "completed" and .result.structured_content.snapshot == $doctor[0].snapshot]
   | length > 0 and all)
' "$probe_dir/events.jsonl"
printf 'MCP 回执目录：%s\n' "$probe_dir"
~~~

原生调用与对照会话保存在 `dist/yami-adoption-closure/` 的 `native-read-only-events.jsonl` 和
`native-ignore-user-events.jsonl`，汇总在 `native-receipt.json`。

## Pantry Restock 接入、升级和回退

从独立补货台 `yami-pantry-restock` 提交 `fcea836` 归档源码，复用既有消费副本
`yami-pantry-restock-yami` 提交 `f0e9803` 中的界面接线和测试。隔离副本使用原应用的本地样例库存
数据和浏览器采购草稿。原应用的搜索、数量、刷新恢复与 CSV 导出均纳入验收。

| 阶段 | 组件包 / MCP | 结果 |
|---|---|---|
| 原应用 | 原始依赖 | 类型检查、生产构建和 4 项浏览器测试通过。 |
| 首次接入 | `0.1.0-candidate.5` / `0.1.0-candidate.2` | 根据既有消费锁文件核对原始 tarball，CLI dry run、init、doctor 通过。 |
| 配对升级 | `0.2.0-candidate.4` / `0.1.0-candidate.8` | 同次更新两个 tarball 引用并安装。doctor 返回新包快照。 |
| 回退 | `0.1.0-candidate.5` / `0.1.0-candidate.2` | 恢复原始 tarball、依赖清单和锁文件。doctor 返回旧快照，生产构建与首次接入逐字节一致。 |

接入后每个阶段均通过类型检查、生产构建和 6 项浏览器测试，覆盖 1440 × 1000 桌面及 390 × 844 手机。
三个阶段的项目 Skill 和 MCP 配置字节一致。在同一浏览器上下文和站点地址下，初始 5 件东北大米、
$64.95 的草稿升级后保留。升级期间增至 6 件，回退后仍为 6 件、$77.94，两个视口导出的 CSV 均正确。

内部归档 `dist/yami-adoption-closure/pantry/` 中的 `consumer-source/` 保存已接线源码和原始 tarball，
各阶段的依赖清单与锁文件在 `initial/`、`upgraded/`、`rollback/`。在 YAMI 仓库根目录运行以下命令，
在临时项目回放三个版本的构建与浏览器验收，并与归档的各阶段 doctor 回执核对。需要 Node 24、
Python 3、jq、仓库锁定依赖和 Playwright Chromium。

~~~sh
set -e
pantry_dir="$PWD/dist/yami-adoption-closure/pantry"
replay_dir=$(mktemp -d "$PWD/dist/yami-pantry-lifecycle-replay.XXXXXX")
consumer_dir=$(mktemp -d "${TMPDIR:-/tmp}/yami-pantry-lifecycle.XXXXXX")
cp -R "$pantry_dir/consumer-source/." "$consumer_dir/"
(
  cd "$consumer_dir"
  for stage in initial upgraded rollback; do
    cp "$pantry_dir/$stage/package.json" "$pantry_dir/$stage/package-lock.json" ./
    npm ci --ignore-scripts --no-audit --no-fund
    if [ "$stage" = initial ]; then
      ./node_modules/.bin/yami-design-cli init --locale zh \
        --design-package ./.artifacts/yami-design-system-0.1.0-candidate.5.tgz \
        --mcp-package ./.artifacts/yami-design-system-mcp-0.1.0-candidate.2.tgz
    fi
    ./node_modules/.bin/yami-design-cli doctor --json > "$replay_dir/$stage-doctor.json"
    jq -e --slurpfile expected "$pantry_dir/$stage-doctor.json" '
      .status == "pass" and .versions == $expected[0].versions and
      .snapshot == $expected[0].snapshot and .mcp.snapshot == .snapshot
    ' "$replay_dir/$stage-doctor.json" > /dev/null
    npm run typecheck
    npm run build
    port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])')
    PANTRY_TEST_PORT="$port" npm run test:browser -- --output "$replay_dir/$stage-screenshots"
    cp -R dist "$replay_dir/$stage-build"
  done
)
diff -qr "$replay_dir/initial-build" "$replay_dir/rollback-build"
cp "$pantry_dir/verify-draft-lifecycle.mjs" "$replay_dir/"
node "$replay_dir/verify-draft-lifecycle.mjs"
printf '回放结果目录：%s\n' "$replay_dir"
~~~

原始草稿验收和截图见归档中的 `draft-lifecycle.json` 与 `draft-*.png`。这份证据覆盖独立应用副本
中的本地消费与版本切换。
