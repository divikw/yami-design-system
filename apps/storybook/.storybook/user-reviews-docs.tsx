import { UserReviews as AppDownload } from "@yami/design-system";
import { userReviewsExamples } from "@yami/design-system/components/UserReviews/fixtures";
import { ComponentDocsTemplate, DocsApiTable, DocsExample, type DocsLocale } from "./component-docs-template";
import { appDownloadLayoutLabels } from "./app-download-properties";

export function UserReviewsDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const example = userReviewsExamples[locale];
  const { appStore, googlePlay, qr } = example.download;
  const code = `import { UserReviews as AppDownload } from "@yami/design-system";

<AppDownload
  locale="${locale}"
  titleStyle="display"
  titleFontFamily="sans"
  dividerPosition="top"
  dividerVariant="gray"
  download={{
    appStore: { href: "${appStore.href}", iconSrc: "/assets/app-store.png" },
    googlePlay: { href: "${googlePlay.href}", iconSrc: "/assets/google-play.svg" },
    qr: { href: "${qr.href}", src: "/assets/download-qr.png" },
    mobileHref: "${example.download.mobileHref}",
    mobileIconSrc: "/assets/yami-app-icon.webp",
  }}
  reviewColumns={${JSON.stringify(example.reviewColumns, null, 2).replace(/\n/g, "\n  ")}}
/>`;

  return (
    <ComponentDocsTemplate
      name="App Download"
      slug="user-reviews"
      locale={locale}
      intro={zh ? "在首页集中展示亚米 App 下载入口和用户评价。" : "Place Yami app download links and user reviews together on the homepage."}
    >
      <section>
        <h2 id="user-reviews-v1">{zh ? "V1 · 用户评价" : "V1 · App reviews"}</h2>
        <DocsExample name="lead" locale={locale} code={code} fillContentWidth previewBackground="var(--background-secondary)">
          <AppDownload {...example} />
        </DocsExample>
      </section>
      {(["balanced", "image-first", "compact"] as const).map(layout => (
        <section key={layout}>
          <h2 id={layout === "balanced" ? "user-reviews-v2" : `user-reviews-v2-${layout}`}>V2 · {appDownloadLayoutLabels[locale][layout]}</h2>
          <DocsExample name={`v2-${layout}`} locale={locale} code={`<AppDownload version="v2" imageLayout="${layout}" locale="${locale}" download={download} />`} fullWidth fillContentWidth previewBackground="var(--background-secondary)">
            <AppDownload version="v2" imageLayout={layout} locale={locale} download={example.download} />
          </DocsExample>
        </section>
      ))}
      <section>
        <h2 id="user-reviews-layout">{zh ? "响应式布局" : "Responsive layout"}</h2>
        <p>{zh
          ? "视口宽度小于 1024px 或容器宽度小于 640px 时，下载区显示 App 图标和单个下载按钮，面板内边距为 16px。在桌面视口且容器达到 640px 时，左侧显示二维码和商店链接，右侧显示一列评价，面板内边距为 24px。容器宽度达到 928px 和 1184px 时，右侧分别最多显示两列和三列。桌面评价卡片内边距为 12px。"
          : "Viewports under 1024px or containers under 640px show the app icon and a single download button with 16px panel padding. On desktop, containers at least 640px wide show the QR code and store links on the left and a review column on the right, with 24px panel padding. The right side shows up to two columns from 928px and three from 1184px of container width. Desktop review cards use 12px padding."}</p>
        <p>{zh
          ? "评价采用底部渐隐的静态预览。二维码链接和应用商店入口支持键盘访问。"
          : "Reviews appear in a static preview with a bottom fade. The QR link and both store links are keyboard accessible."}</p>
      </section>
      <section>
        <h2 id="user-reviews-api">{zh ? "API 参考" : "API Reference"}</h2>
        <DocsApiTable locale={locale} rows={[
          ["download", zh ? "必填。提供应用商店链接、图标、二维码及其链接。可用 mobileIconSrc 设置移动端 App 图标。移动按钮使用 mobileHref，省略时使用二维码链接。" : "Required. Supplies store links and icons, a QR image, and its link. Set mobileIconSrc for the mobile app icon. The mobile button uses mobileHref or falls back to the QR link."],
          ["padding", zh ? "默认开启。模块上下留白为 16px，视口宽度从 1024px 起为 32px，左右使用页面边距。关闭可移除卡片外的留白。" : "Enabled by default. Adds 16px above and below the card, increasing to 32px at viewport widths of 1024px and above, with page gutters on the sides. Disable to remove the outer padding."],
          ["version", zh ? "v1（默认）显示评价，v2 显示 亚米商品箱配图。" : "v1 (default) shows reviews. v2 shows the Yami product box image."],
          ["imageLayout", zh ? "桌面视口且内容宽度达到 640px 时可选 balanced（默认）、image-first 或 compact。更窄时，三者都使用居中单列，配图位于下载按钮下方。" : "On desktop viewports with at least 640px of content width, choose balanced (default), image-first, or compact. Narrower containers use a single centered column with the image below the download button."],
          ["reviewColumns", zh ? "V1 可选。按顺序排好的评价组，每条评价包含 id、quote 和 author。" : "Optional for V1. Ordered review groups with an id, quote, and author for each review."],
          ["locale", zh ? "模块文案语言。支持 zh（默认）和 en。" : "Language for the built-in copy. Accepts zh (default) and en."],
          ["titleStyle", zh ? "标题字号方案。display 为独立展示字号，section 与共享模块标题一致。" : "Title scale. Display is the standalone default. Section follows the shared heading scale."],
          ["titleFontFamily", zh ? "标题字体。支持 sans（默认）和 serif。" : "Title family. Accepts sans (default) and serif."],
          ["dividerPosition", zh ? "分隔线位置。支持 top（默认）、bottom 和 none。" : "Divider edge. Accepts top (default), bottom, and none."],
          ["dividerVariant", zh ? "分隔线样式。gray 为默认 1px 结构分隔线，black 为 2px 强调分隔线。" : "Divider style. Gray is the default 1px structural rule and black is the 2px emphasis rule."],
          ["className", zh ? "用于页面布局的外层区块类名。" : "Additional class on the section for page composition."],
        ]} />
      </section>
    </ComponentDocsTemplate>
  );
}
