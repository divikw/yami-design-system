import type { Meta, StoryObj } from "@storybook/react-vite";

import { Billboard } from "./Billboard";
import { createBillboardProps, type BillboardLocale } from "./fixtures";

function localeFromGlobals(value: unknown): BillboardLocale {
  return value === "en" ? "en" : "zh";
}

const meta = {
  id: "yami-components-commerce-billboard",
  title: "YAMI/Modules/Commerce/Floating Bars",
  component: Billboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Floating Bars / 活动快捷浮动栏。\n\nA full-bleed promotional band whose entire content is one image. Campaign teams ship finished artwork — offer, styling and call to action are drawn into it — so the component contributes the band, the link and an accessible name. That name is a prop, because the words on the artwork are pixels a reader cannot reach.",
      },
    },
  },
  args: createBillboardProps("zh", "#new-user-offer"),
} satisfies Meta<typeof Billboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => (
    <Billboard {...createBillboardProps(localeFromGlobals(globals.locale), "#new-user-offer")} />
  ),
  play: async ({ canvasElement, globals }) => {
    const band = canvasElement.querySelector<HTMLElement>(
      '[data-slot="billboard"]',
    );
    const link = canvasElement.querySelector<HTMLAnchorElement>(
      '[data-slot="billboard-link"]',
    );
    const image = canvasElement.querySelector<HTMLImageElement>(
      '[data-slot="billboard-image"]',
    );
    if (!band || !link || !image) throw new Error("Billboard did not render");

    // The artwork is the whole content, so the link needs a name of its own.
    // Naming only the band is not enough and reads as though it were: a link's
    // name comes from its content, and the content is an image with empty alt,
    // so a reader listing links meets an unnamed one.
    if (!band.getAttribute("aria-label")?.trim()) {
      throw new Error("Billboard must name itself for assistive technology");
    }
    if (!link.getAttribute("aria-label")?.trim() && !link.textContent?.trim()) {
      throw new Error(
        "Billboard link has no accessible name: naming the band does not name the link inside it",
      );
    }
    if (link.textContent?.trim()) {
      throw new Error(
        "Billboard is image-only: any text belongs in the artwork, not the DOM",
      );
    }

    // Height is reserved from the artwork's intrinsic dimensions, so the band
    // does not open as a strip of padding and jump when the image lands. Read
    // before awaiting the load, which is the only moment the claim is testable.
    if (getComputedStyle(image).aspectRatio === "auto") {
      throw new Error(
        "Billboard artwork must declare its intrinsic dimensions, or the band collapses until it loads",
      );
    }
    const reservedHeight = image.getBoundingClientRect().height;
    if (reservedHeight <= 0) {
      throw new Error(
        `Billboard must reserve the artwork's height before it loads, reserved ${reservedHeight}px`,
      );
    }

    await new Promise<void>((resolve) => {
      if (image.complete) return resolve();
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
    if (image.naturalWidth === 0) {
      throw new Error("Billboard artwork must load");
    }
    const locale = localeFromGlobals(globals.locale);
    const expectedDesktopArtwork =
      locale === "zh" ? "weekly-picks-zh-desktop.png" : "new-user-offer.png";
    if (!image.src.includes(expectedDesktopArtwork)) {
      throw new Error(
        `${locale} billboard must retain ${expectedDesktopArtwork}, received ${image.src}`,
      );
    }

    // Dimensions that disagree with the artwork are worse than none: they
    // reserve a box of the wrong shape, and the browser silently corrects to
    // the natural ratio once the image lands — the shift the reservation was
    // there to prevent, now harder to spot. Only checkable against whichever
    // source the viewport actually picked.
    if (image.currentSrc === image.src) {
      const declared = [
        Number(image.getAttribute("width")),
        Number(image.getAttribute("height")),
      ];
      if (
        declared[0] !== image.naturalWidth ||
        declared[1] !== image.naturalHeight
      ) {
        throw new Error(
          `Billboard reserved ${declared[0]}x${declared[1]} for artwork that is ${image.naturalWidth}x${image.naturalHeight}`,
        );
      }
    }

    // The band spans its container while the artwork stops at 1440px. Deriving
    // the room available from the band's own padding, so the check holds at
    // whatever width the story runs and does not quietly pass on a viewport
    // too narrow for the cap to bite.
    const bandBox = band.getBoundingClientRect();
    const imageBox = image.getBoundingClientRect();
    const bandStyle = getComputedStyle(band);
    if (bandStyle.padding !== "48px") {
      throw new Error(`PC floating bars must use 48px padding, got ${bandStyle.padding}`);
    }
    const available =
      bandBox.width -
      parseFloat(bandStyle.paddingLeft) -
      parseFloat(bandStyle.paddingRight);
    const expected = Math.min(available, 1440);
    if (Math.abs(imageBox.width - expected) > 1) {
      throw new Error(
        `Artwork must fill ${expected}px of the ${available}px available, got ${imageBox.width}px`,
      );
    }
    if (available > 1440) {
      const leftGap = imageBox.left - bandBox.left;
      const rightGap = bandBox.right - imageBox.right;
      if (Math.abs(leftGap - rightGap) > 1) {
        throw new Error(
          `Capped artwork must sit centred in the band, ${leftGap}px left of ${rightGap}px right`,
        );
      }
    }
  },
};

/* Showcase runs at 1280, where the 48px gutters leave 1184px and the cap never
 * binds — the width assertion there only proves the artwork fills its room. The
 * cap needs a window wide enough to hit it, which is the whole point of this
 * story; it stays out of the sidebar because it is the same component, only
 * measured somewhere the sidebar has no reason to send anyone. */
export const WideViewport: Story = {
  name: "Wide Viewport",
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "yamiDesktopXl", isRotated: false } },
  render: Showcase.render,
  play: Showcase.play,
};

export const EnglishArtworkContract: Story = {
  name: "English Artwork Contract",
  tags: ["!dev", "!autodocs"],
  globals: { locale: "en" },
  render: Showcase.render,
  play: Showcase.play,
};

export const Pc: Story = {
  name: "PC",
  parameters: { viewport: { defaultViewport: "yamiDesktopLg" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiDesktopLg", isRotated: false } }
    : {},
  render: Showcase.render,
  play: import.meta.env.MODE === "test" ? Showcase.play : undefined,
};

export const MobileCard: Story = {
  name: "Mobile",
  parameters: { viewport: { defaultViewport: "yamiMobile" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiMobile", isRotated: false } }
    : {},
  render: Showcase.render,
  play: import.meta.env.MODE === "test" ? async ({ canvasElement }) => {
    const band = canvasElement.querySelector<HTMLElement>(
      '[data-slot="billboard"]',
    );
    if (!band) throw new Error("Billboard did not render");
    const style = getComputedStyle(band);
    if (style.padding !== "16px") {
      throw new Error(`Mobile floating bars must use 16px padding, got ${style.padding}`);
    }

    // The narrow source carries its own dimensions, since portrait campaign
    // artwork rarely shares the wide one's ratio. Checking here because this
    // is the only story where that source is the one the viewport picks.
    const image = band.querySelector<HTMLImageElement>(
      '[data-slot="billboard-image"]',
    );
    const source = band.querySelector<HTMLSourceElement>("source");
    if (!image || !source) throw new Error("Mobile billboard did not render");
    if (!source.srcset.includes("campaign-banner-mobile.png")) {
      throw new Error("Mobile billboard artwork must remain unchanged");
    }
    await new Promise<void>((resolve) => {
      if (image.complete) return resolve();
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
    if (image.currentSrc === image.src) {
      throw new Error("Mobile billboard must serve its narrow artwork");
    }
    if (
      Number(source.getAttribute("width")) !== image.naturalWidth ||
      Number(source.getAttribute("height")) !== image.naturalHeight
    ) {
      throw new Error(
        `Mobile billboard reserved ${source.getAttribute("width")}x${source.getAttribute("height")} for artwork that is ${image.naturalWidth}x${image.naturalHeight}`,
      );
    }
  } : undefined,
};
