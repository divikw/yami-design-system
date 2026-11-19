import { Badge, ButtonLink, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, useDesktopViewport } from "@yami/design-system";

export function BeautyGuideCard({ locale, src }: { locale: "zh" | "en"; src: string }) {
  const fullButtonSize = useDesktopViewport() ? "sm" : "md";
  const zh = locale === "zh";
  return <Card padding="none" bordered style={{ maxWidth: "24rem", marginInline: "auto" }}>
    <img src={src} alt="" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover",
      borderRadius: "var(--radius-surface-default) var(--radius-surface-default) 0 0" }} />
    <CardHeader style={{ padding: "var(--space-200)" }}>
      <CardTitle>{zh ? "面膜选购指南" : "Sheet mask guide"}</CardTitle>
      <CardDescription style={{ margin: 0 }}>{zh ? "从肤感和使用场景开始，挑选适合自己的面膜。" : "Find a mask for your routine by comparing textures and ingredients."}</CardDescription>
      <CardAction><Badge color="neutral" emphasis="secondary" size="sm">{zh ? "精选" : "Featured"}</Badge></CardAction>
    </CardHeader>
    <CardFooter style={{
      padding: "var(--space-200)",
      backgroundColor: "var(--surface-secondary)", borderTop: "var(--stroke-default) solid var(--border-default)",
      borderRadius: "0 0 var(--radius-surface-default) var(--radius-surface-default)",
    }}>
      <ButtonLink form="full" size={fullButtonSize} href={`https://www.yami.com/us/${locale}/c/masks/59`}>{zh ? "浏览面膜" : "Explore masks"}</ButtonLink>
    </CardFooter>
  </Card>;
}
