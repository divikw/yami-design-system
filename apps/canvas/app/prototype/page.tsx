import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prototypeProjects, resolvePrototypeVariant } from "../lib/prototype-projects";
import { PrototypePlayer } from "../ui/prototype-player";

export default async function PrototypePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((entry) => query.append(key, entry));
    else if (value !== undefined) query.set(key, value);
  }
  const project = prototypeProjects.find((item) => item.id === (query.get("project") ?? prototypeProjects[0].id));
  const mode = resolvePrototypeVariant(project, query.get("variant"))?.fixedPreviewMode;
  if (mode && query.get("previewMode") !== mode) {
    query.set("previewMode", mode);
    redirect(`/prototype?${query}`);
  }
  return <Suspense fallback={<main className="app-loading">正在打开原型…</main>}><PrototypePlayer /></Suspense>;
}
