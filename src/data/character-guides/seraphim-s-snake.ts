import type { CharacterGuide } from "./type";

export const sSnakeGuide: CharacterGuide = {
    characterId: "seraphim-s-snake",

    overview: {
        hp: 9662,
        attack: 2042,
        defense: 2447
    },

    quickStrengths: [
        "Exceptional mobility between allied treasure areas",
        "Excellent at stopping Runners from capturing treasure",
        "Three-hit invincibility provides strong survivability",
        "Removes important enemy Attack and Defense increases",
    ],

    quickWeaknesses: [
        "Held normal attack has a predictable landing point",
        "Relies heavily on Skill 1 for survivability",
        "Much easier to defeat outside allied treasure areas",
    ],

    strengths: [
        {
            title: "Exceptional Map Control",
            description: "S-Snake has one of the best repositioning tools among Defenders. By holding her normal attack, she can instantly travel to the farthest allied treasure area, allowing her to stop back-caps, reinforce teammates, or temporarily disengage from unfavorable fights. Her ability to quickly rotate across the map gives her exceptional control over the pace of the match."
        },
        {
            title: "Dominant Treasure Defense",
            description: "S-Snake excels at protecting treasure areas. Her third normal attack and both of her skills can knock enemies away from the treasure, making it difficult for Runners to capture flags. Since her skills deal increased damage to Runners, she can often secure a KO while defending. She can also remove enemy Defense increases after landing an attack, making defensive Runners such as St. Marcus Mars much easier to deal with."
        },
        {
            title: "Reliable Survivability",
            description: "Landing Skill 1 grants S-Snake a three-hit invincibility effect, allowing her to completely ignore up to three incoming attacks. This lets her save her dodge for critical moments and survive powerful burst skills from characters like Zoro & Sanji or G5V2(Luffy)."
        },
        {
            title: "Shuts Down Buff-Dependent Characters",
            description: "S-Snake can remove an enemy's Attack increase after being hit by one of their skills, preventing Attack-stacking characters from reaching their full potential. This makes her particularly effective against opponents who rely on Attack buffs throughout the match."
        }
    ],

    weaknesses: [
        {
            title: "Predictable Repositioning",
            description: "S-Snake's long-hold normal attack gives her exceptional mobility, but it also creates a predictable landing point. Experienced opponents can time their skills or normal attacks to catch her immediately after she arrives, making careless rotations a significant risk. Only reposition when you are confident the destination is safe or the reward outweighs the risk."
        },
        {
            title: "Relies on Skill 1 for Survival",
            description: "Much of S-Snake's survivability comes from the three-hit invincibility granted by Skill 1. Without it, she relies mainly on healing and a 30% damage reduction while standing in her treasure area, making her much easier to eliminate with burst damage. Using Skill 1 at the wrong time can leave her exposed during crucial fights."
        },
        {
            title: "Vulnerable Outside Treasure Areas",
            description: "S-Snake performs best while defending treasure areas, where she gains additional survivability. Outside of those zones, she loses a large part of her defensive potential and becomes much easier to pressure or eliminate. Avoid taking extended fights away from your treasure whenever possible."
        }
    ],

    normalAttacks: [
        {
            label: "folding",
            video: "/character-guides/seraphim-s-snake/normal-attack.mp4",
            tips: []
        }
    ],

    skillGroups: [
        {
            skills: [
                {
                    slot: 1,
                    label: "Skill 1",
                    name: "Don't Touch Me, You Oaf!",
                    cooldown: 24,
                    video:
                        "/character-guides/seraphim-s-snake/skill-1.mp4",
                    quickTips: [
                        "Difficult to dodge at close range",
                        "Grants three-hit invincibility",
                        "Short cooldown",
                        "Use it aggressively",
                        "Excellent for defending treasure",
                    ],
                    details: [
                        "This is S-Snake's primary close-range skill.",
                        "Its cooldown can be reduced further through her traits, allowing her to use it frequently throughout the match.",
                        "Avoid saving it for the perfect moment, as using it regularly helps maintain pressure and survivability.",
                    ],
                },
                {
                    slot: 2,
                    label: "Skill 2",
                    name: "Love-Love Mellow",
                    cooldown: 31,
                    video:
                        "/character-guides/seraphim-s-snake/skill-2.mp4",
                    quickTips: [
                        "Use it after the enemy dodges",
                        "Effective at long range",
                        "Can support teammates from a distance",
                        "Deals double damage to Runners",
                        "Excellent for defending treasure",
                    ],
                    details: [
                        "Experienced players can often dodge this skill on reaction, so it is most reliable after the opponent has used their dodge.",
                        "Its long range allows S-Snake to support nearby teammates without leaving her treasure area.",
                        "The increased damage against Runners makes it especially effective against enemies attempting to capture treasure.",
                    ],
                },
            ],
        },
    ],

    howToPlay: [
        {
            title: "Prioritize Treasure Defense",
            description: "Your primary role is to protect your team's treasure areas. After your teammates capture a flag, rotate over whenever possible and build up the treasure gauge before enemies arrive."
        },
        {
            title: "Rotate with Purpose",
            description: "S-Snake's long-hold normal attack always targets the farthest allied treasure area. Learn the map layouts so you can reliably reach the treasure you intend to defend instead of repositioning at random."
        },
        {
            title: "Stay One Step Ahead",
            description: "Always watch the minimap for enemies that can quickly reach your treasure, such as Hybrid Kaido or Gear 5 (V2). Position yourself early to defend the flag, or stall the enemy until your teammates arrive."
        }
    ],

    counters: [
        {
            characterId: "flame-emperor-sabo",
            difficulty: 4,
            whyDifficult: [
                "While Flame Emperor state is active, Sabo's high-damage normal attacks and skills can quickly KO S-Snake.",
            ],
            howToRespond: [
                "Once Flame Emperor state ends, S-Snake can inflict Status Effects and fight much more comfortably.",
                "Love-Love Mellow can deal heavy damage after the state expires.",
                "Avoid fighting Sabo aggressively while Flame Emperor state is active.",
            ],
        },
        {
            characterId: "blackbeard-pirates-kuzan",
            difficulty: 5,
            whyDifficult: [
                "S-Snake usually cannot defeat Kuzan inside the treasure area.",
                "Kuzan's skills can deal extremely high damage and quickly overwhelm her.",
            ],
            howToRespond: [
                "Use knockback attacks to prevent Kuzan from maintaining pressure and buy time.",
                "Use the held normal attack to escape to another allied treasure area when the fight becomes unfavorable.",
                "Focus on stalling until teammates arrive rather than trying to win a prolonged fight.",
            ],
        },
        {
            characterId: "the-four-emperors-monkey-d-luffy",
            difficulty: 2,
            whyDifficult: [
                "Gear 5 (V2) can KO S-Snake with his powerful normal attacks and skills.",
            ],
            howToRespond: [
                "Maintain three-hit invincibility to make it difficult for him to finish his offense.",
                "Use the third hit of S-Snake's normal attack to knock him back and disrupt his pressure.",
                "The matchup is manageable if Skill 1 and knockback attacks are timed carefully.",
            ],
        },
    ],

    strongAgainst: [
        {
            characterId: "great-pirate-gol-d-roger",
            advantage: 5,
            whyYouWin: [
                "S-Snake's knockback attacks make it extremely difficult for Dark Roger V2 to capture treasure.",
                "Her normal attacks and skills can often KO him while he is attempting to capture.",
                "Inside the treasure area, S-Snake can usually control the matchup without giving up the flag.",
            ],
            watchOut: [
                "Divine Departure deals 50% HP damage.",
                "Be especially careful when S-Snake is below 50% HP, as the attack can become lethal.",
                "Use three-hit invincibility to absorb Divine Departure safely whenever possible.",
            ],
        },
        {
            characterId: "animal-kingdom-pirates-lead-performer-king",
            advantage: 1,
            whyYouWin: [
                "S-Snake can remove King's three-hit invincibility with her normal attacks.",
                "After King uses his dodge, Skill 1's multi-hit attack can quickly finish him.",
                "If King escapes with his mobility skill, S-Snake can chase him with her held normal attack.",
            ],
            watchOut: [
                "Do not waste Skill 1 while King's three-hit invincibility is still active.",
                "If King creates distance, use Love-Love Mellow only when he no longer has invincibility.",
            ],
        },
    ],
}
