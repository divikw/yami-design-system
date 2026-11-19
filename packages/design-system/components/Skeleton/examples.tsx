import { Skeleton } from "@yami/design-system";

export function ProfileSkeleton({ en = false }: { en?: boolean }) {
  return (
    <section aria-label={en ? "Member profile" : "会员资料"} aria-busy="true"
      style={{ display: "flex", alignItems: "center", gap: "var(--space-200)", width: "min(100%, 20rem)", margin: "0 auto" }}>
      <Skeleton style={{ width: "var(--space-600)", height: "var(--space-600)", flexShrink: 0, borderRadius: "var(--radius-full)" }} />
      <div style={{ flex: 1, display: "grid", gap: "var(--space-100)" }}>
        <Skeleton style={{ width: "72%", height: "var(--space-200)" }} />
        <Skeleton style={{ width: "48%", height: "var(--space-150)" }} />
      </div>
    </section>
  );
}
