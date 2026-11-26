import { isPhonePreviewPage, PhonePreviewInsets } from "@yami/prototypes/phone-preview";
import type { Preview } from "@storybook/react-vite";
import { CURRENT_STORY_WAS_SET, GLOBALS_UPDATED } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

import { ComponentDocsPage } from "./component-docs";
import { TokenAnnotations } from "./token-annotations";

if (typeof document !== "undefined") {
  const channel = addons.getChannel();
  const root = document.documentElement;
  const select = ({ storyId, viewMode }: { storyId: string; viewMode: string }) => {
    root.dataset.yamiDocsId = viewMode === "docs" ? storyId : "";
  };
  const localize = ({ globals }: { globals: Record<string, unknown> }) => {
    root.dataset.yamiDocsLocale = globals.locale === "en" ? "en" : "zh";
  };
  channel.on(CURRENT_STORY_WAS_SET, select);
  channel.on(GLOBALS_UPDATED, localize);
  import.meta.hot?.dispose(() => {
    channel.off(CURRENT_STORY_WAS_SET, select);
    channel.off(GLOBALS_UPDATED, localize);
  });
}

const YAMI_VIEWPORTS = {
  yamiMobileSm: { name: "YAMI Mobile-sm (360)", styles: { width: "360px", height: "800px" }, type: "mobile" as const },
  yamiMobile: { name: "YAMI Mobile (375)", styles: { width: "375px", height: "812px" }, type: "mobile" as const },
  yamiMobileLg: { name: "YAMI Mobile-lg (402)", styles: { width: "402px", height: "844px" }, type: "mobile" as const },
  yamiMobileXl: { name: "YAMI Mobile-xl (480)", styles: { width: "480px", height: "900px" }, type: "mobile" as const },
  yamiTablet: { name: "YAMI Tablet (768)", styles: { width: "768px", height: "1024px" }, type: "tablet" as const },
  yamiDesktop: { name: "YAMI Desktop (1024)", styles: { width: "1024px", height: "768px" }, type: "desktop" as const },
  yamiDesktopMd: { name: "YAMI Desktop-md (1280)", styles: { width: "1280px", height: "800px" }, type: "desktop" as const },
  yamiDesktopLg: { name: "YAMI Desktop-lg (1440)", styles: { width: "1440px", height: "900px" }, type: "desktop" as const },
  yamiDesktopWide: { name: "YAMI Desktop-wide (1680)", styles: { width: "1680px", height: "1050px" }, type: "desktop" as const },
  yamiDesktopXl: { name: "YAMI Desktop-xl (1920)", styles: { width: "1920px", height: "1080px" }, type: "desktop" as const }
};

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    locale: { description: "Content language", toolbar: { icon: "globe", items: [{ value: "zh", title: "中文" }, { value: "en", title: "English" }] } },
    theme: { description: "Color theme", toolbar: { icon: "paintbrush", items: [{ value: "light", title: "Light" }, { value: "dark", title: "Dark" }] } }
  },
  initialGlobals: {
    locale: "zh",
    theme: "light",
    viewport: { value: "yamiMobile", isRotated: false }
  },
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    docs: {
      page: ComponentDocsPage,
      toc: { headingSelector: "h2, h3" },
    },
    a11y: { test: "error" },
    viewport: {
      options: YAMI_VIEWPORTS
    },
    options: {
      // Storybook extracts and evaluates this function as JavaScript.
      storySort: ({ id: leftId = "", title: leftTitle = "" }, { id: rightId = "", title: rightTitle = "" }) => {
        if (leftTitle === rightTitle && (leftTitle.startsWith("YAMI/components/") || leftTitle.startsWith("YAMI/modules/product display/") ||
          ["YAMI/modules/global/header", "YAMI/modules/global/tab bar", "YAMI/modules/commerce/coupon", "YAMI/modules/commerce/app download"].includes(leftTitle))) {
          const rank = (id = "") => id.endsWith("--docs") ? 0 : id.endsWith("--properties") ? 1 : 2;
          return rank(leftId) - rank(rightId);
        }
        const order = new Map([
          ["", ["YAMI"]],
          ["YAMI", ["快速开始", "foundations", "primitives", "assets", "components", "modules", "pages"]],
          ["YAMI/modules", ["global", "product display", "commerce"]],
          ["YAMI/modules/global", ["header", "footer", "tab bar"]],
          ["YAMI/modules/product display", ["horizontal scroll list", "product card", "product list", "collection card"]],
          ["YAMI/modules/commerce", ["floating bars", "brand product rail", "coupon"]],
          ["YAMI/pages", ["ecommerce home", "landing pages", "categories", "email templates", "search", "product detail", "search results"]],
          ["YAMI/pages/landing pages", ["component index", "topic templates", "collection templates"]],
          ["YAMI/pages/landing pages/topic templates", ["brand", "topic", "campaign"]],
          ["YAMI/pages/product detail", ["docs", "beauty", "food", "beverage"]],
        ]);
        const left = leftTitle.split("/");
        const right = rightTitle.split("/");
        for (let i = 0; i < Math.min(left.length, right.length); i++) {
          if (left[i] === right[i]) continue;
          const parent = left.slice(0, i).join("/");
          if (parent === "YAMI/components") {
            return left[i].localeCompare(right[i], "en", { numeric: true, sensitivity: "base" });
          }
          const siblings = order.get(parent) ?? [];
          const leftRank = siblings.indexOf(left[i]);
          const rightRank = siblings.indexOf(right[i]);
          return (leftRank < 0 ? siblings.length : leftRank) - (rightRank < 0 ? siblings.length : rightRank);
        }
        return left.length - right.length;
      },
    }
  },
  decorators: [
    (Story, context) => {
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.classList.toggle("dark", context.globals.theme === "dark");
        root.lang = context.globals.locale;
        root.dataset.theme = context.globals.theme;
        root.dataset.locale = context.globals.locale;
      }

      return <><PhonePreviewInsets enabled={context.viewMode === "story" && isPhonePreviewPage(context.title)} /><TokenAnnotations /><Story /></>;
    }
  ]
};

export default preview;
