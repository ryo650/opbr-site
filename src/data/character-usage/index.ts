import { characterUsage20260802 } from "./snapshots/2026-08-02";

export const characterUsageSnapshots = [
  characterUsage20260802,
].sort(
  (a, b) =>
    new Date(b.date).getTime() -
    new Date(a.date).getTime(),
);

export const latestCharacterUsage =
  characterUsageSnapshots[0];

export const previousCharacterUsage =
  characterUsageSnapshots[1] ?? null;

export * from "./type";
export * from "./helpers";
