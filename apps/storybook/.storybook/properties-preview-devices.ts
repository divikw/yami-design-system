import type { PreparedStory } from "storybook/internal/types";

const deviceNames = ["PC", "Mobile", "App", "H5"] as const;
type DeviceName = typeof deviceNames[number];
type DeviceStory = Pick<PreparedStory, "name" | "tags" | "storyGlobals" | "parameters">;
type ViewportOptions = Record<string, { styles: { width: string; height: string } }>;

export function getPropertiesPreviewDevices(stories: readonly DeviceStory[]) {
  const widths = new Map<DeviceName, string>();
  for (const story of stories) {
    if (!story.tags.includes("component-device")) continue;
    const name = deviceNames.find(device => device.toLowerCase() === story.name.toLowerCase());
    const viewport = story.storyGlobals.viewport as { value: string; isRotated?: boolean } | undefined;
    const options = story.parameters.viewport?.options as ViewportOptions | undefined;
    const styles = viewport && options?.[viewport.value]?.styles;
    if (name && styles) widths.set(name, viewport.isRotated ? styles.height : styles.width);
  }

  if (widths.has("App") || widths.has("H5")) widths.delete("Mobile");
  return deviceNames.flatMap(name => {
    const width = widths.get(name);
    return width ? [{ name, width }] : [];
  });
}
