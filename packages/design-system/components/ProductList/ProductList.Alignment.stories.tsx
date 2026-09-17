import baseMeta, * as examples from "./ProductList.story-examples";

export default { ...baseMeta, tags: ["!dev", "!autodocs"], id: "yami-components-commerce-product-list-centered", title: "YAMI/Modules/Commerce/Product List/Centered" };

export const StandardCentered = { ...examples.StandardCentered, name: "Standard" };
export const BackgroundCentered = { ...examples.BackgroundCentered, name: "Background" };
export const ThemedBackgroundCentered = { ...examples.ThemedBackgroundCentered, name: "Banner" };
