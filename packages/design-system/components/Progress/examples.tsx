"use client";

import { useState } from "react";
import { Progress, ProgressLabel, ProgressValue, Slider } from "@yami/design-system";

export function TransferProgress({ en = false }: { en?: boolean }) {
  const [value, setValue] = useState(50);
  return <div style={{ display: "grid", gap: "var(--space-200)", width: "min(100%, 22rem)", marginInline: "auto" }}>
    <Progress value={value} locale={en ? "en-US" : "zh-CN"}>
      <ProgressLabel>{en ? "Upload progress" : "上传进度"}</ProgressLabel>
      <ProgressValue />
    </Progress>
    <Slider aria-label={en ? "Adjust upload progress" : "调整上传进度"} value={value} onValueChange={setValue} />
  </div>;
}
