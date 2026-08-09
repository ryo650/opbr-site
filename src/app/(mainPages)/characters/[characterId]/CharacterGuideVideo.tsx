"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function CharacterGuideVideo({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const playVideo = () => {
      video.muted = true;
      void video.play().catch(() => {
        // Autoplay can still be blocked by the browser. Controls remain available.
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        if (entry.intersectionRatio >= 0.5 && !reducedMotion.matches) {
          playVideo();
        }
      },
      { threshold: [0, 0.5] },
    );

    const handleReducedMotionChange = () => {
      if (reducedMotion.matches) video.pause();
    };

    observer.observe(video);
    reducedMotion.addEventListener("change", handleReducedMotionChange);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      controls
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  );
}
