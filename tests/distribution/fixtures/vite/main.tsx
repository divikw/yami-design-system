import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Card } from "@yami/design-system";
import { Demo } from "./Demo";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import "./host.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="verification">
      <h1>Component candidate</h1>
      <Card data-testid="host-card"><p>Vite production composition</p></Card>
      <Demo />
    </main>
  </StrictMode>,
);
