import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MedalSetDetail from "@/components/medal-sets/MedalSetDetail";
import { createMedalById, recommendedMedalSets, resolveMedalSetSlots } from "@/data/medal-sets";
import { medals } from "@/data/medals";

type Props = { params: Promise<{ id: string }> };

const medalSetById = new Map(recommendedMedalSets.map((set) => [set.id, set]));
const medalById = createMedalById(medals);

function resolveMedalSet(id: string) {
  const set = medalSetById.get(id);
  if (!set) notFound();
  return set;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return recommendedMedalSets.map((set) => ({ id: set.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const set = resolveMedalSet(id);
  const title = `${set.name} | OPBR Medal Sets`;
  const description = set.description
    ?? `${set.name} is a recommended three-medal combination for One Piece Bounty Rush.`;
  return {
    title,
    description,
    alternates: { canonical: `/medal-sets/${set.id}` },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const set = resolveMedalSet(id);
  const slots = resolveMedalSetSlots(set, medalById);
  return <MedalSetDetail set={set} slots={slots} />;
}
