import { Button } from "../../components/Button";
import { ButtonGroup } from "../../components/ButtonGroup";

export function OrderActions() {
  return <ButtonGroup aria-label="">
    <Button size="sm">Generate receipt</Button>
    <Button size="lg">Cancel</Button>
  </ButtonGroup>;
}
