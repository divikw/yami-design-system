import path from "node:path";

export function distributionOutput(root) {
  return path.resolve(root, process.env.YAMI_DISTRIBUTION_OUTPUT_DIR || "dist");
}
