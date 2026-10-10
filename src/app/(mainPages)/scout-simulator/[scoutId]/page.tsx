
import { notFound } from "next/navigation";
import { simulatorScouts as scouts } from "@/data/scouts/simulator-registry";
import { getScoutSummary } from "@/data/scouts/simulator-type";
import { characters } from "@/data/characters";
import StepUpSimulator from "@/components/scout-step-up/StepUpSimulator";
import ScoutSimulator from "./ScoutSimulator";

export function generateStaticParams() {
  return scouts.map((scout) => ({
    scoutId: getScoutSummary(scout).id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ scoutId: string }> }) {
  const { scoutId } = await params;
  const scout = scouts.find((item) => getScoutSummary(item).id === scoutId);
  if (!scout) notFound();
  const summary = getScoutSummary(scout);
  const title = `${summary.name} Scout Simulator`;
  const description = scout.kind === "normal"
    ? `Simulate single and multi pulls for ${summary.name} in One Piece Bounty Rush.`
    : `Simulate Step-Up pulls for ${summary.name} in One Piece Bounty Rush.`;
  return { title, description, alternates: { canonical: `/scout-simulator/${scoutId}` }, openGraph: { title, description, images: [{ url: summary.bannerImg, alt: summary.name }] } };
}

export default async function ScoutSimulatorPage({
  params,
}: {
  params: Promise<{ scoutId: string }>;
}) {
  const { scoutId } = await params;
  const scout = scouts.find((item) => getScoutSummary(item).id === scoutId);

  if (!scout) {
    notFound();
  }

  switch (scout.kind) {
    case "normal": return <ScoutSimulator scout={scout.legacy} />;
    case "stepUp": return <StepUpSimulator definition={scout} characters={characters} />;
    default: throw new Error("Unsupported scout kind");
  }
}
