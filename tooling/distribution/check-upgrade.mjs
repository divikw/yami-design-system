import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionOutput } from "./output.mjs";
import { verifyUpgrade } from "./upgrade.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const dist = distributionOutput(root);
const result = await verifyUpgrade(root, dist);
console.log(`Upgrade ${result.from} -> ${result.to}: version policy passed. Runtime changed: ${result.runtimeChanged}. See ${path.join(dist, "candidate-upgrade.json")}.`);
