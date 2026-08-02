export type CharacterUsageSnapshot = {
    date: string;
    targetPlayers: number;
    usage: Record<string, number>;
};
