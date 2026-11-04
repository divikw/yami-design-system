import { fileURLToPath } from "node:url";
import { verifyUpgrade } from "./upgrade.mjs";

const result = await verifyUpgrade(fileURLToPath(new URL("../../", import.meta.url)));
console.log(`Upgrade ${result.from} -> ${result.to}: version policy passed. Runtime changed: ${result.runtimeChanged}. See dist/candidate-upgrade.json.`);
