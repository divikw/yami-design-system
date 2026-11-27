import { YAMI_VIEWPORTS } from "@yami/prototypes/viewports";
import { isPhonePreviewPage, PhonePreviewInsets } from "@yami/prototypes/phone-preview";
import type { Preview } from "@storybook/react-vite";
import { CURRENT_STORY_WAS_SET, GLOBALS_UPDATED, STORY_MISSING, STORY_PREPARED } from "storybook/internal/core-events";
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
  if (import.meta.hot) {
    // A moved file can leave Vite's import map one update behind Storybook's index.
    const key = "yami-last-design-story";
    const rememberFile = ({ id, parameters }: { id: string; parameters: { fileName?: string } }) => {
      if (!parameters.fileName?.includes("/prototypes/design/")) return;
      try { sessionStorage.setItem(key, JSON.stringify([id, parameters.fileName])); } catch { /* Optional HMR recovery. */ }
    };
    const retryMovedFile = async (id: string) => {
      try {
        const saved = sessionStorage.getItem(key);
        if (!saved) return;
        const [previousId, previousFile] = JSON.parse(saved);
        if (id !== previousId) return;
        const response = await fetch("./index.json", { cache: "no-store" });
        if (!response.ok) return;
        const entry = (await response.json()).entries[id];
        if (!entry?.importPath.includes("/prototypes/design/") || entry.importPath === previousFile) return;
        if (new URLSearchParams(location.search).get("id") !== id || sessionStorage.getItem(key) !== saved) return;
        sessionStorage.removeItem(key);
        location.reload();
      } catch { /* Keep Storybook's error if the index or storage is unavailable. */ }
    };
    channel.on(STORY_PREPARED, rememberFile);
    channel.on(STORY_MISSING, retryMovedFile);
    import.meta.hot.dispose(() => {
      channel.off(STORY_PREPARED, rememberFile);
      channel.off(STORY_MISSING, retryMovedFile);
    });
  }
  import.meta.hot?.dispose(() => {
    channel.off(CURRENT_STORY_WAS_SET, select);
    channel.off(GLOBALS_UPDATED, localize);
  });
}

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
          ["YAMI", ["快速开始", "foundations", "primitives", "assets", "components", "modules", "pages", "design"]],
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

      return <><PhonePreviewInsets enabled={context.viewMode === "story" && isPhonePreviewPage(context.title)} /><TokenAnnotations />
        {context.title.toLowerCase().startsWith("yami/design/")
          ? <Story args={{ ...context.args, locale: context.globals.locale, theme: context.globals.theme }} />
          : <Story />}</>;
    }
  ]
};

export default preview;
