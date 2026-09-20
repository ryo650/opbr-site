import type { CharacterGuide } from "./type";

/**
 * Jewelry Bonney guide input sheet.
 *
 * Japanese notes are fine while drafting. Empty arrays are intentionally hidden
 * on the published page, so fill in one section at a time without breaking it.
 */
export const jewelryBonneyGuide: CharacterGuide = {
  characterId: "future-where-i-m-the-most-free-jewelry-bonney",

  notice: {
    title: "Guide in Progress",
    description:
      "This guide is being prepared and will be expanded with gameplay details, skills, and matchups.",
  },

  // Overview: ページ冒頭の要約。title と description を英語に整える前は日本語メモでもOKです。
  guideOverview: {
    title: "Jewelry Bonney Guide",
    description:
      "A developing OPBR guide for Future Where I'm the Most Free Jewelry Bonney.",
  },

  // Overview Stats: ゲーム内の最終表示値を確認後、下の例を有効化してください。
  // overview: {
  //   hp: 0,
  //   attack: 0,
  //   defense: 0,
  // },

  // Quick Strengths: 短い箇条書き。例: "〇〇状態中はよろけ無効"
  quickStrengths: [],

  // Quick Weaknesses: 短い箇条書き。例: "スキル1使用後は耐久力が低い"
  quickWeaknesses: [],

  // Strengths: mechanic=強い仕組み / practicalUse=実戦での使い方
  // {
  //   title: "強みの見出し",
  //   mechanic: "なぜ・どの仕組みで強いか",
  //   practicalUse: "試合中にどう活用するか",
  // }
  strengths: [],

  // Weaknesses: weakness=弱点 / howToManage=対処・補い方
  // {
  //   title: "弱点の見出し",
  //   weakness: "何が苦手か、どんな時に困るか",
  //   howToManage: "立ち回りや編成でどう補うか",
  // }
  weaknesses: [],

  // Normal Attacks: 通常攻撃。動画がなければ video は省略できます。
  // {
  //   label: "Normal Attack",
  //   form: "通常時 / 変身時など（不要なら省略）",
  //   video: "/character-guides/<character-id>/normal-attack.mp4",
  //   tips: ["使い方メモ", "何段目にどんな効果があるか"],
  // }
  normalAttacks: [],

  // Skill 1 / Skill 2: name、cooldown、quickTips、details を入力します。
  // skillGroups: [
  //   {
  //     skills: [
  //       {
  //         slot: 1,
  //         label: "Skill 1",
  //         name: "スキル名",
  //         cooldown: 0,
  //         video: "/character-guides/<character-id>/skill-1.mp4",
  //         quickTips: ["短い使い方メモ"],
  //         details: ["詳しい性能・使いどころ"],
  //       },
  //       {
  //         slot: 2,
  //         label: "Skill 2",
  //         name: "スキル名",
  //         cooldown: 0,
  //         video: "/character-guides/<character-id>/skill-2.mp4",
  //         quickTips: ["短い使い方メモ"],
  //         details: ["詳しい性能・使いどころ"],
  //       },
  //     ],
  //   },
  // ],
  skillGroups: [],

  // How to Play: objective=目的 / action=具体的な行動
  // { title: "立ち回り", objective: "達成したいこと", action: "実際にすること" }
  howToPlay: [],

  // Counters: characterId は src/data/characters にあるIDだけを使用します。
  // {
  //   characterId: "相手のcharacterId",
  //   difficulty: 1, // 1（軽い不利）〜5（非常に不利）
  //   whyDifficult: ["不利な理由"],
  //   howToRespond: ["対処方法"],
  // }
  counters: [],

  // Strong Against: characterId は src/data/characters にあるIDだけを使用します。
  // {
  //   characterId: "相手のcharacterId",
  //   advantage: 1, // 1（軽い有利）〜5（非常に有利）
  //   whyYouWin: ["有利な理由"],
  //   watchOut: ["注意点"],
  // }
  strongAgainst: [],
};
