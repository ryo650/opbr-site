"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import styles from "./CommonHeader.module.css";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/character-usage", label: "Character Usage" },
  { href: "/scout-simulator", label: "Scout Simulator" },
  { href: "/create-tier-list", label: "Create Tier List"},
];

export default function CommonHeader() {
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const headerHeight = useRef(0);
  const previousScrollY = useRef(0);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      headerHeight.current = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--site-header-height", `${headerHeight.current}px`);
      if (!header.classList.contains(styles.headerHidden)) {
        document.documentElement.style.setProperty("--site-header-visible-height", `${headerHeight.current}px`);
      }
    };
    const observer = new ResizeObserver(updateHeaderHeight);
    updateHeaderHeight();
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--site-header-visible-height",
      isHidden ? "0px" : `${headerHeight.current}px`,
    );
  }, [isHidden]);

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - previousScrollY.current;

      // ページ最上部では必ず表示
      if (currentScrollY <= 16) {
        setIsHidden(false);
      } else if (difference > 6) {
        // 下へスクロール
        setIsHidden(true);
        setIsMenuOpen(false);
      } else if (difference < -6) {
        // 上へスクロール
        setIsHidden(false);
      }

      previousScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isHidden ? styles.headerHidden : ""}`}
    >
      {/* 現在の .surface 以下はそのまま */}
      <div className={styles.surface}>
        <div className={styles.menu}>
          <DropdownMenu 
            modal={false}
            open={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={styles.menuButton}
                aria-label="Open navigation menu"
              >
                <MenuIcon aria-hidden="true" />
                <span>Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={styles.menuContent} onCloseAutoFocus={(event) => event.preventDefault()}>
              {navigationItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild className={styles.menuItem}>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href="/" className={styles.logoWrap} aria-label="OPBR Guide home">
          <span className={styles.logoHalo} aria-hidden="true" />
          <Image
            src="/favicon-gold-b.png"
            alt="OPBR Guide"
            width={72}
            height={72}
            className={styles.logo}
            priority
          />
        </Link>

        {/*
        <Link href="/" className={styles.languageButton} aria-label="Switch language to English">
          <Globe2 aria-hidden="true" />
          <span>EN</span>
        </Link>
        */}
      </div>
    </header>
  );
}
