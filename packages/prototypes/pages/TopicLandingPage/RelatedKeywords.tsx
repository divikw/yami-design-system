import { useId, useLayoutEffect, useRef, useState } from "react";

import { HorizontalScrollList, SectionHeading, Tag } from "@yami/design-system";

import styles from "./TopicLandingPage.module.css";
import type { TopicLandingPageRelatedKeywords } from "./TopicLandingPage.types";

function getScrollLayout(widths: number[], available: number, gap: number) {
  let rows = 1;
  let rowWidth = 0;
  for (const width of widths) {
    if (rowWidth && rowWidth + gap + width > available) {
      rows++;
      rowWidth = width;
    } else {
      rowWidth += rowWidth ? gap + width : width;
    }
  }
  if (rows <= 3) return null;

  const offsets = [0];
  for (const width of widths) offsets.push(offsets[offsets.length - 1] + width + gap);
  const count = widths.length;

  // Find two breaks that preserve the reading order and minimize the total scroll width.
  let firstBreak = 1;
  let secondBreak = 2;
  let widest = Infinity;
  for (let first = 1; first < count - 1; first++) {
    for (let second = first + 1; second < count; second++) {
      const width = Math.max(offsets[first], offsets[second] - offsets[first], offsets[count] - offsets[second]) - gap;
      if (width < widest) {
        firstBreak = first;
        secondBreak = second;
        widest = width;
      }
    }
  }

  const inlineSize = Math.ceil(widest);
  // The last item in each of the first two rows fills the remainder without stretching its tag.
  return {
    inlineSize,
    rowEnds: new Map([
      [firstBreak - 1, inlineSize - offsets[firstBreak - 1]],
      [secondBreak - 1, inlineSize - (offsets[secondBreak - 1] - offsets[firstBreak])],
    ]),
  };
}

export function RelatedKeywords({ title, items, mode, className }: TopicLandingPageRelatedKeywords & { className?: string }) {
  const headingId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [layout, setLayout] = useState<ReturnType<typeof getScrollLayout>>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const list = listRef.current;
    if (!container || !list) return;

    const mobile = window.matchMedia("(width < 1024px)");
    const tags = list.querySelectorAll('[data-slot="tag"]');
    const update = () => {
      const { paddingInlineStart, paddingInlineEnd } = getComputedStyle(container);
      const available = container.getBoundingClientRect().width -
        parseFloat(paddingInlineStart) - parseFloat(paddingInlineEnd);
      const gap = parseFloat(getComputedStyle(list).columnGap);
      setLayout(mobile.matches && available
        ? getScrollLayout(Array.from(tags, tag => tag.getBoundingClientRect().width), available, gap)
        : null);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    tags.forEach(tag => observer.observe(tag));
    mobile.addEventListener("change", update);
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", update);
    };
  }, [items]);

  return (
    <section className={[styles.relatedKeywords, className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <div ref={containerRef} className={styles.relatedKeywordsContainer}>
        <SectionHeading id={headingId} title={title} slot="related-keywords" />
        <HorizontalScrollList
          className={styles.relatedKeywordsViewport}
          enabled={layout !== null}
          role={layout ? "group" : undefined}
          aria-labelledby={layout ? headingId : undefined}
        >
          <ul
            ref={listRef}
            className={styles.relatedKeywordsList}
            role="list"
            aria-labelledby={headingId}
            style={layout ? { inlineSize: layout.inlineSize } : undefined}
          >
            {items.map((keyword, index) => {
              const inlineSize = layout?.rowEnds.get(index);
              const label = typeof keyword === "string" ? keyword : keyword.label;
              const tag = <Tag mode={mode}>{label}</Tag>;
              return (
                <li key={typeof keyword === "string" ? label : keyword.href} style={inlineSize === undefined ? undefined : { inlineSize }}>
                  {typeof keyword === "string" ? tag : (
                    <a className={styles.relatedKeywordLink} href={keyword.href} target={keyword.target}>{tag}</a>
                  )}
                </li>
              );
            })}
          </ul>
        </HorizontalScrollList>
      </div>
    </section>
  );
}
