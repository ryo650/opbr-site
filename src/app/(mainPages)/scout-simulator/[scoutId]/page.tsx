
import { notFound } from "next/navigation";
import { scouts } from "@/data/scouts";
import ScoutSimulator from "./ScoutSimulator";

export const dynamicParams = false;

export function generateStaticParams() {
  return scouts.map((scout) => ({
    scoutId: scout.id,
  }));
}

export default async function ScoutSimulatorPage({
  params,
}: {
  params: Promise<{ scoutId: string }>;
}) {
  const { scoutId } = await params;
  const scout = scouts.find((item) => item.id === scoutId);

  if (!scout) {
    notFound();
  }

  return <ScoutSimulator scout={scout} />;
}
