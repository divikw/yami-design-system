import { Button } from "../Button";
import { useDesktopViewport } from "../Drawer/useDesktopViewport";
import { ButtonGroup } from "./ButtonGroup";

export function SettingsActions() {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  return <ButtonGroup aria-label="设置操作">
    <Button size={actionSize} variant="secondary">取消</Button>
    <Button size={actionSize}>保存设置</Button>
  </ButtonGroup>;
}

export function CheckoutActions() {
  const actionSize = useDesktopViewport() ? "lg" : "md";
  return <ButtonGroup full aria-label="购物车操作">
    <Button form="full" size={actionSize} variant="secondary">继续购物</Button>
    <Button form="full" size={actionSize} variant="emphasis">前往结算</Button>
  </ButtonGroup>;
}
