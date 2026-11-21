import { useContext, useEffect, useState, type ReactNode } from "react";
import { CodeXml } from "lucide-react";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import {
  Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@yami/design-system";
import { getArgDescription, type DescriptionTranslations } from "./arg-descriptions";
import { ComponentDocsPreview, type DocsPreviewFullWidth, type DocsPreviewMode } from "./component-docs-preview";
import { CodeBlock, ComponentDocsTemplate, DocsExampleCard, type DocsLocale } from "./component-docs-template";
import { getPropertiesPreviewDevices } from "./properties-preview-devices";
import styles from "./component-properties.module.css";

type PropertyValues = Record<string, string | boolean>;
type DeviceName = ReturnType<typeof getPropertiesPreviewDevices>[number]["name"];

type PropertyField<T extends PropertyValues> = {
  [Key in keyof T & string]: {
    key: Key;
    name?: string;
    label?: string;
    type?: string;
    description?: string;
    placeholder?: string;
    group?: { key: "name" | "required" | "preview"; title: string };
  } & (T[Key] extends boolean ? { kind: "switch" } : { kind: "text"; required?: boolean } | {
    kind: "select";
    options: readonly (T[Key] & string)[];
    optionLabels?: Readonly<Record<T[Key] & string, string>>;
  });
}[keyof T & string];

export interface PropertiesDefinition<T extends PropertyValues> {
  slug: string;
  previewMode?: DocsPreviewMode;
  fullWidth?: DocsPreviewFullWidth;
  stickyPreview?: boolean;
  initialValues: (locale: DocsLocale) => T;
  fields: (values: T, locale: DocsLocale, device?: DeviceName) => readonly PropertyField<T>[];
  example: (values: T, locale: DocsLocale, device?: DeviceName, update?: (patch: Partial<T>) => void) => {
    preview: ReactNode; code: string; previewBackground?: string; fillContentWidth?: boolean;
  };
}

export function jsxAttributes(props: Record<string, string | number | boolean | undefined>) {
  return Object.entries(props).flatMap(([name, value]) => {
    if (value === undefined) return [];
    if (value === true) return ` ${name}`;
    if (typeof value === "string" && /^[a-z0-9./:_-]+$/i.test(value)) return ` ${name}="${value}"`;
    return ` ${name}={${JSON.stringify(value)}}`;
  }).join("");
}

export function jsxExample(imports: string, jsx: string, preview: ReactNode) {
  return { preview, code: `import { ${imports} } from "@yami/design-system";\n\n${jsx}` };
}

function PropertySelect({ name, options, optionLabels, value, onChange }: {
  name: string;
  options: readonly string[];
  optionLabels?: Readonly<Record<string, string>>;
  value: string;
  onChange: (value: string) => void;
}) {
  const items = options.map(option => ({ value: option, label: optionLabels?.[option] ?? option }));
  return <Select items={items} value={value} onValueChange={next => { if (next !== null) onChange(next); }}>
    <SelectTrigger aria-label={name}><SelectValue /></SelectTrigger>
    <SelectContent>{items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
  </Select>;
}

export function ComponentPropertiesPage<T extends PropertyValues>({ definition }: { definition: PropertiesDefinition<T> }) {
  const context = useContext(DocsContext);
  const stories = context.componentStories();
  const story = stories[0];
  const devices = definition.previewMode === "document" ? [] : getPropertiesPreviewDevices(stories);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(devices[0]?.name);
  const device = devices.find(option => option.name === selectedDevice) ?? devices[0];
  const [locale, setLocale] = useState<DocsLocale>(() => context.getStoryContext(story).userGlobals.locale === "en" ? "en" : "zh");
  const [overrides, setOverrides] = useState<Partial<T>>({});
  const [showCode, setShowCode] = useState(false);
  useEffect(() => {
    const sync = ({ userGlobals }: { userGlobals: Record<string, unknown> }) => setLocale(userGlobals.locale === "en" ? "en" : "zh");
    context.channel.on(GLOBALS_UPDATED, sync);
    return () => context.channel.off(GLOBALS_UPDATED, sync);
  }, [context]);

  const zh = locale === "zh";
  const { slug } = definition;
  const values = { ...definition.initialValues(locale), ...overrides };
  const { preview, code, previewBackground, fillContentWidth } = definition.example(values, locale, device?.name,
    patch => setOverrides(current => ({ ...current, ...patch })));
  const codeId = `${slug}-properties-jsx`;
  const codeLabel = showCode ? (zh ? "收起 JSX" : "Hide JSX") : (zh ? "查看 JSX" : "Show JSX");
  const translations = story.parameters.docs?.translations as DescriptionTranslations | undefined;
  const groups = new Map<string, { title: string; fields: PropertyField<T>[] }>();
  for (const field of definition.fields(values, locale, device?.name)) {
    const { key, title } = field.group ?? { key: "optional", title: zh ? "可选属性" : "Optional" };
    if (!groups.has(key)) groups.set(key, { title, fields: [] });
    groups.get(key)!.fields.push(field);
  }

  const card = <DocsExampleCard locale={locale} name={`${slug}-properties-preview`}>
    <div className={styles.previewPanel}>
      <ComponentDocsPreview mode={definition.previewMode} locale={locale} name={story.title.split("/").at(-1)}
        viewportWidth={definition.fullWidth === "fluid" && device?.name === "PC" ? undefined : device?.width}
        fullWidth={definition.fullWidth} fillContentWidth={fillContentWidth} previewBackground={previewBackground}>
        <div className={styles.preview}>{preview}</div>
      </ComponentDocsPreview>
      <Button className={styles.codeToggle} form="icon" size="sm" variant="tertiary" aria-label={codeLabel} title={codeLabel}
        aria-controls={codeId} aria-expanded={showCode} onClick={() => setShowCode(!showCode)}>
        <CodeXml size={16} aria-hidden="true" />
      </Button>
    </div>
    <div id={codeId} className={styles.codePanel} hidden={!showCode}>
      {showCode && <CodeBlock locale={locale} code={code} />}
    </div>
  </DocsExampleCard>;

  const devicePreview = devices.length > 1 ? <Tabs value={device?.name} onValueChange={setSelectedDevice}>
      <TabsList className={styles.deviceTabs} variant="secondary" aria-label={zh ? "预览设备" : "Preview device"}>
        {devices.map(({ name }) => <TabsTrigger key={name} value={name}>{name}</TabsTrigger>)}
      </TabsList>
      {devices.map(({ name }) => <TabsContent key={name} value={name}>
        {name === device?.name && card}
      </TabsContent>)}
    </Tabs> : card;

  return <ComponentDocsTemplate name={zh ? "属性试用" : "Properties"} slug={slug} locale={locale}>
    {definition.stickyPreview ? <div className={styles.stickyPreview}>{devicePreview}</div> : devicePreview}
    <section onFocus={definition.stickyPreview ? ({ currentTarget, target }) => {
      const preview = currentTarget.previousElementSibling;
      if (preview && currentTarget.contains(target) && target.getBoundingClientRect().top < preview.getBoundingClientRect().bottom) {
        target.scrollIntoView({ block: "end" });
      }
    } : undefined}>
      <h2 id={`${slug}-properties`}>{zh ? "属性" : "Props"}</h2>
      {[...groups].map(([key, group]) => {
        const headingId = `${slug}-properties-${key}`;
        return <div key={key}>
          <h3 id={headingId} className={styles.groupTitle}>{group.title}</h3>
          <dl className={styles.properties} aria-labelledby={headingId}>
            {group.fields.map(field => {
              const name = field.name ?? field.key;
              const label = field.label ?? name;
              const type = field.type ?? (field.kind === "select" ? field.options.map(option => JSON.stringify(option)).join(" | ") : field.kind === "switch" ? "boolean" : "string");
              const description = field.description ?? getArgDescription(story.title, name, locale, translations);
              const update = (value: string | boolean) => setOverrides(current => ({ ...current, [field.key]: value }));
              return <div className={styles.row} key={field.key}>
                <dt><code>{name}</code></dt>
                <dd>
                  <div className={styles.details}>
                    <code>{type}</code>
                    {description && <p>{description}</p>}
                  </div>
                  <div className={styles.control}>
                    {field.kind === "switch" ? <Switch aria-label={label} checked={Boolean(values[field.key])} onCheckedChange={update} />
                      : field.kind === "select" ? <PropertySelect name={label} options={field.options} optionLabels={field.optionLabels} value={String(values[field.key])} onChange={update} />
                      : <Input density="compact" aria-label={label} placeholder={field.placeholder} required={field.required} value={String(values[field.key])} onChange={event => update(event.target.value)} />}
                  </div>
                </dd>
              </div>;
            })}
          </dl>
        </div>;
      })}
    </section>
  </ComponentDocsTemplate>;
}
