# 库存与采购工作台生成试点

本页保留库存试点的原始对照。组件候选包 `0.1.0-candidate.6` 和配套 MCP
`0.1.0-candidate.3` 为该次实验的本地快照。当前候选包、Skill 和 MCP 已撤回
库存配方。示例保存在 [内部测试夹具](../../../tests/distribution/fixtures/shared/inventory-workbench/InventoryWorkbench.tsx)。

试点借鉴 Astryx 的区域宽度预算、基于渲染证据的评审和独立会话的同题对照。
[布局指南](https://astryx.atmeta.com/docs/layout) ·
[产品评审](https://astryx.atmeta.com/docs/is-my-code-good) ·
[Vibe Test](https://astryx.atmeta.com/blog/vibe-tests)

## 原试点验收

在独立 Next.js 16.4.3 和 Vite 8.3.5 应用中安装候选包，将已安装知识目录中的
TSX/CSS 复制到应用源码，从 `/inventory-workbench` 打开生产构建。示例数据固定，
草稿在当前页面会话内维护。实际采购数据和持久化由消费项目接入。

| 检查 | 两个宿主的结果 | 证据 |
|---|---|---|
| Skill 与 MCP 发现 | 通过 | 中英文 Skill 指向同一索引；Codex 识别项目 Skill 和 MCP。两种 MCP 协议模式均可列出、搜索、读取配方，并读取与磁盘一致的 TSX/CSS。 |
| 首屏和区域 | 通过 | `1440×900` 时首个加入按钮距页面顶端约 310px。库存区 872px，摘要区 320px。库存数值按列对齐。 |
| 窄屏 | 通过 | `390×844` 时首个行内操作位于约 411px，库存、补货线、单价均有可见字段名。`320×740` 下无横向溢出。 |
| 实际操作 | 通过 | 空清单链接定位库存标题；搜索 SKU、清除无结果条件并回到搜索框；键盘加入 9 件后调整为 10 件。下载 CSV 中有正确 SKU、数量和 23.90 美元单价，页面预估为 239.00 美元。移除后回到空清单并恢复焦点。 |
| 可访问性与主题 | 通过 | 每个宿主扫描桌面空/有内容、移动端库存、深色摘要、320px 深色五种状态，Axe 共 10 次扫描、0 项报告。人工查看库存层级和深色摘要截图。 |
| 构建和版本保护 | 通过 | 两个宿主均通过类型检查和生产构建。与原候选包对比，88 个组件、样式、字体和 Token 文件的摘要一致。 |

从仓库根目录运行下列命令可复验内部夹具。验证器将夹具复制到测试宿主，组件来自
本次构建的候选包。报告包含视口、溢出宽度、Axe 结果和截图文件名。

```sh
YAMI_DISTRIBUTION_OUTPUT_DIR=dist/inventory-workbench-review pnpm verify:design-system-candidate
YAMI_DISTRIBUTION_OUTPUT_DIR=dist/inventory-workbench-review pnpm verify:yami-design-cli --native-codex
```

原试点本地回执在 `dist/generation-quality/final/cli-verification/result.json`。
同目录的 `{next,vite}-workbench-*.png` 对应验收表的浏览器状态。

## 同题生成对照

使用两个独立 Vite 消费项目和相同的中文任务、商品数据、预装依赖、Skill 引导及样式入口。
一组安装原组件候选包 `0.1.0-candidate.5`，另一组安装 `0.1.0-candidate.6`。
两个候选包的公开导出、依赖和运行时文件一致，包身份及知识快照随版本变化。
固定 Codex CLI 0.155.0、`gpt-6-sol` 和 medium 推理强度。各组仅取独立会话的首次完成结果。
两组只使用本地 Skill 和随包文件，MCP 能力通过上面的独立消费测试核对。

两组按同一验收表分别检查，渲染使用 Chromium 156.0.8078.4。

| 检查 | 现有 Skill（`24e71186`） | Skill 加配方（`19d3e8f4`） |
|---|---|---|
| 公开入口、Token 和构建 | 通过。已用的组件入口和 CSS 变量均可从包内查到。 | 通过。读取了配方，复制并按业务数据调整了示例。 |
| 桌面比较与首屏操作 | 通过。6 行按列对齐，首个加入按钮在约 510px。大号红色价格与补货状态同时争夺注意力。 | 通过。6 行按列对齐，首个加入按钮在约 310px。低库存和导出各自承担行级与页面级强调。 |
| 390px 和 320px 窄屏 | 通过。字段有标签，页面无横向溢出。390px 下首个按钮在 727px，首屏有 1 个加入动作。320px 下需滚动才能加入。 | 通过。字段有标签，页面无横向溢出。390px 下首个按钮在 411px，首屏有 3 个加入动作。320px 下首屏有 2 个。 |
| 搜索与采购 | 通过。SKU 搜索和无结果恢复可用，空清单有下一步说明。加入 9 件、调整到 10 件并下载正确数据，移除后恢复空清单。 | 通过。相同流程可用，另有空清单到库存标题的链接。两组都得到 189.00 美元的预估。 |
| 键盘与可访问性 | 需修正。两个桌面状态各有 6 个加入按钮的可访问名称与可见标签不匹配。键盘移除后焦点落到 `body`。 | 通过。6 个状态的 Axe 扫描均为 0 项报告。键盘移除后焦点回到采购清单标题。 |

本轮通过项为 4/5 和 5/5。可量化的差异集中在手机首屏密度与键盘移除后的焦点。
配方组的行内按钮还直接显示建议数量，店员可在加入前确认。
本轮只有一个库存任务和每组一次生成，人工查看截图时知道分组。结果覆盖操作密度
和可访问性。后续视觉复核发现桌面列间距偏散，手机端加入商品后需跳到清单才能查看
总量和金额。样例留作内部回归测试。

本地证据目录为 `dist/generation-quality/experiment/`。两组的
`*-review.json` 记录 DOM 测量、Axe、焦点与下载内容，`*-source/` 保存各自的首次生成源码，
`*.jsonl` 保存执行记录。同目录保留 `seed/`、`task.txt`、`run.sh` 和 `review.mjs`。
`input-sha256.txt` 锁定两份实验 tarball、任务和数据。该次试点的本地快照在
`dist/generation-quality/final/`，来自本地工作树并标记 `sourceDirty: true`。
实验后调整了配方英文引言。两份候选内容的文件差异只有配方 Markdown 和对应索引摘要，
对比记录见 `runtime-parity.json`。

任务原文如下。

> 请用这个项目已接入的 YAMI Design System 做一个中文的门店补货工作台。店员每天要核对商品名称、规格、现有库存、补货线和单价，快速找出需要补货的商品，并完成本次采购。
>
> 使用 src/inventory.json 的数据（金额为美元分）。支持按商品名或 SKU 搜索，清楚标明库存不高于补货线的商品。能将商品加入采购清单，首次加入时按目标库存与现有库存之差推荐数量，正常库存默认加 1。支持调整数量和移除，显示预估金额，能下载包含 SKU、商品名、数量、美元单价的 CSV。清单从空状态开始。请让桌面和手机上的库存核对与采购操作都可用。
>
> 直接完成项目代码，用项目已有的类型检查和生产构建验证。以你提交的第一次实现为准。

任务数据位于两个项目相同的 `src/inventory.json`。

```json
[
  {"sku":"DRK-01","name":"桂花乌龙茶","pack":"12 瓶 / 箱","stock":3,"reorderAt":6,"target":12,"cents":1890},
  {"sku":"SNK-02","name":"照烧海苔米饼","pack":"10 袋 / 箱","stock":8,"reorderAt":4,"target":12,"cents":1520},
  {"sku":"DRK-03","name":"原味豆奶","pack":"8 盒 / 箱","stock":2,"reorderAt":3,"target":8,"cents":1200},
  {"sku":"PAN-04","name":"手工日晒细切拌面家庭分享装","pack":"6 包 / 箱","stock":11,"reorderAt":5,"target":16,"cents":2530},
  {"sku":"SNK-05","name":"蜂蜜黄油杏仁","pack":"12 袋 / 箱","stock":5,"reorderAt":5,"target":10,"cents":2890},
  {"sku":"PAN-06","name":"低盐昆布高汤","pack":"4 袋 / 箱","stock":9,"reorderAt":4,"target":12,"cents":1740}
]
```

复验可使用相同的两个本地 tarball。项目使用 React/React DOM 19.3.1、Vite 8.3.5、
TypeScript 6.0.2 与 React 类型 19.3.0。入口加载 YAMI 字体、Token、基础样式并挂载空的
`App`，`index.html` 设置 `lang="zh"`。在两个项目的 `AGENTS.md` 和项目 Skill
中使用相同的读取约定，从项目自己的安装包读取 `SKILL.zh-CN.md` 和相邻索引。
保留相同预装依赖和数据。各自在项目目录运行以下命令，从 stdin 输入任务原文。

```sh
codex exec --ignore-user-config --ignore-rules --disable hooks --disable multi_agent \
  --enable skip_host_skill_discovery --ephemeral --skip-git-repo-check \
  --sandbox workspace-write --model gpt-6-sol \
  -c 'approval_policy="never"' -c 'sandbox_workspace_write.network_access=false' \
  -c 'model_reasoning_effort="medium"' --json -
```

生产构建后分别核对公开组件与 Token、桌面数字对齐和首屏动作、窄屏可读与溢出、
搜索及采购流程、键盘与 Axe。记录通过、需修正或未检查，以及每个结论的 DOM、下载或截图证据。
CI 运行确定性的包、协议和浏览器检查。模型对照在本地单独执行。
