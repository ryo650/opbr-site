import type { CharacterGuide } from "./type";

// PRE-RELEASE: Matchup scores are predictions based on official reveals.
export const stTopmanWarcuryGuide: CharacterGuide = {
  "characterId": "the-five-elders-st-topman-warcury",
  "guideOverview": {
    "title": "St. Topman Warcury Guide",
    "description": "A Dark EX Defender who switches to Attacker when using a skill. Warcury can protect multiple Treasure Areas with a recoverable Defensive Shield and fast responses to enemy captures, then support allies with DEF-scaling skills when the team's Treasures are secure."
  },
  "quickStrengths": [
    "A Defensive Shield with maximum durability equal to 100% of his max HP, supported by several ways to recover or restore it.",
    "Strong map coverage: holding Normal Attack can move him to the closest allied Treasure Area being captured, while a separate movement effect can trigger on respawn.",
    "Can nullify 1-HP survival and HP recovery from otherwise fatal damage under different conditions, making some durable enemies easier to KO."
  ],
  "quickWeaknesses": [
    "DEF-dependent durability and skill damage are vulnerable to DEF-increase removal; DEF-ignoring attacks can bypass the defensive benefit of DEF.",
    "Conditional respawn movement sends him to the allied Treasure Area farthest away, which may not be the one that needs defending.",
    "Skill usage appears important for burst damage and immediate shield/HP recovery; ordinary Normal Attack damage may be limited."
  ],
  "strengths": [
    {
      "title": "Powerful Shield with Multiple Recovery Options",
      "mechanic": "Warcury's Defensive Shield has maximum durability equal to 100% of his max HP, but starts at just 20% of that capacity when he spawns. Using either skill restores 30% HP and 30% shield durability, and multiple other actions can restore a broken shield. While in Attacker class, each skill hit increases his DEF by 10%, up to 50%, until Warcury is KO'd.",
      "practicalUse": "Protect the shield by regularly refilling Treasure Gauges, timing skills for recovery, and selecting favorable fights. A full shield can greatly extend his survivability, but it takes recovery triggers to reach full durability."
    },
    {
      "title": "Rapid Responses Across Multiple Treasure Areas",
      "mechanic": "Holding Normal Attack during the first hit changes the second hit into a move toward the closest allied Treasure Area currently being captured, followed by an obstacle-ignoring percentage-damage attack. Separately, if an enemy is capturing an allied Treasure Area when Warcury respawns, he moves to the allied Treasure Area farthest from him and attacks. Skill 2 also provides movement while attacking.",
      "practicalUse": "React to enemy capture attempts instead of staying on just one flag. Watch where the automatic respawn movement sends you: it does not necessarily target the Treasure Area being captured."
    },
    {
      "title": "Two Conditional Ways to Bypass Survival Traits",
      "mechanic": "While his Defensive Shield has durability remaining, Warcury nullifies traits that recover HP when damage would otherwise KO an enemy. At maximum Boost, he also nullifies traits that leave an opponent at 1 HP when attacking enemies at or below 30% of their max HP.",
      "practicalUse": "Finish opponents who normally survive a fatal hit, but check the conditions first: shield durability and the target's remaining HP govern different effects."
    }
  ],
  "weaknesses": [
    {
      "title": "Heavy Reliance on DEF for Defense and Offense",
      "weakness": "Warcury has no general damage-reduction trait listed in his pre-release information. Removing his DEF increases can reduce both his practical durability and his DEF-scaling skill damage. Attacks that ignore DEF can bypass DEF-based damage mitigation without removing the DEF increase itself.",
      "howToManage": "Be cautious around enemies that remove DEF increases or ignore DEF, such as predicted counter picks. Preserve shield durability and avoid trading skills without a defensive plan."
    },
    {
      "title": "Conditional Respawn Movement Can Be Inconvenient",
      "weakness": "If an enemy is capturing an allied Treasure when Warcury respawns, he automatically moves to the furthest allied Treasure rather than choosing a destination. This can be inconvenient when a Treasure near the original spawn needs immediate defense.",
      "howToManage": "Track which Treasures are threatened before respawning and plan the next rotation after the automatic move. No move occurs through this effect if your team has no Treasure Area."
    },
    {
      "title": "Reliance on Skills for Damage and Immediate Recovery",
      "weakness": "Warcury's major attacks are DEF-scaling skills, while his Normal Attacks emphasize Knockback, cooldown cycling and defensive movement; their direct damage is not yet verified. Using a skill also restores a substantial amount of HP and shield durability immediately.",
      "howToManage": "Use his many cooldown-reduction conditions to keep skills cycling. Shield recovery is not limited to skills: Treasure Gauge refills and conditional hits or KOs can also restore it."
    }
  ],
  "normalAttacks": [
    {
      "label": "Normal Attack Combo",
      "video": "/character-guides/the-five-elders-st-topman-warcury/normal-attacks.mp4",
      "tips": [
        "The third hit inflicts Knockback. Normal Attack hits reduce Skill 1 cooldown by 5%.",
        "Direct Normal Attack damage is not yet confirmed; use the combo primarily to interrupt captures and help cycle Skill 1."
      ]
    },
    {
      "label": "Hold Normal Attack: Treasure Response",
      "video": "/character-guides/the-five-elders-st-topman-warcury/held-normal-attack.mp4",
      "tips": [
        "Holding the Normal Attack button during the first hit changes the second hit into a move toward the closest allied Treasure Area being captured, followed by an obstacle-ignoring, three-hit area attack that deals 5% of the enemy's max HP per hit.",
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
          "video": "/character-guides/the-five-elders-st-topman-warcury/skill-1.mp4",
          "quickTips": [],
          "details": []
        },
        {
          "slot": 2,
          "label": "Skill 2",
          "name": "Godhead of Justice's Onrush",
          "cooldown": 29,
          "video": "/character-guides/the-five-elders-st-topman-warcury/skill-2.mp4",
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
      "description": "Shield capacity is 100% of max HP, but starts at 20% on spawning. Skill use restores 30% HP and 30% shield durability; KOing an enemy as an Attacker restores 30% of each. As a Defender in an allied Treasure Area, each time Warcury continuously refills the Treasure Gauge by 10%, he restores 3% shield durability. Conditional respawn movement restores 10% shield durability, attacking Straw Hat Pirates restores 20%, and being hit by a skill from an enemy who can change Elements restores 5%. The listed triggers can restore the shield after it has been destroyed."
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
      "action": "Warcury spawns with only 20% of his shield's full capacity. Refill Treasure Gauges, ignoring nearby enemies while refilling up to 150%, and restore shield durability as you do. Use skills when their immediate HP and shield recovery matters."
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
        "Sabo's DEF-ignoring skills and favorable Element matchup could deal heavy damage despite Warcury's DEF increases, creating a credible KO threat.",
        "As a Runner, Sabo can create an obstacle with his counter to support Treasure captures and contest important Treasure Areas."
      ],
      "howToRespond": [
        "Against Sabo, avoid using the held Normal Attack movement and approach directly instead. Predictable skills are easy to counter, so mix up Normal Attacks: stop after the first or second hit and use the threat of the third-hit Knockback to bait Sabo's counter. Once the counter is no longer active, look for an opening to land a skill."
      ]
    },
    {
      "characterId": "future-where-i-m-the-most-free-jewelry-bonney",
      "difficulty": 3,
      "whyDifficult": [
        "Can remove Warcury's DEF increases, weakening both durability and DEF-scaling skill damage.",
        "Bonney's Runner and Attacker roles may let her challenge him both when capturing Treasures and in direct combat."
      ],
      "howToRespond": [
        "Avoid direct combat with Bonney where possible, especially when she can remove DEF increases; let a better-matched ally handle her."
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
        "Avoid unnecessary fights with Uta because her DEF increase removal weakens Warcury's defense and skill damage; leave her to a better-matched ally."
      ]
    },
    {
      "characterId": "winner-island-trafalgar-law",
      "difficulty": 3,
      "whyDifficult": [
        "Law's strong Treasure capture abilities and counter may help him evade attacks, create space, and contribute as a Runner without committing to a direct duel."
      ],
      "howToRespond": [
        "Against Law, avoid using the held Normal Attack movement and approach directly instead. Rather than throwing out a predictable skill into his counter, vary the Normal Attack combo: stop after the first or second hit and threaten the third-hit Knockback to draw out his counter. When the counter is no longer active, time a skill to punish the opening."
      ]
    },
    {
      "characterId": "animal-kingdom-pirates-lead-performer-king",
      "difficulty": 3,
      "whyDifficult": [
        "King's held movement Skill 2 deals 1.5 times damage to Attackers. Warcury changes to Attacker when he uses a skill, so taking Skill 2 in that class can deal massive damage or even KO him.",
        "The moving hits of King's Skill 2 normally Down targets, while its final hit inflicts Knockback. Warcury's Defensive Shield can absorb those hits without him being Downed, letting the moving attack hit repeatedly. This can quickly break even a fully recovered shield with capacity equal to 100% of Warcury's max HP, then expose Warcury to the skill itself.",
        "King's three-hit invincibility protection lets him force Treasure captures, often avoiding Warcury's skills or held Normal Attack movement. His high mobility further complicates defending Treasure Areas."
      ],
      "howToRespond": [
        "When King has Skill 2 ready, keep either Dodge or Warcury's invincible Skill 1 available. Dodge the held charge or time Skill 1 as he uses it; do not rely on shield durability alone to survive repeated moving hits.",
        "Against a capture protected by King's three invincibility hits, use Normal Attacks to remove those protections before trying to interrupt the capture with a skill or another attack.",
        "King's attacks other than Skill 2 are generally less threatening to Warcury. Prioritize avoiding Skill 2 and avoid spending both Dodge and the invincible skill before King uses it."
      ]
    },
    {
      "characterId": "king-of-the-pirates-gol-d-roger",
      "difficulty": 2,
      "whyDifficult": [
        "Roger can deal heavy damage to Warcury and generally has the advantage in damage trades when Roger avoids Warcury's skills.",
        "With an ATK increase active, Roger may be able to KO Warcury in a single hit."
      ],
      "howToRespond": [
        "Avoid direct fights when possible and leave Roger to an ally with a better matchup. If you must fight, look for a window when Roger's ATK is not increased."
      ]
    },
    {
      "characterId": "navy-hq-fleet-admiral-akainu",
      "difficulty": 4,
      "whyDifficult": [
        "Akainu's attacks that increase Dodge cooldown and his attacks in Mag-Mag state can let him keep Warcury under one-sided pressure. While in Mag-Mag state, he can nullify incoming damage and accompanying effects up to 3 times, making it easier for him to KO Warcury."
      ],
      "howToRespond": [
        "There may be an opening to fight when Akainu is not in Mag-Mag state and his Skill 2 (Meteor Volcano), which activates it, is on cooldown. Otherwise, generally avoid fighting him; if forced to respond, try to disengage with skills."
      ]
    },
    {
      "characterId": "ama-no-murakumo-sword-kizaru",
      "difficulty": 4,
      "whyDifficult": [
        "Kizaru's high-damage Normal Attacks can overwhelm Warcury.",
        "Kizaru can change Elements, so being hit by his skills can trigger Warcury's trait that removes the attacker's ATK increase and restores 5% HP and 5% Defensive Shield durability. This recovery does not overcome the disadvantage against Kizaru's Normal Attacks."
      ],
      "howToRespond": [
        "Generally avoid direct fights with Kizaru and focus on defending another Treasure Area when possible. Do not deliberately take his skills to trigger recovery."
      ]
    }
  ],
  "strongAgainst": [
    {
      "characterId": "the-four-emperors-monkey-d-luffy",
      "advantage": 5,
      "whyYouWin": [
        "Landing attacks on a Straw Hat Pirates character restores Warcury's HP and shield durability and increases his damage by 50%, making extended fights highly favorable."
      ],
      "watchOut": [
        "The recovery comes from Warcury landing attacks, not from simply being hit."
      ]
    },
    {
      "characterId": "the-wings-zoro-sanji",
      "advantage": 2,
      "whyYouWin": [
        "Against the Straw Hat Pirates, Warcury's traits increase his damage and restore HP and shield durability when he lands attacks, giving him some counterplay."
      ],
      "watchOut": [
        "Even with HP and shield recovery, Zoro & Sanji can still KO Warcury if they pressure him with skills and Normal Attacks while their damage is boosted. Do not rely on recovery alone to survive their attacks."
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
