import type { Meta, StoryObj } from "@storybook/react-vite";

import { H5HomeDraftHeader } from "../../../design-system/storybook/H5HeaderDrafts";
import { EcommerceHomeTemplate } from "./EcommerceHome";
import homeMeta, { H5 } from "./EcommerceHome.stories";

const meta = {
  ...homeMeta,
  title: "YAMI/Pages/Ecommerce Home/Draft",
  tags: ["draft", "!autodocs", "!test"],
} satisfies Meta<typeof EcommerceHomeTemplate>;

export default meta;

export const H5Baseline: StoryObj<typeof meta> = {
  ...H5,
  name: "H5 Baseline",
};

const staticHomeParameters = { ...H5.parameters, staticHomeTabBar: true };

export const H5V1: StoryObj<typeof meta> = {
  ...H5,
  name: "H5 V1",
  parameters: staticHomeParameters,
  render(args, context) {
    const locale = context.globals.locale === "en" ? "en" : "zh";
    return H5.render({
      ...args,
      headerContent: <H5HomeDraftHeader version="v1" locale={locale} />,
    }, context);
  },
};

export const H5V2: StoryObj<typeof meta> = {
  ...H5,
  name: "H5 V2",
  parameters: staticHomeParameters,
  render(args, context) {
    const locale = context.globals.locale === "en" ? "en" : "zh";
    return H5.render({
      ...args,
      headerContent: <H5HomeDraftHeader version="v2" locale={locale} />,
    }, context);
  },
};
