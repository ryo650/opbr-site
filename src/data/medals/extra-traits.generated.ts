import type { ExtraTraitCatalogIssue, RawExtraTraitDefinition } from "./extra-traits.ts";

// Generated from validation-passed Rate OCR plus reviewed importer fixtures.
// Run npm run medals:generate-extra-traits to regenerate.
export const extraTraitCatalog = [
  {
    "id": "atk-increase-6-5-percent-unconditional",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 6.5,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "sourceRefs": [
      "red-hair:IMG_4682.PNG"
    ]
  },
  {
    "id": "atk-increase-7-5-percent-unconditional",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 7.5,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "sourceRefs": [
      "red-hair:IMG_4682.PNG"
    ]
  },
  {
    "id": "atk-increase-12-percent-unconditional",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 12,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "sourceRefs": [
      "arlong-sun-pirates:IMG_4643.PNG",
      "crocus-roger-pirata:IMG_4695.PNG",
      "jozu-young:IMG_4621.PNG",
      "koala:IMG_4678.PNG",
      "oden-2nd-division-commander:IMG_4629.PNG",
      "red-hair:IMG_4681.PNG",
      "sanji-child:IMG_4650.PNG",
      "the-pirate-kings-right-arm:IMG_4698.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-unconditional",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "sourceRefs": [
      "fisher-tiger:IMG_4640.PNG",
      "oden-2nd-division-commander:IMG_4629.PNG",
      "red-hair:IMG_4681.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "arlong-sun-pirates:IMG_4643.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "sanji-child:IMG_4650.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-when-the-equipped-character-is-character-type-new-world",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"New World\"."
    },
    "sourceRefs": [
      "jozu-young:IMG_4621.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "vista-land-of-wano-memoir:IMG_4632.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "crocus-roger-pirata:IMG_4695.PNG",
      "rayleigh-first-mate:IMG_4705.PNG",
      "the-pirate-kings-right-arm:IMG_4698.PNG"
    ]
  },
  {
    "id": "atk-increase-14-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "cat-burglar:IMG_4653.PNG"
    ]
  },
  {
    "id": "atk-increase-16-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "fisher-tiger:IMG_4639.PNG"
    ]
  },
  {
    "id": "atk-increase-16-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "reiju-child:IMG_4646.PNG"
    ]
  },
  {
    "id": "atk-increase-16-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "oden-roger-pirates:IMG_4624.PNG",
      "roger-captain:IMG_4701.PNG",
      "shanks-child:IMG_4688.PNG"
    ]
  },
  {
    "id": "atk-increase-16-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "marco-young:IMG_4617.PNG",
      "oden-2nd-division-commander:IMG_4628.PNG"
    ]
  },
  {
    "id": "atk-increase-18-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "fisher-tiger:IMG_4639.PNG"
    ]
  },
  {
    "id": "atk-increase-18-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "reiju-child:IMG_4646.PNG"
    ]
  },
  {
    "id": "atk-increase-18-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "roger-captain:IMG_4701.PNG",
      "shanks-child:IMG_4688.PNG"
    ]
  },
  {
    "id": "atk-increase-18-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "atk-increase",
    "label": "ATK Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "atk-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "marco-young:IMG_4617.PNG",
      "oden-2nd-division-commander:IMG_4628.PNG"
    ]
  },
  {
    "id": "skill1-cooldown-reduction-speed-1-percent-unconditional",
    "effectId": "skill1-cooldown-reduction-speed",
    "label": "Cooldown Reduction (Skill 1)",
    "value": 1,
    "unit": "percent",
    "capGroup": "skill1-cooldown-reduction-speed",
    "sourceRefs": [
      "rate-traits.test:B/C"
    ]
  },
  {
    "id": "skill1-cooldown-reduction-speed-2-percent-when-the-equipped-character-is-character-type-runner",
    "effectId": "skill1-cooldown-reduction-speed",
    "label": "Cooldown Reduction (Skill 1)",
    "value": 2,
    "unit": "percent",
    "capGroup": "skill1-cooldown-reduction-speed",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Runner\"."
    },
    "sourceRefs": [
      "rate-traits.test:E"
    ]
  },
  {
    "id": "skill1-cooldown-reduction-speed-3-percent-unconditional",
    "effectId": "skill1-cooldown-reduction-speed",
    "label": "Cooldown Reduction (Skill 1)",
    "value": 3,
    "unit": "percent",
    "capGroup": "skill1-cooldown-reduction-speed",
    "sourceRefs": [
      "rate-traits.test:E"
    ]
  },
  {
    "id": "skill2-cooldown-reduction-speed-1-percent-unconditional",
    "effectId": "skill2-cooldown-reduction-speed",
    "label": "Cooldown Reduction (Skill 2)",
    "value": 1,
    "unit": "percent",
    "capGroup": "skill2-cooldown-reduction-speed",
    "sourceRefs": [
      "rate-traits.test:B/C"
    ]
  },
  {
    "id": "skill2-cooldown-reduction-speed-1-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "skill2-cooldown-reduction-speed",
    "label": "Cooldown Reduction (Skill 2)",
    "value": 1,
    "unit": "percent",
    "capGroup": "skill2-cooldown-reduction-speed",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "rate-traits.test:D"
    ]
  },
  {
    "id": "crit-increase-12-percent-unconditional",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 12,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "sourceRefs": [
      "genius-jester:IMG_4685.PNG",
      "miracle-worker:IMG_4675.PNG",
      "red-hair:IMG_4682.PNG"
    ]
  },
  {
    "id": "crit-increase-14-percent-unconditional",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "sourceRefs": [
      "miracle-worker:IMG_4675.PNG",
      "red-hair:IMG_4682.PNG"
    ]
  },
  {
    "id": "crit-increase-14-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "iron-mace:IMG_4671.PNG"
    ]
  },
  {
    "id": "crit-increase-14-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "arlong-sun-pirates:IMG_4643.PNG"
    ]
  },
  {
    "id": "crit-increase-14-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "sanji-child:IMG_4650.PNG"
    ]
  },
  {
    "id": "crit-increase-14-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "vice-admiral-tsuru:IMG_4664.PNG"
    ]
  },
  {
    "id": "crit-increase-14-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "buggy-child:IMG_4692.PNG",
      "crocus-roger-pirata:IMG_4695.PNG",
      "the-pirate-kings-right-arm:IMG_4698.PNG"
    ]
  },
  {
    "id": "crit-increase-16-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "loan-shark:IMG_4668.PNG"
    ]
  },
  {
    "id": "crit-increase-16-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "fisher-tiger:IMG_4640.PNG"
    ]
  },
  {
    "id": "crit-increase-16-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "admiral-sengoku:IMG_4661.PNG"
    ]
  },
  {
    "id": "crit-increase-16-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "marco-land-of-wano-memoir:IMG_4636.PNG"
    ]
  },
  {
    "id": "crit-increase-16-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "pirate-hunter:IMG_4657.PNG"
    ]
  },
  {
    "id": "crit-increase-16-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "oden-2nd-division-commander:IMG_4629.PNG"
    ]
  },
  {
    "id": "crit-increase-18-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "loan-shark:IMG_4668.PNG"
    ]
  },
  {
    "id": "crit-increase-18-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "fisher-tiger:IMG_4640.PNG"
    ]
  },
  {
    "id": "crit-increase-18-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "admiral-sengoku:IMG_4661.PNG"
    ]
  },
  {
    "id": "crit-increase-18-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "marco-land-of-wano-memoir:IMG_4636.PNG"
    ]
  },
  {
    "id": "crit-increase-18-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "pirate-hunter:IMG_4657.PNG"
    ]
  },
  {
    "id": "crit-increase-18-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "crit-increase",
    "label": "CRIT Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "crit-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "oden-2nd-division-commander:IMG_4629.PNG"
    ]
  },
  {
    "id": "damage-dealt-increase-3-percent-when-attacking-an-enemy-with-the-logia-tag",
    "effectId": "damage-dealt-increase",
    "label": "Damage Dealt Increase",
    "value": 3,
    "unit": "percent",
    "capGroup": "damage-dealt-increase",
    "condition": {
      "kind": "text",
      "description": "When attacking an enemy with the Logia tag."
    },
    "sourceRefs": [
      "rate-traits.test:damage-logia"
    ]
  },
  {
    "id": "damage-dealt-increase-3-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "damage-dealt-increase",
    "label": "Damage Dealt Increase",
    "value": 3,
    "unit": "percent",
    "capGroup": "damage-dealt-increase",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "rate-traits.test:damage-navy"
    ]
  },
  {
    "id": "damage-dealt-increase-5-percent-when-the-equipped-character-is-character-type-the-grand-line",
    "effectId": "damage-dealt-increase",
    "label": "Damage Dealt Increase",
    "value": 5,
    "unit": "percent",
    "capGroup": "damage-dealt-increase",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"The Grand Line\"."
    },
    "sourceRefs": [
      "rate-traits.test:damage-grand-line"
    ]
  },
  {
    "id": "damage-received-reduction-3-percent-when-the-equipped-character-is-character-type-the-grand-line",
    "effectId": "damage-received-reduction",
    "label": "Damage Received Reduction",
    "value": 3,
    "unit": "percent",
    "capGroup": "damage-received-reduction",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"The Grand Line\"."
    },
    "sourceRefs": [
      "rate-traits.test:damage-grand-line"
    ]
  },
  {
    "id": "def-increase-12-percent-unconditional",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 12,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "sourceRefs": [
      "genius-jester:IMG_4685.PNG",
      "koala:IMG_4678.PNG",
      "miracle-worker:IMG_4674.PNG",
      "red-hair:IMG_4681.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-unconditional",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "sourceRefs": [
      "miracle-worker:IMG_4674.PNG",
      "red-hair:IMG_4681.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "iron-mace:IMG_4671.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "arlong-sun-pirates:IMG_4643.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "sanji-child:IMG_4650.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "vice-admiral-tsuru:IMG_4664.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-new-world",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"New World\"."
    },
    "sourceRefs": [
      "jozu-young:IMG_4621.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "vista-land-of-wano-memoir:IMG_4632.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "buggy-child:IMG_4692.PNG",
      "crocus-roger-pirata:IMG_4695.PNG",
      "rayleigh-first-mate:IMG_4705.PNG",
      "the-pirate-kings-right-arm:IMG_4698.PNG"
    ]
  },
  {
    "id": "def-increase-14-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "cat-burglar:IMG_4653.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "loan-shark:IMG_4667.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "fisher-tiger:IMG_4639.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "reiju-child:IMG_4647.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "marco-land-of-wano-memoir:IMG_4635.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "oden-roger-pirates:IMG_4625.PNG",
      "roger-captain:IMG_4702.PNG",
      "shanks-child:IMG_4689.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "pirate-hunter:IMG_4656.PNG"
    ]
  },
  {
    "id": "def-increase-16-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "marco-young:IMG_4618.PNG",
      "oden-2nd-division-commander:IMG_4628.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "loan-shark:IMG_4667.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-fish-man",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Fish-Man\"."
    },
    "sourceRefs": [
      "fisher-tiger:IMG_4639.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "reiju-child:IMG_4647.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "admiral-sengoku:IMG_4660.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "marco-land-of-wano-memoir:IMG_4635.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "oden-roger-pirates:IMG_4625.PNG",
      "roger-captain:IMG_4702.PNG",
      "shanks-child:IMG_4689.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "pirate-hunter:IMG_4656.PNG"
    ]
  },
  {
    "id": "def-increase-18-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "def-increase",
    "label": "DEF Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "def-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "marco-young:IMG_4618.PNG",
      "oden-2nd-division-commander:IMG_4628.PNG"
    ]
  },
  {
    "id": "hp-increase-6-5-percent-unconditional",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 6.5,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "sourceRefs": [
      "genius-jester:IMG_4685.PNG",
      "koala:IMG_4678.PNG",
      "miracle-worker:IMG_4675.PNG"
    ]
  },
  {
    "id": "hp-increase-7-5-percent-unconditional",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 7.5,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "sourceRefs": [
      "miracle-worker:IMG_4675.PNG"
    ]
  },
  {
    "id": "hp-increase-12-percent-unconditional",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 12,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "sourceRefs": [
      "admiral-sengoku:IMG_4661.PNG",
      "buggy-child:IMG_4692.PNG",
      "cat-burglar:IMG_4653.PNG",
      "genius-jester:IMG_4685.PNG",
      "iron-mace:IMG_4671.PNG",
      "koala:IMG_4678.PNG",
      "loan-shark:IMG_4668.PNG",
      "marco-land-of-wano-memoir:IMG_4636.PNG",
      "marco-young:IMG_4618.PNG",
      "miracle-worker:IMG_4674.PNG",
      "oden-roger-pirates:IMG_4625.PNG",
      "pirate-hunter:IMG_4657.PNG",
      "rayleigh-first-mate:IMG_4705.PNG",
      "reiju-child:IMG_4647.PNG",
      "roger-captain:IMG_4702.PNG",
      "shanks-child:IMG_4689.PNG",
      "vice-admiral-tsuru:IMG_4664.PNG",
      "vista-land-of-wano-memoir:IMG_4632.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-unconditional",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "sourceRefs": [
      "admiral-sengoku:IMG_4661.PNG",
      "loan-shark:IMG_4668.PNG",
      "marco-land-of-wano-memoir:IMG_4636.PNG",
      "marco-young:IMG_4618.PNG",
      "miracle-worker:IMG_4674.PNG",
      "oden-roger-pirates:IMG_4625.PNG",
      "pirate-hunter:IMG_4657.PNG",
      "reiju-child:IMG_4647.PNG",
      "roger-captain:IMG_4702.PNG",
      "shanks-child:IMG_4689.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "iron-mace:IMG_4671.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "vice-admiral-tsuru:IMG_4664.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-when-the-equipped-character-is-character-type-new-world",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"New World\"."
    },
    "sourceRefs": [
      "jozu-young:IMG_4621.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "vista-land-of-wano-memoir:IMG_4632.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "buggy-child:IMG_4692.PNG",
      "rayleigh-first-mate:IMG_4705.PNG"
    ]
  },
  {
    "id": "hp-increase-14-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 14,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "cat-burglar:IMG_4653.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "loan-shark:IMG_4667.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "reiju-child:IMG_4646.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "admiral-sengoku:IMG_4660.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "marco-land-of-wano-memoir:IMG_4635.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "oden-roger-pirates:IMG_4624.PNG",
      "roger-captain:IMG_4701.PNG",
      "shanks-child:IMG_4688.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "pirate-hunter:IMG_4656.PNG"
    ]
  },
  {
    "id": "hp-increase-16-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 16,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "marco-young:IMG_4617.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-buggy-s-delivery",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Buggy's Delivery\"."
    },
    "sourceRefs": [
      "loan-shark:IMG_4667.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-germa-66",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Germa 66\"."
    },
    "sourceRefs": [
      "reiju-child:IMG_4646.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-navy",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Navy\"."
    },
    "sourceRefs": [
      "admiral-sengoku:IMG_4660.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-paramecia",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Paramecia\"."
    },
    "sourceRefs": [
      "marco-land-of-wano-memoir:IMG_4635.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-roger-pirates-ex-roger-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Roger Pirates / Ex-Roger Pirates\"."
    },
    "sourceRefs": [
      "oden-roger-pirates:IMG_4624.PNG",
      "roger-captain:IMG_4701.PNG",
      "shanks-child:IMG_4688.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-straw-hat-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Straw Hat Pirates\"."
    },
    "sourceRefs": [
      "pirate-hunter:IMG_4656.PNG"
    ]
  },
  {
    "id": "hp-increase-18-percent-when-the-equipped-character-is-character-type-whitebeard-pirates",
    "effectId": "hp-increase",
    "label": "HP Increase",
    "value": 18,
    "unit": "percent",
    "capGroup": "hp-increase-percent",
    "condition": {
      "kind": "text",
      "description": "When the equipped character is character type \"Whitebeard Pirates\"."
    },
    "sourceRefs": [
      "marco-young:IMG_4617.PNG"
    ]
  },
  {
    "id": "stun-duration-reduction-36-percent-unconditional",
    "effectId": "stun-duration-reduction",
    "label": "Stun Duration Reduction",
    "value": 36,
    "unit": "percent",
    "capGroup": "stun-duration-reduction",
    "sourceRefs": [
      "rate-traits.test:status"
    ]
  }
] as const satisfies readonly RawExtraTraitDefinition[];

export const extraTraitCatalogNeedsReview = [
  {
    "sourceRef": "admiral-sengoku:IMG_4660.PNG",
    "text": "When the equipped character is character type \"Navy\": Increase DEF by 1.6%..",
    "reason": "Stat value is outside the reviewed Rate values and may be an OCR decimal error."
  },
  {
    "sourceRef": "fisher-tiger:IMG_4640.PNG",
    "text": "Increase AT by 12%.",
    "reason": "Effect, value, or unit could not be parsed safely."
  },
  {
    "sourceRef": "oden-roger-pirates:IMG_4624.PNG",
    "text": "When the equipped character is character type \"Roger Pirates / Ex-Roger, Pirates\": Increase ATK by 18%.",
    "reason": "Condition contains an ambiguous OCR comma."
  }
] as const satisfies readonly ExtraTraitCatalogIssue[];
