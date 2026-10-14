# Story banner images

Captured on 2026-10-14 from the exact CDN URLs in `../../story-banners.json`.
These are the original response bytes for eight campaign images and 24 product
thumbnails; no resizing, recompression, or artwork changes are applied.

`manifest.json` records the original URL, filename, byte length, and SHA-256 for
each file. Page fixtures resolve these bundled images while retaining the source
URLs and original story destinations in the content snapshot.

Bundling removes this banner rail's dependency on remote image loading. Slow
CDN image requests previously held up the browser's lower-priority video requests
on first entry to Social Trends, even though the videos were served locally.
