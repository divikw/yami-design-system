import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";
import { STORY_CHANGED, STORY_PREPARED } from "storybook/internal/core-events";

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
  theme: create({ base: "light", brandTitle: "Yami Design System", brandUrl: "/", colorPrimary: "#ff2d2d", colorSecondary: "#202020" })
});
