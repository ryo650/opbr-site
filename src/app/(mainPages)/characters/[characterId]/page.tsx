import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { characterGuides } from "@/data/character-guides";
import { characters } from "@/data/characters";
import { SITE_URL } from "@/lib/site";
import CharacterGuidePage from "./CharacterGuidePage";

type Props = { params: Promise<{ characterId: string }> };

function resolveGuide(characterId: string) {
  if (!Object.hasOwn(characters, characterId) || !Object.hasOwn(characterGuides, characterId)) notFound();
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
  const title = `${character.name} Guide, Skills, Counters and Matchups`;
  const description = `Learn how to play ${character.name}, including stats, skills, strengths, weaknesses, counters, and favorable matchups in One Piece Bounty Rush.`;
  const url = `/characters/${characterId}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: character.image, alt: character.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [character.image],
    },
  };
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `${character.name} Guide`,
        item: `${SITE_URL}/characters/${characterId}`,
      },
    ],
  };

  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
      }}
    />
    <CharacterGuidePage character={character} guide={guide} matchupCharacters={matchupCharacters} />
  </>;
}
