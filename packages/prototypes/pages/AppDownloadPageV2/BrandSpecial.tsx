import { useEffect, useRef } from "react";
import { Card, HorizontalScrollList } from "@yami/design-system";
import { type AppDownloadLocale } from "./fixtures";
import type { SectionDividerProps } from "../../../design-system/components/sectionDivider.types";
import { dividerAttributes } from "./sectionDividers";
import { SectionHeading } from "../../../design-system/components/SectionHeading";
import content from "./brand-special.json";
import styles from "./BrandSpecial.module.css";

const media = (name: string) => new URL(`./assets/brand-special/${name}`, import.meta.url).href;

export function BrandSpecial({ locale, ...divider }: { locale: AppDownloadLocale } & SectionDividerProps) {
  const t = content[locale];
  const video = useRef<HTMLVideoElement>(null);
  const brandsRef = useRef<HTMLUListElement>(null);
  const strengthsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const rails = [brandsRef.current, strengthsRef.current].filter((rail): rail is HTMLUListElement => Boolean(rail));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const positions = rails.map((rail) => rail.scrollLeft);
    let previous = 0;
    let frame = 0;
    // Both rows travel at 32 CSS pixels per second, regardless of item count.
    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 100) / 1000 : 0;
      previous = now;
      rails.forEach((rail, index) => {
        const first = rail.children[0] as HTMLElement;
        const copy = rail.querySelector<HTMLElement>('[data-loop-copy="true"]');
        const distance = copy && first ? copy.offsetLeft - first.offsetLeft : 0;
        const bounds = rail.getBoundingClientRect();
        if (!motion.matches && distance > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight && !rail.matches(":hover, :focus-within")) {
          positions[index] = (positions[index] + elapsed * 32) % distance;
          rail.scrollLeft = positions[index];
        } else {
          positions[index] = rail.scrollLeft;
        }
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void player.play().catch(() => { /* Native controls remain available. */ });
      } else {
        player.pause();
      }
    }, { threshold: 0.25 });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  return <section {...dividerAttributes(divider)} id="brand-special" className={styles.root} aria-labelledby="brand-special-title">
    <div className={styles.container}>
      <SectionHeading id="brand-special-title" align="center" slot="brand-special" title={t.title} description={t.description} />
      <video ref={video} className={styles.video} src={media("branding-video.mp4")} poster={media("poster.jpg")} muted loop playsInline controls preload="metadata" aria-label={t.title} />
      <div className={styles.brands}>
        <h3 id="brand-special-brands">{t.brandsTitle}</h3>
        <div className={styles.railFrame}>
        <HorizontalScrollList as="ul" className={styles.rail} ref={brandsRef} aria-labelledby="brand-special-brands">
          {[false, true].map((copy) => content.brands.map((brand) => <li key={`${copy}-${brand.image}`} data-loop-copy={copy || undefined} aria-hidden={copy || undefined}><Card padding="md" className={styles.brand}><img src={media(brand.image)} alt={brand.name} loading="lazy" /></Card></li>))}
        </HorizontalScrollList>
        </div>
      </div>
      <div className={styles.strengths}>
        <h3 id="brand-special-strengths">{t.strengthsTitle}</h3>
        <div className={styles.railFrame}>
        <HorizontalScrollList as="ul" className={styles.strengthRail} ref={strengthsRef} aria-labelledby="brand-special-strengths">
          {[false, true].map((copy) => t.strengths.map(([title, description]) => <li key={`${copy}-${title}`} data-loop-copy={copy || undefined} aria-hidden={copy || undefined}><Card padding="md" className={styles.strength}><strong>{title}</strong><p>{description}</p></Card></li>))}
        </HorizontalScrollList>
        </div>
      </div>
    </div>
  </section>;
}
