"use client";

import { useEffect, useState } from "react";
import { Progress } from "@yami/design-system";

export function ProgressDemo({ en = false }: { en?: boolean }) {
  const [value, setValue] = useState(15);
  useEffect(() => {
    const timer = setTimeout(() => setValue(65), 600);
    return () => clearTimeout(timer);
  }, []);
  return <Progress value={value} aria-label={en ? "Upload progress" : "上传进度"} />;
}
