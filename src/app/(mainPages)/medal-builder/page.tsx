import type { Metadata } from "next";
import { medals } from "@/data/medals";
import MedalBuilder from "@/components/medal-builder/MedalBuilder";

export const metadata: Metadata = {
  title: "Medal Builder | OPBR",
  description: "Build and compare an OPBR medal set using the complete medal catalog.",
};

export default function MedalBuilderPage() {
  return <MedalBuilder medals={medals} />;
}
