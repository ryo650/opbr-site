"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function CharacterGuideVideo({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const silenceVideo = () => {
      video.defaultMuted = true;
      if (!video.muted) video.muted = true;
      if (video.volume !== 0) video.volume = 0;
    };

    const playVideo = () => {
      silenceVideo();
      void video.play().catch(() => {
        // Muted inline autoplay is widely supported, but playback can still be
        // blocked by a browser or OS policy. A later intersection retries it.
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        playVideo();
      },
      { threshold: 0 },
    );

    observer.observe(video);
    silenceVideo();
    video.addEventListener("volumechange", silenceVideo);

    return () => {
      observer.disconnect();
      video.removeEventListener("volumechange", silenceVideo);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      autoPlay
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="none"
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  );
}
