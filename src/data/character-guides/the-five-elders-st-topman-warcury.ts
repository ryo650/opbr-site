import type { CharacterGuide } from "./type";

// PRE-RELEASE: Matchup scores are predictions based on official reveals.
export const stTopmanWarcuryGuide: CharacterGuide = {
  "characterId": "the-five-elders-st-topman-warcury",
  "notice": {
    "title": "Pre-Release Guide",
    "description": "Based on official pre-release information and predicted matchups. Ratings and gameplay advice have not yet been verified in live matches and will be reviewed after the October 21, 2026 release."
  },
  "guideOverview": {
    "title": "St. Topman Warcury Guide (Pre-Release)",
    "description": "A Dark EX Defender who can become an Attacker when using skills. Warcury looks built to defend multiple Treasure Areas through repeatable shields and rapid responses to captures, then support teammates with DEF-based skills when defense is secure."
  },
  "quickStrengths": [
    "A Defensive Shield with a maximum durability equal to 100% max HP, supported by many recovery and restoration triggers.",
    "Strong map coverage: a held Normal Attack can respond to nearby allied Treasures under capture, with a separate conditional respawn movement effect.",
    "Can bypass 1-HP survival and KO-triggered HP recovery under different conditions, making it easier to finish some durable opponents."
  ],
  "quickWeaknesses": [
    "DEF-dependent durability and skill damage are vulnerable to DEF-increase removal; DEF-ignoring attacks can bypass the defensive benefit of DEF.",
    "Conditional respawn movement goes to the furthest allied Treasure, which may be the wrong location for the immediate defensive need.",
    "Skill usage appears important for burst damage and immediate shield/HP recovery; ordinary Normal Attack damage may be limited."
  ],
  "strengths": [
    {
      "title": "Powerful, Repeatably Restored Defensive Shield",
      "mechanic": "Warcury's Defensive Shield can hold durability equivalent to 100% of his max HP, although it starts at only 20% durability upon spawning. Using either skill restores 30% HP and 30% shield durability, and multiple other actions can restore a broken shield. Skill hits in Attacker class also build DEF by 10% per hit, up to 50% (reset upon KO).",
      "practicalUse": "Protect the shield by regularly refilling Treasure Gauges, timing skills for recovery, and selecting favorable fights. A full shield can greatly extend survivability, but it must first be built up."
    },
    {
      "title": "Rapid Responses Across Multiple Treasure Areas",
      "mechanic": "Holding Normal Attack during the first hit changes the second hit into a move toward the closest allied Treasure Area currently being captured, followed by an obstacle-ignoring percentage-damage attack. If an enemy is capturing an allied Treasure while Warcury respawns, he instead moves to the furthest allied Treasure and attacks. Skill 2 can also be used while moving.",
      "practicalUse": "React to enemy capture attempts instead of staying on just one flag. Watch where the automatic respawn movement sends you: it does not necessarily target the Treasure being stolen."
    },
    {
      "title": "Two Conditional Ways to Bypass Survival Traits",
      "mechanic": "While his Defensive Shield has durability remaining, Warcury nullifies traits that recover HP when damage would otherwise KO an enemy. His maximum Boost Trait also nullifies the effect that leaves an opponent at 1 HP when he attacks an enemy at 30% max HP or below.",
      "practicalUse": "Finish opponents who normally survive a fatal hit, but check the conditions first: shield durability and the target's remaining HP govern different effects."
    }
  ],
  "weaknesses": [
    {
      "title": "Heavy Reliance on DEF for Defense and Offense",
      "weakness": "Warcury has no listed general damage-reduction trait. Removing his DEF increases can reduce both his practical durability and his DEF-scaling skill damage. Skills that ignore DEF are also threatening to his DEF-based protection, even though they do not remove the buff itself.",
      "howToManage": "Be cautious around enemies that remove DEF increases or ignore DEF, such as predicted counter picks. Preserve shield durability and avoid trading skills without a defensive plan."
    },
    {
      "title": "Conditional Respawn Movement Can Be Inconvenient",
      "weakness": "If an enemy is capturing an allied Treasure when Warcury respawns, he automatically moves to the furthest allied Treasure rather than choosing a destination. This can be inconvenient when a Treasure near the original spawn needs immediate defense.",
      "howToManage": "Track which Treasures are threatened before respawning and plan the next rotation after the automatic move. No move occurs through this effect if your team has no Treasure Area."
    },
    {
      "title": "Reliance on Skills for Damage and Immediate Recovery",
      "weakness": "Warcury's major attacks are DEF-scaling skills, while his Normal Attacks emphasize Knockback, cooldown cycling and defensive movement; their direct damage is not yet verified. Skill usage also grants a large immediate HP and shield recovery.",
      "howToManage": "Use his many cooldown-reduction conditions to keep skills cycling. Shield recovery is not limited to skills: Treasure Gauge refills and conditional hits or KOs can also restore it."
    }
  ],
  "normalAttacks": [
    {
      "label": "Normal Attack Combo",
      "tips": [
        "The third hit inflicts Knockback. Normal Attack hits reduce Skill 1 cooldown by 5%.",
        "Direct Normal Attack damage is not yet confirmed; use the combo primarily to interrupt captures and help cycle Skill 1."
      ]
    },
    {
      "label": "Hold Normal Attack: Treasure Response",
      "tips": [
        "Holding the Normal Attack button during the first hit changes the second hit into a move toward the closest allied Treasure Area under capture, followed by an obstacle-ignoring, three-hit area attack dealing 5% of enemy max HP per hit.",
        "This movement does not occur if none of your team's Treasure Areas is being captured."
      ]
    }
  ],
  "skillGroups": [
    {
      "skills": [
        {
          "slot": 1,
          "label": "Skill 1",
          "name": "I Will Chop You Up!",
          "cooldown": 27,
          "quickTips": [],
          "details": []
        },
        {
          "slot": 2,
          "label": "Skill 2",
          "name": "Godhead of Justice's Onrush",
          "cooldown": 29,
          "quickTips": [],
          "details": []
        }
      ]
    }
  ],
  "traits": [
    {
      "title": "Skill Cooldown Reduction and Cycling",
      "description": "When an enemy begins capturing an allied Treasure, Skill 1 cooldown decreases by 30%. Normal Attack hits reduce Skill 1 cooldown by 5%. In Defender class, attacking a capturing enemy reduces Skill 1 cooldown by 10% and increases that enemy's Guard cooldown by 50%; recovering a Treasure Gauge to 150% reduces Skill 2 cooldown by 50%. In Attacker class near an enemy Treasure Area, skill cooldown reduction speed increases by 100%; KOing an enemy reduces Skill 1 cooldown by 30%. The speed boost is different from an instant cooldown reduction."
    },
    {
      "title": "Shield Recovery and Restoration",
      "description": "Shield capacity is 100% of max HP, but starts at 20% on spawning. Skill use restores 30% HP and 30% shield durability; KOing an enemy as an Attacker restores 30% of each. As a Defender in your team's Treasure Area, each continuous 10% of Treasure Gauge recovery restores 3% shield durability. Conditional respawn movement restores 10% shield durability, attacking Straw Hat Pirates restores 20%, and being hit by a skill from an enemy who can change Elements restores 5%. The listed triggers can restore the shield after it has been destroyed."
    },
    {
      "title": "Defender / Attacker Class Switching",
      "description": "Using a skill changes Warcury's class to Attacker, restoring 30% HP and shield durability. Beginning to refill your team's Treasure Gauge changes him back to Defender, except during a short period after using a skill. As Defender, he can ignore enemies while refilling the gauge up to 150%. While his shield remains, Treasure Gauge recovery amount increases by 100%."
    },
    {
      "title": "DEF-Scaling Skills and Shield-Dependent Damage",
      "description": "Skill 1 ('I Will Chop You Up!', 27 seconds) deals long-range DEF-based damage that disregards damage reduction; while the shield has durability remaining, it adds fixed damage based on the shield's remaining durability. The skill gives temporary invincibility and cannot be used in certain locations with obstacles overhead. Skill 2 ('Godhead of Justice's Onrush', 29 seconds) can be held to move and attack while charging through two stages; releasing it creates a DEF-based, damage-reduction-ignoring Knockback attack whose range changes with charge level."
    },
    {
      "title": "Normal Attack Movement and Respawn Movement",
      "description": "Holding Normal Attack during the first hit changes the second hit into a move toward the closest allied Treasure that is currently being captured, then an obstacle-ignoring multi-hit percentage-damage attack (5% max HP per hit, up to three hits). Separately, if an enemy is capturing an allied Treasure when Warcury respawns, he moves to the furthest allied Treasure, attacks with four obstacle-ignoring percentage-damage hits (15% max HP per hit) and restores 10% shield durability. The respawn effect does not move him if no allied Treasure remains."
    },
    {
      "title": "Two Different Survival-Nullification Conditions",
      "description": "While his Defensive Shield has durability remaining, attacks nullify the enemy trait that recovers HP when receiving otherwise fatal damage. Separately, the maximum Boost Trait nullifies the trait '1 HP will be left even if KO'd' when Warcury attacks an enemy whose remaining HP is 30% of their maximum HP or less. Neither effect is always active."
    },
    {
      "title": "Status Resistance and Conditional Matchup Effects",
      "description": "At 30% HP or above, Warcury resists Stagger and nullifies status effects inflicted by enemies. Against Straw Hat Pirates, his attacks deal 50% more damage and restore 5% HP and 20% shield durability. When hit by a skill from an enemy able to change Elements, he removes that enemy's ATK increase and restores 5% HP and 5% shield durability. Skill hits while in Attacker class increase DEF by 10% up to 50%, resetting when KO'd."
    }
  ],
  "howToPlay": [
    {
      "title": "Prioritize Treasure Defense and Shield Upkeep",
      "objective": "Make the shield last and keep allied Treasure Gauges full.",
      "action": "Warcury spawns with only 20% of his shield's full capacity. Refill Treasure Gauges, using enemy-ignore refill and the 150% maximum to build defense while restoring shield durability. Use skills when their immediate HP and shield recovery matters."
    },
    {
      "title": "Rotate Quickly to Threatened Treasures",
      "objective": "Protect several Treasure Areas instead of a single flag.",
      "action": "Watch for enemy captures and use held Normal Attack to respond to a nearby allied Treasure under capture. Interrupt captures with Knockback and skills. On respawn, remember the furthest-Treasure movement can trigger when an enemy is capturing an allied flag, even when that destination is inconvenient."
    },
    {
      "title": "Switch to Attacker When Defense Is Secure",
      "objective": "Support teammates and keep skills cycling without abandoning important Treasures.",
      "action": "Use skills to change into Attacker, pressure opponents with DEF-based attacks, and exploit accelerated cooldowns near enemy Treasures. Return to Defender by refilling an allied Treasure Gauge after the post-skill restriction expires. Manage shield durability and skill availability before committing to fights."
    }
  ],
  "counters": [
    {
      "characterId": "flame-emperor-sabo",
      "difficulty": 4,
      "whyDifficult": [
        "DEF-ignoring skills and favorable Element matchup could deal heavy damage through Warcury's DEF-dependent defense, creating a realistic KO threat.",
        "As a Runner, Sabo can use a counter-created obstacle to contest captures and threaten important Treasure Areas."
      ],
      "howToRespond": [
        "Avoid relying on DEF stacks alone; note that Warcury has attacks that ignore obstacles."
      ]
    },
    {
      "characterId": "future-where-i-m-the-most-free-jewelry-bonney",
      "difficulty": 3,
      "whyDifficult": [
        "Can remove Warcury's DEF increases, weakening both durability and DEF-scaling skill damage.",
        "Runner and Attacker options may let Bonney respond to him in both capture pressure and direct combat."
      ],
      "howToRespond": [
        "Watch for buff removal, and avoid overextending when a Treasure Area needs defending."
      ]
    },
    {
      "characterId": "happy-halloween-uta",
      "difficulty": 3,
      "whyDifficult": [
        "Can remove DEF increases, undermining his defense and skill damage.",
        "Obstacle placement can support treasure capture and defense against Warcury."
      ],
      "howToRespond": [
        "Use Warcury's obstacle-ignoring attacks where appropriate; the obstacle does not guarantee safety."
      ]
    },
    {
      "characterId": "winner-island-trafalgar-law",
      "difficulty": 3,
      "whyDifficult": [
        "Strong capture capabilities and a counter may let Law evade attacks, create space, and contribute as a Runner without a direct duel."
      ],
      "howToRespond": [
        "Punish predictable captures, but respect Law's counter. Law may be vulnerable if his 1-HP survival is nullified at 30% HP or below."
      ]
    }
  ],
  "strongAgainst": [
    {
      "characterId": "the-four-emperors-monkey-d-luffy",
      "advantage": 5,
      "whyYouWin": [
        "Attacking a Straw Hat Pirates opponent restores Warcury's HP and shield durability while increasing damage dealt by 50%, making extended duels very favorable."
      ],
      "watchOut": [
        "The recovery comes from Warcury landing attacks, not from simply being hit."
      ]
    },
    {
      "characterId": "the-wings-zoro-sanji",
      "advantage": 5,
      "whyYouWin": [
        "The Straw Hat Pirates damage boost and HP/shield recovery can let Warcury outlast their attacks and punish close-range exchanges."
      ],
      "watchOut": [
        "Do not assume the shield is full at spawn; keep it restored."
      ]
    },
    {
      "characterId": "great-pirate-gol-d-roger",
      "advantage": 5,
      "whyYouWin": [
        "Warcury's high defensive mobility helps him follow Roger's treasure pressure. DEF-scaling skills ignore damage reduction, and the Normal Attack combo can inflict Knockback to interrupt captures."
      ],
      "watchOut": [
        "Skill timing and shield management still matter against Roger's mobility."
      ]
    },
    {
      "characterId": "daimyo-of-kuri-kozuki-oden",
      "advantage": 5,
      "whyYouWin": [
        "When Oden is at 30% HP or below, Warcury's maximum Boost Trait nullifies the 1-HP survival effect, making a KO much easier."
      ],
      "watchOut": [
        "The survival bypass depends on the enemy HP threshold and the maximum Boost Trait."
      ]
    },
    {
      "characterId": "kaido-s-son-yamato",
      "advantage": 5,
      "whyYouWin": [
        "Warcury can nullify Yamato's 1-HP survival once her remaining HP falls to 30% or less, removing a major defense against being KO'd."
      ],
      "watchOut": [
        "Keep track of the enemy HP requirement."
      ]
    },
    {
      "characterId": "red-rock-monkey-d-luffy",
      "advantage": 5,
      "whyYouWin": [
        "With shield durability remaining, Warcury nullifies HP recovery from otherwise fatal damage. His mobility can pursue Luffy, while the Straw Hat Pirates bonus strengthens damage and recovery."
      ],
      "watchOut": [
        "The KO-triggered HP recovery bypass is inactive if the shield has no durability."
      ]
    },
    {
      "characterId": "battle-of-monsters-on-onigashima-kaido",
      "advantage": 5,
      "whyYouWin": [
        "While the shield remains, Warcury can bypass HP recovery on a would-be KO and use his mobility to follow Kaido's treasure rotations."
      ],
      "watchOut": [
        "Keep some shield durability to preserve this survival-bypass effect."
      ]
    }
  ]
};
