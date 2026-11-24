import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";
import { GLOBALS_UPDATED, STORY_CHANGED, STORY_PREPARED } from "storybook/internal/core-events";
import { formatSidebarLabel } from "./sidebar-label";
import { localizeArgTypes } from "./arg-descriptions";

// The Controls panel lives in the manager; Docs has its own locale-aware context.
addons.register("yami/control-descriptions", (api) => {
  const localize = (locale = api.getGlobals().locale) => {
    const story = api.getCurrentStoryData();
    if (story?.type !== "story" || !story.argTypes) return;
    const original = story.argTypes;
    const argTypes = localizeArgTypes(story.title, original, locale, story.parameters?.docs?.translations);
    if (Object.keys(argTypes).some(name => argTypes[name].description !== original[name].description)) {
      void api.updateStory(story.id, { argTypes });
    }
  };
  // Let the manager receive the prepared story / globals before reading its state.
  const schedule = () => queueMicrotask(() => localize());
  api.on(STORY_PREPARED, schedule);
  api.on(STORY_CHANGED, schedule);
  api.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, unknown> }) => {
    queueMicrotask(() => localize(globals.locale));
  });
});

// Story defaults apply on entry; subsequent toolbar changes remain editable.
addons.register("yami/viewport-default", (api) => {
  let appliedStoryId: string | undefined;
  const applyDefault = (id: string) => {
    const viewport = api.getParameters(id, "viewport");
    if (id === appliedStoryId || !viewport?.defaultViewport) return;
    appliedStoryId = id;
    api.updateGlobals({ viewport: { value: viewport.defaultViewport, isRotated: false } });
  };
  api.on(STORY_CHANGED, (id: string) => {
    appliedStoryId = undefined;
    applyDefault(id);
  });
  api.on(STORY_PREPARED, ({ id }: { id: string }) => {
    if (api.getUrlState().storyId === id) applyDefault(id);
  });
});

addons.setConfig({
  sidebar: {
    // Storybook includes generated Docs even when their stories omit the dev tag.
    filters: {
      legacyActivityHeader: (entry) => entry.id !== "yami-components-navigation-activity-page-header--docs",
    },
    renderLabel: (entry) => {
      if (entry.type === "story" && entry.tags?.includes("preserve-story-name")) return entry.name;
      if (entry.type === "docs" && entry.name === "Properties") return entry.name;
      if ("tags" in entry && entry.tags?.includes("component-device")) {
        return entry.type === "docs" ? "Docs" : entry.name;
      }
      if (entry.type === "component" && entry.id.startsWith("yami-components-")) return entry.name;
      return formatSidebarLabel(entry.name);
    },
  },
  theme: create({ base: "light", brandTitle: "Yami Design System", brandUrl: "/", colorPrimary: "#ff2d2d", colorSecondary: "#202020" })
});
