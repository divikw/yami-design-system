import baseMeta, * as examples from "./ProductList.story-examples";

export default { ...baseMeta, id: "yami-components-commerce-product-list", title: "YAMI/Modules/Commerce/Product List" };

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
