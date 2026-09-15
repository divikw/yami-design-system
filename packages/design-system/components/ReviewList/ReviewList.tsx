"use client";

import { useId } from "react";

import { RailNavigation } from "../Button/RailNavigation";
import {
  HorizontalScrollList,
  useHorizontalScrollList,
} from "../HorizontalScrollList";
import { SectionHeading } from "../SectionHeading";

import styles from "./ReviewList.module.css";
import type { ReviewListProps } from "./ReviewList.types";
import { ReviewCard } from "./ReviewCard";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ReviewList({
  title,
  description,
  headingAlign = "start",
  titleFontFamily = "sans",
  mobileTitle,
  reviews,
  mobileSurface = "card",
  viewAllHref,
  viewAllLabel = "See all",
  previousLabel = "Previous reviews",
  nextLabel = "Next reviews",
  dividerPosition = "top",
  dividerVariant = "gray",
  className,
  ...rest
}: ReviewListProps) {
  const titleId = useId();
  const {
    listRef,
    state: railState,
    updateState,
    scrollByPage,
  } = useHorizontalScrollList({
    itemCount: reviews.length,
    minimumPageDistance: 150,
  });

  return (
    <section
      {...rest}
      className={cx(styles.root, className)}
      data-slot="review-list"
      data-heading-align={headingAlign}
      data-mobile-surface={mobileSurface}
      data-divider-position={dividerPosition}
      data-divider-variant={dividerVariant}
      aria-labelledby={titleId}
    >
      <div className={styles.container} data-slot="review-list-container">
        <SectionHeading
          align={headingAlign}
          id={titleId}
          title={title}
          description={description}
          titleFontFamily={titleFontFamily}
          mobileTitle={mobileTitle ?? title}
          slot="review-list"
          className={styles.heading}
          viewAllHref={viewAllHref}
          viewAllLabel={viewAllLabel}
          actions={headingAlign === "start" && railState.canScroll ? (
            <RailNavigation
              className={styles.railActions}
              previousLabel={previousLabel}
              nextLabel={nextLabel}
              previousDisabled={railState.atStart}
              nextDisabled={railState.atEnd}
              onPrevious={() => scrollByPage(-1)}
              onNext={() => scrollByPage(1)}
              buttonClassName={styles.railButton}
            />
          ) : null}
        />

        <div className={styles.railFrame}>
        <HorizontalScrollList
          as="ul"
          ref={listRef}
          className={styles.list}
          data-slot="review-list-items"
          onScroll={updateState}
        >
          {reviews.map((review) => (
            <li key={review.id} className={styles.item}>
              <ReviewCard {...review} />
            </li>
          ))}
        </HorizontalScrollList>
          {headingAlign === "center" && railState.canScroll && <RailNavigation
            className={styles.edgeNavigation}
            previousLabel={previousLabel} nextLabel={nextLabel}
            previousDisabled={railState.atStart} nextDisabled={railState.atEnd}
            onPrevious={() => scrollByPage(-1)} onNext={() => scrollByPage(1)}
          />}
        </div>
      </div>
    </section>
  );
}
