import { useState, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, useDesktopViewport } from "@yami/design-system";

export function ReportCard({ locale }: { locale: "zh" | "en" }) {
  const fullButtonSize = useDesktopViewport() ? "sm" : "md";
  const zh = locale === "zh";
  const [enabled, setEnabled] = useState(false);
  const [details, setDetails] = useState(false);
  const features = zh
    ? ["每周汇总订单数量", "按品类查看销售趋势", "标出库存不足的商品"]
    : ["Review weekly order totals", "Track sales by category", "Identify items running low"];

  return <Card size="sm" bordered style={{ maxWidth: "20rem", marginInline: "auto" }}>
    <CardHeader>
      <CardTitle>{zh ? "定期报告" : "Scheduled reports"}</CardTitle>
      <CardDescription style={{ margin: 0 }}>{zh ? "按周查看店铺经营摘要。" : "Get a weekly summary of store activity."}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul style={{ display: "grid", gap: "var(--space-100)", padding: 0, margin: 0, listStyle: "none" }}>
        {features.map(feature => <li key={feature} style={{ display: "flex", alignItems: "center", gap: "var(--space-050)" }}>
          <ChevronRight aria-hidden="true" size={16} />{feature}
        </li>)}
      </ul>
      {details && <p>{zh ? "摘要包含最近一周的数据，每周一更新。" : "Reports cover the previous week and update on Monday."}</p>}
    </CardContent>
    <CardFooter style={{
      marginInline: "calc(-1 * var(--card-spacing))", marginBottom: "calc(-1 * var(--card-spacing))",
      padding: "var(--card-spacing)",
      backgroundColor: "var(--surface-secondary)", borderTop: "var(--stroke-default) solid var(--border-default)",
      borderRadius: "0 0 var(--radius-surface-default) var(--radius-surface-default)",
    }}>
      <Button form="full" size={fullButtonSize} aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
        {enabled ? (zh ? "已开启周报" : "Weekly reports enabled") : (zh ? "开启周报" : "Enable weekly reports")}
      </Button>
      <Button form="full" size={fullButtonSize} variant="secondary" style={{ "--button-secondary": "var(--surface-primary)", border: "var(--stroke-default) solid var(--border-default)" } as CSSProperties} aria-expanded={details} onClick={() => setDetails(!details)}>
        {zh ? "报告说明" : "Report details"}
      </Button>
    </CardFooter>
  </Card>;
}
