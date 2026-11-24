import baseMeta, * as examples from "./ProductList.story-examples";

export default { ...baseMeta, id: "yami-components-commerce-product-list", title: "YAMI/Modules/Product Display/Product List" };

export const Showcase = { ...examples.Showcase, tags: ["!dev", "!autodocs"], play: examples.Showcase.play };

export const PC = {
  name: "PC",
  parameters: { viewport: { defaultViewport: "yamiDesktopLg" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiDesktopLg", isRotated: false } }
    : {},
  render: examples.renderPreview,
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "yamiMobile" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiMobile", isRotated: false } }
    : {},
  render: examples.renderPreview,
};

export const PCPreview = {
  ...PC,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview = {
  ...Mobile,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};

export const Playground = { tags: ["!dev", "!test"], render: examples.renderPreview };

export const StandardRailExample = { ...examples.StandardRail, name: "Standard rail", tags: ["!dev", "!test"] };
export const ThemedRailExample = { ...examples.ThemedRail, name: "Themed rail", tags: ["!dev", "!test"] };
export const WaterfallExample = { ...examples.Waterfall, name: "Waterfall", tags: ["!dev", "!test"] };
export const LoadingExample = { ...examples.SkeletonMatrix, name: "Loading", tags: ["!dev", "!test"] };
