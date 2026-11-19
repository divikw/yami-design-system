import { useState, type CSSProperties } from "react";
import {
  Button, ButtonGroup, Card, CardAction, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle, Input, useDesktopViewport,
} from "@yami/design-system";

const spacings = [
  [16, "var(--space-200)"],
  [20, "var(--space-250)"],
  [24, "var(--space-300)"],
  [32, "var(--space-400)"],
] as const;

export function LoginCard({ locale, adjustableSpacing = false }: { locale: "zh" | "en"; adjustableSpacing?: boolean }) {
  const fullButtonSize = useDesktopViewport() ? "sm" : "md";
  const zh = locale === "zh";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);

  const [spacing, setSpacing] = useState<string>(spacings[0][1]);

  return <div style={{ display: "grid", gap: "var(--space-200)", maxWidth: "24rem", marginInline: "auto" }}>
    {adjustableSpacing && <ButtonGroup aria-label={zh ? "卡片间距" : "Card spacing"}>
      {spacings.map(([px, token]) => (
        <Button key={px} size="sm" variant={spacing === token ? "secondary" : "tertiary"}
          style={{ border: "var(--stroke-default) solid var(--border-default)" }}
          aria-pressed={spacing === token} onClick={() => setSpacing(token)}>{px}px</Button>
      ))}
    </ButtonGroup>}
    <form onChange={() => setValidated(false)}
      onSubmit={(event) => { event.preventDefault(); setValidated(true); }}
      onReset={() => { setEmail(""); setPassword(""); setValidated(false); }}>
      <Card bordered style={adjustableSpacing ? { "--card-spacing": spacing } as CSSProperties : undefined}>
        <CardHeader style={{ alignItems: "center" }}>
          <CardTitle>{zh ? "登录账户" : "Account sign-in"}</CardTitle>
          <CardDescription style={{ margin: 0 }}>{zh ? "使用示例数据体验登录表单。" : "Try the form with sample credentials."}</CardDescription>
          <CardAction style={{ gridRow: 1, display: "flex" }}>
            <Button htmlType="reset" size="sm" variant="tertiary" style={{
              backgroundColor: "var(--button-tertiary)", paddingInline: 0, fontWeight: "var(--font-weight-normal)",
              textDecoration: "underline", textUnderlineOffset: "var(--space-025)",
            }}>{zh ? "重填" : "Reset"}</Button>
          </CardAction>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: "var(--space-200)" }}>
          <Input fullWidth density="compact" type="email" placeholder="m@example.com" label={zh ? "邮箱" : "Email"} autoComplete="off" required
            value={email} onValueChange={setEmail} />
          <Input fullWidth density="compact" type="password" label={zh ? "密码" : "Password"} autoComplete="off" required
            value={password} onValueChange={setPassword} />
        </CardContent>
        <CardFooter style={{
          marginInline: "calc(-1 * var(--card-spacing))", marginBottom: "calc(-1 * var(--card-spacing))",
          padding: "var(--card-spacing)",
          backgroundColor: "var(--surface-secondary)", borderTop: "var(--stroke-default) solid var(--border-default)",
          borderRadius: "0 0 var(--radius-surface-default) var(--radius-surface-default)",
        }}>
          <Button form="full" size={fullButtonSize} htmlType="submit">{zh ? "登录" : "Sign in"}</Button>
          <Button form="full" size={fullButtonSize} variant="secondary" style={{ "--button-secondary": "var(--surface-primary)", border: "var(--stroke-default) solid var(--border-default)" } as CSSProperties} onClick={() => {
            setEmail("demo@example.com"); setPassword("example-only"); setValidated(false);
          }}>{zh ? "填入示例账户" : "Use sample account"}</Button>
          {validated && <span role="status">{zh ? "示例表单已验证。" : "Sample form validated."}</span>}
        </CardFooter>
      </Card>
    </form>
  </div>;
}
