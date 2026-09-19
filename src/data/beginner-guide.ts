export type BeginnerGuideSection = {
  title: string;
  summary: string;
  paragraphs: string[];
  bullets: string[];
  image?: {
    src: string;
    alt: string;
  };
  callout?: {
    title: string;
    text: string;
  };
  internalLink?: {
    label: string;
    href: string;
  };
};

export const beginnerGuideSections: BeginnerGuideSection[] = [
  {
    title: "Build Your Support",
    summary:
      "Aim for at least 130% Support before trying to reach SS League.",
    paragraphs: [
      "Support Percentage has a major impact on your Battle Character's stats. Even if your Battle Character is strong, climbing to SS can become much harder if your Support Percentage is too low.",
      "You can increase your Support by strengthening the characters in your Support lineup. Level them up, increase their Boost, and equip them with high-grade medals. Character Tags also provide additional Support effects, so raising characters that share useful Tags can make your Support lineup stronger and more efficient."
    ],
    bullets: [
      "Aim for at least 130% Support",
      "Level up your Support Characters",
      "Increase their Boost",
      "Equip high-grade medals",
      "Use Character Tags when possible"
    ],
    internalLink: {
      label: "Learn How to Build Support",
      href: "/support-guide",
    },
  },

  {
    title: "Use Strong Characters",
    summary:
      "Use characters that can perform well in the current meta if you want to reach SS faster.",
    paragraphs: [
      "You can reach SS with many different characters, but stronger characters give you more opportunities to influence the match.",
      "As a general guideline, characters ranked B Tier or higher on our Tier List are recommended for climbing. Lower-ranked characters can still perform well in certain situations, but it may be harder to consistently affect the outcome of matches."
    ],
    bullets: [],
    internalLink: {
      label: "View Tier List",
      href: "/tier-list",
    },
  },

  {
    title: "Learn the Basics",
    summary:
      "Learn the basic rules of League Battle and understand what each role is supposed to do.",
    paragraphs: [
      "League Battle is ultimately decided by Treasure Areas. Getting KOs and earning a high score can help your team, but they do not matter if your team finishes the match with fewer Treasure Areas.",
      "Attackers, Runners, and Defenders each contribute to winning in different ways. Understanding your role, character matchups, and when to fight, capture, defend, or support your teammates will make your decisions much more effective."
    ],
    bullets: [
      "Focus on Treasure Areas, not only KOs",
      "Understand the role of your character",
      "Pay attention to favorable and unfavorable matchups",
      "Change your priorities depending on the situation"
    ],
    internalLink: {
      label: "Learn League Battle Basics",
      href: "/basic-gameplay-guide",
    },
  },

  {
    title: "Build a Good Medal Set",
    summary:
      "Build a reliable Medal Set because medals affect many parts of your character's performance.",
    paragraphs: [
      "A good Medal Set can improve your character's stats, cooldowns, damage, survivability, and other important effects.",
      "As a beginner, you do not need to create a Medal Set from scratch. Start by copying a proven set, then check its Tags, Unique Traits, and activation conditions to understand why the combination works.",
      "Medal Traits can be transferred between medals, but some transfer items and traits are difficult to obtain. Before using valuable transfer materials, make sure you understand which traits are worth keeping."
    ],
    bullets: [
      "Start with a proven Medal Set",
      "Check Medal Tags",
      "Check Unique Trait conditions",
      "Avoid wasting valuable transfer resources"
    ],
    internalLink: {
      label: "Explore Medal Sets",
      href: "/medal-sets",
    },
  },

  {
    title: "Don't Worry About Hyper Boost",
    summary:
      "You do not need to worry about Hyper Boost when trying to reach SS for the first time.",
    paragraphs: [
      "Experienced players may have very high Hyper Boost levels, but you do not need to match them to compete in League Battle.",
      "Think of Hyper Boost as long-term progression. Your Battle Characters, Support, Medals, and gameplay fundamentals should be much higher priorities when you are starting out."
    ],
    bullets: [],
  },

  {
    title: "Try Playing a Runner",
    summary:
      "Runners are especially useful in solo League Battle because they can directly influence the number of Treasure Areas your team controls.",
    paragraphs: [
      "Coordination with random teammates can be difficult, so being able to capture Treasure Areas yourself gives you another way to influence the match.",
      "You do not have to play a Runner in every match, but learning how to use one can make climbing League easier."
    ],
    bullets: [],
  },

  {
    title: "Build Your Battle Characters",
    summary:
      "Raise your main Battle Characters to at least Level 80 and Boost 2.",
    paragraphs: [
      "At Level 80, Trait 2 is unlocked. These additional traits are often a major part of how a character is designed to function, which makes Level 80 an important milestone.",
      "Boost 2 provides a significant stat increase and unlocks additional Boost Traits, making it another important upgrade before seriously climbing League."
    ],
    bullets: [
      "Reach at least Level 80",
      "Unlock Trait 2",
      "Reach Boost 2",
      "Upgrade your main Skills"
    ],
  },

  {
    title: "Have Fun",
    summary:
      "Winning is important, but do not forget to enjoy the game.",
    paragraphs: [
      "Reaching SS is a useful first goal, but it does not have to be the only reason you play. Try different characters, roles, and Medal Sets, and find the playstyle you enjoy."
    ],
    bullets: [],
  },
];
