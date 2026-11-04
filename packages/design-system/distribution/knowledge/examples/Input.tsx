"use client";

import { useState } from "react";
import { Input } from "@yami/design-system/components/Input";

export function InputExample() {
  const [query, setQuery] = useState("");
  return (
    <Input label="Example search" value={query} onChange={(event) => setQuery(event.target.value)}
      clearable onClear={() => setQuery("")} helperText="Search state belongs to the host application." fullWidth />
  );
}
