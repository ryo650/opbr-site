import type { Metadata } from "next";
import MedalSets from "@/components/medal-sets/MedalSets";
import { recommendedMedalSets } from "@/data/medal-sets";
import { medals } from "@/data/medals";

export const metadata: Metadata = {
  alternates: { canonical: "/medal-sets" },
  title: "Medal Sets | OPBR",
  description: "Find recommended OPBR medal combinations for different playstyles.",
};

export default function Page() {
  return <MedalSets medals={medals} sets={recommendedMedalSets} />;
}
