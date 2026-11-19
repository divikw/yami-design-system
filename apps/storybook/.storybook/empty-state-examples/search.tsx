import { useState } from "react";
import {
  EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateHeader, EmptyStateMedia,
  EmptyStateTitle, Input, Tag,
} from "@yami/design-system";
import { Search } from "lucide-react";

export function SearchAgain({ en = false }: { en?: boolean }) {
  const [query, setQuery] = useState(en ? "Coffee" : "咖啡");
  const items = en ? ["Black tea", "Green tea"] : ["红茶", "绿茶"];
  const results = items.filter(item => item.toLowerCase().includes(query.trim().toLowerCase()));
  const prompt = en ? "Search tea" : "搜索茶饮";
  return (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon"><Search aria-hidden="true" size={20} /></EmptyStateMedia>
        <EmptyStateTitle>{results.length ? (en ? "Tea" : "茶饮") : (en ? "No matching tea" : "没有找到匹配的茶饮")}</EmptyStateTitle>
        {!results.length && <EmptyStateDescription>{en ? "Try a different tea name." : "试试其他茶饮名称。"}</EmptyStateDescription>}
      </EmptyStateHeader>
      <EmptyStateContent>
        <Input density="compact" aria-label={prompt} placeholder={prompt} value={query} onValueChange={setQuery} clearable />
        {results.length > 0 && (
          <ul aria-label={en ? "Matching teas" : "匹配的茶饮"}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-100)", margin: 0, padding: 0, listStyle: "none" }}>
            {results.map(item => <Tag key={item} render={<li />}
              style={{ color: "var(--text-primary)", backgroundColor: "var(--surface-secondary)" }}>{item}</Tag>)}
          </ul>
        )}
      </EmptyStateContent>
    </EmptyState>
  );
}
