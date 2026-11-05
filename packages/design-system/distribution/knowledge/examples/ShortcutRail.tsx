import { ShortcutRail } from "@yami/design-system/components/ShortcutRail";

const icon = "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 32 32'%3E%3Crect x='6' y='6' width='20' height='20' rx='4' fill='%2360826b'/%3E%3C/svg%3E";

export function ShortcutRailExample() {
  return (
    <>
      <ShortcutRail ariaLabel="Example collections" items={[
        { id: "new", label: "New arrivals", iconSrc: icon, href: "#shortcut-new" },
        { id: "weekly", label: "Weekly picks", iconSrc: icon, href: "#shortcut-weekly" },
      ]} />
      <p id="shortcut-new">New arrivals collection</p>
      <p id="shortcut-weekly">Weekly picks collection</p>
    </>
  );
}
