import { Spinner } from "@yami/design-system";

export function LoadingOrders({ en = false }: { en?: boolean }) {
  return (
    <span role="status" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-100)" }}>
      <Spinner />
      {en ? "Loading orders…" : "正在加载订单…"}
    </span>
  );
}
