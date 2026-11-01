import type { ReactNode } from "react";
import Image from "next/image";
import type { Medal } from "@/data/medals";
import { getMedalArtworkTransform } from "./medal-artwork-transform";
import styles from "./MedalArtwork.module.css";

type Props = {
  medal: Pick<Medal, "id">;
  sizes: string;
  alt?: string;
  className?: string;
  eager?: boolean;
  children?: ReactNode;
};

export default function MedalArtwork({
  medal,
  sizes,
  alt = "",
  className,
  eager = false,
  children,
}: Props) {
  const { translateX, translateY, scale } = getMedalArtworkTransform(medal.id);

  return (
    <span className={`${styles.artwork}${className ? ` ${className}` : ""}`} data-medal-art>
      <span className={styles.viewport}>
        <Image
          src={`/medals/${medal.id}.webp`}
          alt={alt}
          fill
          sizes={sizes}
          style={{ transform: `translate(${translateX}%, ${translateY}%) scale(${scale})` }}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          fetchPriority={eager ? "high" : undefined}
          draggable={false}
        />
        {children}
      </span>
    </span>
  );
}
