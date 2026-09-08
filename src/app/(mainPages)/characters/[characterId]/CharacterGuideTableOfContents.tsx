"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export type TableOfContentsItem = {
  id: string;
  label: string;
};

export default function CharacterGuideTableOfContents({ items }: { items: TableOfContentsItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    const nav = navRef.current;
    const layout = nav?.parentElement;
    if (!nav || !layout) return;

    const updateTocHeight = () => layout.style.setProperty("--guide-toc-height", `${nav.offsetHeight}px`);
    const observer = new ResizeObserver(updateTocHeight);
    updateTocHeight();
    observer.observe(nav);

    return () => {
      observer.disconnect();
      layout.style.removeProperty("--guide-toc-height");
    };
  }, []);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const updateActiveSection = () => {
      const activationLine = Math.min(180, window.innerHeight * 0.3);
      const visibleSection = [...sections]
        .reverse()
        .find((section) => section.getBoundingClientRect().top <= activationLine);
      setActiveId(visibleSection?.id ?? sections[0]?.id ?? "");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [items]);

  useEffect(() => {
    const link = linkRefs.current.get(activeId);
    const list = navRef.current?.querySelector("ol");
    if (!link || !list || list.scrollWidth <= list.clientWidth) return;
    // Scroll only the horizontal list; scrollIntoView also moves the article.
    const linkBounds = link.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    list.scrollTo({
      left: list.scrollLeft + linkBounds.left - listBounds.left - (list.clientWidth - linkBounds.width) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [activeId]);

  return (
    <nav ref={navRef} className={styles.toc} aria-label="Table of contents">
      <p className={styles.eyebrow}>On this page</p>
      <ol>
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              ref={(element) => {
                if (element) linkRefs.current.set(id, element);
                else linkRefs.current.delete(id);
              }}
              href={`#${id}`}
              className={activeId === id ? styles.tocActive : undefined}
              aria-current={activeId === id ? "location" : undefined}
              onClick={(event) => {
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                event.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                window.history.pushState(null, "", `#${id}`);
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
