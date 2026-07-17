"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe2, MenuIcon } from "lucide-react";
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
  { href: "/scout-simulator", label: "Scout Simulator" },
];

export default function CommonHeader() {
  const [isHidden, setIsHidden] = useState(false);
  const previousScrollY = useRef(0);

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
      className={`${styles.header} ${isHidden ? styles.headerHidden : ""}`}
    >
      {/* 現在の .surface 以下はそのまま */}
      <div className={styles.surface}>
        <div className={styles.menu}>
          <DropdownMenu>
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
            <DropdownMenuContent className={styles.menuContent}>
              {navigationItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
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
