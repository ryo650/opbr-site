import { characters } from "@/data/characters";
import type { CharacterUsageSnapshot } from "@/data/character-usage/type";

export function createCharacterUsageRanking(
    snapshot: CharacterUsageSnapshot,
) {
    const recordedSlots = Object.values(snapshot.usage).reduce(
        (total, count) => total + count,
        0,
    );

    const estimatedPlayers = recordedSlots / 2;
    
    return Object.entries(snapshot.usage)
        .map(([characterId, count]) => {
            const character = characters[characterId];

            if (!character) {
                throw new Error(
                    `Character not found: ${characterId}`,
                );
            }

            return {
                character,
                count,
                usageRate: 
                    estimatedPlayers > 0
                    ? (count / estimatedPlayers) * 100
                    : 0,
            };
        })
        .sort((a, b) => b.count - a.count)
        .map((item, index) => ({
            ...item,
            rank: index + 1,
        }));
}
