import type { ReactNode } from "react";
import { Badge } from "@yami/design-system";
import type { DocsPreviewMode } from "./component-docs-preview";
import { componentGuideNotes } from "./component-guide-notes";
import { CodeBlock, ComponentDocsTemplate, DocsApiTable, DocsExample, type DocsLocale } from "./component-docs-template";
import styles from "./component-docs-template.module.css";

export interface GuideExample {
  id: string;
  anchor?: string;
  title: string;
  description: string;
  code: string;
  preview: ReactNode;
  previewBackground?: string;
}

/** Content for the shared component documentation layout; demos use real YAMI components. */
export function ComponentGuide({ name, slug, intro, previous, next, locale, composition, examples, leadExample, usageCode = examples[0].code, usageNote, practices, storyExamples, api, apiNote, accessibility, reference, legacyAnchors, previewMode }: {
  name: string;
  slug: string;
  intro: string;
  previous?: { name: string; path: string };
  next?: { name: string; path: string };
  locale: DocsLocale;
  composition: string | [string, string][];
  examples: GuideExample[];
  leadExample?: Pick<GuideExample, "code" | "preview" | "previewBackground">;
  usageCode?: string;
  usageNote?: string;
  storyExamples?: ReactNode;
  practices?: ["do" | "avoid", string][];
  api: [string, string][];
  apiNote: string;
  accessibility?: string[];
  reference?: { label: string; href: string };
  legacyAnchors?: Record<string, readonly string[]>;
  previewMode?: DocsPreviewMode;
}) {
  const zh = locale === "zh";
  const notes = componentGuideNotes(slug, locale);
  usageNote ??= notes?.usageNote;
  practices ??= notes?.practices;
  accessibility ??= notes?.accessibility;
  const lead = leadExample ?? examples[0];
  const anchors = (section: string) => legacyAnchors?.[section]?.map((id) => <span className={styles.legacyAnchor} id={id} key={id} aria-hidden="true" />);
  const [imports, ...usage] = usageCode.split("\n\n");
  return <ComponentDocsTemplate name={name} slug={slug} intro={intro} previous={previous} next={next} locale={locale}>
    <DocsExample key={`lead-${locale}`} locale={locale} code={lead.code} name="lead" previewMode={previewMode} previewBackground={lead.previewBackground}>{lead.preview}</DocsExample>
    <section>{anchors("usage")}<h2 id={`${slug}-usage`}>{zh ? "用法" : "Usage"}</h2>
      {usageNote && <p>{usageNote}</p>}
      <CodeBlock locale={locale} code={imports} />
      {usage.length > 0 && <CodeBlock locale={locale} code={usage.join("\n\n")} />}
    </section>
    <section>{anchors("composition")}<h2 id={`${slug}-composition`}>{zh ? "组合结构" : "Anatomy"}</h2>
      {typeof composition === "string" ? <CodeBlock locale={locale} code={composition} language="text" />
        : <DocsApiTable locale={locale} rows={composition} partLabel={zh ? "部件" : "Part"} />}
    </section>
    {practices?.length ? <section><h2 id={`${slug}-practices`}>{zh ? "使用建议" : "Best Practices"}</h2>
      <div className={`${styles.tableScroll} ${styles.guidanceTable}`}>
        <table aria-labelledby={`${slug}-practices`}>
          <thead><tr><th scope="col">{zh ? "建议" : "Guidance"}</th><th scope="col">{zh ? "做法" : "Practice"}</th></tr></thead>
          <tbody>{practices.map(([guidance, practice]) => <tr key={practice}>
            <td><Badge color={guidance === "do" ? "green" : "red"} emphasis="secondary">{guidance === "do" ? (zh ? "推荐" : "Do") : (zh ? "避免" : "Avoid")}</Badge></td>
            <td>{practice}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section> : null}
    <section className={styles.examples}>{anchors("examples")}
      <h2 id={`${slug}-examples`}>{zh ? "示例" : "Examples"}</h2>
      {examples.map((example) => <section key={example.id} id={example.anchor}>
        {anchors(example.id)}
        <h3 id={`${slug}-${example.id}`}>{example.title}</h3><p>{example.description}</p>
        <DocsExample key={`${example.id}-${locale}`} name={example.id} locale={locale} code={example.code} previewMode={previewMode} previewBackground={example.previewBackground}>{example.preview}</DocsExample>
      </section>)}
      {storyExamples}
    </section>
    <section>{anchors("api")}<h2 id={`${slug}-api`}>{zh ? "API 参考" : "API Reference"}</h2><p>{apiNote}</p><DocsApiTable locale={locale} rows={api} />{reference && <p><a href={reference.href} target="_blank" rel="noreferrer">{reference.label}</a></p>}</section>
    {accessibility?.length ? <section><h2 id={`${slug}-accessibility`}>{zh ? "无障碍" : "Accessibility"}</h2>
      <ul className={styles.guideList}>{accessibility.map(note => <li key={note}>{note}</li>)}</ul>
    </section> : null}
  </ComponentDocsTemplate>;
}
