import baseMeta, * as examples from "./ProductList.story-examples";

export default { ...baseMeta, tags: ["!dev", "!autodocs"], id: "yami-components-commerce-product-list-pc", title: "YAMI/Modules/Commerce/Product List/PC" };

export const StandardRail = { ...examples.StandardRail, name: "Standard" };
export const RailWithIntroContent = { ...examples.RailWithIntroContent, name: "With introduction" };
export const ThemedRail = { ...examples.ThemedRail, name: "Banner · Card" };
export const ThemedBackgroundRail = { ...examples.ThemedBackgroundRail, name: "Banner · Plain" };
export const AtmosphericRail = { ...examples.AtmosphericRail, name: "Background · Card" };
export const BackgroundRail = { ...examples.BackgroundRail, name: "Background · Plain" };
export const Waterfall = { ...examples.Waterfall, name: "Waterfall" };
