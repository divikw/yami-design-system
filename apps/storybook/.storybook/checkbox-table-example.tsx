import { useState } from "react";
import { Checkbox } from "@yami/design-system";

const selectionCell = { width: "1%", height: "var(--space-500)", paddingBlock: "var(--space-050)", paddingInlineEnd: 0, verticalAlign: "middle" };
const orderCell = { lineHeight: "var(--line-height-body-md)", paddingBlock: "var(--space-050)", paddingInlineStart: "var(--space-100)", textAlign: "start", verticalAlign: "middle" } as const;

export function OrderSelection({ orders, selectAll, caption }: {
  orders: string[]; selectAll: string; caption: string;
}) {
  const [selected, setSelected] = useState(orders.slice(0, 1));
  const allChecked = orders.length > 0 && selected.length === orders.length;
  return (
    <table aria-label={caption}>
      <thead><tr>
        <th scope="col" style={selectionCell}>
          <Checkbox style={{ display: "flex" }} aria-label={selectAll} checked={allChecked}
            indeterminate={selected.length > 0 && !allChecked}
            onCheckedChange={(checked) => setSelected(checked ? orders : [])} />
        </th>
        <th scope="col" style={orderCell}>{caption}</th>
      </tr></thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order}>
            <td style={selectionCell}>
              <Checkbox style={{ display: "flex" }} aria-label={order} checked={selected.includes(order)}
                onCheckedChange={(checked) => setSelected((current) =>
                  checked ? [...current, order] : current.filter((item) => item !== order))} />
            </td>
            <td style={orderCell}>{order}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
