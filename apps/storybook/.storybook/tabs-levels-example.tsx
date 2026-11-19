import { Tabs, TabsContent, TabsList, TabsTrigger } from "@yami/design-system";

export function TabsLevels({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  const levels = [
    { list: { variant: "primary", styleVariant: "a" }, label: zh ? "一级 A · 下划线" : "Primary A · Line" },
    { list: { variant: "primary", styleVariant: "b" }, label: zh ? "一级 B · 分段" : "Primary B · Segmented" },
    { list: { variant: "secondary" }, label: zh ? "二级标签页" : "Secondary tabs" },
    { list: { variant: "tertiary" }, label: zh ? "三级标签页" : "Tertiary tabs" },
  ] as const;
  const sections = [
    { value: "details", label: zh ? "商品详情" : "Details" },
    { value: "brewing", label: zh ? "冲泡方法" : "Brewing" },
    { value: "storage", label: zh ? "储存方式" : "Storage" },
  ];

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: "var(--space-300)" }}>
      {levels.map(({ list, label }) => (
        <Tabs key={label} defaultValue="details">
          <TabsList {...list} aria-label={label}>
            {sections.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>
          <div hidden>
            {sections.map(({ value }) => <TabsContent key={value} value={value} />)}
          </div>
        </Tabs>
      ))}
    </div>
  );
}
