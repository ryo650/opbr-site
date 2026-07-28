import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { characterGuides } from "@/data/character-guides";
import { characters } from "@/data/characters";
import CharacterGuidePage from "./CharacterGuidePage";

type Props = { params: Promise<{ characterId: string }> };

function resolveGuide(characterId: string) {
  const character = characters[characterId];
  const guide = characterGuides[characterId];
  if (!character || !guide) notFound();
  return { character, guide };
}

export function generateStaticParams() {
  return Object.keys(characterGuides).map((characterId) => ({ characterId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { characterId } = await params;
  const { character } = resolveGuide(characterId);
  const title = `${character.name} Guide, Skills, Counters and Matchups | Any Lantern`;
  const description = `Learn how to play ${character.name}, including stats, skills, strengths, weaknesses, counters, and favorable matchups in One Piece Bounty Rush.`;
  return { title: { absolute: title }, description, openGraph: { title, description, images: [{ url: character.image, alt: character.name }] } };
}

export default async function Page({ params }: Props) {
  const { characterId } = await params;
  const { character, guide } = resolveGuide(characterId);
  const matchupIds = [...(guide.counters ?? []), ...(guide.strongAgainst ?? [])].map((matchup) => matchup.characterId);
  const matchupCharacters = Object.fromEntries(matchupIds.map((id) => {
    const matchupCharacter = characters[id];
    if (!matchupCharacter) throw new Error(`Character guide matchup not found: ${id}`);
    return [id, matchupCharacter];
  }));
  return <CharacterGuidePage character={character} guide={guide} matchupCharacters={matchupCharacters} />;
}
