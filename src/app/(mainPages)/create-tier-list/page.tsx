import CreateTierList from "@/components/create-tier-list/CreateTierList";
import styles from "./page.module.css";

export const metadata = {
  alternates: { canonical: "/create-tier-list" },
  title: "Create OPBR Tier List",
  description: "Create and arrange your own One Piece Bounty Rush character tier list.",
};

export default function CreateTierListPage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <CreateTierList />
    </main>
  );
}
