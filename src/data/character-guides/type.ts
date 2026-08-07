export type Rating = 1 | 2 | 3 | 4 | 5;

export type GuidePoint = {
    title: string;
    description: string;
};

type GuideLinks = {
    label: string;
    href: string;
}

export type GuideOverview = {
    title?: string;
    description?: string;
    links?: GuideLinks[];
}

export type CharacterOverview = {
    hp: number;
    attack: number;
    defense: number;
};

export type NormalAttackGuide = {
    label: string;
    form?: string;
    video?: string;
    tips: string[];
};

export type SkillVariant = {
    label: string;
    video?: string;
    details?: string[];
};

{/*labelはスキルの変化の条件、状態を表すもの、ev,comboなど */ }
export type CharacterSkill = {
    slot: 1 | 2;
    label: string;
    name: string;
    cooldown?: number;
    video?: string;
    quickTips: string[];
    details: string[];
    variants?: SkillVariant[];
};

{/*displayTypeによって表示方式で区別する
    tabGroupはevスキルcomboスキル、フォーム、ダブルキャラなど、
    見せ方の種類を決めるグループ*/}
export type SkillGroup = {
    id?: string;
    label?: string;
    displayType?: "default" | "section" | "tab";
    tabGroup?: string;
    skills: CharacterSkill[];
};

export type CounterMatchup = {
    characterId: string;
    difficulty: Rating;
    whyDifficult: string[];
    howToRespond?: string[];
};

export type StrongAgainstMatchup = {
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

    guideOverview?: GuideOverview;

    overview?: CharacterOverview;
    quickStrengths: string[];
    quickWeaknesses: string[];
    strengths?: GuidePoint[];
    weaknesses?: GuidePoint[];
    normalAttacks?: NormalAttackGuide[];
    skillGroups?: SkillGroup[];
    howToPlay?: GuidePoint[];
    counters?: CounterMatchup[];
    strongAgainst?: StrongAgainstMatchup[];
};
