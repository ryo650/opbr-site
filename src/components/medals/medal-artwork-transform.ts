type MedalArtworkTransform = {
  translateX: number;
  translateY: number;
  scale: number;
};

const defaultTransform: MedalArtworkTransform = { translateX: 3, translateY: 4, scale: 1.1 };

// These imports have different framing from the older catalog images.
const eggheadTransform: MedalArtworkTransform = { translateX: 1, translateY: 0, scale: 1.05 };
const transformsByMedalId: Record<string, MedalArtworkTransform> = {
  "st-topman-warcury": eggheadTransform,
  "st-shepherd-ju-peter": eggheadTransform,
  "kizaru-egghead": eggheadTransform,
  "luffy-dawn-rocket": eggheadTransform,
  kumacy: { translateX: 2, translateY: 2, scale: 1.08 },
};

export function getMedalArtworkTransform(medalId: string): MedalArtworkTransform {
  return transformsByMedalId[medalId] ?? defaultTransform;
}
