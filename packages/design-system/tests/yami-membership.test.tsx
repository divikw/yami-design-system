import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MembershipBadge } from "../components/MembershipBadge";
import { MembershipIcon } from "../components/MembershipIcon";

describe.each([MembershipIcon, MembershipBadge])("membership artwork", (Component) => {
  it("defaults to the original gray Ruby variant", () => {
    const markup = renderToStaticMarkup(<Component />);
    expect(markup).toContain('data-tier="ruby-0"');
    expect(markup).toContain('aria-label="Ruby-0 会员"');
  });

  it("renders distinct artwork for every tier", () => {
    const sources = new Set<string>();
    for (const tier of ["ruby-0", "ruby", "silver", "gold"] as const) {
      const markup = renderToStaticMarkup(<Component tier={tier} alt="会员等级" />);
      const source = markup.match(/<img[^>]*src="([^"]+)"/)?.[1];
      expect(source).toBeTruthy();
      sources.add(source!);
      expect(markup).toContain('aria-label="会员等级"');
      expect(markup).toContain('alt=""');
    }
    expect(sources.size).toBe(4);
  });

  it("supports decorative artwork beside an equivalent tier label", () => {
    const markup = renderToStaticMarkup(<Component tier="gold" alt="" />);
    expect(markup).not.toContain('role="img"');
    expect(markup).not.toContain("aria-label=");
    expect(markup).toContain('aria-hidden="true"');
  });
});
