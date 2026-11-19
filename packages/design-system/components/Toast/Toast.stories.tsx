import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Toast, Toaster } from "./Toast";
import { SaveForLater } from "./examples";

const meta = {
  id: "yami-components-data-display-toast",
  title: "YAMI/Components/Toast",
  component: Toast,
  args: { toast: { id: "preview" } },
  parameters: { layout: "centered" },
  render: (_, { globals }) => {
    const en = globals.locale === "en";
    return <Toaster closeLabel={en ? "Close notification" : "关闭通知"} viewportLabel={en ? "Notifications" : "通知"}>
      <SaveForLater en={en} />
    </Toaster>;
  },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const save = canvas.getByRole("button", { name: /收藏商品|Save item/ });
    await userEvent.click(save);
    const undo = await body.findByRole("button", { name: /撤销|Undo/ });
    await expect(save).toHaveAccessibleName(/移出收藏|Remove from favorites/);
    await userEvent.click(undo);
    await waitFor(() => expect(undo).not.toBeInTheDocument());
    await expect(save).toHaveAccessibleName(/收藏商品|Save item/);
    await userEvent.click(save);
    await body.findByRole("dialog");
    await userEvent.keyboard("{F6}");
    await userEvent.click(await body.findByRole("button", { name: /关闭通知|Close notification/ }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const PCPreview: Story = {
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
