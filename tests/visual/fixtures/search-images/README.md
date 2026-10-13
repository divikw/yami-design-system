# Search visual image fixtures

These are the original CDN response bytes for the 12 products in the Canvas
search snapshot. Playwright serves them only in the two search visual tests;
application URLs, production image loading and screenshot baselines are unchanged.

Captured on 2026-10-13. Eleven responses come from the failed PR #163 CI trace
(run `38397880834`); the stalled TSUJIRI response (`1020065241`) was fetched
directly from its original URL. `manifest.json` records each source URL, actual
MIME type and SHA-256. The CDN's `.webp` URLs return JPEG or PNG bytes.

When the product snapshot intentionally changes, review the source images and
update the corresponding fixtures and manifest. Any screenshot baseline update
still runs in the locked Linux CI image.
