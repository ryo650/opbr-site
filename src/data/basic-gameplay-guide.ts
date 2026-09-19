import type { DraftGuideSection, GuideIntro } from "./guide-section";

export const basicGameplayGuideIntro: GuideIntro = {
  eyebrow: "Basic Gameplay Guide",
  title: "How to Win League Battle",
  description:
    "Learn how Treasure control, roles, matchups, timing, and decision-making work together to win League Battle.",
  target: "3+",
  targetLabel: "Treasure Areas when the match ends",
};

export const basicGameplayGuideSections: DraftGuideSection[] = [
  {
    title: "How to Win League Battle",
    draftJa:
      "リーグバトルで勝つにはキャラクター選択、試合の序盤、中盤、終盤の動き、4人の役職のバランス、状況に応じた判断が重要になる。",
    summary:
      "Winning League Battle is about making the right decisions as a team, not just getting KOs.",
    paragraphs: [
      "Character selection, team role balance, and how you play during the early, middle, and late stages of a match all affect the outcome.",
      "There is no single correct action for every situation. Learning to read the number of Treasure Areas, the remaining time, your teammates, and the enemy team will help you make better decisions throughout the match."
    ],
    bullets: [
      "Choose characters that work well with your team",
      "Pay attention to your team's role balance",
      "Adjust your play as the match changes",
      "Always keep track of Treasure Areas and remaining time"
    ],
  },

  {
    title: "Treasure Areas Come First",
    draftJa:
      "リーグバトル最終的にお宝エリアを相手より多く所持したチームが勝つ。すなわち3つ以上のお宝エリアを所持していれば勝つということだ。それはどんな状況でも良い、試合終了まで3つ守りきれも良い、最後の20秒で一気に3つ取り返してでも良い。お宝エリアの争奪において試合の序盤中盤終盤で注意する部分が変わるので試合時間や状況をよく見よう。",
    summary:
      "League Battle is decided by Treasure Areas, so controlling at least three when the match ends is what ultimately matters.",
    paragraphs: [
      "It does not matter whether your team controls three Treasure Areas for most of the match or captures them in the final seconds. If your team has more Treasure Areas when time runs out, you win.",
      "Your priorities should change depending on the stage of the match. Early on, you may focus on establishing control. Later, protecting a lead or creating one final opportunity to capture can become much more important."
    ],
    bullets: [
      "Aim to finish the match with at least three Treasure Areas",
      "Do not prioritize KOs over the actual win condition",
      "Change your priorities as the remaining time decreases",
      "Think about what the Treasure count needs to look like when time reaches zero"
    ],
    callout: {
      title: "Plan the End of the Match",
      text: "When time is running out, work backward from the result you need. Decide whether your team should defend its current Treasure Areas or move to capture another one, and make sure there is actually enough time left to complete the play."
    },
  },

  {
    title: "Attacker",
    draftJa:
      "アタッカーは状況に応じてオールラウンドな動きが必要になるキャラクターだ。三つの役職の中で一番難しいだろう。ディフェンダーの代わりに一時的にお宝エリアを防衛したり、余裕があればお宝エリアのゲージを減らしたり、味方のマッチアップを見て動きやすくするように敵を排除したりなどを試合全体の状況に応じて判断する必要があり基本的にrunnerとdefenderのサポートが仕事。ただやること自体はシンプルで、お宝エリアを三つ以上保持するように動けば良い。2つ以下ならそれより取られないように一つ取れるように動く、三つ以上なら無理に攻め込まずに防衛を優先する。余裕があればさらに攻める。相手に奪取能力の高いゲッターなどがいたりしたら臨機応変に対応する感じ。お宝エリアは基本的に自陣のエリア2つと中央のCエリアを中心に動こう、敵陣のエリアにいきなり突っ込んでいくのは状況次第だがあまりおすすめしない",
    summary:
      "Attackers should support the team by removing threats and adapting to whatever the match needs.",
    paragraphs: [
      "Despite the name, an Attacker's job is not simply to chase KOs. Attackers often need to support Runners and Defenders by removing dangerous enemies, temporarily defending a Treasure Area, or creating space for teammates.",
      "A simple way to decide what to do is to look at the Treasure count. If your team has two or fewer, help create an opportunity to capture another. If your team has three or more, defending your advantage is usually more valuable than pushing deep into enemy territory.",
      "In many matches, the two Treasure Areas closest to your team and the central C Treasure Area are the most important places to control. Pushing directly into the enemy's side can be useful in some situations, but it should have a clear purpose."
    ],
    bullets: [
      "Support your Runners and Defenders",
      "Remove enemies that are blocking important plays",
      "Help defend when your team already controls enough Treasure Areas",
      "Avoid chasing KOs that do not help your team control Treasure"
    ],
  },

  {
    title: "Runner",
    draftJa:
      "Runnerはお宝エリア奪取が早いキャラクターだ。やることとしてはお宝エリアの少しの防衛と奪取だ。基本的に苦手な敵を避けつつエリア奪取を狙っていこう。試合の終盤ではお宝エリアをどうやったら3つ以上になるかを計算して動こう、例えば自分のチームがお宝エリア三つ持っているとすると、三つとも守りきりで勝てそうならエリアを防衛を優先、一つ取られそうで守りきれないなら奪取しに行く、試合終了時間を見てお宝を奪取できるのかどうかを確認しながら試合終了までをデザインしよう。",
    summary:
      "Runners directly influence the win condition by capturing Treasure Areas and creating pressure across the map.",
    paragraphs: [
      "Your main job as a Runner is to capture Treasure Areas while avoiding unnecessary fights, especially against characters that have a strong matchup against you. You may also need to help defend briefly when the situation calls for it.",
      "The late game is especially important for Runners. Instead of automatically running toward the next Treasure Area, think about how your team can finish the match with at least three.",
      "For example, if your team already controls three Treasure Areas and can defend them until time runs out, defending may be the correct choice. If one of them is likely to be lost, you may need to move early and capture another before the match ends."
    ],
    bullets: [
      "Prioritize capturing Treasure Areas",
      "Avoid unnecessary fights and bad matchups",
      "Watch the remaining time before committing to a capture",
      "Plan how your team will finish the match with at least three Treasure Areas"
    ],
  },

  {
    title: "Defender",
    draftJa:
      "defenderはお宝エリアのゲージを貯めることに長けていて試合を安定して進めやすくできる役職だ。基本的に自陣から中央のCエリアのゲージを貯めて行って敵の奪取を妨害してくのが仕事。ゲージが溜まり切ったエリアの防衛はアタッカーに任せたりしてもok、基本的に一人一つのエリアを守れれば良いので複数人で固まらないようにしよう。",
    summary:
      "Defenders stabilize the match by filling Treasure Gauges and making important areas difficult for the enemy to capture.",
    paragraphs: [
      "A Defender should usually build up the Treasure Gauge from the areas closest to your team toward the central C Treasure Area, then position to stop enemy Runners from capturing them.",
      "You do not need to stand on every Treasure Area yourself. Once an area is secure, another teammate such as an Attacker may be able to protect it while you move to a more important position.",
      "Try not to stack multiple teammates on the same Treasure Area unnecessarily. If each player can control a different important area, your team can cover much more of the map."
    ],
    bullets: [
      "Fill important Treasure Gauges",
      "Stop enemy captures",
      "Prioritize the areas your team actually needs to hold",
      "Avoid grouping multiple teammates on one Treasure Area without a reason"
    ],
  },

  {
    title: "Character Matchups",
    draftJa:
      "キャラクターの相性は一対一の状況で大きく勝敗を分ける要素だ。できるだけ敵味方のキャラクターの相性と役職などからそれぞれの考えられる対面を予想して試合を有利に進めよう。基本的な役職をこなしつつ味方、自分の対面をできるだけ有利に運べるように全体を見よう。",
    summary:
      "Understanding character matchups helps you choose better fights and create better situations for your teammates.",
    paragraphs: [
      "Character matchups can heavily influence one-on-one fights. Before committing to a battle, consider whether your character has an advantage or disadvantage against the opponent.",
      "You should also pay attention to your teammates' matchups. Sometimes the best move is not to fight the enemy in front of you, but to switch targets so both you and your teammate can fight more favorable opponents.",
      "Keep performing your role while looking at the overall battlefield and try to create as many favorable matchups for your team as possible."
    ],
    bullets: [
      "Learn which characters your main character handles well",
      "Avoid forcing unfavorable matchups when another option exists",
      "Watch your teammates' matchups as well as your own",
      "Switch targets when it creates a better situation for the team"
    ],
  },

  {
    title: "When to Fight and When to Move",
    draftJa:
      "戦うタイミングを問われるのはチームブーストが発動する時だ。チームブーストは短期間の間、非常に強化されるため基本的にブースト中の敵とは戦わずにやり過ごすことが重要だ。逆に自分のチームがブースト中なら積極的に動こう。さらにチームブーストを最大限活用する方法と、相手のチームブーストの被害を最大限なくす方法がある。これは試合の勝敗に大きく関わるだろう。まず最大限活用するにはチームブースト発動直前にkoされないことだ。だから発動しそうになったら無理に対面せずにブースト発動を待つのがおすすめだ。逆に相手が発動しそうなタイミングならkoを狙ったりできるだけダウンさせて時間を稼ぐことで被害を防げる。",
    summary:
      "Team Boost is one of the clearest signals for when to fight aggressively and when to avoid combat.",
    paragraphs: [
      "Team Boost provides a large temporary advantage. When the enemy team activates it, fighting them directly is usually much more dangerous, so surviving and wasting their Boost time can be more valuable than forcing a fight.",
      "When your own Team Boost is about to activate, try to stay alive so you can take advantage of it. Avoid taking unnecessary risks immediately before activation, then use the power spike to pressure enemies and important Treasure Areas.",
      "You can also reduce the impact of an incoming enemy Team Boost. If possible, KO or knock down enemies just before their Boost activates so they lose part of the limited time while recovering or returning to the fight."
    ],
    bullets: [
      "Avoid unnecessary fights during the enemy Team Boost",
      "Stay alive when your own Team Boost is about to activate",
      "Use your Team Boost to create pressure and secure objectives",
      "KO or knock down enemies before their Team Boost when possible"
    ],
  },
];
