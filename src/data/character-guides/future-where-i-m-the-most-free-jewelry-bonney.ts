import type { CharacterGuide } from "./type";

// Original Japanese notes, kept separate from the published English guide.
export const jewelryBonneyGuideInput = {
  overview: {
    draftJa: `ページ冒頭の要約。全スタイルへの変更、ソロブースト、回復と天竜人に対する復活特性無効を活用し、状態異常・割合ダメージ・奪取妨害に注意する。`,
  },
  quickStrengths: {
    draftJa: `solo boost中で発動する特性が強力（skill2の最終段が当たると問答無用で確定ko、回避の飛距離が伸びて同時に攻撃ができる、スキルと回避のクールタイムを短縮できる)、特性で五老星に対して非常に強い、全スタイルになれる（attacker,runner,defendeer)、`,
  },
  quickWeaknesses: {
    draftJa: `状態異常無効がないので短期間行動不能になる、割合ダメージがそのまま効く、強力なダメージ減少無視スキルで大ダメージをもらいやすい、runnerにスタイルチェンジできるものの奪取を妨害されやすい`,
  },
  strengths: {
    draftJa: `高い自立性、全スタイルチェンジが可能で奪取、お宝ゲージの回復、敵のkoなど幅広く扱うことができる。回復性能が高い、koした時、スキルでダメージを与えた時、カウンター成功時、ダメージを受けた時など回復する特性が多いため継戦力が高い。天竜人(celestial dragons)をKOした時にその復活特性を無効にできる。この効果は特定のスキルに限定されないため、通常攻撃でもスキルでもKOできれば復活を阻止でき、復活特性を持つ五老星などの天竜人に特に強い。また天竜人(celestial dragons)に対して強化解除を持ってるので五老星にも有効。実力次第で強力になる、ソロブーストでの性能やカウンターを持ってることであらゆる状況を打開する可能性を持ってる。Solo Boost中は回避を利用して通常時より素早く移動できる。solo-boost-dodge.mp4はこの移動を示す。`,
  },
  weaknesses: {
    draftJa: `状態異常に弱い、状態異常80%短縮はあるものの少し状態異常が入ることで攻撃される隙を晒したりそのまま詰んだり相手に逃げられることがある。機動力が低い、ソロブースト中なら回避を使うことで素早く移動できるが通常の状態では移動系のスキルなどがないため遅い。割合ダメージで大ダメージをもらう、ダメージ減少や防御力増加最大７０%や特性により通常攻撃やスキルに対しては強いが割合ダメージはそのまま通るため優先して避けていきたい。強力なダメージ減少無視で大ダメージ、防御力は敵にダメージを与えるたびに3%増加なので出撃時は低いためシンプルにダメージ減少無視でダメージをもらいやすいので慎重に動く必要がある時もある。器用貧乏になりやすい、全スタイルになれたりカウンター、ソロブーストなど汎用性の高い能力があるが、スキルの使い所やソロブーストの発動タイミング、カウンターをどう使うか、スタイルチェンジを計算して行えるかなど判断する部分が多く要求される難易度が高くなりやすく扱いが難しい場面が多い。`,
  },
  normalAttacks: {
    draftJa: `シンプルにリーチが長めの通常攻撃。通常攻撃を長押しするとカウンターを出せる。counter-whiff.mp4はカウンターが発動せず空撃ちになった時の挙動を示す。カウンターは失敗すると隙を晒すためタイミングに注意する。`,
  },
  skills: {
    draftJa: `skill1のスキル名 Gum-Gum Dawn Balloon & Super-Size Nika Punch、ダメージ減少無視でダメージを与えると体力回復もできる。スキル発動でアタッカーに変化。skill2 Liberation Nika Punch、発動中無敵になる。ソロブースト中なら最終段で確定ko。二つとも飛距離がそこそこ長いので他の味方の対面中の敵に当てたりも狙える。`,
  },
  howToPlay: {
    draftJa: `序盤は自陣の旗ディフェンダーになりお宝ゲージを貯めていこう、これによりソロブーストのゲージも溜まっていくため敵と対峙した時にソロブーストを利用しやすくできる。hpの管理を行う、高い耐久性能があるが回復手段から自分のhpを逆算してリスク管理しながらhpを管理しよう。取れそうなお宝エリアは奪取しておくrunnerに変化できるが敵無視奪取がなく、奪取中も妨害されやすいため逆転性能は高くないのでお宝エリアを3つ以上確保できるように立ち回るかもう一体のバトルキャラには奪取性能の高いrunnerを入れておくと良い。`,
  },
  counters: {
    draftJa: `クザン、4、アイスボールとアイスボール状態による割合ダメージが痛い、またアイスボール状態で行動不能になり一気にkoされる可能性がある。クザンがattakerに変化していた場合は特性によってそこそこ耐久はできる。サボ、2、炎帝状態中の攻撃やスキルなどによるダメージが高くkoされやすいがボニーのスキルも強力なのでカウンターやソロブーストで炎帝状態をやり過ごしつつkoを狙える。great-pirate-gol-d-roger、4、devine-depeartureによる割合ダメージと気絶状態が強力で奪取中でも気絶状態を付与してくるため妨害もやりにくいがそれ以外は脅威ではないためスキルをカウンターや無敵スキルでやり過ごしたり、お宝エリアは一度取らせてしまって奪取後の無防備な状態にスキルを当てたりすると倒せる。the-fouremperors-marshall-d-teach、4、スキルによる振動状態付与も厄介だが基本的に白属性だった場合は勝ち目がないが黒属性の時はごぶごぶなためその時に対面する。redrock-luffy、3、スキルによる割合ダメージと移動速度増加中に無限復活されるため移動速度増加中だと確定koしか倒す手段がなく相手は避けるだけでいいのでその時は勝つことは難しくむしろスキルでkoされるので移動速度増加を待つか無視したり妨害くらいにしておく。`,
  },
  strongAgainst: {
    draftJa: `the-wing-zoro-sanji、４、攻撃力増加解除や特性によりダメージがかなり抑えられるため雑に戦っても基本的に負けることはない。the-five-elders-st-marcus-mars、5、天竜人である相手を通常攻撃でもスキルでもKOした時に復活特性を無効にできるため倒しやすく、負けることはないが無敵スキルで逃げられたりはするので相手のスキル状況を見る。`,
  },
};

export const jewelryBonneyGuide: CharacterGuide = {
  characterId: "future-where-i-m-the-most-free-jewelry-bonney",
  guideOverview: {
    title: "Future Where I'm the Most Free Jewelry Bonney Guide",
    description: "Bonney can switch between Attacker, Runner, and Defender to fight, capture, and fill Treasure Gauges. Build Solo Boost while defending early, then use its stronger dodge and Skill 2 to turn fights. Manage status effects, percentage damage, and capture interruptions carefully.",
  },
  overview: {
    hp: 9383,
    attack: 2425,
    defense: 2152
  },
  quickStrengths: [
    "Solo Boost empowers Skill 2's final hit, extends dodge range, adds an attack to dodge, and shortens skill and dodge cooldowns.",
    "Traits make her especially strong against the Five Elders.",
    "Can switch between Attacker, Runner, and Defender.",
  ],
  quickWeaknesses: [
    "Status effects can briefly stop her actions because she lacks status effect immunity.",
    "Percentage damage still hits her hard.",
    "Skills that ignore damage reduction can deal heavy damage.",
    "Her captures are easy to interrupt even after switching to Runner.",
  ],
  strengths: [
    {
      title: "Flexible, Self-Sufficient Roles",
      mechanic: "Bonney can switch among all three roles, letting her capture treasure, fill Treasure Gauges, and KO enemies.",
      practicalUse: "Change roles according to what the match needs instead of committing to one job throughout the fight.",
    },
    {
      title: "Sustained Healing",
      mechanic: "She can heal after a KO, dealing skill damage, landing a counter, or taking damage.",
      practicalUse: "Use those healing opportunities to stay in fights, while tracking your HP before taking another risk.",
    },
    {
      title: "Stops Celestial Dragon Revivals",
      mechanic: "Against Celestial Dragons, Bonney nullifies revive traits when she KOs them. This effect is not tied to a specific skill, so KOs from either her normal attacks or skills can prevent them from reviving. She can also remove buffs from Celestial Dragons.",
      practicalUse: "This makes her especially effective against Celestial Dragons with revive traits, such as the Five Elders. She does not need to save a specific skill to stop their revival.",
    },
    {
      title: "High Solo Boost Potential",
      mechanic: "Solo Boost strengthens her options, and her counter can turn around difficult situations. During Solo Boost, Bonney can use her enhanced dodge to move around the map much faster than she can normally.",
      practicalUse: "Time Solo Boost and the counter deliberately to create an opening when a fight looks unfavorable.",
      video: "/character-guides/future-where-i-m-the-most-free-jewelry-bonney/solo-boost-dodge.mp4",
    },
  ],
  weaknesses: [
    {
      title: "Status Effects Still Create Openings",
      weakness: "Her status effect duration is reduced by 80%, but she is not immune. Even a short effect can leave her open to attacks or let an enemy escape.",
      howToManage: "Respect enemies who can inflict status effects and avoid giving them a free opening.",
    },
    {
      title: "Limited Movement Outside Solo Boost",
      weakness: "Her dodge provides quick movement during Solo Boost, but she has no movement skill to cover ground quickly otherwise.",
      howToManage: "Position early, and use the boosted dodge when Solo Boost is active.",
    },
    {
      title: "Vulnerable to Percentage Damage",
      weakness: "Damage reduction, traits, and up to 70% Defense increase help against normal attacks and skills, but percentage damage still goes through.",
      howToManage: "Prioritize avoiding percentage-damage attacks even when Bonney otherwise feels durable.",
    },
    {
      title: "Exposed Before Defense Builds",
      weakness: "Her Defense increases by 3% each time she damages an enemy, so it starts low when she enters the match. Strong attacks that ignore damage reduction can hurt badly.",
      howToManage: "Play cautiously before building Defense, especially against damage-reduction-ignoring skills.",
    },
    {
      title: "Many Decisions to Manage",
      weakness: "Her role changes, counter, and Solo Boost are versatile, but choosing skill timing, Boost timing, counter timing, and role changes makes her demanding to play.",
      howToManage: "Choose a clear job for the current situation and commit those tools when they serve it.",
    },
  ],
  normalAttacks: [
    {
      label: "Normal Attack",
      video: "/character-guides/future-where-i-m-the-most-free-jewelry-bonney/normal-attack.mp4",
      tips: ["Her normal attacks have fairly long reach."],
    },
    {
      label: "Hold Normal Attack Counter",
      form: "Counter Whiff",
      video: "/character-guides/future-where-i-m-the-most-free-jewelry-bonney/counter-whiff.mp4",
      tips: ["Hold Normal Attack to use the counter.", "If the counter does not trigger, Bonney whiffs and is left open; time it carefully."],
    },
  ],
  skillGroups: [
    {
      skills: [
        {
          slot: 1,
          label: "Skill 1",
          name: "Gum-Gum Dawn Balloon & Super-Size Nika Punch",
          video: "/character-guides/future-where-i-m-the-most-free-jewelry-bonney/skill-1.mp4",
          quickTips: ["Ignores damage reduction and heals Bonney when it deals damage.", "Using it switches Bonney to Attacker."],
          details: ["Its reach can also let you hit an enemy who is fighting a teammate."],
        },
        {
          slot: 2,
          label: "Skill 2",
          name: "Liberation Nika Punch",
          video: "/character-guides/future-where-i-m-the-most-free-jewelry-bonney/skill-2.mp4",
          quickTips: ["Bonney is invincible during the skill.", "During Solo Boost, the final hit guarantees a KO if it lands."],
          details: ["Its reach can also let you hit an enemy who is fighting a teammate."],
        },
      ],
    },
  ],
  howToPlay: [
    {
      title: "Build Solo Boost Early",
      objective: "Have Solo Boost ready for enemy encounters.",
      action: "Switch to Defender early and fill your team's Treasure Gauges. This also builds the Solo Boost gauge.",
    },
    {
      title: "Manage Your HP",
      objective: "Stay healthy enough to take the next fight.",
      action: "Track your current HP against the healing available from your traits, and take risks accordingly.",
    },
    {
      title: "Plan Treasure Captures",
      objective: "Help your team hold at least three Treasure Areas without relying on a difficult last-minute capture.",
      action: "Capture open Treasure Areas when possible. Runner form cannot ignore enemies while capturing and can be interrupted, so consider pairing Bonney with a Runner that captures reliably.",
    },
  ],
  counters: [
    {
      characterId: "blackbeard-pirates-kuzan",
      difficulty: 4,
      whyDifficult: ["Ice Ball and its status effect deal painful percentage damage.", "Ice Ball can stop Bonney from acting and lead to a quick KO."],
      howToRespond: ["If Kuzan has switched to Attacker, Bonney's traits let her withstand him somewhat better."],
    },
    {
      characterId: "flame-emperor-sabo",
      difficulty: 2,
      whyDifficult: ["Sabo's attacks and skills deal high damage during Flame Emperor state and can KO Bonney quickly."],
      howToRespond: ["Use the counter or Solo Boost to wait out Flame Emperor state, then look for a KO with Bonney's strong skills."],
    },
    {
      characterId: "great-pirate-gol-d-roger",
      difficulty: 4,
      whyDifficult: ["Divine Departure deals percentage damage and inflicts stun, even while Roger is capturing, making him difficult to interrupt."],
      howToRespond: ["Handle that skill with Bonney's counter or invincible skill.", "If needed, let Roger finish capturing, then hit him with a skill while he is exposed."],
    },
    {
      characterId: "the-four-emperors-marshall-d-teach",
      difficulty: 4,
      whyDifficult: ["His skills can inflict Tremor. Bonney has almost no chance against his white-element form."],
      howToRespond: ["Fight him when he is in black-element form, where the matchup is more even."],
    },
    {
      characterId: "red-rock-monkey-d-luffy",
      difficulty: 3,
      whyDifficult: ["His skills deal percentage damage. While his movement speed is increased, he can keep reviving, so only a guaranteed KO can finish him; he can dodge and KO Bonney with a skill."],
      howToRespond: ["Wait for the movement speed increase to end, ignore him, or limit yourself to disrupting him during that period."],
    },
  ],
  strongAgainst: [
    {
      characterId: "the-wings-zoro-sanji",
      advantage: 4,
      whyYouWin: ["Bonney removes their Attack increase, and her traits greatly reduce the damage she takes, making the fight strongly favorable."],
      watchOut: [],
    },
    {
      characterId: "the-five-elders-st-marcus-mars",
      advantage: 5,
      whyYouWin: ["As a Celestial Dragon, Mars cannot revive if Bonney KOs him with a normal attack or a skill."],
      watchOut: ["Mars can escape with an invincible skill, so watch whether his skill is available."],
    },
  ],
};
