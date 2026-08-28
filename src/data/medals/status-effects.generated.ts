// Generated from scripts/medal-importer/status-effects.json. Do not edit.
export const STATUS_EFFECT_IDS = [
  "clawed",
  "capture-block",
  "aflame",
  "tremor",
  "stun",
  "poison",
  "confuse",
  "shock",
  "freeze",
  "entrance",
  "negative",
  "bind",
  "stolen-heart",
  "shadowless",
  "recovery-blocked",
] as const;

export type StatusEffectType = (typeof STATUS_EFFECT_IDS)[number];
