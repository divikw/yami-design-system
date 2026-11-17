import { Button } from "../Button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "./AlertDialog";

export function AlertDialogExample({ locale = "zh", destructive = false }: { locale?: "zh" | "en"; destructive?: boolean }) {
  const zh = locale === "zh";
  return <AlertDialog>
    <AlertDialogTrigger render={<Button variant="secondary" />}>
      {destructive ? (zh ? "删除地址" : "Delete address") : (zh ? "确认更改" : "Confirm changes")}
    </AlertDialogTrigger>
    <AlertDialogContent lang={locale}>
      <AlertDialogHeader>
        <AlertDialogTitle>{destructive ? (zh ? "删除这个地址？" : "Delete this address?") : (zh ? "应用配送设置？" : "Apply delivery settings?")}</AlertDialogTitle>
        <AlertDialogDescription>{destructive ? (zh ? "此操作无法撤销。删除后，你需要重新添加这个配送地址。" : "This action cannot be undone. You will need to add this delivery address again.") : (zh ? "新的设置将在下一次下单时生效，已提交的订单不受影响。" : "Your new settings will apply to your next order. Existing orders will not be changed.")}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{zh ? "取消" : "Cancel"}</AlertDialogCancel>
        <AlertDialogAction variant={destructive ? "emphasis" : "primary"}>{destructive ? (zh ? "删除" : "Delete") : (zh ? "应用设置" : "Apply settings")}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
