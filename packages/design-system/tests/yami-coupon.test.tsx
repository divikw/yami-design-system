import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { Coupon } from "../components/Coupon";

it.each([
  { disabled: false, useLink: undefined },
  { disabled: true, useLink: { href: "/coupons", label: "Use now" } },
])("shows a non-interactive claimed status when there is no usable link (%j)", ({ disabled, useLink }) => {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<Coupon title="Save 10%" description="Eligible items" disabled={disabled}
    claim={{ status: "claimed", label: "Claimed", onClaim: () => {}, useLink }} />);

  const status = container.querySelector('[data-slot="coupon-claim-status"]');
  expect(status?.textContent).toBe("Claimed");
  expect(status?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  expect(container.querySelector("button, a, [tabindex]")).toBeNull();
});
