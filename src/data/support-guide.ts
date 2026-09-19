import type { DraftGuideSection, GuideIntro } from "./guide-section";

export const supportGuideIntro: GuideIntro = {
  eyebrow: "Support Guide",
  title: "Build Better Support",
  description:
    "Learn how Support strengthens your Battle Characters, which upgrades matter most, and how to efficiently build toward 130%+ Support.",
  target: "130%+",
  targetLabel: "A strong first target for SS League",
};

export const supportGuideSections: DraftGuideSection[] = [
  {
    title: "What Is Support?",
    draftJa:
      "サポートは編成したバトルキャラのステータスを向上、サポートキャラのタグ一致効果によって追加で特性のようなものを付与できる。サポートの値がかけ離れすぎると勝負にもならないので最低限の向上をすることで対抗できる",
    summary:
      "Support strengthens your Battle Characters and can provide additional effects through Character Tags.",
    paragraphs: [
      "Your Support lineup directly affects the stats of the Battle Characters you use in League Battle. If there is a large Support Percentage gap between you and your opponents, you can start the match at a significant stat disadvantage.",
      "Support Characters can also activate Character Tag effects when enough matching tags are included in your lineup. Building a solid Support lineup gives your Battle Characters a much stronger foundation."
    ],
    bullets: [
      "Increase your Battle Characters' stats",
      "Reduce large stat disadvantages against stronger opponents",
      "Activate additional effects through Character Tags"
    ],
  },

  {
    title: "Aim for 130%+ Support",
    draftJa:
      "ssリーグに行くまでのサポートの最低限の値は約130%だ。キャラの有利不利で難しい場面はあるがサポートにおいて一方的にやられるということはなくなる",
    summary:
      "Aim for around 130% Support or higher when trying to reach SS League.",
    paragraphs: [
      "Around 130% is a good first target for beginners climbing toward SS League. Character matchups and player skill will still matter, but reaching this level of Support helps prevent your team from being heavily outmatched by raw stats alone.",
      "You do not need a perfect Support lineup immediately. Reaching a solid percentage first is more important than optimizing every Character Tag."
    ],
    bullets: [
      "Use 130% as your first major target",
      "Prioritize Support Percentage before perfect tag combinations"
    ],
  },

  {
    title: "How to Increase Support",
    draftJa:
      "サポートを向上させる方法はサポートキャラを強化することで向上が可能。具体的に言うと、レベルを上げる、装備してるメダルを星9にする、ブーストを上げることで上がる",
    summary:
      "Increase Support by strengthening the characters in your Support lineup.",
    paragraphs: [
      "The main way to raise your Support Percentage is to invest in your Support Characters. Their level, Boost, and equipped medals all contribute to the strength of your Support lineup.",
      "You do not need to maximize everything at once. Focus first on upgrades that are easy to obtain and that improve multiple Support Characters efficiently."
    ],
    bullets: [
      "Raise Support Character levels",
      "Increase their Boost",
      "Equip three 9★ medals when possible"
    ],
  },

  {
    title: "Level and Boost",
    draftJa:
      "レベルを100レベルまで上げるにはレベル上限を解放する必要があり、そのためにはキャラのかけら（fragment)が必要になる。キャラのかけらはさまざまなところから入手可能でかけら交換所、リーグバトルの報酬、同じキャラをガチャで入手するなど、special trainingはbfまたはexのキャラのかけらを入手するのにおすすめだ。レベルはsurvival 100をクリアすることでレベルを上げたりEXP Orbsを入手できる。ブーストは最終的にサポートキャラクター全員Boost 2を目指す。",
    summary:
      "Raise your Support Characters toward Level 100 and aim to get every character in your Support lineup to Boost 2.",
    paragraphs: [
      "To raise a character all the way to Level 100, you need Character Fragments to increase their level cap. Fragments can be obtained from sources such as Exchange Shops, League Battle rewards, duplicate characters, and Special Training.",
      "Special Training is especially useful for slowly collecting fragments for Battle Festival and Extreme characters, while Survival 100 and EXP Orbs can help with character leveling.",
      "For Boost, a simple long-term goal is to bring every character in your Support lineup to Boost 2. This gives each Support Character a meaningful stat increase and helps raise your overall Support Percentage."
    ],
    bullets: [
      "Raise Support Characters toward Level 100",
      "Collect Character Fragments to increase their level cap",
      "Use Special Training for harder-to-obtain characters",
      "Aim for Boost 2 on every Support Character"
    ],
  },

  {
    title: "Medals for Support Characters",
    draftJa:
      "サポートキャラのメダルは星9であればなんでも良いので無理にリーグバトルで使うようなメダルを作成する必要はない。エイプリルフールなどのイベントで星9メダルが簡単に入手できるものもあるので積極的に入手しよう。",
    summary:
      "For Support Characters, the medal grade matters more than building a perfect battle-ready Medal Set.",
    paragraphs: [
      "You do not need to use your best League Battle medals on Support Characters. If your goal is simply to improve Support, equipping 9★ medals is enough.",
      "Some events make 9★ medals much easier to obtain, so they can be a very efficient way to strengthen multiple Support Characters without spending valuable medal resources."
    ],
    bullets: [
      "Equip 9★ medals on Support Characters",
      "Save valuable battle medals for your main characters",
      "Take advantage of events that provide easy 9★ medals"
    ],
  },

  {
    title: "Character Tags",
    draftJa:
      "キャラクタータグは一致させることで効果を得ることができる主に使いやすく強いと言われてるのはnew world, 各role, zoan, the sevean warlords...(省略）などだ",
    summary:
      "Matching Character Tags can add useful bonus effects to your Support lineup.",
    paragraphs: [
      "Each Support Character has Character Tags, and including enough characters with matching tags activates additional effects.",
      "Some commonly useful tags include New World, role-based tags, Zoan, The Seven Warlords of the Sea, and Former The Seven Warlords of the Sea. Beginners should focus on useful tag combinations without sacrificing too much Support Percentage."
    ],
    bullets: [
      "Look for tags shared by multiple Support Characters",
      "Prioritize useful tags that fit your Battle Characters",
      "Do not sacrifice too much Support Percentage just to activate a tag"
    ],
    terms: [
      "New World",
      "Role Tags",
      "Zoan",
      "The Seven Warlords of the Sea",
      "Former The Seven Warlords of the Sea",
    ],
  },

  {
    title: "How to Build Support Efficiently",
    draftJa:
      "効率的にサポートを上げたいならbfやexのようなレベル上限を上げにくいキャラよりレベル上限を100に上げやすいstar-4を中心にサポートを組むのがおすすめ。star-4の中にも強力なサポートを持つキャラクターがいるので自分のバトルキャラを同じ属性のキャラを最優先で強化していくのがおすすめだ。（おすすめサポートキャラを乗せる）",
    summary:
      "Build Support around characters that are easy to reach Level 100 rather than only using rare characters.",
    paragraphs: [
      "Battle Festival and Extreme characters can take much longer to reach Level 100, so they are not always the most efficient Support investment for beginners.",
      "Standard 4★ characters that are easier to obtain and limit break can be excellent Support options. Prioritize characters that match the color of your main Battle Characters, then look for characters that also provide useful Character Tags."
    ],
    bullets: [
      "Prioritize characters that are easier to reach Level 100",
      "Build around the same color as your main Battle Characters",
      "Look for useful Character Tags",
      "Upgrade efficient Support Characters before expensive BF or EX options"
    ],
  },
];
