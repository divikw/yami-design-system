import { ButtonLink } from "@yami/design-system";
import { designIssues } from "../lib/prototype-projects";

export function DesignIssues() {
  if (!designIssues.length) return null;
  return <section role="alert"><strong>请修正方案文件中的 ID</strong>
    <ul>{designIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
  </section>;
}

export function DesignUnavailable({ empty = false }: { empty?: boolean }) {
  return <main className="prototype-unavailable">
    <h1>{empty ? "暂无可用的设计方案" : "找不到这个原型方案"}</h1>
    <DesignIssues />
    {empty ? <p>在 <code>packages/prototypes/design/</code> 中添加一个 <code>*.stories.tsx</code> 或 <code>*.stories.ts</code> 方案文件。</p>
      : <ButtonLink href="/design" variant="secondary" size="sm">返回工作台</ButtonLink>}
  </main>;
}
