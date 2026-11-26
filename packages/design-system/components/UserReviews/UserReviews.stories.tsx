import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { UserReviews } from "./index";
import { userReviewsExamples } from "./fixtures";
import styles from "./UserReviews.stories.module.css";

const meta = {
  title: "YAMI/Modules/Commerce/User Reviews",
  component: UserReviews,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  args: userReviewsExamples.zh,
  render: (args, { globals }) => (
    <div className={styles.preview}>
      <UserReviews {...(globals.locale === "en" ? userReviewsExamples.en : args)} />
    </div>
  ),
} satisfies Meta<typeof UserReviews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    const example = userReviewsExamples[locale];
    const canvas = within(canvasElement);
    const appStore = canvas.getByRole("link", { name: "App Store" });
    const googlePlay = canvas.getByRole("link", { name: "Google Play" });
    const qr = canvas.getByRole("link", { name: locale === "zh" ? "下载亚米 App" : "Download the Yami app" });
    const reviews = canvas.getByRole("region", { name: locale === "zh" ? "用户评价" : "User reviews" });
    await expect(appStore).toHaveAttribute("href", example.download.appStore.href);
    await expect(googlePlay).toHaveAttribute("href", example.download.googlePlay.href);
    await expect(qr).toHaveAttribute("href", example.download.qr.href);
    await expect(within(reviews).getAllByRole("list")).toHaveLength(example.reviewColumns.length);
    await expect(reviews).not.toHaveAttribute("tabindex");

    await userEvent.tab();
    await expect(qr).toHaveFocus();
    await userEvent.tab();
    await expect(appStore).toHaveFocus();
    await userEvent.tab();
    await expect(googlePlay).toHaveFocus();
    await userEvent.tab();
    await expect(reviews).not.toHaveFocus();
  },
};

export const PCPreview: Story = {
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};

export const MobilePreview: Story = {
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
