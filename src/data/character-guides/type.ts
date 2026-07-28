type GuidePoint = {
    title: string;
    description: string;
}

type CharacterAttack = {
    normalattack: string;
    video?: string;
}

type CharacterSkill = {
    name: string;
    description: string;
    cooldown?: number;
    image?: string;
    video?: string;

    quicktips?: string[]
}

type MedalSet = {
    title: string;
    medals: string[];
    description: string;
}

type SupportTags = {
    tag: string;
    reason: string
}

type HowToPlay = {
    title: string;
    description: string;
    image?: string;
    video?: string;
}

type Counters = {
    characterId: string;
    reason: string;
    difficulty: 1 | 2 | 3 | 4 | 5
    video?: string;
}

type StrongAgainst = {
    characterId: string;
    reason: string;
    advantage: 1 | 2 | 3 | 4 | 5
    video?: string;
}

type KeyTraits = {
    title: string;
    description: string;
}


export type CharacterGuide = {
    characterId: string;
    overview: {
        hp: number,
        attack: number,
        defense: number,
    };
    strengths: GuidePoint[];
    weakness: GuidePoint[];
    normalattacks: CharacterAttack[];
    skills: CharacterSkill[];


    howtoplay: HowToPlay[];
    counters: Counters[];
    strongagainst:StrongAgainst[];
}
