# PROTOTYPE

Run `pnpm dev:canvas` from the repository root and open
`http://localhost:3200/design`. Existing `/workbench` links redirect to `/design`
with their query parameters.

## Project delivery

The workbench selects a project, variant, page, language, H5/App preview mode and device width.
The header theme toggle remembers the workbench theme in the browser. The preview uses its own theme.
“独立预览” opens the complete flow at the recipient's browser width. “复制预览链接”
copies that same address. A recipient does not need the author's local drafts.
Links use the current host: localhost links require the local service; remote
sharing requires deploying this code to the intended host first.

The `global-navigation` project offers H5 V1 with a side drawer and H5 V2 with
a storefront switcher on the mobile home page. Both use H5 previews, and H5 V2
uses English. H5 V1 is the default, including for links to the retired `current`
and `image-categories` variants. The project page
picker lists the mobile home page. Preview navigation still supports the maintained
search, product, cart and Anua page compositions. Category routes use the search/list
composition and fixture products; this is a simulated flow, not a live catalogue or checkout.
Unknown pages show an explicit out-of-scope screen.

Preview mode is independent of width. App is the default when a preview has no
fixed mode or mode parameter. On phone widths it shows the system chrome and
the page's App navigation.
H5 phone previews show fixed Safari chrome with system status and home indicators.
The H5 V1 and V2 home pages show their four-item Tab Bar
above the Safari toolbar. The page fills the phone behind transparent chrome,
with 62px top and 86px bottom safe areas for sticky headers and checkout bars.
The status area follows the page at the top and matches the navigation when
scrolled; only Safari's floating controls carry a glass background.
Safari back uses preview history, refresh reloads the embedded
page without clearing the basket, and More opens the standalone page. The
address shows the preview host. Toolbars do not collapse while scrolling.
`previewMode=h5` or `previewMode=app` is retained across navigation, refresh,
standalone preview and shared links. Switching modes preserves the demo basket.
Storybook pages opened through `/design?story=<story-id>` receive the same mode.
Tablet/desktop and standalone H5 pages do not receive simulated Safari chrome.

Example independent address:

```text
/prototype?project=global-navigation&variant=h5-v2&path=%2Fsearch%2Fmatcha&locale=en&theme=light
```

Project definitions are versioned in `app/lib/prototype-projects.ts`. To add a
project, register its stable ID, variants and page entry points there; connect
its page compositions and variant behavior in `app/ui/prototype-player.tsx`.
Creating a definition alone does not implement new page types. Keep shared page
code in `@yami/prototypes` and component states in Storybook. There is no drag
and drop editor or server-side project database.

## Experience state

Search text, filters, sorting, list presentation, basket quantities and saved
items are stored in `sessionStorage`, isolated by project and variant. Same-tab
navigation and refresh retain this state. A new recipient starts a fresh demo;
the shared URL carries the project/variant/page, not the author's basket.
“重置演示” clears only the active variant's session and remounts its page.
Closing the browser session clears demo state. Storage-disabled browsers can
still render the flow, but cannot retain state after a reload.

The workbench uses the existing validated same-origin iframe navigation message.
Standalone links retain their project/variant and support browser back/forward.
Modified clicks and links opened in a new tab retain native link behavior.
Device width is exact in the workbench, with horizontal scrolling when needed;
standalone previews adapt to the recipient's browser width.
On narrow windows, the workbench opens with the sidebar collapsed and uses a
phone preview width when the URL does not specify one.
Drag the preview's right edge to resize between 360 and 1920 pixels. H5 V1
supports phone and tablet widths up to 1023 pixels. Width is
updated live without reloading the embedded page, then saved to the workbench URL
on release. The focused handle supports arrow keys (1px), Shift+arrow (10px),
Home/End (bounds), and Escape (cancel). Device presets remain available.
The width field below the device presets reflects dragging and accepts exact
pixel values. Enter or blur applies the value within the same bounds; Escape
discards an edit. Back, standalone preview, share and reset actions sit above the
canvas and remain available when the sidebar is collapsed.
Device selection follows the width: phone 360–767px, tablet 768–1023px, desktop
1024–1920px. Clicking a device uses its 402/768/1440px preset; custom widths and
dragging always keep one device selected. The field displays its px unit inside.
Back/forward controls use the project's preview-page history, preserving the
current variant, language and viewport. They never navigate outside the workbench.

## Compatibility

Old `direction=...` workbench links without a `project` still use the legacy
preview. Legacy JSON directions affect only the home page and use local storage.
A `/design?story=<story-id>` link opens a single Storybook page for inspection.

## Verification

```sh
pnpm validate
pnpm exec playwright test tests/e2e/prototype-projects.spec.ts tests/e2e/canvas.spec.ts --project=e2e
pnpm --filter @yami/canvas build
```
