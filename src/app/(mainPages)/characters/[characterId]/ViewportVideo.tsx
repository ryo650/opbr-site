"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

type ViewportVideoProps = {
  src: string;
  label: string;
};

export default function ViewportVideo({ src, label }: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isSufficientlyVisible = false;

    const playIfAllowed = () => {
      if (isSufficientlyVisible && !reducedMotion.matches) {
        void video.play().catch(() => {
          // Autoplay can still be rejected by browser or device policy.
        });
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isSufficientlyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        playIfAllowed();
      },
      { threshold: 0.5 },
    );

    const handleMotionPreference = () => playIfAllowed();

    observer.observe(video);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      controls
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  );
}
