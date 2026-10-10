# Avatar

A circular image avatar for accounts, review authors, and other identity displays. This component is defined in code and does not yet have a verified Figma binding.

## Usage

Provide an accessible name with `alt`. Omit `src` to use the built-in YAMI mascot, or supply a custom image URL. The default image also appears while a custom image loads or if it fails. Use `alt=""` beside an existing visible name to avoid duplicate announcements. Avatar displays images only; it does not generate initials.

## Sizes

Choose `sm` (32px), `md` (40px, default), or `lg` (48px). Sizes are the same on mobile and desktop. Images use centered cover cropping; adjust `style.objectPosition` for a different focal point.

```tsx
import { Avatar } from "@yami/design-system/components/Avatar";

<Avatar alt="Default avatar" size="md" />
<Avatar src="/images/alex.jpg" alt="Alex Morgan" />
```

Avatar is not focusable. For interaction, wrap it in a shared Button or link that provides an accessible name and a sufficient tap target.

## Membership

Set `membershipTier="ruby-0" | "ruby" | "silver" | "gold"` to display a 2px tier-colored ring and a membership icon at the bottom-right. Omit it for a plain image avatar. Membership avatars use the same default image and the original MembershipIcon SVG assets.

```tsx
<Avatar alt="Alex Morgan" membershipTier="gold" />
<Avatar alt="Sam Chen" size="sm" membershipTier="ruby" />
```

Outer diameters remain 32/40/48px. A 2px white separator sits between the ring and image in both themes, leaving an image diameter of 24/32/40px. The icon backing has a 12/16/20px content area and uses `right: -4px; bottom: -4px` to extend 2px beyond the avatar's outer border on each side. The portrait clips separately so the icon remains fully visible. All dimensions are the same on mobile and desktop.

The icon has an opaque circular backing with a 1px tier-colored border to separate it from the portrait. Ruby-0 / Ruby / Silver / Gold use pale gray / red / blue / gold backings in both themes. Backing outer diameters are 14/18/22px, with centered artwork canvases of 10/14/18px.

Membership ring and icon colors stay consistent in both themes. The Ruby ring follows the [live YAMI account avatar](https://www.yami.com/us/zh). Other tiers use their original icon colors; their corresponding live account states have not yet been verified. This composition does not yet have a verified Figma avatar binding.

Assistive technology announces the person's name and membership tier once. The native `lang` prop controls the tier suffix: English by default (for example, “Alex Morgan, Gold member”), or Chinese with `lang="zh"` / `lang="zh-CN"`. Storybook follows its language toolbar unless `lang` is explicitly selected. Use `alt=""` to make the entire avatar and icon decorative when adjacent text already provides the name and tier.
