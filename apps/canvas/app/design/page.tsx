import type { Metadata } from "next";
import { Suspense } from "react";
import { CanvasWorkbench } from "../ui/canvas-workbench";

export const metadata: Metadata = {
  title: "PROTOTYPE · Yami Design System",
};

export default function DesignPage() {
  return <Suspense fallback={<main className="app-loading">正在打开 PROTOTYPE…</main>}><CanvasWorkbench /></Suspense>;
}
