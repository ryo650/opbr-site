import type { Metadata } from "next";
import GuideArticle, {
  type GuideSectionTreatment,
} from "@/components/guides/GuideArticle";
import {
  supportGuideIntro,
  supportGuideSections,
} from "@/data/support-guide";

export const metadata: Metadata = {
  alternates: { canonical: "/support-guide" },
  title: "Support Guide",
  description:
    "Learn how to build Support efficiently and work toward 130%+ Support in ONE PIECE Bounty Rush.",
  robots: { index: false, follow: true },
};

const sectionTreatments: Partial<Record<number, GuideSectionTreatment>> = {
  1: "target",
  2: "milestones",
  3: "milestones",
  4: "milestones",
  6: "extendable",
};

export default function SupportGuidePage() {
  return (
    <GuideArticle
      intro={supportGuideIntro}
      sections={supportGuideSections}
      treatments={sectionTreatments}
    />
  );
}
