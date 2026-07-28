export type GuidePoint = {
  title: string;
  description: string;
};

export type CharacterAttack = {
  label?: string;
  video?: string;
};

export type CharacterSkill = {
  name: string;
  description: string;
  cooldown?: number;
  video?: string;
  quickTips?: string[];
};

export type CharacterCounter = {
  characterId: string;
  reason: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
};

export type CharacterAdvantage = {
  characterId: string;
  reason: string;
  advantage: 1 | 2 | 3 | 4 | 5;
};

export type CharacterGuide = {
  characterId: string;
  overview?: {
    hp: number;
    attack: number;
    defense: number;
  };
  strengths?: GuidePoint[];
  weaknesses?: GuidePoint[];
  normalAttacks?: CharacterAttack[];
  skills?: CharacterSkill[];
  howToPlay?: GuidePoint[];
  counters?: CharacterCounter[];
  strongAgainst?: CharacterAdvantage[];
};
