import { Button, type ButtonProps } from "@yami/design-system";
import type { ProductListItem } from "@yami/design-system/components/ProductList";

// Published declarations must reject navigation masquerading as an action.
// @ts-expect-error Button has no href API.
const invalidButton: ButtonProps = { href: "/orders" };
// @ts-expect-error Unknown variants must not silently widen to string.
const invalidVariant = <Button variant="made-up">Save</Button>;
// @ts-expect-error ProductListItem requires a stable id.
const invalidProduct: ProductListItem = { title: "Sample", href: "/sample", priceCurrent: "$1.00" };

export { invalidButton, invalidVariant, invalidProduct };
