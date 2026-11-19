import type { Meta, StoryObj } from "@storybook/react-vite";

import { createFoodProductDetailPageFixture } from "../../food-fixtures";
import { PDPPromotion } from "./PDPPromotion";

const fixture = createFoodProductDetailPageFixture("en");

const meta = {
  title: "YAMI/Pages/Product Detail/Components/PDP Promotion",
  component: PDPPromotion,
  parameters: { layout: "padded" },
  args: {
    giftCard: fixture.giftCardPrice,
    ...fixture.promotions,
  },
} satisfies Meta<typeof PDPPromotion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPromotions: Story = {};

export const GiftCardAndCoupons: Story = {
  args: {
    discountCode: undefined,
    gifts: undefined,
  },
};

export const GiftsOnly: Story = {
  args: {
    giftCard: undefined,
    coupon: undefined,
    discountCode: undefined,
  },
};
