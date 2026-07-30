import type { CharacterGuide } from "./type";

export const stMarcusMarsGuide: CharacterGuide = {
    characterId: "the-five-elders-st-marcus-mars",

    overview: {
        hp: 10095,
        attack: 1981,
        defense: 2418
    },

    notice: {
        title: "Pre-Release Information",
        description: "This guide is based on information available before St.Marcus Mars becomes playable. Some details, including stats, traits, skill behavior, and matchups, may change or require further testing after release."
    },

    strengths: [
        {
            title: "High Survivability",
            description: "Mars is one of the tankiest characters in the game. His DEF increases by up to 70% while attacking enemies, and his Boost Trait allows him to fully recover and revive after receiving a fatal attack by consuming the Power Gauge. He also becomes immune to status effects after reviving."
        },
        {
            title: "Strong Against Meta Characters",
            description: "Mars has traits specifically designed to counter top meta characters. He takes 50% less damage from characters such as Zoro & Sanji and Nusjuro while also reducing their ATK, making it difficult for them to defeat him."
        },
        {
            title: "Excellent Treasure Capture",
            description: "Mars captures treasure in a unique way without directly touching the flag. This allows him to ignore obstacles such as Whitebeard's walls. He can also use his skill while capturing to push enemies away, making it much easier to finish capturing the treasure."
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
            video: "/character-guides/seraphim-s-snake/normal-attack.mp4"
        }
    ],

    skills: [
        {
            name: "Don't Touch Me, You Oaf!",
            description: "S-Snake's primary close-range skill that is difficult to react to at close range. Its short cooldown can be reduced even further through her traits, allowing her to use it frequently throughout the match. Use it aggressively to pressure enemies instead of saving it for the perfect moment.",
            cooldown: 24,
            video: "/character-guides/seraphim-s-snake/skill-1.mp4",
            quickTips: [
                "Difficult to dodge at close range",
                "Short cooldown",
                "Can be used aggressively",
                "Great for defending treasure"
            ]
        },
        {
            name: "Love-Love Mellow",
            description: "Love-Love Mellow is most effective after your opponent has used their dodge, as experienced players can often react to it on sight. Its long range makes it excellent for supporting nearby teammates, while its increased damage against Runners makes it a powerful defensive tool.",
            cooldown: 31,
            video: "/character-guides/seraphim-s-snake/skill-2.mp4",
            quickTips: [
                "Wait for the enemy's dodge",
                "Long-range support",
                "Deals double damage to Runners",
                "Excellent for defending treasure"
            ]
        }
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
            reason: "S-Snake struggles heavily against Flame Emperor Sabo while his Flame Emperor state is active. His powerful normal attacks and skills can quickly KO her before she has a chance to recover. However, once the state ends, she can inflict Status Effects and even deal massive damage with Love-Love Mellow, giving her opportunities to turn the matchup around.",
            difficulty: 4,
        },
        {
            characterId: "blackbeard-pirates-kuzan",
            reason: "Kuzan is extremely difficult to fight inside the treasure area, where his damage can quickly overwhelm S-Snake. While she usually loses prolonged fights, her knockback attacks and long-hold normal attack allow her to stall for time or escape until teammates arrive.",
            difficulty: 5,
        },
        {
            characterId: "the-four-emperors-monkey-d-luffy",
            reason: "Gear5V2 can overwhelm S-Snake with his powerful normal attacks and skills. However, her three-hit invincibility and frequent knockback attacks can disrupt his offense, making the matchup much more manageable with proper timing.",
            difficulty : 2,
        }
    ],

    strongAgainst: [
        {
            characterId: "great-pirate-gol-d-roger",
            reason: "S-Snake is one of the strongest Defenders against Dark Roger V2. Her knockback attacks and high damage make it extremely difficult for him to capture treasure while she can often KO him during his attempts. Be careful of Divine Departure, however, as its 50% HP damage can be lethal when S-Snake is below half health. If possible, use your three-hit invincibility to absorb the attack safely.",
            advantage: 5
        },
        {
            characterId: "animal-kingdom-pirates-lead-performer-king",
            reason: "King can also gain three-hit invincibility, but S-Snake can usually remove it with her normal attacks before finishing him with the multi-hit Skill 1. If King retreats with his mobility skill, S-Snake can pressure him with Love-Love Mellow or quickly chase him using her long-hold normal attack.",
            advantage: 1
        }
    ]
}
