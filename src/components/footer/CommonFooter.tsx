import Link from "next/link";
import styles from "./CommonFooter.module.css";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export default function CommonFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>OPBR Guide</p>
        <nav className={styles.links} aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className={styles.disclaimer}>
          An unofficial fan site for ONE PIECE Bounty Rush players.
        </p>
      </div>
    </footer>
  );
}
