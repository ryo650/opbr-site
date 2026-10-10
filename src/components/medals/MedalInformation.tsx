import type { Medal } from "@/data/medals";
import styles from "./MedalInformation.module.css";

const nativeTraitLabels = { atk: "ATK", def: "DEF", hp: "HP", crit: "CRIT" } as const;

function formatId(value: string): string {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Section({ title, values, text }: {
  title: string;
  values?: readonly string[];
  text?: string;
}) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      {text !== undefined
        ? <p>{text || "None"}</p>
        : values?.length
          ? <div className={styles.pills}>{values.map((value, index) =>
              <span key={value + ":" + index}>{value}</span>)}</div>
          : <em className={styles.none}>None</em>}
    </section>
  );
}

/** Shared, read-only medal facts for Builder and Finder detail dialogs. */
export default function MedalInformation({ medal }: { medal: Medal }) {
  return (
    <div className={styles.content}>
      <Section title="Unique Trait" text={medal.uniqueTrait} />
      <Section title="Tags" values={medal.tags.map((tag) => tag.name)} />
      <Section title="Native Traits" values={medal.nativeTraits.map((trait) => nativeTraitLabels[trait])} />
      <Section title="Extra Trait Effects" values={(medal.nativeEffects ?? []).map(formatId)} />
      <Section title="Status Reductions" values={(medal.statusReductions ?? []).map(formatId)} />
    </div>
  );
}
