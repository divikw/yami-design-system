# 跨项目消费契约：组件与设计知识候选包

状态：本地候选验证。包名为 `@yami/design-system`，版本由 `distribution.json`
管理，与当前 workspace 包及各组件的版本分别记录。尚未发布到 npm 或内部 Registry。

统一消费入口：[在现有项目使用 YAMI](https://yds-docsite.vercel.app/zh/docs/consume-package)。
该入口由本仓库文档站构建；线上版本以实际部署为准。升级与回退规则见同包
[UPGRADING.md](./UPGRADING.md)，本次配对版本的迁移说明在 `UPGRADE.json`。

## 范围

- 稳定组件入口：Button（含 ButtonLink）、Input、Card、ProductCard、ProductList、
  HeroBanner、ShortcutRail、Billboard。
- Beta 页头仅通过 `@yami/design-system/components/Header` 导入，不出现在包根导出中。
- 组件的传递依赖随包提供，未列出的组件没有候选包公开入口。
- 默认采用组件现有行为和语义 Token，不复制样式到消费项目。
- React/React DOM 为宿主提供的 peer dependencies；首版范围为 `~19.3.1`。
- 首轮验证 Node 24.18.0、Next.js 16.4.3 App Router、Vite 8.3.5、TypeScript 6.0.2。
  其他版本和原生端尚未验证。
- 同一版本内分发中英文消费方 Skill、设计规范、内容与动效规范、Token、组件契约和可复制示例。
- 可选配套 `@yami/design-system-mcp` 提供本地只读查询，SDK 依赖不进入组件运行时。
- 这是 React Web 组件候选包，页面模板和模型运行时尚未提供。

YAMI 通过自有版本包、内部 Registry、随包 Skill 和只读 MCP 实现跨项目复用。
shadcn 仅提供结构化分发、明确依赖以及 AI 按契约读取规范和示例的思路参考，
其 CLI/Registry 兼容层不列入待办，也不作为交付前置条件。
后续实施顺序见 [ADR 009](../../docs/adr/009-agent-ready-contracts-and-distribution.md)。

独立 Next.js/Vite 应用可选用单独的本地候选工具
[yami-design-cli](../yami-design-cli/README.md)，通过 `init` 安装配对包并连接
项目 Skill/MCP，通过只读 `doctor` 检查真实查询。CLI 不随组件运行时安装，
宿主样式接入与客户端信任仍需明确完成；手动流程继续可用。

## 构建与安装

从 YAMI 仓库根目录执行：

```bash
pnpm pack:design-system-candidate
```

输出位于根目录 `dist/`：组件和 MCP 候选目录、两个带版本号的 `.tgz` 及各自打包回执。
在独立项目安装该 `.tgz`，不要使用指向 YAMI 源码的软链接或路径别名：

```bash
npm install /absolute/path/to/yami-design-system-0.2.0-candidate.4.tgz
```

候选包保留 `private: true`，避免被误发布；本地打包和安装仍然可用。
现有仓库内的 workspace 源码入口及开发方式保持不变。

## 公开导出

```tsx
import { Button, ButtonLink, Input, Card, ProductCard, ProductList } from '@yami/design-system';
// 也可以按组件导入，避免加载不需要的组件入口。
import { Button } from '@yami/design-system/components/Button';
import type { ProductListItem } from '@yami/design-system/components/ProductList';
```

包内提供 ESM JavaScript、`.d.ts` 和 CSS Modules。消费方需要支持 CSS Modules
及 CSS 资源加载；不需要为候选包配置 TypeScript 源码转译。
公开组件入口标记为 React 客户端边界。Next.js Server Component 可以组合组件；
事件回调、受控状态等仍须放在消费方自己的 Client Component 中。

Token 数据与构建身份可以单独读取：

```ts
import tokens from '@yami/design-system/tokens.json';
import candidate from '@yami/design-system/candidate-manifest.json';
```

## 随版本分发的设计知识

消费项目无需读取 YAMI 源码 checkout，也不依赖本地 Storybook 服务。
三个稳定的文件入口可用 Node 的模块解析器定位；Markdown 入口供工具读取，不作为 JS 执行：

```js
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const resolve = createRequire(import.meta.url).resolve;
const indexFile = resolve('@yami/design-system/knowledge/index.json');
const index = JSON.parse(readFileSync(indexFile, 'utf8'));
console.log(index.packageVersion, indexFile);
console.log(resolve('@yami/design-system/skill'));    // English
console.log(resolve('@yami/design-system/skill/zh')); // 简体中文
```

`index.json` 的 `skills`、`references`、组件契约和示例路径均相对于索引所在目录；
`sourceSkill.path` 与 `documents[].source` 是相对于源码仓库根目录的溯源记录。
其 `components` 列出上述稳定组件和 Beta 预览入口，
包含具名导出、成熟度、组件版本、契约、用法和示例路径；其中导出清单由实际 TypeScript
入口生成。元数据保留原有属性、Token 绑定和无障碍契约，`exports` 与 `examples` 分别
投影为候选包真实导出和经过验证的消费示例。组合依赖不等于独立公开入口。

完整设计规范描述的范围更大，文件顶部会说明可用范围；未收录的组件、仓库脚本等链接
标为 `upstream reference`，固定到快照的源码提交，仅作补充参考。包内已有设计概览、
完整规范、内容与动效规范及组件用法，不要求联网才能读取这些知识。
参考目录中的 Token 与运行时文件逐字节一致。

索引与 `candidate-manifest.json` 记录相同包版本、源码提交及工作树状态；索引还记录
来源 Skill 版本及每份源文档的 SHA-256，外层清单覆盖最终知识文件。不要混用其他版本
的全局 Skill。可在目标项目的 `AGENTS.md` 中添加以下约定，不需要更改全局配置：

```text
制作或检查 YAMI 界面时，先读取
node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.zh-CN.md，
按相邻 index.json 确认安装版本、查阅契约和示例。仅使用索引列出的公开组件。
```

示例是应用源码参考，需复制到消费项目后连接真实业务；不要直接导入包内示例 TSX。
示例只依赖 React 与候选包公开入口，使用中性占位内容，不请求外部商品图片。

## 组合商城首页入口

页头预览提供 `StickyStorefrontHeader`，接收 `HeaderProps`。放在文档滚动的页面容器内、
`<main>` 之前，避免给祖先设置会创建独立滚动容器的 `overflow: hidden/auto/scroll`。
桌面保留搜索栏吸顶，手机滚动后保留紧凑搜索和操作。`onSearchSubmit` 和
`mobileSearchHref` 分别由宿主接到桌面查询和手机搜索页。

在主内容内按顺序组合 `HeroBanner`、`ShortcutRail`、`Billboard` 和 `ProductList`。
为每个活动、快捷入口和条幅提供真实 `href`。活动主图按 `8:9` 整卡出图，底部给文字
和商品留出空间。条幅传同一活动的桌面与手机素材和各自原始尺寸；缺少同活动手机图时用
`mobileTextFallback` 显示 `label`。`label` 表达可见活动文案和行动。使用组件默认的文本
配色与焦点样式。页面路由、素材、区块外边距和数据由宿主维护；
候选包的示例覆盖单个组件，整页试点不随包提供。

### 首页布局与验收

- **桌面 1440 × 900**。页头下紧接活动轨，区块之间使用组件自带的纵向间距。快捷入口使用简短标签，避免换行把条幅推到首屏下方。保留活动图和条幅的原始宽高比，首屏须完整显示桌面条幅及其行动文案。
- **手机 402 × 844**。快捷入口使用 `lines={1}` 和 `surface="card"`，保持单行横滑。沿用活动轨在手机的卡片可见性。主内容统一用 `gap: var(--layout-page-margin-card)`，活动轨与快捷入口之间保留 8px。快捷入口、条幅和榜单卡片的左右外缘分别对齐。
- **首屏商品**。榜单采用 `layout="rail"` 和 `mobileSurface="card"`，保留标题和分类。手机首屏须露出首张商品卡的图片。检查从页头到榜单的整体高度，再调整宿主间距。
- **一级标题**。在 `<main>` 中提供一个能说明首页用途的 `<h1>`。设计未安排可见标题时，使用屏幕阅读器可读的视觉隐藏样式，保留标题语义与首屏空间。

全宽首页由宿主在全局样式中将 `body` 外边距清零，页头与主内容容器占满可用视口。用 `.storefront-page` 包住 `StickyStorefrontHeader` 和 `<main className="storefront-home">`。手机条幅通过 `className="storefront-home-billboard"` 覆盖根节点的 `100%` 宽度，扣除两侧卡片边距后居中，由主内容的 `gap` 统一提供上下间距。

在宿主客户端组件中，从 React 引入 `useRef` 和 `useCallback`，把 `pageRef` 绑定到 `.storefront-page`，把 `updateSurface` 传给 `HeroBanner` 的 `onActiveSurfaceColorChange`。组件会在首屏及横滑时报告当前最显眼卡片的实际表面色。手机顶部的透明页头与活动轨共用这层渐变，起始色由 16% 活动色与页面底色混合，向下过渡到 `--background-secondary`。桌面及手机纵向滚动后的吸顶页头沿用组件的实底。

```tsx
const pageRef = useRef<HTMLDivElement>(null);
const updateSurface = useCallback((color: string) => {
  pageRef.current?.style.setProperty('--storefront-active-surface', color);
}, []);
```

```css
body { margin: 0; }

.storefront-page { position: relative; }

@media (max-width: 1023.98px) {
  .storefront-page {
    background: var(--background-secondary);
  }

  .storefront-page::before {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    aspect-ratio: 1;
    max-block-size: 440px;
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--storefront-active-surface, var(--background-primary)) 16%, var(--background-primary)),
      var(--background-secondary)
    );
    content: "";
    pointer-events: none;
  }

  .storefront-home {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--layout-page-margin-card);
    background: transparent;
  }

  .storefront-home > .storefront-home-billboard {
    width: calc(100% - 2 * var(--layout-page-margin-card));
    margin-block: 0;
    margin-inline: auto;
    padding: 0;
    border-radius: var(--radius-surface-default);
  }
}
```

在两种尺寸的浏览器首屏核对页头的上缘和左右外缘与可用视口齐平。手机端测量活动轨和快捷入口的间隔，以及快捷入口、条幅和榜单的左右外缘。横滑到另一张活动卡，确认页头透出的渐变跟着换色，再纵向滚动确认吸顶页头恢复实底。图片解码后再截图，检查条幅与商品卡。实测滚动搜索和三个区块的链接，并检查一级标题与键盘焦点。

随包 Skill 用于引导现有 AI 工具读取规范。可选 MCP 服务通过配套候选包安装，
只读查询相同知识快照，详见[接入说明](./distribution/MCP.md)。

## 样式、主题与语言

在应用的全局入口按顺序加载一次：

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

Next.js 使用 `app/layout.tsx`；Vite 使用 `src/main.tsx`。
`tokens.css` 提供 Token 和语言/主题覆盖；`base.css` 提供全局排版及元素基线，
会影响宿主的 `html`、`body`、标题和链接。既有应用应先检查自己的 reset 和全局样式顺序。

在 `html` 上声明 `lang="en"` 或 `lang="zh"`；深色主题在 `html` 上添加 `dark`
class。颜色模式与组件 `inverse` 属性分别使用。不要把 Token 值另存为应用样式副本。

## 字体及其他资产

候选包仅供当前获授权环境中的本地安装与验证。GT Walsheim 字体保留在可选的
`styles/fonts.css` 入口及其关联资源中，受原有许可限制；该入口也加载依赖包提供的
Source Serif 4 Variable 和 Noto Serif SC。候选包不额外打包业务商品摄影或独立 Logo 文件；
组件自身已有的内联图形随实现保留。

本地验证不建立新的分发授权。跨设备交付、上传包仓库或扩大使用范围前，需按
`docs/migration/asset-rights.csv` 和字体许可核实目标范围；字体未经确认时由目标项目
提供已获授权的字体加载方式，不能把缺失字体的预览称为品牌视觉验收通过。

## 身份、兼容与回退

`candidate-manifest.json` 记录包版本、源码提交、工作树是否有改动、组件版本和
成熟度，以及实际打包文件的 SHA-256。`contentDigest` 覆盖回执之外的全部文件；
它表示候选内容，不把带本地改动的构建误标为某个干净提交。

- 已交付的版本不能替换成不同内容；修改候选内容时提升 candidate 序号。
- `tooling/distribution/releases/` 记录已交付版本，打包前拒绝重建其中任一组件/MCP 版本。
  新候选会比较真实 `.d.ts` 和公开 Token，按变更级别执行版本门禁；具体覆盖与人工审查边界见升级指南。
- 兼容修复使用 patch，新增公开能力使用 minor；删除或重命名公开 API/Token、
  不兼容的默认行为使用 major，并附迁移说明。组件版本与候选包版本分别记录。
- API、Token、默认视觉和交互的变化均须说明，不能只依赖类型兼容判断。
- 消费项目锁定 `.tgz` 和 lockfile，保留此前验证过的候选包用于回退。
- 当前只验证明确列出的组件及宿主版本，不把候选包当作全量组件库发布。

## 验证入口

```bash
pnpm test:distribution
pnpm verify:design-system-candidate
```

第二个命令先打包，再在系统临时目录创建两个独立项目，分别安装同一对 `.tgz`、
逐文件验证安装内容与构建指纹，通过公开文件入口定位 Skill 和索引，复制包内五个示例，
再以官方 MCP Client 验证真实 stdio 查询，执行类型检查和生产构建、
启动生产服务并验证原有场景及包内示例的交互。
字体检查要求真实的字体面加载，不能仅凭字体名称可用就通过。它需要网络安装宿主依赖及
本机 Playwright Chromium。命令使用 `tar` 和 POSIX 进程组；Windows 尚未验证。
回执和截图默认写入仓库根目录 `dist/candidate-verification/`。可用
`YAMI_DISTRIBUTION_OUTPUT_DIR` 将本轮候选包和回执写入独立目录，相对路径从仓库根解析。
回执记录临时项目路径供复查。该命令只在本地打包和安装候选包。
