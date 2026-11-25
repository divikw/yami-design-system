import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
async function walk(dir, predicate) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name), predicate) : predicate(entry.name) ? [path.join(dir, entry.name)] : []));
  return nested.flat();
}
const normalizeComponentName = (value) => value.replace(/[^a-z0-9]/gi, "").toLowerCase();
const componentsRoot = path.join(root, "packages/design-system/components");
const componentDirectories = (await fs.readdir(componentsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const componentDocs = await Promise.all(componentDirectories.map(async (directory) => {
  const componentRoot = path.join(componentsRoot, directory);
  const meta = JSON.parse(await fs.readFile(path.join(componentRoot, "meta.json"), "utf8"));
  const usagePath = path.join(componentRoot, "usage.md");
  const storyPath = path.join(componentRoot, `${directory}.stories.tsx`);
  const usage = await fs.readFile(usagePath, "utf8");
  const usageSections = usage.split(/<!-- locale:(?:zh|en) -->\s*/)
    .filter((section) => section.trim())
    .map((section) => section.trimStart());

  await fs.access(storyPath);
  if (meta.usageRef !== "./usage.md") {
    throw new Error(`${directory} must declare usageRef as ./usage.md`);
  }
  if (usageSections.length === 0 || usageSections.some((section) => !section.startsWith("# "))) {
    throw new Error(`${directory}/usage.md must start each language section with a level-one heading`);
  }

  return { directory, name: meta.name, storyPath, headings: usageSections.map((section) => section.split(/\r?\n/, 1)[0]) };
}));

const stories = [
  ...await walk(path.join(root, "packages/design-system"), (name) => name.endsWith(".stories.tsx")),
  ...await walk(path.join(root, "packages/prototypes"), (name) => name.endsWith(".stories.tsx")),
];
const indexPath = path.join(root, "apps/storybook/storybook-static/index.json");
const index = JSON.parse(await fs.readFile(indexPath, "utf8"));
const entries = Object.values(index.entries ?? {});
// Draft components expose versioned preview stories before publishing Docs.
const draftStoryPaths = new Set(entries
  .filter((entry) => entry.type === "story" && entry.tags?.includes("draft") && /\/draft\//i.test(entry.title))
  .map((entry) => path.resolve(root, "apps/storybook", entry.importPath)));
const docsEntries = entries.filter((entry) => entry.type === "docs");
const docsComponentNames = new Set(docsEntries.map((entry) => normalizeComponentName(entry.title.split("/").at(-1))));
const deviceStoryNames = {
  ActivityPageHeader: "",
  Header: "docs,Properties,PC,APP,H5",
  Footer: "docs,PC",
  TabBar: "docs,Properties,APP,H5",
};
const componentsWithProperties = new Set([
  "Accordion", "Alert", "AlertDialog", "AspectRatio", "Avatar", "Badge", "Breadcrumb", "Button", "ButtonGroup",
  "Card", "Checkbox", "Combobox", "Coupon", "Dialog", "Divider", "Drawer", "DropdownMenu", "EmptyState", "Field",
  "FilterChip", "Header", "HorizontalScrollList", "Input", "NavigationMenu", "Pagination", "Popover", "ProductCard",
  "ProductList", "Progress", "RadioGroup", "Select",
  "Skeleton", "Slider", "Spinner", "Switch", "TabBar", "Tabs", "Tag", "Textarea", "Toast", "Tooltip",
]);
for (const component of componentDocs) {
  if (docsEntries.some((entry) => path.resolve(root, "apps/storybook", entry.importPath) === component.storyPath)) {
    docsComponentNames.add(normalizeComponentName(component.name));
  }
}
const storySources = new Map(await Promise.all(componentDocs.map(async (component) => [
  normalizeComponentName(component.name),
  await fs.readFile(component.storyPath, "utf8"),
])));

function hasOwningDocsEntry(componentName) {
  const normalizedName = normalizeComponentName(componentName);
  if (docsComponentNames.has(normalizedName)) return true;

  return componentDocs.some((owner) => {
    if (!docsComponentNames.has(normalizeComponentName(owner.name))) return false;
    const source = storySources.get(normalizeComponentName(owner.name)) ?? "";
    const subcomponents = source.match(/subcomponents\s*:\s*{([^}]*)}/s)?.[1] ?? "";
    return new RegExp(`\\b${componentName}\\b`).test(subcomponents);
  });
}

for (const component of componentDocs) {
  if (!draftStoryPaths.has(component.storyPath) && !hasOwningDocsEntry(component.name)) {
    throw new Error(`${component.name} is missing its Storybook docs entry`);
  }
  const visible = entries.filter((entry) => entry.tags?.includes("dev") &&
    (path.resolve(root, "apps/storybook", entry.importPath) === component.storyPath ||
      entry.storiesImports?.some((storyPath) => path.resolve(root, "apps/storybook", storyPath) === component.storyPath)));
  const hasProperties = componentsWithProperties.has(component.name);
  const expectedNames = deviceStoryNames[component.name] ?? (hasProperties ? "docs,Properties,PC,Mobile" : "docs,PC,Mobile");
  if (!expectedNames) {
    if (visible.length) throw new Error(`${component.name} must stay out of the sidebar`);
    continue;
  }
  const invalidProperties = hasProperties && !(visible[1]?.type === "docs" && visible[1].tags.includes("attached-mdx"));
  if (visible.map((entry) => entry.name).join(",") !== expectedNames || invalidProperties ||
      visible[0].type !== "docs" || visible.slice(hasProperties ? 2 : 1).some((entry) => entry.type !== "story" || entry.tags.includes("play-fn"))) {
    throw new Error(`${component.name} must show ${expectedNames.split(",").join(", ")} in order, with no autoplay in the device previews`);
  }
}

const componentTitles = [...new Set(entries
  .filter((entry) => entry.tags?.includes("dev") && /^YAMI\/components\//i.test(entry.title))
  .map((entry) => entry.title))];
const sortedComponentTitles = [...componentTitles].sort((left, right) => (
  left.localeCompare(right, "en", { numeric: true, sensitivity: "base" })
));
if (!componentTitles.length || componentTitles.some((title, index) => (
  title.split("/").length !== 3 || title !== sortedComponentTitles[index]
))) {
  throw new Error("Components must appear directly under Components in alphabetical order");
}

const staticAssets = await walk(
  path.join(root, "apps/storybook/storybook-static/assets"),
  (name) => name.endsWith(".js"),
);
const bundledDocs = (await Promise.all(staticAssets.map((file) => fs.readFile(file, "utf8")))).join("\n");
if (!bundledDocs.includes("data-yami-docs")) {
  throw new Error("The component usage docs template was not bundled");
}
for (const component of componentDocs) {
  if (draftStoryPaths.has(component.storyPath)) continue;
  for (const heading of component.headings) {
    if (!bundledDocs.includes(heading)) {
      throw new Error(`${component.name} usage content was not bundled into Storybook: ${heading}`);
    }
  }
}

if (!entries.some((entry) => entry.title.toLowerCase() === "yami/pages/ecommerce home")) throw new Error("Ecommerce Home story is missing");
console.log(`Storybook verified: ${stories.length} source files, ${componentDocs.length} component usage guides, ${docsEntries.length} docs entries, ${entries.length} indexed entries.`);
