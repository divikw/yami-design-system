import { Button, toast } from "@yami/design-system";

export function ReceiptExample({ en = false }: { en?: boolean }) {
  function loadReceipt(fail: boolean) {
    const request = new Promise<void>((resolve, reject) => {
      setTimeout(() => fail ? reject(new Error("unavailable")) : resolve(), 1000);
    });
    toast.promise(request, {
      loading: en ? "Loading receipt…" : "正在获取收据…",
      success: en ? "Receipt ready." : "收据已就绪。",
      error: en ? "Receipt unavailable. Try again." : "收据暂不可用，请重试。",
    }).catch(() => { /* The error state is displayed in the toast. */ });
  }
  return <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-100)" }}>
    <Button size="sm" variant="secondary" onClick={() => loadReceipt(false)}>{en ? "Load receipt" : "获取收据"}</Button>
    <Button size="sm" variant="secondary" onClick={() => loadReceipt(true)}>{en ? "Simulate failure" : "模拟失败"}</Button>
  </div>;
}
