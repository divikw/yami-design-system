# Phone preview shell

`@yami/prototypes/phone-preview` exports `PhonePreviewShell` for preview hosts.
It takes an existing `frame` element, optional `enabled` (default true), and
`theme` (`light` by default). It preserves the iframe and its browsing context.
The optional `mode` (`app` by default) is sent to the embedded page. In `h5`
mode the `safari` props supply the displayed address, standalone URL, back
availability and back/reload callbacks for a fixed Safari toolbar. Its receiver
also reads `previewMode=h5` from the URL for standalone previews, hides cart App
navigation, and removes the navigation offset from checkout controls. Ordinary
Storybook URLs are unaffected.

Below 768px of host width, the iframe fills the entire phone viewport and the
system bars overlay it. At the top, both bars are transparent. After scrolling,
the top status area uses the visible navigation's computed background color;
returning to the top clears it. The bottom indicator remains transparent and
page content can pass beneath it. The host canvas is never used as a bar's background.

`PhonePreviewInsets` runs inside the embedded document (Canvas layout and the
Storybook page decorator). A parent/iframe handshake enables initial 62px top
spacing and 34px bottom spacing, plus offsets for sticky headers, fixed purchase
controls and sheets. These styles are preview-only and removed when switching
to tablet/desktop or a component story. The message receiver checks the parent
window; the host validates both the iframe window and its origin. Standalone
pages do not receive the handshake and retain their ordinary layout.
System chrome is decorative and hidden from accessibility.
The embedded page scrollbar is hidden only in phone previews; scrolling remains enabled.
The status bar follows the supplied [iPhone 18 Pro reference](https://www.figma.com/design/nL0ukGvsz8G0woKmDqGOHn?node-id=5465-16807):
402 × 62px with 8px horizontal padding, a 95 × 36.667px Dynamic Island
14px from the top, and the exported Wi-Fi/battery SVGs.
The island stays centered. Side groups retain their 402px-reference edge offsets
on wider previews and shrink only below that width to prevent overlap. This does
not simulate a specific device's full screen or hardware frame. The bottom follows the supplied
[Home Indicator reference](https://www.figma.com/design/nL0ukGvsz8G0woKmDqGOHn?node-id=106-60033),
using its iPhone portrait variant (`106:60032`): a 34px area with a centered
144 × 5px bar, 8px from the bottom, and a 100px corner radius.
System geometry and typography intentionally follow iOS rather than YAMI tokens.

H5 mode reserves 62px above and 86px below content for its fixed Safari toolbar
(4px top padding, 48px controls, 34px home indicator). Content can pass beneath
the transparent chrome while fixed controls respect these insets. Only the
floating Safari controls have glass fills; there is no full-width blur layer.
Without a fixed bottom bar, page content stays visible behind Safari. Fixed
TabBar and checkout surfaces extend their own background through the 86px bottom
inset. Hidden or removed bars leave no background behind; inline bars and sheet
controls are excluded. Background changes inherit directly from the bar.
Both modes hide embedded scrollbars.
The toolbar is accessible and interactive, while system chrome stays decorative.
On tablet/desktop, the iframe returns to its full host size and chrome is removed.

Safari uses the supplied [Default toolbar variants](https://www.figma.com/design/Cn8vrrB3AxGYjYUdcWF72l?node-id=4010-337):
light `4010:338`, dark `4023:791`. At 402px, controls have 34px side margins,
8px gaps and a 222px address capsule. Narrow widths retain the icon dimensions
and truncate the address. The Figma LiquidGlassRegularSmall mapping is not
installed in this repo; CSS tint, blur and inset highlights approximate that
native material. Browser refraction and scroll-to-collapse are not simulated.

Original Safari SVG assets are stored locally without path edits. Reader exports
come from the design context; SF Symbol text layers were exported directly via
the Figma Plugin API because the asset endpoint cannot address instance descendants.

| Asset pair (light / dark) | Figma source nodes | Intrinsic size |
| --- | --- | --- |
| `safari-back-*.svg` | `I4010:339;4013:490;4013:563` / `I4023:792;4023:962;4013:563` | 11 × 19 |
| `safari-reader-*.svg` | `4018:1058` / `4023:796` | 15.3994 × 18 (dark 18.001) |
| `safari-reload-*.svg` | `4010:344` / `4023:801` | 15 × 19 |
| `safari-more-*.svg` | `I4010:345;4013:639;4013:563` / `I4023:802;4023:902;4013:563` | 20 × 4 |
The phone viewport clips its iframe and system chrome to a 40px corner radius,
matching the Screen layer (`12740:33921`) in the supplied
[iPhone 18 Pro example](https://www.figma.com/design/nL0ukGvsz8G0woKmDqGOHn?node-id=12740-35193).
The separate photographic metal bezel is not added. The outer resize handle
remains outside the clipping area; tablet/desktop previews have square corners.
SVG sources: Wi-Fi `10465:36970`, battery `13015:2275`; stored locally in `assets/`.
These exports are byte-identical to the previous iPhone 17 Pro assets.

Only PROTOTYPE attaches the shell, in its workbench. Storybook's own manager,
page stories, component stories and Docs have no device chrome or safe-area
spacing. The Storybook decorator only listens for the PROTOTYPE host handshake
so an imported page can respect its safe areas; it renders nothing when viewed
in Storybook itself. Component subsections and email previews are excluded.

Raw story iframe URLs and standalone prototype pages remain content-only.
This prevents duplicate chrome when a Storybook page is imported into PROTOTYPE,
and keeps simulated system UI out of real mobile browser pages. Page components
do not depend on this shell. The shell is preview infrastructure, not a product
component in the design-system catalog.
