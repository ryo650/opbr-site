type Rating = 1 | 2 | 3 | 4 | 5;

type GuidePoint = {
    title: string;
    description: string;
};

type CharacterOverview = {
    hp: number;
    attack: number;
    defense: number;
};

type NormalAttackGuide = {
    label: string;
    form?: string;
    video?: string;
    tips: string[];
};

type SkillVariant = {
    label: string;
    video?: string;
    details?: string[];
};

{/*labelはスキルの変化の条件、状態を表すもの、ev,comboなど */ }
type CharacterSkill = {
    slot: 1 | 2;
    label: string;
    name: string;
    cooldown?: number;
    quickTips: string[];
    variants?: SkillVariant[];
};

{/*displayTypeによって表示方式で区別する*/}
type SkillGroup = {
    id: string;
    label: string;
    displayType: "default"| "section"| "tab";
    tabGroup?: string;
    skills: CharacterSkill[];
}

type CounterMatchup = {
    characterId: string;
    difficulty: Rating;
    whyDifficult: string[];
    howToRespond?: string[];
};

type StrongAgainstMatchup = {
    characterId: string;
    advantage: Rating;
    whyYouWin: string[];
    watchOut?: string[];
};

export type CharacterGuide = {
    characterId: string;

    notice?: {
        title: string;
        description: string;
    };

    overview?: CharacterOverview;
    strengths?: GuidePoint[];
    weaknesses?: GuidePoint[];
    normalAttacks?: NormalAttackGuide[];
    skills?: SkillGroup[];
    howToPlay?: GuidePoint[];
    counters?: CounterMatchup[];
    strongAgainst?: StrongAgainstMatchup[];
};
