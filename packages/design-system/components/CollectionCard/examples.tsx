import { CollectionCard, type CollectionCardProps } from "./CollectionCard";

export const anuaCollection: CollectionCardProps["item"] = {
  id: "anua",
  title: "ANUA",
  href: "/collections/anua",
  products: [
    { src: "https://cdn.yamibuy.net/item/5af44b511383dd36dda1715efe96a9b9_300x300.webp", alt: "" },
    { src: "https://cdn.yamibuy.net/item/3680d08345dd05cb177d2fe948b68dd7_300x300.webp", alt: "" },
    { src: "https://cdn.yamibuy.net/item/53c27b31bddf648653cb157eabb12387_300x300.webp", alt: "" },
    { src: "https://cdn.yamibuy.net/item/eb3e34703d2bc73800be72716e3b4dcc_300x300.webp", alt: "" },
  ],
};

export function AnuaCollectionCard() {
  return <CollectionCard item={anuaCollection} />;
}
