export const MAX_LEVEL_PREVIEW_TEMPLATE_ID = "max-level-preview-v1";

const referenceSize = { width: 2532, height: 1170 };

function relativeRegion(x, y, width, height) {
  return {
    x: x / referenceSize.width,
    y: y / referenceSize.height,
    width: width / referenceSize.width,
    height: height / referenceSize.height,
  };
}

// Coordinates were measured from IMG_4816.PNG. Regions intentionally cover
// only the identity and four requested Stats fields, never the full screen.
export const maxLevelPreviewTemplate = {
  id: MAX_LEVEL_PREVIEW_TEMPLATE_ID,
  referenceSize,
  ocrScale: 2,
  regions: {
    characterName: relativeRegion(180, 950, 700, 180),
    level: relativeRegion(1390, 190, 460, 70),
    hp: relativeRegion(1390, 300, 470, 55),
    atk: relativeRegion(1390, 355, 470, 55),
    def: relativeRegion(1390, 410, 470, 50),
  },
};

export function resolveRelativeCrop(region, imageSize) {
  const x = Math.round(region.x * imageSize.width);
  const y = Math.round(region.y * imageSize.height);
  const right = Math.round((region.x + region.width) * imageSize.width);
  const bottom = Math.round((region.y + region.height) * imageSize.height);
  return { x, y, width: right - x, height: bottom - y };
}

export function resolveTemplateCrops(template, imageSize) {
  return Object.fromEntries(
    Object.entries(template.regions).map(([field, region]) => [
      field,
      resolveRelativeCrop(region, imageSize),
    ]),
  );
}
