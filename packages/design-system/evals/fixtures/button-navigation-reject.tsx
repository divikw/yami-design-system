import { Button } from "../../components/Button";

export function OrderNavigation() {
  return <Button onClick={() => { window.location.href = "/orders/Y20261011-1234"; }}>View order</Button>;
}
