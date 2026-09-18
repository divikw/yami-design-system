import { SectionBanner, type SectionBannerItem } from "./SectionBanner";

export function SectionBannerExample({ items }: { items: SectionBannerItem[] }) {
  return <SectionBanner title="精选主题" items={items} />;
}
