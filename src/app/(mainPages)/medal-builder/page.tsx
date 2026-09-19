import type { Metadata } from "next";
import { medals } from "@/data/medals";
import MedalBuilder from "@/components/medal-builder/MedalBuilder";

export const metadata: Metadata = {
  alternates: { canonical: "/medal-builder" },
  title: "Medal Builder | OPBR",
  description: "Build and compare an OPBR medal set using the complete medal catalog.",
};

type Props = {
  searchParams: Promise<{ medals?: string | string[] }>;
};

export default async function MedalBuilderPage({ searchParams }: Props) {
  const value = (await searchParams).medals;
  const requestedMedalIds = (Array.isArray(value) ? value[0] : value)
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <MedalBuilder
      key={requestedMedalIds?.join(",") ?? "empty"}
      medals={medals}
      initialMedalIds={requestedMedalIds}
    />
  );
}
