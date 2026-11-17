import type { ReactNode } from "react";
import { CodeBlock, ComponentDocsTemplate, DocsApiTable, DocsExample, Installation, type DocsLocale } from "./component-docs-template";

export interface GuideExample {
  id: string;
  title: string;
  description: string;
  code: string;
  preview: ReactNode;
}

/** Content for the shared component documentation layout; demos use real YAMI components. */
export function ComponentGuide({ name, slug, intro, previous, next, locale, composition, examples, api, apiNote, reference }: {
  name: string;
  slug: string;
  intro: string;
  previous?: { name: string; path: string };
  next?: { name: string; path: string };
  locale: DocsLocale;
  composition: string;
  examples: GuideExample[];
  api: [string, string][];
  apiNote: string;
  reference: { label: string; href: string };
}) {
  const labels = locale === "zh" ? ["安装", "用法", "组合结构", "API 参考"] : ["Installation", "Usage", "Composition", "API Reference"];
  const lead = examples[0];
  const [imports, ...usage] = lead.code.split("\n\n");
  const pageText = [
    `# ${name}`, intro,
    `## ${labels[0]}\n\npnpm add "@yami/design-system@workspace:*"`,
    '```tsx\nimport "@yami/design-system/styles/fonts.css";\nimport "@yami/design-system/tokens.css";\nimport "@yami/design-system/styles/base.css";\n```',
    `## ${labels[1]}\n\n\`\`\`tsx\n${lead.code}\n\`\`\``,
    `## ${labels[2]}\n\n\`\`\`text\n${composition}\n\`\`\``,
    ...examples.map((example) => `## ${example.title}\n\n${example.description}\n\n\`\`\`tsx\n${example.code}\n\`\`\``),
    `## ${labels[3]}\n\n${apiNote}\n\n${api.map(([prop, description]) => `- ${prop}: ${description}`).join("\n")}\n\n[${reference.label}](${reference.href})`,
  ].join("\n\n");
  return <ComponentDocsTemplate name={name} slug={slug} intro={intro} previous={previous} next={next} locale={locale} pageText={pageText}>
    <DocsExample key={`lead-${locale}`} locale={locale} code={lead.code} name="lead">{lead.preview}</DocsExample>
    <section><h2 id={`${slug}-installation`}>{labels[0]}</h2><Installation locale={locale} /></section>
    <section><h2 id={`${slug}-usage`}>{labels[1]}</h2><CodeBlock locale={locale} code={imports} /><CodeBlock locale={locale} code={usage.join("\n\n")} /></section>
    <section><h2 id={`${slug}-composition`}>{labels[2]}</h2><CodeBlock locale={locale} code={composition} language="text" /></section>
    {examples.map((example) => <section key={example.id}>
      <h2 id={`${slug}-${example.id}`}>{example.title}</h2><p>{example.description}</p>
      <DocsExample key={`${example.id}-${locale}`} name={example.id} locale={locale} code={example.code}>{example.preview}</DocsExample>
    </section>)}
    <section><h2 id={`${slug}-api`}>{labels[3]}</h2><p>{apiNote}</p><DocsApiTable locale={locale} rows={api} /><p><a href={reference.href} target="_blank" rel="noreferrer">{reference.label}</a></p></section>
  </ComponentDocsTemplate>;
}
