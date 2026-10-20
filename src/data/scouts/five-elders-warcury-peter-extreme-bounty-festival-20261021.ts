// Pre-release dual-EX scout announced on 2026-10-20.
// The 0.1% featured rates for each Five Elder are user-supplied.
// Remaining category rates, single/multi costs, and November 30 end date
// are provisional simulator placeholders—not verified official values.
// No step-up rules or guarantees are simulated.
import type { ScoutBanner, ScoutPickup } from "./type";

const pickups = [
  { characterId: "the-five-elders-st-topman-warcury", rate: 0.1 },
  { characterId: "the-five-elders-st-shepherd-ju-peter", rate: 0.1 },
] satisfies readonly ScoutPickup[];

export const scoutFiveEldersWarcuryPeter20261021: ScoutBanner = {
  id: "five-elders-warcury-peter-extreme-bounty-festival-20261021",
  name: "Five Elders: Warcury & Peter Extreme Bounty Festival",
  bannerImg: "/scouts/five-elders-warcury-peter-extreme-bounty-festival-20261021.webp",
  startAt: "2026-10-21T14:00:00+09:00",
  endAt: "2026-11-30T13:59:59+09:00",
  pullOptions: {
    single: { pullCount: 1, diamondCost: 5 },
    multi: { pullCount: 11, diamondCost: 50 },
  },
  pickups,
  featuredCharacterId: "the-five-elders-st-topman-warcury",
  rates: {
    pickup: 0.2,
    bf: 2.9,
    "star-4": 3.9,
    "star-3": 35,
    "star-2": 58,
  },
  provisionalNotice: "Pre-release approximation: Warcury and Peter are each 0.1%. Other pull rates and character pools, 5/50-diamond costs, and the November 30 end date are unverified placeholders, not official scout details. Guarantees are not simulated.",
};
