import { Avatar } from "./Avatar";

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
