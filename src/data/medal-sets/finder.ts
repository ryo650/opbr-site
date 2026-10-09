import type { Medal, MedalTag } from "../medals/types";
import type { UniqueTraitCategoryId } from "../medals/unique-trait-categories";

export type FinderMode = "all" | "tag" | "trait" | "hybrid";

export type FinderCriteria = {
  readonly mode: FinderMode;
  readonly minTags: number;
  readonly purposeId: UniqueTraitCategoryId | null;
};

export type IndexedMedal = {
  readonly medal: Medal;
  readonly tagIds: ReadonlySet<string>;
  readonly purposes: ReadonlySet<UniqueTraitCategoryId>;
};

export type FinderCandidate = {
  readonly medal: Medal;
  readonly commonTagCount: number;
  readonly completionCount: number | null;
};

// "cooldown" is a broad classification: a Skill 1 medal and a Skill 2 medal
// must not be treated as having the same specific purpose just because both
// are cooldown-related.
function normalizePurposes(ids: readonly UniqueTraitCategoryId[]): ReadonlySet<UniqueTraitCategoryId> {
  const result = new Set(ids);
  if (result.has("skill-1") || result.has("skill-2")) result.delete("cooldown");
  return result;
}

export function createFinderIndex(
  medals: readonly Medal[],
  categoriesByMedalId: Readonly<Record<string, readonly UniqueTraitCategoryId[]>>,
): IndexedMedal[] {
  return medals.map((medal) => ({
    medal,
    tagIds: new Set(medal.tags.map((tag) => tag.id)),
    purposes: normalizePurposes(categoriesByMedalId[medal.id] ?? []),
  }));
}

// Remove only the chosen medal, then keep the remaining selections in order.
// Packing left preserves the step-by-step selection flow without clearing later medals.
export function removeMedalFromSlots(
  slots: readonly [string | null, string | null, string | null],
  index: number,
): [string | null, string | null, string | null] {
  if (!Number.isInteger(index) || index < 0 || index > 2 || slots[index] === null) {
    return [...slots];
  }
  const remaining = slots.filter((id, position): id is string => position !== index && id !== null);
  return [remaining[0] ?? null, remaining[1] ?? null, remaining[2] ?? null];
}

export function getCommonTagCount(items: readonly IndexedMedal[]): number {
  if (!items.length) return 0;
  let count = 0;
  for (const tagId of items[0].tagIds) {
    if (items.every((item) => item.tagIds.has(tagId))) count++;
  }
  return count;
}

export function getCommonTags(medals: readonly Medal[]): MedalTag[] {
  if (!medals.length) return [];
  return medals[0].tags.filter((tag) =>
    medals.every((medal) => medal.tags.some((other) => other.id === tag.id)),
  );
}

export function getSharedPurposes(items: readonly IndexedMedal[]): {
  id: UniqueTraitCategoryId;
  count: number;
}[] {
  const counts = new Map<UniqueTraitCategoryId, number>();
  for (const item of items) {
    for (const id of item.purposes) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

export function requiredCommonTags(criteria: FinderCriteria): number {
  const threshold = criteria.mode === "tag" || criteria.mode === "hybrid" ? 4 : 2;
  return Math.max(threshold, Math.max(0, Math.floor(criteria.minTags)));
}

export function matchesCompletedSet(
  items: readonly IndexedMedal[],
  criteria: FinderCriteria,
): boolean {
  if (items.length !== 3 || new Set(items.map((item) => item.medal.id)).size !== 3) return false;
  if (getCommonTagCount(items) < requiredCommonTags(criteria)) return false;
  const needsPurpose = criteria.mode === "trait" || criteria.mode === "hybrid" || criteria.purposeId !== null;
  if (!needsPurpose) return true;
  const shared = getSharedPurposes(items);
  return criteria.purposeId === null
    ? shared.length > 0
    : shared.some((entry) => entry.id === criteria.purposeId);
}

// Each result is ONE next medal, never a generated 3-medal set list.
// For slot 2, require at least one possible slot 3 so the user cannot hit a
// dead end. For slot 3, evaluate the completed trio directly.
export function findNextMedals(
  index: readonly IndexedMedal[],
  selectedMedalIds: readonly string[],
  criteria: FinderCriteria,
): FinderCandidate[] {
  const selectedIds = new Set(selectedMedalIds);
  if (selectedIds.size !== selectedMedalIds.length || selectedIds.size >= 3) return [];
  const byId = new Map(index.map((item) => [item.medal.id, item]));
  const selected = selectedMedalIds.map((id) => byId.get(id));
  if (selected.some((item) => !item)) return [];
  const chosen = selected.filter((item): item is IndexedMedal => Boolean(item));

  if (!chosen.length) {
    return index.map(({ medal }) => ({ medal, commonTagCount: 0, completionCount: null }))
      .sort((a, b) => a.medal.name.localeCompare(b.medal.name));
  }

  const results: FinderCandidate[] = [];
  const minTags = requiredCommonTags(criteria);

  for (const candidate of index) {
    if (selectedIds.has(candidate.medal.id)) continue;
    const pairOrTrio = [...chosen, candidate];
    const commonTagCount = getCommonTagCount(pairOrTrio);
    if (commonTagCount < minTags) continue;

    if (chosen.length === 2) {
      if (matchesCompletedSet(pairOrTrio, criteria)) {
        results.push({ medal: candidate.medal, commonTagCount, completionCount: null });
      }
      continue;
    }

    let completionCount = 0;
    for (const last of index) {
      if (last.medal.id === chosen[0].medal.id || last.medal.id === candidate.medal.id) continue;
      if (matchesCompletedSet([...pairOrTrio, last], criteria)) completionCount++;
    }
    if (completionCount > 0) {
      results.push({ medal: candidate.medal, commonTagCount, completionCount });
    }
  }

  return results.sort((a, b) =>
    b.commonTagCount - a.commonTagCount ||
    a.medal.name.localeCompare(b.medal.name) ||
    a.medal.id.localeCompare(b.medal.id),
  );
}
