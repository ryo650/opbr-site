import type { Metadata } from "next";
import { medals } from "@/data/medals";
import MedalBuilder from "@/components/medal-builder/MedalBuilder";

export const metadata: Metadata = { title: "Medal Builder | OPBR Guide", description: "Build and analyze an OPBR medal set." };

export default function MedalBuilderPage() {
  return <MedalBuilder medals={medals} />;
}
