import type { CharacterGuide } from "./type";

export const stMarcusMarsGuide: CharacterGuide = {
  characterId: "the-five-elders-st-marcus-mars",

  notice: {
    title: "Early Guide",
    description:
      "This guide is based on currently available information and may be updated after St. Marcus Mars is released and tested in actual matches.",
  },

  overview: {
    hp: 10095,
    attack: 1981,
    defense: 2418,
  },

  strengths: [
    {
      title: "High Survivability",
      description:
        "Mars is one of the tankiest characters in the game. His DEF can increase by up to 70% while attacking enemies, and his Boost Trait allows him to fully recover and revive after receiving a fatal attack by consuming the Power Gauge.",
    },
    {
      title: "Strong Against Meta Characters",
      description:
        "Mars has traits designed to counter several top meta characters. He takes 50% less damage from characters such as Zoro & Sanji and Nusjuro while also reducing their ATK.",
    },
    {
      title: "Excellent Treasure Capture",
      description:
        "Mars can capture treasure without directly touching the flag, allowing him to bypass obstacles such as Whitebeard's walls. He can also use a skill while capturing to push enemies away.",
    },
  ],

  weaknesses: [
    {
      title: "Slow Treasure Capture",
      description:
        "Mars does not have a trait that directly increases treasure capture speed. He may need medal sets or support tags to capture flags more quickly.",
    },
    {
      title: "Limited Power Gauge at the Start",
      description:
        "Unlike Nusjuro or Saturn, Mars does not begin the match with two Power Gauge stocks. This prevents him from fully using his revive mechanic during the early stages of the battle.",
    },
  ],
};
