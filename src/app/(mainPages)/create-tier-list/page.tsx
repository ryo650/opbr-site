import CreateTierList from "@/components/create-tier-list/CreateTierList";
import styles from "./page.module.css";

export const metadata = {
  title: "Create OPBR Tier List",
  description: "Create and arrange your own One Piece Bounty Rush character tier list.",
};

export default function CreateTierListPage() {
  return (
    <main className={styles.page}>
      <CreateTierList />
    </main>
  );
}
