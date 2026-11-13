import { Suspense } from "react";
import { PrototypePlayer } from "../ui/prototype-player";

export default function PrototypePage() {
  return <Suspense fallback={<main className="app-loading">正在打开原型…</main>}><PrototypePlayer /></Suspense>;
}
