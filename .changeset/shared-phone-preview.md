---
"@yami/prototypes": minor
---

Add iOS phone chrome to PROTOTYPE's mobile page previews. Transparent status
and home bars overlay the full page viewport, with embedded safe-area spacing
for initial content, sticky headers and fixed controls. Storybook itself stays
content-only; pages imported into PROTOTYPE use its host shell. Standalone
components and tablet/desktop previews remain unwrapped.

Support H5/App preview modes, retaining the selected mode in prototype links.
H5 phone previews use fixed Safari chrome from the supplied Figma reference,
with local light/dark icon assets and working back/reload controls. Transparent
chrome reveals page backgrounds; safe-area offsets keep checkout controls above the browser toolbar, including
imported Storybook pages. App navigation remains hidden in H5 mode.
