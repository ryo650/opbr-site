import Image from "next/image";
import Link from "next/link";
import styles from "./LinkCard.module.css";

type LinkCardProps = {
  title: string;
  description: string;
  href: string;
  image: string;
  buttonText?: string;
  variant?: "large" | "normal";
};

export default function LinkCard({ title, description, href, image, buttonText, variant = "normal" }: LinkCardProps) {
  return (
    <Link href={href} className= {`${styles.card} ${styles[variant]}`}>
      <Image src={image} alt="" fill className={styles.image} />

        <div className={styles.overlay} />
        
        <div className={styles.container}>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className={styles.button}>{buttonText}</span>
        </div>
    </Link>
  )
}
