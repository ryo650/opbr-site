import type { Metadata } from "next";
import GuideArticle, {
  type GuideSectionTreatment,
} from "@/components/guides/GuideArticle";
import {
  basicGameplayGuideIntro,
  basicGameplayGuideSections,
} from "@/data/basic-gameplay-guide";

export const metadata: Metadata = {
  alternates: { canonical: "/basic-gameplay-guide" },
  title: "Basic Gameplay Guide",
  description:
    "Learn Treasure control, roles, matchups, timing, and decision-making for League Battle in ONE PIECE Bounty Rush.",
  robots: { index: false, follow: true },
};

const sectionTreatments: Partial<Record<number, GuideSectionTreatment>> = {
  1: "target",
  2: "attacker",
  3: "runner",
  4: "defender",
  6: "boost",
};

export default function BasicGameplayGuidePage() {
  return (
    <GuideArticle
      intro={basicGameplayGuideIntro}
      sections={basicGameplayGuideSections}
      treatments={sectionTreatments}
    />
  );
}
