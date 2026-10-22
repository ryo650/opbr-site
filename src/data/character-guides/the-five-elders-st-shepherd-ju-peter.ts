import type { CharacterGuide } from "./type";

// PRE-RELEASE: Ratings are matchup predictions. No game-verified stats yet.
export const stShepherdJuPeterGuide: CharacterGuide = {
  "characterId": "the-five-elders-st-shepherd-ju-peter",
  "guideOverview": {
    "title": "St. Shepherd Ju Peter Guide",
    "description": "A Dark EX Runner with top-tier potential through SP Capture and favorable matchups against leading meta characters. Peter can swing treasure counts, but his results may depend heavily on matchup selection, HP management, and Power Gauge timing."
  },
  "quickStrengths": [
    "Very strong against selected top-meta characters through reactive ATK/DEF buff removal and debuffs.",
    "SP Capture and strong interruption resistance can force treasure captures and create late-match comebacks."
  ],
  "quickWeaknesses": [
    "Highly matchup-dependent: his targeted effects do not answer every opponent.",
    "Aflame, other damage-over-time effects, and Recovery Blocked can undermine his survival.",
    "Limited free movement outside SP Capture makes escaping unfavorable fights difficult.",
    "Keeping HP at 50% or above is crucial to maintaining Stagger and Down resistance."
  ],
  "strengths": [
    {
      "title": "Exceptional Matchups Against Top Meta Characters",
      "mechanic": "Peter has reactive effects against Straw Hat Pirates, Power Gauge users, and enemies who can change Elements, removing selected ATK/DEF increases and inflicting debuffs.",
      "practicalUse": "Zoro & Sanji, Nusjuro, and The Four Emperors Monkey D. Luffy are predicted to be especially favorable. Respect the opening hit before reactive effects take hold."
    },
    {
      "title": "Match-Winning Capture Pressure",
      "video": "/character-guides/the-five-elders-st-shepherd-ju-peter/sp-capture.mp4",
      "mechanic": "SP Capture repositions Peter outside a Treasure Area, destroys certain enemy-created objects, and places a temporary shield that blocks nearby attacks and movement. After the shield breaks or expires, his special capture begins. He can ignore enemies while capturing.",
      "practicalUse": "Use the threat of SP Capture to force defenders to react and control the flag count. A decisive capture late in a match can secure the third treasure needed to win."
    }
  ],
  "weaknesses": [
    {
      "title": "Highly Matchup-Dependent",
      "weakness": "His most effective debuffs and buff removal require specific enemy tags or abilities, leaving him less effective against opponents outside those conditions.",
      "howToManage": "Identify which enemy traits trigger his effects. Avoid unnecessary combat with unfavorable opponents."
    },
    {
      "title": "Vulnerable to Damage-over-Time and Recovery Blocked",
      "weakness": "His immobilizing-status immunity does not establish immunity to Aflame or every other status. Damage-over-time may KO him after a 1-HP survival trigger; Recovery Blocked can compromise his healing and HP thresholds.",
      "howToManage": "Avoid prolonged exposure to Aflame and Recovery Blocked. SP Capture removes inflicted status effects when the capture starts, but continuous immunity beyond that remains unverified."
    },
    {
      "title": "Limited Movement Outside SP Capture",
      "weakness": "SP Capture can reposition Peter, but he lacks a freely available long-distance movement skill. His other mobility gain is a temporary SPD boost after capturing.",
      "howToManage": "Track enemy positions and do not enter unfavorable fights without a safe escape route."
    },
    {
      "title": "Demanding HP Management",
      "weakness": "At below 50% HP, Peter loses HP-gated resistance to Stagger and being Downed, making capture interruptions easier. His Big Character Trait lists Knockback resistance independently of HP.",
      "howToManage": "Keep HP high through safe skill hits, Perfect Guards, treasure captures, and SP Capture attacks. Do not assume a heal is always available."
    }
  ],
  "skillGroups": [
    {
      "skills": [
        {
          "slot": 1,
          "label": "Skill 1",
          "name": "None of You Are Leaving Alive!",
      "video": "/character-guides/the-five-elders-st-shepherd-ju-peter/skill-1.mp4",
          "cooldown": 28,
          "quickTips": [],
          "details": []
        },
        {
          "slot": 2,
          "label": "Skill 2",
          "name": "Godhead of Agriculture's Raid",
      "video": "/character-guides/the-five-elders-st-shepherd-ju-peter/skill-2.mp4",
          "cooldown": 35,
          "quickTips": [],
          "details": []
        }
      ]
    }
  ],
  "traits": [
    {
      "title": "SP Capture: Activating It",
      "description": "Power Gauge holds up to 5 stocks and resets on KO. Hitting an enemy with a skill adds 2 stocks and restores 10% HP. With a full gauge, the Capture button changes to SP Capture. Pressing it moves Peter to a set distance from the center of the nearest Treasure Area, destroys nearby enemy-created objects with HP, nullifies the creators' traits, and generates a shield that blocks nearby enemy attacks and movement. After 15 seconds or damage equivalent to 100% of his maximum HP, the shield disappears and SP Capture begins."
    },
    {
      "title": "SP Capture: Capturing and Recovery",
      "description": "SP Capture can capture from outside a Treasure Area unless the elevation difference is too large. Starting SP Capture consumes 5 Power Gauge stocks and removes inflicted status effects. Capture speed increases by 25%, and an area attack pulls enemies toward the Treasure Area center. Landing SP Capture attacks restores 5% HP; finishing the capture unleashes another area attack."
    },
    {
      "title": "Reactive Buff Removal and Debuffs",
      "description": "When attacked by Straw Hat Pirates, remove their ATK increase and reduce ATK by 50% for 5 seconds. When attacked by a Power Gauge user, remove their DEF increase and reduce DEF by 50% for 5 seconds. When attacked by an enemy who can change Elements, remove their ATK increase and recover 7% HP. When attacked by Royalty / Former Royalty, reduce their ATK by 50% for 5 seconds without buff removal on that trigger alone."
    },
    {
      "title": "Perfect Guard and Capture Recovery",
      "description": "A Perfect Guard restores 30% HP, fully reduces Guard cooldown and releases a mid-range attack that inflicts Stagger. Capturing a Treasure restores 30% HP and grants 30% SPD for 10 seconds. Peter also has 30% damage reduction, can ignore enemies while capturing, and gains 50% DEF for 10 seconds when attacked during a capture (non-stacking)."
    },
    {
      "title": "HP Thresholds and Survival",
      "description": "At HP 50% or above, Peter resists Stagger and being Downed and recovers 50% of percentage damage received. At HP 30% or above, damage that would KO him leaves 1 HP (ineffective at exactly 1 HP), and his capture speed increases by 50%. The Big Character Trait separately lists resistance to Pull and Knockback, including stage effects, without an HP threshold."
    },
    {
      "title": "Other Skill and Boost Effects",
      "description": "Normal Attack hits reduce skill cooldown by 5%. When attacked by an opponent who has obtained a Defensive Shield, the maximum Boost Trait reduces Skill 2 cooldown by 10%, including when the shield is already broken. Team Boost is EX Recovery Boost."
    }
  ],
  "howToPlay": [
    {
      "title": "Keep HP Above 50%",
      "video": "/character-guides/the-five-elders-st-shepherd-ju-peter/capture-hp-50.mp4",
      "objective": "Maintain protection against interruption during captures.",
      "action": "Avoid unnecessary damage and recover through safe skill hits, Perfect Guards, treasure captures, and SP Capture attacks. Knockback resistance is also listed separately, but losing HP-gated Stagger and Down resistance is a major risk."
    },
    {
      "title": "Build the Power Gauge Safely",
      "objective": "Have SP Capture ready for meaningful treasure pressure.",
      "action": "Land skills on safe targets to build stocks while monitoring enemies who can punish Peter. Avoid spending more HP than the gauge is worth."
    },
    {
      "title": "Early to Midgame: Choose Favorable Fights",
      "objective": "Help control the treasure count while conserving resources.",
      "action": "Avoid characters Peter struggles against, pressure favorable targets with reactive debuffs and buff removal, and capture accessible flags without getting trapped."
    },
    {
      "title": "Endgame: Use SP Capture to Win",
      "objective": "Secure three or more Treasures before time expires.",
      "action": "Choose a poorly defended flag for a decisive SP Capture, accounting for the delay while its shield is active. Using SP Capture earlier is also appropriate when it secures a strategically valuable flag."
    }
  ],
  "counters": [
    {
      "characterId": "unexpected-collaboration-rob-lucci",
      "difficulty": 2,
      "whyDifficult": [
        "Can quickly reach a Treasure Area being captured and attack through obstacles, threatening SP Capture.",
        "Can bypass Peter's survive-with-1-HP trait and may KO with Skill 1 when no obstacle blocks the attack."
      ],
      "howToRespond": [
        "Track Lucci before initiating SP Capture and avoid predictable captures."
      ]
    },
    {
      "characterId": "flame-emperor-sabo",
      "difficulty": 4,
      "whyDifficult": [
        "High ATK and increased damage against favorable Elements present a serious KO threat.",
        "Aflame damage can finish Peter after 1-HP survival triggers, and Sabo's obstacle damage can counter SP Capture. Sabo can also challenge him for treasure as a Runner."
      ],
      "howToRespond": [
        "Avoid extended duels and Aflame; attack treasures Sabo cannot immediately cover."
      ]
    },
    {
      "characterId": "tontatta-pirates-captain-leo",
      "difficulty": 3,
      "whyDifficult": [
        "Leo's Sew-Sew Treasure Area can prevent captures, potentially denying SP Capture.",
        "Skill mobility lets him respond to distant pressure, and Peter's modest KO potential may be insufficient to dislodge him."
      ],
      "howToRespond": [
        "Look for Treasures not protected by Sew-Sew effects; confirm the SP Capture interaction after launch."
      ]
    },
    {
      "characterId": "king-of-the-pirates-gol-d-roger",
      "difficulty": 3,
      "whyDifficult": [
        "Roger can deal heavy damage to Peter and generally has the advantage in damage trades when Roger avoids Peter's skills.",
        "With an ATK increase active, Roger can quickly leave Peter critically low on HP, potentially triggering Peter's trait that lets him survive with 1 HP."
      ],
      "howToRespond": [
        "Avoid direct fights when possible and leave Roger to an ally with a better matchup. If you must fight, look for a window when Roger's ATK is not increased."
      ]
    },
    {
      "characterId": "legendary-hero-monkey-d-garp",
      "difficulty": 3,
      "whyDifficult": [
        "Garp can deal heavy damage to Peter and generally has the advantage in damage trades when Garp avoids Peter's skills.",
        "With an ATK increase active, Garp can quickly leave Peter critically low on HP, potentially triggering Peter's trait that lets him survive with 1 HP."
      ],
      "howToRespond": [
        "Avoid direct fights when possible and leave Garp to an ally with a better matchup. If you must fight, look for a window when Garp's ATK is not increased."
      ]
    },
    {
      "characterId": "film-red-shanks",
      "difficulty": 3,
      "whyDifficult": [
        "Shanks can deal heavy damage to Peter and generally has the advantage in damage trades when Shanks avoids Peter's skills.",
        "With an ATK increase active, Shanks can quickly leave Peter critically low on HP, potentially triggering Peter's trait that lets him survive with 1 HP.",
        "Shanks's max HP reduction is also effective against Peter; it lowers his maximum HP as a separate effect from ordinary damage to his current HP."
      ],
      "howToRespond": [
        "Avoid direct fights when possible and leave Shanks to an ally with a better matchup. If you must fight, look for a window when Shanks's ATK is not increased."
      ]
    },
    {
      "characterId": "ama-no-murakumo-sword-kizaru",
      "difficulty": 4,
      "whyDifficult": [
        "Kizaru's skills can damage Peter effectively, and his high mobility makes it difficult for Peter to escape. Peter's limited KO potential can leave him at a one-sided disadvantage."
      ],
      "howToRespond": [
        "Try to Perfect Guard Kizaru's skills whenever possible, and carefully choose when to activate SP Capture and which Treasure to target."
      ]
    },
    {
      "characterId": "navy-hq-fleet-admiral-akainu",
      "difficulty": 4,
      "whyDifficult": [
        "Akainu's enhanced Normal Attacks in Mag-Mag state and the heavy damage over time from Incinerate can overwhelm Peter."
      ],
      "howToRespond": [
        "Avoid direct fights with Akainu. Target a different Treasure Area instead of contesting one he is defending."
      ]
    }
  ],
  "strongAgainst": [
    {
      "characterId": "the-wings-zoro-sanji",
      "advantage": 5,
      "whyYouWin": [
        "Reactive debuffs and ATK increase removal make the matchup extremely favorable after the first hit."
      ],
      "watchOut": [
        "Beware the initial un-debuffed attack."
      ]
    },
    {
      "characterId": "the-five-elders-st-ethanbaron-v-nusjuro",
      "advantage": 5,
      "whyYouWin": [
        "Power Gauge user traits allow Peter to remove DEF increases and inflict a 50% DEF debuff."
      ],
      "watchOut": [
        "Respect the first un-debuffed skill hit."
      ]
    },
    {
      "characterId": "the-four-emperors-monkey-d-luffy",
      "advantage": 5,
      "whyYouWin": [
        "When Luffy attacks Peter, his Straw Hat Pirates tag triggers ATK increase removal and a 50% ATK reduction for 5 seconds, making this a favorable matchup."
      ],
      "watchOut": [
        "Be careful with the first hit before the reactive effect."
      ]
    },
    {
      "characterId": "future-where-i-m-the-most-free-jewelry-bonney",
      "advantage": 2,
      "whyYouWin": [
        "Peter can reduce Bonney's ATK through his Royalty / Former Royalty trait, but Bonney can remove that ATK reduction by using a skill, limiting Peter's advantage."
      ],
      "watchOut": [
        "Watch for Bonney's skills, which can clear the ATK reduction. Her Normal Attacks can also deal substantial damage when her attack power is boosted.",
        "Avoid prolonged damage trades; use hit-and-run attacks to pressure Bonney without exposing Peter to repeated hits."
      ]
    }
  ]
};
