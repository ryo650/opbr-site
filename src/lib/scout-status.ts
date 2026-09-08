import type { ScoutBanner } from "@/data/scouts/type";

export function getScoutStatus(scout: Pick<ScoutBanner, "startAt" | "endAt">, now: number) {
  if (now < Date.parse(scout.startAt)) return "upcoming";
  if (now <= Date.parse(scout.endAt)) return "current";
  return "past";
}
