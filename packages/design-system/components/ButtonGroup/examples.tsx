import { Button } from "../Button";
import { ButtonGroup } from "./ButtonGroup";

export function SettingsActions() {
  return <ButtonGroup aria-label="设置操作">
    <Button variant="secondary">取消</Button>
    <Button>保存设置</Button>
  </ButtonGroup>;
}

export function CheckoutActions() {
  return <ButtonGroup full aria-label="购物车操作">
    <Button form="full" size="lg" variant="secondary">继续购物</Button>
    <Button form="full" size="lg" variant="emphasis">前往结算</Button>
  </ButtonGroup>;
}
