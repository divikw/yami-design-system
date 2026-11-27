import { connection } from "next/server";
import { PrototypePlayer } from "../ui/prototype-player";

export default async function PrototypePage() {
  await connection();
  return <PrototypePlayer />;
}
