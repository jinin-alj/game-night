import { readFileSync, writeFileSync } from "node:fs";

const artFolder = new URL("../public/art/", import.meta.url);
const panoramaRoot =
  'id="panorama" viewBox="0 0 2400 900" width="2400" height="900"';

// Each crop shows part of the same drawing through its own viewBox: x y width height.
const crops = [
  { name: "zone-1", viewBox: "0 160 660 660" },
  { name: "zone-2", viewBox: "640 260 620 620" },
  { name: "zone-3", viewBox: "1200 260 620 620" },
  { name: "zone-4", viewBox: "1860 60 540 540" },
  { name: "horizon-strip", viewBox: "0 470 2400 180" },
];

const panorama = readFileSync(new URL("panorama.svg", artFolder), "utf8");
if (!panorama.includes(panoramaRoot)) {
  throw new Error(`panorama.svg must start with <svg ... ${panoramaRoot} ...>`);
}

for (const crop of crops) {
  const sizes = crop.viewBox.split(" ");
  const width = sizes[2];
  const height = sizes[3];
  const cropRoot = `id="${crop.name}" viewBox="${crop.viewBox}" width="${width}" height="${height}"`;

  writeFileSync(
    new URL(`${crop.name}.svg`, artFolder),
    panorama.replace(panoramaRoot, cropRoot),
  );
  console.log(`Wrote public/art/${crop.name}.svg (viewBox ${crop.viewBox})`);
}
