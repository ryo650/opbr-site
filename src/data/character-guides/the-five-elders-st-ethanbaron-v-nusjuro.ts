import type { CharacterGuide } from "./type";

export const stEthanbaronVNusjuroGuide: CharacterGuide = {
  characterId: "the-five-elders-st-ethanbaron-v-nusjuro",
  guideOverview: {
    title: "St. Ethanbaron V. Nusjuro Guide",
    description: "Nusjuro is a mobile Defender whose game plan is to hold three Treasure Areas. Fill Treasure Gauges to 150% to build his Power Gauge, land skills to increase DEF, then use that DEF for both durability and damage. Rotate quickly to cover teammates and protect treasure rather than chasing KOs away from the objective."
  },
  // Lv.100 Boost Max: verified base stats + canonical Boost Max values.
  overview: {
    hp: 9920,
    attack: 1873,
    defense: 2569
  },
  quickStrengths: [
    "Excellent mobility for rotating between Treasure Areas and covering teammates.",
    "Very high survivability with a Defensive Shield and a developed Power Gauge.",
    "High KO potential as DEF increases during battle.",
    "Can fill Treasure Gauges to 150%, even with enemies inside the Treasure Area."
  ],
  quickWeaknesses: [
    "Limited Knockback options for stopping certain Runners from capturing.",
    "Normal Attacks before the movement change are weak in direct combat.",
    "Much of his survivability depends on maintaining the Power Gauge."
  ],
  strengths: [
    {
      title: "Excellent Mobility and Map Coverage",
      mechanic: "After moving continuously for a period of time, Nusjuro's movement and Normal Attack change. The changed movement and Skill 2 give him excellent mobility.",
      practicalUse: "Rotate between distant Treasure Areas, cover teammates, and leave unfavorable fights. Use his speed to defend multiple areas; mobility alone does not make his treasure captures faster."
    },
    {
      title: "Very High Survivability",
      mechanic: "With at least one Power Gauge stock, Nusjuro resists Stagger and nullifies enemy status effects. With at least two stocks, he can consume two to recover 100% HP after taking damage that would KO him. His Defensive Shield provides additional protection.",
      practicalUse: "Build and track the Power Gauge before committing to a fight. Restore the shield with Skill 1 and use Skill 2's invincibility to avoid dangerous attacks or escape."
    },
    {
      title: "High KO Potential",
      mechanic: "His skills and changed Normal Attack deal damage based on DEF. Landing skills increases DEF, strengthening both his durability and damage output. Both skills deal increased damage to Runners, and the changed Normal Attack ignores enemy DEF.",
      practicalUse: "Build DEF through well-timed skill hits and look for KOs that help defend treasure. Avoid chasing an enemy if it leaves an important Treasure Area exposed."
    },
    {
      title: "Strong Treasure Defense",
      mechanic: "Nusjuro can fill a Treasure Gauge to 150% and continue filling it while an enemy is inside the Treasure Area. Filling a Treasure Gauge to 150% adds one Power Gauge stock.",
      practicalUse: "Strengthen your team's defenses while building your own survivability. Look for opportunities to finish filling a Treasure Gauge before rotating to the next threatened area."
    }
  ],
  weaknesses: [
    {
      title: "Limited Knockback Options",
      weakness: "Skill 1 provides Knockback, but Nusjuro has few ways to force certain Runners off a capture when it is unavailable. Mars and Dark Roger can be particularly difficult to stop.",
      howToManage: "Save Skill 1 when a Runner is about to threaten your treasure. If you cannot interrupt the capture or secure a KO, let a better-suited teammate handle the matchup."
    },
    {
      title: "Weak Standard Normal Attacks in Direct Combat",
      weakness: "Before the movement change, his Normal Attacks deal low damage, can be difficult to land consistently, and lack strong secondary effects such as Freeze or Knockback.",
      howToManage: "Use the changed Normal Attack for direct combat when possible. The standard attack still has valuable utility: its quick sequence removes King's three-hit protection, and its first hit can bait counters."
    },
    {
      title: "Power Gauge Dependency",
      weakness: "Losing Power Gauge stocks removes access to key defensive traits. A KO resets the gauge, so Nusjuro must rebuild it after returning to battle.",
      howToManage: "Track your remaining stocks, especially after using the full-HP recovery. Rebuild through treasure defense and safe KO opportunities instead of assuming the recovery is always available."
    }
  ],
  normalAttacks: [
    {
      label: "Before the Movement Change",
      tips: [
        "Low damage and limited secondary effects make this a weak option for sustained direct combat.",
        "Its quick sequence is one of Nusjuro's fastest options for removing King's three-hit protection when Skill 2 is unavailable.",
        "Against a counter user, tap Normal Attack once to use only the first hit and bait a counter. That first hit is usually too quick to counter on sight; skills and the changed Normal Attack are easier to anticipate or react to.",
        "Wait for the baited counter to finish before committing to your main attack."
      ]
    },
    {
      label: "After the Movement Change",
      video: "/character-guides/the-five-elders-st-ethanbaron-v-nusjuro/changed-normal-attack.mp4",
      tips: [
        "Moving continuously for a period of time changes Nusjuro's movement and Normal Attack.",
        "The changed Normal Attack deals damage based on DEF and ignores enemy DEF.",
        "It has a 50% chance to inflict Freeze for 6 seconds and is his main Normal Attack for direct combat.",
        "It can also help cover ground while rotating between Treasure Areas."
      ]
    }
  ],
  skillGroups: [
    {
      skills: [
        {
          slot: 1,
          label: "Skill 1",
          name: "Godhead of Finance's Flash",
          cooldown: 27,
          video: "/character-guides/the-five-elders-st-ethanbaron-v-nusjuro/skill-1.mp4",
          quickTips: [
            "A long-range area attack that ignores obstacles and inflicts Knockback.",
            "Deals damage based on DEF, with 100% increased damage to Runners.",
            "Reduces enemy ATK by 30% for 10 seconds.",
            "Restores 50% of Defensive Shield durability, even if the shield has already been broken."
          ],
          details: [
            "Use it to remove enemies from a Treasure Area, attack through obstacles, and restore your shield.",
            "Aim after an enemy dodge or invincible skill ends. Its fast activation can still be dodged or countered, so choose a clear opening.",
            "Its range can let you surprise an enemy who is fighting a teammate.",
            "Avoid wasting this skill when a Runner may soon attempt to capture: it is your main Knockback option."
          ]
        },
        {
          slot: 2,
          label: "Skill 2",
          name: "Foolish!!",
          cooldown: 30,
          video: "/character-guides/the-five-elders-st-ethanbaron-v-nusjuro/skill-2.mp4",
          quickTips: [
            "Nusjuro becomes invincible on activation and stays invincible throughout the held movement.",
            "Release the Skill button, or reach the maximum hold duration, to perform a long-range multi-hit area attack.",
            "The attack deals damage based on DEF, inflicts Freeze, and deals 50% increased damage to Runners.",
            "Reduces enemy ATK by 30% for 10 seconds."
          ],
          details: [
            "Hold the skill to avoid dangerous attacks, escape unfavorable matchups, move to another Treasure Area, or wait out enemy buffs.",
            "The invincibility continues while you hold and move; it is not limited to the moment of activation.",
            "The multi-hit attack helps remove hit-based invincibility, including King's three-hit protection.",
            "Consider keeping it available when you may need an invincible escape or a quick rotation to defend another treasure."
          ]
        }
      ]
    }
  ],
  traits: [
    {
      title: "Defensive Shield",
      description: "On spawning, Nusjuro gains a Defensive Shield with durability equal to 20% of his Max HP. While it is active, damage reduces shield durability instead of HP. Skill 1 restores 50% of shield durability and can restore a broken shield."
    },
    {
      title: "Build the Power Gauge",
      description: "The Power Gauge holds up to five stocks. KO an enemy or fill a Treasure Gauge to 150% to gain one stock. His Boost Trait grants two stocks on spawning. The gauge resets when he is KO'd."
    },
    {
      title: "Power Gauge Defensive Effects",
      description: "With at least one stock, Nusjuro resists Stagger and nullifies status effects inflicted by enemies. With at least two stocks, taking damage that would KO him consumes two stocks and recovers 100% HP. Track the remaining stocks after each recovery."
    },
    {
      title: "Power Gauge Damage Bonus",
      description: "With at least two Power Gauge stocks, damage dealt to Straw Hat Pirates increases by 50%. Maintaining the gauge supports both survivability and pressure against those opponents."
    },
    {
      title: "Build DEF with Skill Hits",
      description: "Attacking an enemy with a skill increases DEF by 25%, up to 70%. This increase resets when Nusjuro is KO'd. His skills and changed Normal Attack use DEF for damage, so landing skills improves both durability and offensive power."
    },
    {
      title: "Treasure Gauge at 150%",
      description: "Nusjuro can fill a Treasure Gauge to 50% above its normal maximum, reaching 150%, even when enemies are inside the Treasure Area. Reaching 150% grants one Power Gauge stock, directly rewarding treasure defense."
    }
  ],
  howToPlay: [
    {
      title: "Opening: Fast C Treasure Arrival with Skill 2",
      objective: "Reach the center C Treasure quickly when your team needs an opening contest.",
      action: "Use Skill 2 at the start and hold it while moving toward C Treasure, as shown in the clip. Choose this opening when contesting the center helps your team; filling friendly Treasure Gauges to 150% remains an alternative.",
      video: "/character-guides/the-five-elders-st-ethanbaron-v-nusjuro/opening-fast-c-treasure.mp4"
    },
    {
      title: "Build the Power Gauge Early",
      objective: "Establish survivability while strengthening your team's Treasure Gauges.",
      action: "Fill friendly Treasure Gauges to 150% whenever the situation allows. You do not always need to rush the center treasure. If your team secures it, choose between staying for a safe KO opportunity and returning to fill another gauge."
    },
    {
      title: "When Your Team Holds Two or Fewer Treasures",
      objective: "Protect the treasure you have while creating an opportunity to secure a third.",
      action: "Cover threatened friendly Treasure Areas first, then use your mobility to support a third capture or take an open treasure when safe. Avoid leaving your existing defenses exposed during the rotation."
    },
    {
      title: "Maintain Three Treasure Areas",
      objective: "Keep three Treasure Areas stable as your main win condition.",
      action: "Watch where enemies are heading and rotate to cover the threatened treasure. Fill gauges, land skills to build DEF, and take KOs that support defense. Pursue a fourth or fifth treasure only when the three you need are secure."
    },
    {
      title: "Choose Your Fights",
      objective: "Contribute to defense without getting trapped in an unfavorable matchup.",
      action: "Use Skill 2 to disengage, defend another Treasure Area, and let a better-suited teammate handle the opponent. Save Skill 1 for important capture interruptions, and check your Power Gauge and shield before committing."
    }
  ],
  counters: [
    {
      characterId: "the-five-elders-st-marcus-mars",
      difficulty: 5,
      whyDifficult: [
        "Mars is difficult to KO, and Nusjuro's limited Knockback options make it hard to stop him from taking treasure."
      ],
      howToRespond: [
        "Let a teammate with a better matchup handle Mars. Use your mobility to defend another threatened Treasure Area."
      ]
    },
    {
      characterId: "the-wings-zoro-sanji",
      difficulty: 4,
      whyDifficult: [
        "A direct fight against Zoro & Sanji is highly unfavorable."
      ],
      howToRespond: [
        "Avoid a prolonged fight. Disrupt them only when needed, then use your mobility to disengage and cover another treasure."
      ]
    },
    {
      characterId: "red-rock-monkey-d-luffy",
      difficulty: 3,
      whyDifficult: [
        "He is difficult to stop while his movement speed buff is active. His percentage-damage attacks and guaranteed-KO skill are also dangerous."
      ],
      howToRespond: [
        "Survive the 20-second movement speed buff, then look for a KO after it expires.",
        "Use dodge or Skill 2's invincibility to avoid dangerous attacks while waiting."
      ]
    },
    {
      characterId: "the-four-emperors-monkey-d-luffy",
      difficulty: 3,
      whyDifficult: [
        "His treasure captures in Big Character form are hard to interrupt. Just Guard recovery and rotations to another treasure also make him difficult to contain."
      ],
      howToRespond: [
        "Look for a skill KO opportunity while he is holding his attack in Big Character form. Avoid committing into Just Guard."
      ]
    },
    {
      characterId: "great-pirate-gol-d-roger",
      difficulty: 3,
      whyDifficult: [
        "Dark Roger is difficult to interrupt during a treasure capture without Knockback."
      ],
      howToRespond: [
        "Save Skill 1 for the capture. Outside the Treasure Area, use Freeze and look for a KO; leave the matchup to a teammate if you cannot stop him reliably."
      ]
    },
    {
      characterId: "animal-kingdom-pirates-lead-performer-king",
      difficulty: 3,
      whyDifficult: [
        "King's flames indicate protection that nullifies three hits. He can use that protection to absorb attacks while capturing, and his skill mobility makes him difficult to keep in place.",
        "His multi-hit percentage-damage skill also inflicts Knockback. It can push Nusjuro away even with a shield active and create a capture opportunity. Landing that skill is also one way King gains his three-hit protection."
      ],
      howToRespond: [
        "Remove the three-hit protection first with Skill 2's multi-hit attack. When Skill 2 is unavailable, the standard Normal Attack before the movement change is one of your quickest options.",
        "Prioritize dodging or using invincibility against King's Knockback skill on a Treasure Area. Do not rely on the shield to hold your position."
      ]
    }
  ],
  strongAgainst: [
    {
      characterId: "winner-island-trafalgar-law",
      advantage: 3,
      whyYouWin: [
        "Landing a skill provides a strong KO opportunity. Outside the Treasure Area, status effects can also help control Law."
      ],
      watchOut: [
        "Watch for his counter, Amputate, and escapes or position swaps with Shambles."
      ]
    },
    {
      characterId: "future-where-i-m-the-most-free-jewelry-bonney",
      advantage: 1,
      whyYouWin: [
        "Nusjuro can deal effective damage and inflict status effects. Seven Warlords of the Sea support can help extend Freeze."
      ],
      watchOut: [
        "Bonney can nullify Nusjuro's revival when she KOs him. Be especially careful at low HP with no shield; do not rely on the Power Gauge recovery to survive her finishing hit."
      ]
    },
    {
      characterId: "flame-emperor-sabo",
      advantage: 4,
      whyYouWin: [
        "Sabo does not nullify Nusjuro's revival, and landing a skill creates a strong KO opportunity.",
        "After his counter ends, Skill 1 can reach him through obstacles. Nusjuro's mobility also helps catch him after an escape."
      ],
      watchOut: [
        "Bait or wait out the counter before committing a skill."
      ]
    }
  ]
};
