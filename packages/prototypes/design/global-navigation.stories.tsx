import type { DesignPreviewProps } from "./projects";
import { GlobalNavigationPreview } from "./global-navigation-preview";

export default {
  id: "yami-design-global-navigation",
  title: "YAMI/design/Global Navigation",
  component: GlobalNavigationPreview,
  args: { categoryMenu: "text", fixedPreviewMode: "h5" } as const,
  render: (props: DesignPreviewProps) => <GlobalNavigationPreview {...props} homeHeader="v1" />,
  tags: ["!autodocs", "!test", "preserve-story-name"],
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    viewport: { defaultViewport: "yamiMobileLg" },
    project: {
      id: "global-navigation",
      description: "导航流程演示 · 使用示例商品，不产生真实订单",
      pages: [{ value: "/", label: "Ecommerce Home" }],
    },
  },
};

export const H5V1 = {
  name: "H5 V1 · 侧边导航",
  parameters: { __id: "yami-design-global-navigation--h5-v1" },
  args: {
    id: "h5-v1", description: "移动首页使用 V1 左侧抽屉导航。",
    maxPreviewWidth: 1023,
  } as const,
};

export const H5V2 = {
  name: "H5 V2 · 商城切换",
  parameters: { __id: "yami-design-global-navigation--h5-v2" },
  globals: { locale: "en" as const },
  render: (props: DesignPreviewProps) => <GlobalNavigationPreview {...props} homeHeader="v2" />,
  args: {
    id: "h5-v2", description: "移动首页使用 V2 商城切换入口。",
  } as const,
};
