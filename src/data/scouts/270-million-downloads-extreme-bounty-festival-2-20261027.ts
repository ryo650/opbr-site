// Source: screenshots IMG_5418–IMG_5423 supplied 2026-10-15.
// This is a Step 1 NORMAL-DRAW approximation of the 5-step Scout.
// The existing simulator does not track step advancement, eight cycles,
// step rewards, or any step-specific guarantees.
// All 5 steps shown cost 30 rainbow diamonds for 11 characters.
// The game does not show a single-pull option here; the single (5 RD)
// remains a compatibility-only control in the existing simulator UI.
// Official start date not shown; first observed date is used provisionally.
// Source Step 1: 4★ 7%, 3★ 35%, 2★ 58%. 10 featured characters:
// Akainu 0.2% and 9 others 0.7555555% each (screen precision).
import type { ScoutBanner, ScoutPickup } from "./type";

const pickups = [
    { characterId: "navy-hq-fleet-admiral-akainu", rate: 0.2 },
    { characterId: "shogun-of-wano-kozuki-momonosuke", rate: 0.7555555 },
    { characterId: "former-happosui-army-12th-chief-chin-jao", rate: 0.7555555 },
    { characterId: "stealth-black-soba-mask", rate: 0.7555555 },
    { characterId: "animal-kingdom-pirates-lead-performer-queen", rate: 0.7555555 },
    { characterId: "navy-hq-admiral-fujitora", rate: 0.7555555 },
    { characterId: "animal-kingdom-pirates-supreme-commander-kaido", rate: 0.7555555 },
    { characterId: "beautiful-pirates-captain-cavendish", rate: 0.7555555 },
    { characterId: "barto-club-captain-bartolomeo", rate: 0.7555555 },
    { characterId: "2-years-later-combatant-roronoa-zoro", rate: 0.7555555 },
] satisfies readonly ScoutPickup[];

export const scout270MillionDownloadsExtremeBountyFestival220261027: ScoutBanner = {
    id: "270-million-downloads-extreme-bounty-festival-2-20261027",
    name: "5-Step [270 Million Downloads Celebration] Extreme Bounty Festival #2",
    bannerImg: "/scouts/270-million-downloads-extreme-bounty-festival-2-20261027.svg",
    startAt: "2026-10-15T00:00:00+09:00",
    endAt: "2026-10-27T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 }, // compatibility only: not an official option
        multi: { pullCount: 11, diamondCost: 30 }, // source: all displayed steps
    },
    pickups,
    featuredCharacterId: "navy-hq-fleet-admiral-akainu",
    rates: {
        pickup: 7, // ★4 category total; individual rates truncated to seven decimals
        "star-3": 35,
        "star-2": 58,
    },
};
