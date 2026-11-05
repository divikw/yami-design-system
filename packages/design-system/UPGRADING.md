# 升级与回退候选包

候选包仍只用于获授权环境的本地验证。交付记录不等于发布到 npm 或内部包仓库。

## 消费项目升级

1. 保留当前两个原始 tarball、消费项目 lockfile 和已经通过的页面验证记录。
2. 阅读新包中的 `UPGRADE.json`，核对组件包与 MCP 的配对版本、迁移步骤及视觉/交互说明。
3. 安装新的两个 tarball 并更新 lockfile，不复制另一版本的全局 Skill。
4. 重启项目 MCP；通过 `list_components` 返回的 `snapshot` 核对安装版本和内容摘要。
5. 运行消费项目自己的类型检查、生产构建和主要页面交互检查，覆盖所用语言、主题与屏幕尺寸。

出现问题时恢复原始两个 tarball 与旧 lockfile，重新安装并重启 MCP，再验证页面。
不要把同版本重新构建的文件当作原始回退产物；源码提交、构建身份和内容可能不同。

## 维护者的交付保护

`tooling/distribution/releases/` 保存已经交付的版本、原始 tarball SHA-512、内容摘要、
完整 `.d.ts`、公开 Token 名称与运行时文件摘要。记录不包含字体文件或业务图片。
初始基线是 PR #199 已验证的组件 candidate.4 / MCP candidate.1，来源为该 PR 评审过的合并前提交
`3901d8e310c9bd3689dbaf39a12b7ec7f86365d1`，并非重新构建的主分支产物。

已记录的组件和 MCP 版本不允许再次打包，检查发生在清空构建目录和写 tarball 之前。
需要重用时恢复原始文件；需要修改时提升版本。未交付的新候选允许反复构建和验证。

每次升级在 `distribution/upgrades/<新组件版本>.json` 记录：

- 基线和目标组件/MCP 版本；两个包一起更新，MCP 精确绑定组件版本。
- `changeType`：`patch`、`minor` 或 `major`。
- `summary`、`migration`、`rollback`、`visualAndBehavior`：非空的变更、迁移、回退和人工审查说明。

版本支持 `X.Y.Z` 和 `X.Y.Z-candidate.N`。预发布序号按数字比较。
兼容修复可增加 patch 或同一预发布系列的序号；新增公开 API/Token 至少增加 minor；
破坏性变化至少增加 major。即使仍为 0.x，破坏性变化也不能只增加 candidate 序号。

## 自动检查覆盖

打包会自动执行升级检查，也可以在已有构建上单独运行：

```bash
pnpm check:distribution-upgrade
```

检查实际打包的 TypeScript 声明与上一交付版本，包含包导出、具名导出、类型赋值兼容性、
可选属性删除、必填属性增加、枚举收窄与公开 Token 删除/改名。新增能力要求 minor。
联合类型按各分支的属性名合并检查，避免漏掉分支独有的可选属性。
宿主 peer 要求变化保守地按破坏性变化处理，需要独立兼容性评审。

回执在 `dist/candidate-upgrade.json`，先写 `running`，检查完成后才写 `pass` 或 `fail`。
`runtimeChanged` 比较组件 JS/CSS、Token 数据、基础样式、字体摘要与外部依赖版本。类型通过不能证明
视觉、默认值、交互或无障碍兼容；这些仍需人工说明与浏览器验证。
带默认参数的泛型按默认实例检查，并比较组件函数签名，不枚举全部泛型实参。
遇到带必需泛型参数的公开类型别名或接口时检查会停止，需先增加明确的兼容夹具。
JSON 知识 schema、任意运行时语义与所有 TypeScript 使用方式并未得到完整兼容性证明。

## 交付检查

```bash
pnpm test:distribution
pnpm verify:design-system-candidate
```

第二个命令在独立 Next.js/Vite 消费项目检查安装内容、随包 Skill、MCP 协议、类型、
生产构建和浏览器交互。升级说明是计划与审查记录，不能代替实际通过的验证回执。
交付前保留原始产物；审核交付记录与升级说明，不改写旧记录来绕过版本保护。

已评审并确定要交付的候选，可在干净源码提交上完成上述验证后执行：

```bash
pnpm record:distribution-delivery
```

该命令只新增本地交付记录，不发布或上传包。它核对源码提交、两个包的内容摘要、
原始 tarball SHA-512，以及两种宿主的类型、构建、MCP 和浏览器成功回执；旧成功回执不能
用于另一份构建。记录使用排他写入，不覆盖已存在的文件。
保存记录后，将下一开发候选版本与迁移说明一并推进，再运行 CI；已交付的版本不再用于打包。
CI 对照 PR 基线或推送前提交，禁止修改、删除或用软链接替换已经存在的交付记录。
