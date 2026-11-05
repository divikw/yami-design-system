import { HeroBanner } from "@yami/design-system/components/HeroBanner";

// The full 8:9 canvas is the campaign image, including the area behind the copy.
const artwork = "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 320 360'%3E%3Crect width='320' height='360' fill='%23ebf2ec'/%3E%3Ccircle cx='160' cy='133' r='79' fill='%2360826b'/%3E%3C/svg%3E";

export function HeroBannerExample() {
  return (
    <>
      <HeroBanner ariaLabel="Example campaigns" items={[
        { id: "pantry", title: "Pantry picks", description: "Explore everyday staples", image: { src: artwork, alt: "" }, href: "#campaign-pantry" },
        { id: "tea", title: "Tea time", description: "Explore the tea collection", image: { src: artwork, alt: "" }, href: "#campaign-tea" },
      ]} />
      <p id="campaign-pantry">Pantry campaign</p>
      <p id="campaign-tea">Tea campaign</p>
    </>
  );
}
