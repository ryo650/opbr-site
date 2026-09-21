import type { CharacterGuide } from "./type";

export const stMarcusMarsGuide: CharacterGuide = {
    characterId: "the-five-elders-st-marcus-mars",

    notice: {
        title: "Guide in Progress",
        description:
            "This guide contains an early overview and is being expanded with attacks, skills, gameplay advice, and matchups.",
    },

    // Overview: ページ冒頭の要約。日本語の大雑把なメモから入力しても構いません。
    guideOverview: {
        title: "St. Marcus Mars Guide",
        description:
            "Learn the fundamentals of St. Marcus Mars, including his durability, remote treasure capture, strengths, and weaknesses.",
    },

    overview: {
        hp: 10095,
        attack: 1981,
        defense: 2418,
    },

    quickStrengths: [
        "High durability with up to 70% increased DEF",
        "Can revive by consuming the Power Gauge",
        "Strong against several top meta characters",
        "Can capture treasure without directly touching the flag",
    ],

    quickWeaknesses: [
        "No built-in treasure capture speed increase",
        "Limited access to the revive mechanic early in the match",
    ],

    strengths: [
        {
            title: "High Survivability",
            mechanic:
                "Mars can increase his DEF by up to 70% while attacking enemies, and his Boost Trait allows him to fully recover and revive after receiving a fatal attack by consuming the Power Gauge.",
            practicalUse:
                "Build DEF through safe attacks, then use the extra durability and revive as insurance while contesting important treasure areas.",
        },
        {
            title: "Strong Against Meta Characters",
            mechanic:
                "Mars has traits designed to counter several top meta characters. He takes 50% less damage from characters such as Zoro & Sanji and Nusjuro while also reducing their ATK.",
            practicalUse:
                "Look for these favorable matchups when choosing which treasure area to pressure, but avoid assuming the damage reduction makes every exchange safe.",
        },
        {
            title: "Excellent Treasure Capture",
            mechanic:
                "Mars can capture treasure without directly touching the flag, allowing him to bypass obstacles such as Whitebeard's walls. He can also use a skill while capturing to push enemies away.",
            practicalUse:
                "Start captures from safer positions and use the available skill to create space when an enemy tries to interrupt.",
        },
    ],

    weaknesses: [
        {
            title: "Slow Treasure Capture",
            weakness:
                "Mars does not have a trait that directly increases treasure capture speed, so exposed captures can take too long.",
            howToManage:
                "Use medal sets or support tags that improve capture speed, and begin captures only after creating enough space.",
        },
        {
            title: "Limited Power Gauge at the Start",
            weakness:
                "Unlike Nusjuro or Saturn, Mars does not begin the match with two Power Gauge stocks. This limits access to his revive mechanic early in the battle.",
            howToManage:
                "Play more carefully at the start of the match and avoid treating the revive as available until the required gauge is ready.",
        },
    ],

    // Normal Attacks: label / form / video（任意）/ tips を入力してください。
    normalAttacks: [],

    // Skill 1 / Skill 2: slot / label / name / cooldown / video / quickTips / details を入力してください。
    skillGroups: [],

    // How to Play: { title, objective: "目的", action: "具体的な行動" }
    howToPlay: [],

    // Counters: { characterId, difficulty: 1〜5, whyDifficult, howToRespond }
    counters: [],

    // Strong Against: { characterId, advantage: 1〜5, whyYouWin, watchOut }
    strongAgainst: [],
};
