import { Button, toast } from "@yami/design-system";

export function ToastTypes({ en = false }: { en?: boolean }) {
  const messages = [
    ["default", "普通", "Default", "已复制链接。", "Link copied."],
    ["success", "成功", "Success", "地址已保存。", "Address saved."],
    ["info", "信息", "Info", "订单已开始配货。", "Your order is being packed."],
    ["warning", "提醒", "Warning", "仅剩 2 件商品。", "Only two items remain."],
    ["error", "错误", "Error", "保存失败，请重试。", "Could not save. Try again."],
  ];
  return <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-100)" }}>
    {messages.map(([type, zhName, enName, zhText, enText]) =>
      <Button key={type} size="sm" variant="secondary" onClick={() => toast.add({
        type, description: en ? enText : zhText, priority: type === "error" ? "high" : "low",
      })}>{en ? enName : zhName}</Button>)}
  </div>;
}
