# PROTOTYPE

Run `pnpm dev:canvas` from the repository root and open
`http://localhost:3200/workbench`.

## Project delivery

The workbench selects a project, variant, page, language and device width.
“独立预览” opens the complete flow without the workbench frame; “复制方案链接”
copies that same address. A recipient does not need the author's local drafts.
Links use the current host: localhost links require the local service; remote
sharing requires deploying this code to the intended host first.

The first project, `global-navigation`, has two demonstration variants using the
existing text and image category menus. These are tool demonstrations, not an
approved navigation redesign. Both reuse the maintained home, search, product,
cart and Anua page compositions. Category routes use the search/list composition
and fixture products; this is a simulated flow, not a live catalogue or checkout.
Unknown pages show an explicit out-of-scope screen.

Example independent address:

```text
/prototype?project=global-navigation&variant=image-categories&path=%2Fsearch%2Fmatcha&locale=en&theme=light
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
Drag the preview's right edge to resize between 320 and 1920 pixels. Width is
updated live without reloading the embedded page, then saved to the workbench URL
on release. The focused handle supports arrow keys (1px), Shift+arrow (10px),
Home/End (bounds), and Escape (cancel). Device presets remain available.
The width field below the device presets reflects dragging and accepts exact
pixel values. Enter or blur applies the value within the same bounds; Escape
discards an edit. Back, standalone preview, share and reset actions sit above the
canvas and remain available when the sidebar is collapsed.
Device selection follows the width: phone 320–767px, tablet 768–1023px, desktop
1024–1920px. Clicking a device uses its 402/768/1440px preset; custom widths and
dragging always keep one device selected. The field displays its px unit inside.
Back/forward controls use the project's preview-page history, preserving the
current variant, language and viewport. They never navigate outside the workbench.

## Compatibility

Old `direction=...` workbench links without a `project` still use the legacy
preview. Legacy JSON directions affect only the home page and use local storage.
The Storybook importer remains a single-page inspection tool; imported stories
are not automatically registered as project routes or variants.

## Verification

```sh
pnpm validate
pnpm exec playwright test tests/e2e/prototype-projects.spec.ts tests/e2e/canvas.spec.ts --project=e2e
pnpm --filter @yami/canvas build
```
