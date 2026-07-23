import Image from "next/image";
import Link from "next/link";
import { scouts } from "@/data/scouts";
import type { ScoutBanner } from "@/data/scouts/type";
import styles from "./page.module.css";

export const revalidate = 3600;

type ScoutStatus =
  | "upcoming"
  | "current"
  | "past";

function getScoutStatus(
  scout: ScoutBanner,
  now: Date,
): ScoutStatus {
  const startAt = new Date(scout.startAt);
  const endAt = new Date(scout.endAt);

  if (now < startAt) {
    return "upcoming";
  }

  if (now <= endAt) {
    return "current";
  }

  return "past";
}

function formatScoutDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function ScoutCard({
  scout,
  status,
}: {
  scout: ScoutBanner;
  status: ScoutStatus;
}) {
  return (
    <Link
      className={styles.scoutCard}
      href={`/scout-simulator/${scout.id}`}
    >
      <div className={styles.banner}>
        <Image
          src={scout.bannerImg}
          alt={`${scout.name} banner`}
          fill
          sizes="(max-width: 700px) calc(100vw - 32px), 360px"
          className={styles.bannerImage}
        />

        <span
          className={`${styles.status} ${styles[status]}`}
        >
          {status === "current" && "Available Now"}
          {status === "upcoming" && "Coming Soon"}
          {status === "past" && "Ended"}
        </span>
      </div>

      <div className={styles.cardContent}>
        <h3>{scout.name}</h3>

        <p className={styles.period}>
          {formatScoutDate(scout.startAt)}
          {" – "}
          {formatScoutDate(scout.endAt)}
        </p>

        <span className={styles.openLink}>
          Open Simulator
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function ScoutSection({
  title,
  description,
  scouts,
  emptyMessage,
}: {
  title: string;
  description?: string;
  scouts: ScoutBanner[];
  emptyMessage: string;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>

        <span>{scouts.length}</span>
      </div>

      {scouts.length > 0 ? (
        <div className={styles.scoutGrid}>
          {scouts.map((scout) => (
            <ScoutCard
              key={scout.id}
              scout={scout}
              status={getScoutStatus(
                scout,
                new Date(),
              )}
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyMessage}>
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export default function ScoutSimulatorListPage() {
  const now = new Date();

  const currentScouts = scouts
    .filter(
      (scout) =>
        getScoutStatus(scout, now) === "current",
    )
    .sort(
      (a, b) =>
        new Date(a.endAt).getTime() -
        new Date(b.endAt).getTime(),
    );

  const upcomingScouts = scouts
    .filter(
      (scout) =>
        getScoutStatus(scout, now) === "upcoming",
    )
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() -
        new Date(b.startAt).getTime(),
    );

  const pastScouts = scouts
    .filter(
      (scout) =>
        getScoutStatus(scout, now) === "past",
    )
    .sort(
      (a, b) =>
        new Date(b.endAt).getTime() -
        new Date(a.endAt).getTime(),
    );

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            OPBR SCOUT
          </p>

          <h1>Scout Simulator</h1>

          <p className={styles.description}>
            Try OPBR scouts with rates based on
            the in-game drop rate information.
            Track your pulls, diamonds spent, and
            featured character results.
          </p>
        </header>

        <ScoutSection
          title="Current Scouts"
          description="Scouts currently available in OPBR."
          scouts={currentScouts}
          emptyMessage="There are no active scouts right now."
        />

        <ScoutSection
          title="Upcoming Scouts"
          description="Announced scouts that will become available soon."
          scouts={upcomingScouts}
          emptyMessage="There are no announced upcoming scouts."
        />

        <ScoutSection
          title="Past Scouts"
          description="Previously available scout simulators."
          scouts={pastScouts}
          emptyMessage="Past scouts will appear here."
        />
      </div>
    </main>
  );
}
