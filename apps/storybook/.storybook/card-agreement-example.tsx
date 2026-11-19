import { useState, type CSSProperties } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@yami/design-system";

export function AgreementCard({ locale }: { locale: "zh" | "en" }) {
  const zh = locale === "zh";
  const [decision, setDecision] = useState<"accepted" | "declined">();
  const title = zh ? "活动参与约定" : "Workshop agreement";
  const paragraphs = zh ? [
    "签到时请使用报名时填写的昵称，方便工作人员核对分组并为你准备材料。",
    "动手体验开始前，请先阅读桌面上的材料清单。需要替换材料时可以向现场工作人员说明。",
    "拍照前请征得同组参与者同意。分享作品时，可以附上你自己的创作说明。",
    "离开前请将借用的工具放回收纳区，让下一组参与者也能顺利开始体验。",
  ] : [
    "Check in with the name on your reservation so the hosts can find your group and prepare your materials.",
    "Read the supply list at your station before the session begins. Ask a host if you need a replacement.",
    "Ask others at your table before taking their photograph. When sharing your work, include your own project notes.",
    "Return borrowed tools to the supply station before leaving so the next group can start their session.",
  ];
  return <Card bordered style={{ maxWidth: "24rem", marginInline: "auto" }}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription style={{ margin: 0 }}>{zh ? "阅读以下说明后选择是否接受。" : "Read the notes before accepting the agreement."}</CardDescription>
    </CardHeader>
    <CardContent>
      <div tabIndex={0} role="region" aria-label={title} style={{
        maxHeight: "12rem", overflowY: "auto", marginInline: "calc(-1 * var(--card-spacing))",
        padding: "var(--card-spacing)", background: "var(--surface-secondary)",
        borderTop: "var(--stroke-default) solid var(--border-default)",
      }}>
        {paragraphs.map(text => <p key={text}>{text}</p>)}
      </div>
    </CardContent>
    <CardFooter style={{
      marginInline: "calc(-1 * var(--card-spacing))", marginBottom: "calc(-1 * var(--card-spacing))",
      padding: "var(--card-spacing)",
      marginBlockStart: 0, justifyContent: "flex-end",
      backgroundColor: "var(--surface-secondary)", borderTop: "var(--stroke-default) solid var(--border-default)",
      borderRadius: "0 0 var(--radius-surface-default) var(--radius-surface-default)",
    }}>
      <span role="status">{decision === "accepted" ? (zh ? "已接受" : "Accepted") :
        decision === "declined" ? (zh ? "已拒绝" : "Declined") : ""}</span>
      <Button size="sm" variant="secondary" style={{ "--button-secondary": "var(--surface-primary)", border: "var(--stroke-default) solid var(--border-default)" } as CSSProperties} onClick={() => setDecision("declined")}>{zh ? "拒绝" : "Decline"}</Button>
      <Button size="sm" onClick={() => setDecision("accepted")}>{zh ? "接受" : "Accept"}</Button>
    </CardFooter>
  </Card>;
}
