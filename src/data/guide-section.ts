export type DraftGuideSection = {
  title: string;
  draftJa: string;
  summary: string;
  paragraphs: string[];
  bullets: string[];
  image?: {
    src: string;
    alt: string;
  };
  callout?: {
    title: string;
    text: string;
  };
  terms?: string[];
};

export type GuideIntro = {
  eyebrow: string;
  title: string;
  description: string;
  target?: string;
  targetLabel?: string;
};
