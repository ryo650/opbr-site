import Link from "next/link";
import type { ReactNode } from "react";
import { hasCharacterGuide } from "@/data/character-guides";
import styles from "./CharacterGuideLink.module.css";

type CharacterGuideLinkProps = {
  characterId: string;
  characterName: string;
  children: ReactNode;
  className?: string;
  fallbackClassName?: string;
};

export default function CharacterGuideLink({
  characterId,
  characterName,
  children,
  className,
  fallbackClassName,
}: CharacterGuideLinkProps) {
  if (!hasCharacterGuide(characterId)) {
    return fallbackClassName
      ? <div className={fallbackClassName}>{children}</div>
      : children;
  }

  const linkClassName = [styles.link, className].filter(Boolean).join(" ");

  return (
    <Link
      href={`/characters/${characterId}`}
      className={linkClassName}
      aria-label={`View ${characterName} character guide`}
    >
      {children}
    </Link>
  );
}
