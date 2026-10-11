import { Button } from "../../components/Button";

export function OrderActions({ generateReceipt }: { generateReceipt: () => void }) {
  return <article>
    <a href="/orders/Y20261011-1234">View order</a>
    <Button onClick={generateReceipt}>Download receipt</Button>
  </article>;
}
