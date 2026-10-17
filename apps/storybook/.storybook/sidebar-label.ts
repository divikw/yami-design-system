export function formatSidebarLabel(name: string) {
  return name.replace(/[A-Za-z][A-Za-z0-9]*/g, (word) =>
    word !== "PC" && /^[A-Z][A-Z0-9]+$/.test(word) ? word : word.toLowerCase()
  );
}
