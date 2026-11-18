import { Avatar, AvatarGroup, AvatarGroupCount } from "./Avatar";

const groupPortraits = new URL("./assets/group-portraits.webp", import.meta.url).href;

export const avatarGroupExampleLabels = {
  zh: { group: "小组成员", members: ["林悦", "乔丹", "陈宇"], more: "另有 3 位成员" },
  en: { group: "Team members", members: ["Yue Lin", "Jordan Davis", "Yu Chen"], more: "3 more members" },
};

export function AvatarImageExample() {
  return <Avatar alt="Default avatar" />;
}

export function AvatarMembershipExample() {
  return <Avatar alt="Alex Morgan" membershipTier="gold" />;
}

export function AvatarSizesExample() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-100)" }}>
      <Avatar alt="Default avatar" size="sm" />
      <Avatar alt="Default avatar" size="md" />
      <Avatar alt="Default avatar" size="lg" />
    </span>
  );
}

export function AvatarGroupExample({ locale = "en", withCount = false }: { locale?: "zh" | "en"; withCount?: boolean }) {
  const labels = avatarGroupExampleLabels[locale];
  return (
    <AvatarGroup aria-label={labels.group}>
      {labels.members.map((name, index) => (
        <Avatar key={name} src={groupPortraits} alt={name} style={{ objectPosition: `${index * 50}% center` }} />
      ))}
      {withCount && <AvatarGroupCount aria-label={labels.more}>+3</AvatarGroupCount>}
    </AvatarGroup>
  );
}
