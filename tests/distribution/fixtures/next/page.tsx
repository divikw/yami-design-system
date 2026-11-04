import { Button, Card } from "@yami/design-system";
import { Demo } from "./Demo";

// Remains a Server Component: the package owns its public client boundaries.
export default function Page() {
  return (
    <main className="verification">
      <h1>Component candidate</h1>
      <Card data-testid="host-card">
        <p>Next.js Server Component composition</p>
        <Button>Server-rendered button</Button>
      </Card>
      <Demo />
    </main>
  );
}
