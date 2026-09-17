import baseMeta, * as examples from "./ProductList.story-examples";

export default { ...baseMeta, id: "yami-components-commerce-product-list", title: "YAMI/Modules/Commerce/Product List" };

export const Showcase = { ...examples.Showcase, tags: ["!dev", "!autodocs"], play: examples.Showcase.play };

export const PC = {
  name: "PC",
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
  render: examples.renderPreview,
};

export const Mobile = {
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  render: examples.renderPreview,
};
