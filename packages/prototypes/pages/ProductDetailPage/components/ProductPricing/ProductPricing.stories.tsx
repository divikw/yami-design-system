import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ProductPricing } from "./ProductPricing";

const meta = {
  title: "YAMI/Pages/Product Detail/Components/Product Pricing",
  component: ProductPricing,
  parameters: { layout: "padded" },
  args: {
    regular: {
      currentPrice: "$9.69",
      originalPrice: "$10.99",
      discountLabel: "11% off",
    },
  },
} satisfies Meta<typeof ProductPricing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

export const BundleWithUnitPrice: Story = {
  args: {
    regular: {
      currentPrice: "$15.99",
      unitPrice: "$2.67 / item",
      originalPrice: "$19.99",
      discountLabel: "20% off",
    },
  },
};

export const AllPriceTypes: Story = {
  args: {
    regular: {
      currentPrice: "$9.69",
      originalPrice: "$10.99",
      discountLabel: "11% off",
      saleEndsLabel: "Sale ends in 11:55:13",
    },
    giftCard: {
      label: "Pay with Gift Card to get sale price:",
      price: "$8.99",
      detailsLabel: "Details",
      onDetailsClick: fn(),
    },
    vvip: {
      label: "Price:",
      price: "$8.49",
      actionLabel: "Buy at VVIP Price",
      onAction: fn(),
    },
  },
};
