import { characterUsage20260802 } from "./snapshots/2026-08-02";
import { characterUsage20260819 } from "./snapshots/2026-08-19";
import { characterUsage20260826 } from "./snapshots/2026-08-26";

export const characterUsageSnapshots = [
  characterUsage20260802,
  characterUsage20260819,
  characterUsage20260826
].sort(
  (a, b) =>
    new Date(a.date).getTime() -
    new Date(b.date).getTime(),
);

export const latestCharacterUsage =
  characterUsageSnapshots.at(-1);

export const previousCharacterUsage =
  characterUsageSnapshots.at(-2) ?? null;

export * from "./type";
export * from "./helpers";
