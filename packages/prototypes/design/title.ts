// Both hosts use the same path relative to packages/prototypes/design.
export function designTitle(file: string, title?: string) {
  const path = file.replace(/^\.\//, "").replace(/\.stories\.tsx?$/, "");
  return "YAMI/design/" + (title?.replace(/^YAMI\/design\//i, "") || path);
}
