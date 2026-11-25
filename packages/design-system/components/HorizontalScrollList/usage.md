# Horizontal Scroll List — Usage

`HorizontalScrollList` supplies the shared finite horizontal-rail surface:
native horizontal scrolling, contained overscroll, mandatory item snapping,
hidden scrollbars, touch momentum, and keyboard focusability. Callers retain
their semantic element, item width, gap, and padding. Use `surface="card"` for
the square surface and 8px item/edge spacing over the caller-provided background,
or keep the default `surface="plain"` for a transparent rail. Both surfaces use
8px item and edge spacing on mobile. Plain desktop item geometry stays caller-owned.

## Scroll boundaries

For a mobile list that reaches the page edges, expand the scroll container
through the page section's inline padding. Apply the same inset inside the
scroll container so the first item aligns with the heading at rest and the
last item has breathing room at the end. Items can cross the inset as they
scroll. For a list inside a card or dialog, keep the scroll container within
the host's intended boundary.

Use the markup and styles together in a full-width section. Pass your products
as `ProductCard` props and match the section's existing inline padding token.

```tsx
<section className={styles.section}>
  <h2>Featured products</h2>
  <HorizontalScrollList as="ul" aria-label="Featured products" className={styles.list}>
    {products.map((product) => (
      <li key={product.id} className={styles.item}>
        <ProductCard {...product} />
      </li>
    ))}
  </HorizontalScrollList>
</section>
```

```css
.section {
  padding-inline: var(--layout-page-margin-default);
}

.list {
  display: flex;
  gap: var(--space-100);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  flex: 0 0 min(16rem, 100%);
  min-inline-size: 0;
  scroll-snap-align: start;
}

@media (width < 1024px) {
  .section > .list[data-surface="plain"] {
    inline-size: calc(100% + 2 * var(--layout-page-margin-default));
    margin-inline: calc(-1 * var(--layout-page-margin-default));
    padding-inline: var(--layout-page-margin-default);
    scroll-padding-inline: var(--layout-page-margin-default);
  }
}
```

## Verification

Open the actual page or host at a narrow viewport where the list overflows.

- Check the visible clipping edge at rest and while scrolling. It should align with the intended page or host edge. Check where the first item starts relative to the heading.
- Scroll to each end. The first and last items should be fully visible at their respective ends, with room for their focus indicators. Check that the page itself has no horizontal overflow.
- Verify touch or trackpad scrolling and keyboard access. Check snap positions and paging controls when the design uses them.

## Paging controls

Use `useHorizontalScrollList` when the section also renders previous/next
controls. Pass the returned `listRef` and `updateState` to the list, then bind
`state` and `scrollByPage` to `RailNavigation`.

The controller measures a full visible item page, observes list resizing,
tracks the start/end edges, respects reduced-motion preferences, and falls back
to direct `scrollLeft` updates where `scrollBy` is unavailable.

## Responsibilities

- The list owns horizontal scrolling and focusability.
- The optional `card` surface remains transparent and square, and owns 8px
  item/edge spacing; its caller owns the visible background.
- The `plain` surface owns its 8px mobile item/edge spacing; desktop gap and padding
  remain caller-owned.
- Each child owns `scroll-snap-align` and its fixed or responsive width.
- The caller owns `aria-label`, item semantics, gap, and edge padding.
- Set `enabled={false}` when reusing the same markup for a non-rail layout.

Do not use this finite-list controller for looping or auto-advancing carousels.
Hero banners and other looping rails require a different paging strategy.
