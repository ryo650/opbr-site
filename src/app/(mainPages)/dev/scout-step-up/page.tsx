import { notFound } from "next/navigation";
import { connection } from "next/server";
import StepUpSimulator from "@/components/scout-step-up/StepUpSimulator";

export const metadata = { title: "Development Step-Up Fixture", robots: { index: false, follow: false } };
export default async function StepUpPreviewPage() {
  await connection();
  if (process.env.NODE_ENV !== "development") notFound();
  const { stepUpDemo, demoCharacters } = await import("@/data/scouts/fixtures/step-up-demo");
  return <StepUpSimulator definition={stepUpDemo} characters={demoCharacters} />;
}
