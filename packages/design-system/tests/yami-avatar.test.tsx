import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Avatar } from "../components/Avatar";

describe("YAMI Avatar", () => {
  it("provides one accessible name without generating visible text", () => {
    const markup = renderToStaticMarkup(<Avatar src="/portrait.jpg" alt="Alex Morgan" />);
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Alex Morgan"');
    expect(markup).not.toContain("avatar-fallback");
    expect(markup).not.toContain(">AM<");
  });

  it("uses the supplied default artwork without a custom source", () => {
    const markup = renderToStaticMarkup(<Avatar alt="默认头像" />);
    expect(markup).toContain("default-avatar.png");
    expect(markup).toContain('aria-label="默认头像"');
  });

  it("allows decorative images beside an existing name", () => {
    const markup = renderToStaticMarkup(<Avatar src="/portrait.jpg" alt="" />);
    expect(markup).not.toContain('role="img"');
    expect(markup).not.toContain("aria-label=");
    expect(markup).toContain('aria-hidden="true"');
  });

  it.each([
    [undefined, "Alex Morgan, Gold member"],
    ["zh", "Alex Morgan，Gold 会员"],
    ["zh-CN", "Alex Morgan，Gold 会员"],
  ])("announces the member tier once with language %s", (lang, label) => {
    const markup = renderToStaticMarkup(<Avatar alt="Alex Morgan" membershipTier="gold" lang={lang} />);
    expect(markup).toContain(`aria-label="${label}"`);
    expect(markup.match(/role="img"/g)).toHaveLength(1);
    expect(markup).toContain('data-slot="avatar-membership" aria-hidden="true"');
    expect(markup).toContain('data-tier="gold"');
  });

  it("keeps a member avatar decorative when alt is empty", () => {
    const markup = renderToStaticMarkup(<Avatar alt="" membershipTier="ruby" />);
    expect(markup).not.toContain('role="img"');
    expect(markup).not.toContain("aria-label=");
  });
});
