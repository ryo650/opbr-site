# The Five Elders St. Ethanbaron V. Nusjuro — Publication Draft

- Status: English publication copy implemented locally; not pushed or published.
- Updated: 2026-10-02
- Source: [Character Guide調整確認](chatgpt-conversation://6abee0fe-5ad8-83ee-8f30-cc588fd40820), incorporating the approved gameplay notes.
- Production data: `src/data/character-guides/the-five-elders-st-ethanbaron-v-nusjuro.ts`.
- Terminology and structure follow the existing Mars / Bonney guides. Strong Points use the existing `strengths` field and Strengths heading.
- Power Gauge and DEF growth are separate: treasure filling / KOs build the gauge; skill hits build DEF.
- The movement-change delay is intentionally left unspecified because the remembered value was not confirmed. Overview stats are verified below; the four supplied videos are implemented using the existing Character Guide player.
- Traits below explain the approved core mechanics; they are not a complete transcription of every in-game trait.

## Character Master Verification

The authoritative Record keys and each entry's `id` match. Route slugs use these exact IDs.

| Character Master name | ID / route slug | Element | Role | Source |
| --- | --- | --- | --- | --- |
| The-Five-Elders-St-Ethanbaron-V-Nusjuro | `the-five-elders-st-ethanbaron-v-nusjuro` | red | defender | `src/data/characters/red.ts` |
| The Five Elders St.Marcus Mars | `the-five-elders-st-marcus-mars` | blue | runner | `src/data/characters/blue.ts` |
| The-Wings-Zoro-Sanji | `the-wings-zoro-sanji` | blue | attacker | `src/data/characters/blue.ts` |
| Red-Rock-Monkey-D-Luffy | `red-rock-monkey-d-luffy` | black | runner | `src/data/characters/black.ts` |
| The-Four-Emperors-Monkey-D.Luffy | `the-four-emperors-monkey-d-luffy` | white | runner | `src/data/characters/white.ts` |
| Great-Pirate-Gol-D-Roger | `great-pirate-gol-d-roger` | black | runner | `src/data/characters/black.ts` |
| Animal-Kingdom-Pirates-Lead-Performer-King | `animal-kingdom-pirates-lead-performer-king` | red | runner | `src/data/characters/red.ts` |
| Winner-Island-Trafalgar-Law | `winner-island-trafalgar-law` | red | runner | `src/data/characters/red.ts` |
| Future Where I'm the Most Free Jewelry Bonney | `future-where-i-m-the-most-free-jewelry-bonney` | green | attacker | `src/data/characters/green.ts` |
| Flame-Emperor-Sabo | `flame-emperor-sabo` | green | runner | `src/data/characters/green.ts` |

King is **Animal Kingdom Pirates / Lead Performer King**, the red Runner, ID `animal-kingdom-pirates-lead-performer-king`.

## Guide Overview

Nusjuro is a mobile Defender whose game plan is to hold three Treasure Areas. Fill Treasure Gauges to 150% to build his Power Gauge, land skills to increase DEF, then use that DEF for both durability and damage. Rotate quickly to cover teammates and protect treasure rather than chasing KOs away from the objective.

## Overview Stats

Lv.100, Boost Max, following the existing Mars / Bonney guides. Values are derived from the verified `src/data/characters/level-100-base-stats.ts` entry plus the canonical Boost Max profile in `src/data/characters/boost-profiles.ts`.

| Stat | Verified Base | Boost Max | Guide Display |
| --- | ---: | ---: | ---: |
| HP | 7,340 | 2,580 | 9,920 |
| ATK | 1,233 | 640 | 1,873 |
| DEF | 1,929 | 640 | 2,569 |

The production `overview` uses numeric `hp`, `attack`, `defense` fields in that order. The existing page automatically adds the Overview Stats section and table-of-contents link.

## Video Assets

The four supplied MOV recordings are converted to silent H.264 MP4 with fast-start metadata and stored under `public/character-guides/the-five-elders-st-ethanbaron-v-nusjuro/`. The shared `CharacterGuideVideo` player preserves muted inline autoplay, looping, `preload="none"`, and pause / resume based on visibility.

| Supplied recording | Asset filename | Placement |
| --- | --- | --- |
| `ScreenRecording_08-31-2026 10.MOV` | `skill-1.mp4` | Skill 1 |
| `ScreenRecording_08-31-2026 9.MOV` | `skill-2.mp4` | Skill 2 |
| `ScreenRecording_08-31-2026 8.MOV` | `opening-fast-c-treasure.mp4` | How to Play / Opening: Fast C Treasure Arrival with Skill 2 |
| `ScreenRecording_08-31-2026 07-08-33_1.MOV` | `changed-normal-attack.mp4` | Normal Attacks / After the Movement Change |

The standard Normal Attack remains text-only because no recording was supplied for it. How to Play uses an optional `video` field and the existing structured-point renderer.

## Quick Strengths

- Excellent mobility for rotating between Treasure Areas and covering teammates.
- Very high survivability with a Defensive Shield and a developed Power Gauge.
- High KO potential as DEF increases during battle.
- Can fill Treasure Gauges to 150%, even with enemies inside the Treasure Area.

## Quick Weaknesses

- Limited Knockback options for stopping certain Runners from capturing.
- Normal Attacks before the movement change are weak in direct combat.
- Much of his survivability depends on maintaining the Power Gauge.

## Strong Points

### Excellent Mobility and Map Coverage

**What Makes It Strong:** After moving continuously for a period of time, Nusjuro's movement and Normal Attack change. The changed movement and Skill 2 give him excellent mobility.

**Practical Use:** Rotate between distant Treasure Areas, cover teammates, and leave unfavorable fights. Use his speed to defend multiple areas; mobility alone does not make his treasure captures faster.

### Very High Survivability

**What Makes It Strong:** With at least one Power Gauge stock, Nusjuro resists Stagger and nullifies enemy status effects. With at least two stocks, he can consume two to recover 100% HP after taking damage that would KO him. His Defensive Shield provides additional protection.

**Practical Use:** Build and track the Power Gauge before committing to a fight. Restore the shield with Skill 1 and use Skill 2's invincibility to avoid dangerous attacks or escape.

### High KO Potential

**What Makes It Strong:** His skills and changed Normal Attack deal damage based on DEF. Landing skills increases DEF, strengthening both his durability and damage output. Both skills deal increased damage to Runners, and the changed Normal Attack ignores enemy DEF.

**Practical Use:** Build DEF through well-timed skill hits and look for KOs that help defend treasure. Avoid chasing an enemy if it leaves an important Treasure Area exposed.

### Strong Treasure Defense

**What Makes It Strong:** Nusjuro can fill a Treasure Gauge to 150% and continue filling it while an enemy is inside the Treasure Area. Filling a Treasure Gauge to 150% adds one Power Gauge stock.

**Practical Use:** Strengthen your team's defenses while building your own survivability. Look for opportunities to finish filling a Treasure Gauge before rotating to the next threatened area.

## Weaknesses

### Limited Knockback Options

**Weakness:** Skill 1 provides Knockback, but Nusjuro has few ways to force certain Runners off a capture when it is unavailable. Mars and Dark Roger can be particularly difficult to stop.

**How to Manage:** Save Skill 1 when a Runner is about to threaten your treasure. If you cannot interrupt the capture or secure a KO, let a better-suited teammate handle the matchup.

### Weak Standard Normal Attacks in Direct Combat

**Weakness:** Before the movement change, his Normal Attacks deal low damage, can be difficult to land consistently, and lack strong secondary effects such as Freeze or Knockback.

**How to Manage:** Use the changed Normal Attack for direct combat when possible. The standard attack still has valuable utility: its quick sequence removes King's three-hit protection, and its first hit can bait counters.

### Power Gauge Dependency

**Weakness:** Losing Power Gauge stocks removes access to key defensive traits. A KO resets the gauge, so Nusjuro must rebuild it after returning to battle.

**How to Manage:** Track your remaining stocks, especially after using the full-HP recovery. Rebuild through treasure defense and safe KO opportunities instead of assuming the recovery is always available.

## Normal Attacks

### Before the Movement Change

- Low damage and limited secondary effects make this a weak option for sustained direct combat.
- Its quick sequence is one of Nusjuro's fastest options for removing King's three-hit protection when Skill 2 is unavailable.
- Against a counter user, tap Normal Attack once to use only the first hit and bait a counter. That first hit is usually too quick to counter on sight; skills and the changed Normal Attack are easier to anticipate or react to.
- Wait for the baited counter to finish before committing to your main attack.

### After the Movement Change

- Moving continuously for a period of time changes Nusjuro's movement and Normal Attack.
- The changed Normal Attack deals damage based on DEF and ignores enemy DEF.
- It has a 50% chance to inflict Freeze for 6 seconds and is his main Normal Attack for direct combat.
- It can also help cover ground while rotating between Treasure Areas.

## Skills

### Skill 1 — Godhead of Finance's Flash

Cooldown: 27 seconds.

**Quick Tips**

- A long-range area attack that ignores obstacles and inflicts Knockback.
- Deals damage based on DEF, with 100% increased damage to Runners.
- Reduces enemy ATK by 30% for 10 seconds.
- Restores 50% of Defensive Shield durability, even if the shield has already been broken.

**Details**

- Use it to remove enemies from a Treasure Area, attack through obstacles, and restore your shield.
- Aim after an enemy dodge or invincible skill ends. Its fast activation can still be dodged or countered, so choose a clear opening.
- Its range can let you surprise an enemy who is fighting a teammate.
- Avoid wasting this skill when a Runner may soon attempt to capture: it is your main Knockback option.

### Skill 2 — Foolish!!

Cooldown: 30 seconds.

**Quick Tips**

- Nusjuro becomes invincible on activation and stays invincible throughout the held movement.
- Release the Skill button, or reach the maximum hold duration, to perform a long-range multi-hit area attack.
- The attack deals damage based on DEF, inflicts Freeze, and deals 50% increased damage to Runners.
- Reduces enemy ATK by 30% for 10 seconds.

**Details**

- Hold the skill to avoid dangerous attacks, escape unfavorable matchups, move to another Treasure Area, or wait out enemy buffs.
- The invincibility continues while you hold and move; it is not limited to the moment of activation.
- The multi-hit attack helps remove hit-based invincibility, including King's three-hit protection.
- Consider keeping it available when you may need an invincible escape or a quick rotation to defend another treasure.

## Traits

### Defensive Shield

On spawning, Nusjuro gains a Defensive Shield with durability equal to 20% of his Max HP. While it is active, damage reduces shield durability instead of HP. Skill 1 restores 50% of shield durability and can restore a broken shield.

### Build the Power Gauge

The Power Gauge holds up to five stocks. KO an enemy or fill a Treasure Gauge to 150% to gain one stock. His Boost Trait grants two stocks on spawning. The gauge resets when he is KO'd.

### Power Gauge Defensive Effects

With at least one stock, Nusjuro resists Stagger and nullifies status effects inflicted by enemies. With at least two stocks, taking damage that would KO him consumes two stocks and recovers 100% HP. Track the remaining stocks after each recovery.

### Power Gauge Damage Bonus

With at least two Power Gauge stocks, damage dealt to Straw Hat Pirates increases by 50%. Maintaining the gauge supports both survivability and pressure against those opponents.

### Build DEF with Skill Hits

Attacking an enemy with a skill increases DEF by 25%, up to 70%. This increase resets when Nusjuro is KO'd. His skills and changed Normal Attack use DEF for damage, so landing skills improves both durability and offensive power.

### Treasure Gauge at 150%

Nusjuro can fill a Treasure Gauge to 50% above its normal maximum, reaching 150%, even when enemies are inside the Treasure Area. Reaching 150% grants one Power Gauge stock, directly rewarding treasure defense.

## How to Play

### Opening: Fast C Treasure Arrival with Skill 2

**Objective:** Reach the center C Treasure quickly when your team needs an opening contest.

**Action:** Use Skill 2 at the start and hold it while moving toward C Treasure, as shown in the clip. Choose this opening when contesting the center helps your team; filling friendly Treasure Gauges to 150% remains an alternative.

### Build the Power Gauge Early

**Objective:** Establish survivability while strengthening your team's Treasure Gauges.

**Action:** Fill friendly Treasure Gauges to 150% whenever the situation allows. You do not always need to rush the center treasure. If your team secures it, choose between staying for a safe KO opportunity and returning to fill another gauge.

### When Your Team Holds Two or Fewer Treasures

**Objective:** Protect the treasure you have while creating an opportunity to secure a third.

**Action:** Cover threatened friendly Treasure Areas first, then use your mobility to support a third capture or take an open treasure when safe. Avoid leaving your existing defenses exposed during the rotation.

### Maintain Three Treasure Areas

**Objective:** Keep three Treasure Areas stable as your main win condition.

**Action:** Watch where enemies are heading and rotate to cover the threatened treasure. Fill gauges, land skills to build DEF, and take KOs that support defense. Pursue a fourth or fifth treasure only when the three you need are secure.

### Choose Your Fights

**Objective:** Contribute to defense without getting trapped in an unfavorable matchup.

**Action:** Use Skill 2 to disengage, defend another Treasure Area, and let a better-suited teammate handle the opponent. Save Skill 1 for important capture interruptions, and check your Power Gauge and shield before committing.

## Counters

### The Five Elders St.Marcus Mars

- characterId: `the-five-elders-st-marcus-mars`
- difficulty: 5 / 5

**Why It Is Difficult**

- Mars is difficult to KO, and Nusjuro's limited Knockback options make it hard to stop him from taking treasure.

**How to Respond**

- Let a teammate with a better matchup handle Mars. Use your mobility to defend another threatened Treasure Area.

### The-Wings-Zoro-Sanji

- characterId: `the-wings-zoro-sanji`
- difficulty: 4 / 5

**Why It Is Difficult**

- A direct fight against Zoro & Sanji is highly unfavorable.

**How to Respond**

- Avoid a prolonged fight. Disrupt them only when needed, then use your mobility to disengage and cover another treasure.

### Red-Rock-Monkey-D-Luffy

- characterId: `red-rock-monkey-d-luffy`
- difficulty: 3 / 5

**Why It Is Difficult**

- He is difficult to stop while his movement speed buff is active. His percentage-damage attacks and guaranteed-KO skill are also dangerous.

**How to Respond**

- Survive the 20-second movement speed buff, then look for a KO after it expires.
- Use dodge or Skill 2's invincibility to avoid dangerous attacks while waiting.

### The-Four-Emperors-Monkey-D.Luffy

- characterId: `the-four-emperors-monkey-d-luffy`
- difficulty: 3 / 5

**Why It Is Difficult**

- His treasure captures in Big Character form are hard to interrupt. Just Guard recovery and rotations to another treasure also make him difficult to contain.

**How to Respond**

- Look for a skill KO opportunity while he is holding his attack in Big Character form. Avoid committing into Just Guard.

### Great-Pirate-Gol-D-Roger

- characterId: `great-pirate-gol-d-roger`
- difficulty: 3 / 5

**Why It Is Difficult**

- Dark Roger is difficult to interrupt during a treasure capture without Knockback.

**How to Respond**

- Save Skill 1 for the capture. Outside the Treasure Area, use Freeze and look for a KO; leave the matchup to a teammate if you cannot stop him reliably.

### Animal-Kingdom-Pirates-Lead-Performer-King

- characterId: `animal-kingdom-pirates-lead-performer-king`
- difficulty: 3 / 5

**Why It Is Difficult**

- King's flames indicate protection that nullifies three hits. He can use that protection to absorb attacks while capturing, and his skill mobility makes him difficult to keep in place.
- His multi-hit percentage-damage skill also inflicts Knockback. It can push Nusjuro away even with a shield active and create a capture opportunity. Landing that skill is also one way King gains his three-hit protection.

**How to Respond**

- Remove the three-hit protection first with Skill 2's multi-hit attack. When Skill 2 is unavailable, the standard Normal Attack before the movement change is one of your quickest options.
- Prioritize dodging or using invincibility against King's Knockback skill on a Treasure Area. Do not rely on the shield to hold your position.

## Strong Against

### Winner-Island-Trafalgar-Law

- characterId: `winner-island-trafalgar-law`
- advantage: 3 / 5

**Why You Win**

- Landing a skill provides a strong KO opportunity. Outside the Treasure Area, status effects can also help control Law.

**Watch Out**

- Watch for his counter, Amputate, and escapes or position swaps with Shambles.

### Future Where I'm the Most Free Jewelry Bonney

- characterId: `future-where-i-m-the-most-free-jewelry-bonney`
- advantage: 1 / 5

**Why You Win**

- Nusjuro can deal effective damage and inflict status effects. Seven Warlords of the Sea support can help extend Freeze.

**Watch Out**

- Bonney can nullify Nusjuro's revival when she KOs him. Be especially careful at low HP with no shield; do not rely on the Power Gauge recovery to survive her finishing hit.

### Flame-Emperor-Sabo

- characterId: `flame-emperor-sabo`
- advantage: 4 / 5

**Why You Win**

- Sabo does not nullify Nusjuro's revival, and landing a skill creates a strong KO opportunity.
- After his counter ends, Skill 1 can reach him through obstacles. Nusjuro's mobility also helps catch him after an escape.

**Watch Out**

- Bait or wait out the counter before committing a skill.
