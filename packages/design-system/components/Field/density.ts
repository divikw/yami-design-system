"use client";

import { createContext } from "react";

export type FieldDensity = "default" | "compact";
export const FieldDensityContext = createContext<FieldDensity | undefined>(undefined);
