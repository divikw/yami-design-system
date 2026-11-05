import { Billboard } from "@yami/design-system/components/Billboard";

function artwork(width: number, height: number) {
  return `data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23ebf2ec'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' font-family='sans-serif' font-size='28'%3EWeekly offer%3C/text%3E%3C/svg%3E`;
}

export function BillboardExample() {
  return (
    <>
      <Billboard href="#weekly-offer" label="Weekly offer" image={{
        src: artwork(960, 96), width: 960, height: 96, alt: "",
        mobile: { src: artwork(390, 88), width: 390, height: 88 },
      }} />
      <p id="weekly-offer">Weekly offer details</p>
    </>
  );
}
