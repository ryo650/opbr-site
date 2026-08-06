"use client";

import { useState } from "react";
import type { CharacterSkill, SkillGroup, SkillVariant } from "@/data/character-guides/type";
import CharacterGuideVideo from "./CharacterGuideVideo";
import styles from "./page.module.css";

function BulletList({ title, items, accent = false }: { title: string; items: string[]; accent?: boolean }) {
  if (!items.length) return null;
  return <div className={accent ? styles.tips : styles.details}><h4>{title}</h4><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function Variant({ variant, skillName }: { variant: SkillVariant; skillName: string }) {
  return <div className={styles.variant}><h4>{variant.label}</h4>{variant.video && <CharacterGuideVideo src={variant.video} label={`${skillName} — ${variant.label}`} />}<BulletList title="Details" items={variant.details ?? []} /></div>;
}

function SkillCard({ skill }: { skill: CharacterSkill }) {
  return <article className={`${styles.card} ${styles.skillCard}`}>
    <div className={styles.skillTitle}><div><p className={styles.skillLabel}>{skill.label}</p><h3>{skill.name}</h3></div>{skill.cooldown !== undefined && <span>{skill.cooldown}s cooldown</span>}</div>
    {skill.video && <CharacterGuideVideo src={skill.video} label={`${skill.name} demonstration`} />}
    <BulletList title="Quick Tips" items={skill.quickTips} accent />
    <BulletList title="Details" items={skill.details} />
    {!!skill.variants?.length && <div className={styles.variants}>{skill.variants.map((variant) => <Variant key={variant.label} variant={variant} skillName={skill.name} />)}</div>}
  </article>;
}

function GroupContent({ group }: { group: SkillGroup }) {
  return <div className={styles.skillGrid}>{group.skills.map((skill) => <SkillCard key={`${skill.slot}-${skill.label}-${skill.name}`} skill={skill} />)}</div>;
}

function TabbedGroups({ groups }: { groups: SkillGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0].id ?? "0");
  const activeIndex = Math.max(0, groups.findIndex((group, index) => (group.id ?? String(index)) === activeId));
  return <div className={styles.tabPanel}>
    <div className={styles.tabs} role="tablist" aria-label={groups[0].tabGroup ?? "Skill forms"}>{groups.map((group, index) => {
      const id = group.id ?? String(index);
      const selected = index === activeIndex;
      return <button key={id} type="button" role="tab" aria-selected={selected} className={selected ? styles.activeTab : ""} onClick={() => setActiveId(id)}>{group.label ?? `Form ${index + 1}`}</button>;
    })}</div>
    <div role="tabpanel"><GroupContent group={groups[activeIndex]} /></div>
  </div>;
}

export default function CharacterGuideSkills({ groups }: { groups: SkillGroup[] }) {
  const renderedTabGroups = new Set<string>();
  return <div className={styles.skillGroups}>{groups.map((group, index) => {
    if (group.displayType === "tab") {
      const tabGroup = group.tabGroup ?? `tabs-${index}`;
      if (renderedTabGroups.has(tabGroup)) return null;
      renderedTabGroups.add(tabGroup);
      const related = groups.filter((candidate) => candidate.displayType === "tab" && (candidate.tabGroup ?? `tabs-${groups.indexOf(candidate)}`) === tabGroup);
      return <TabbedGroups key={tabGroup} groups={related} />;
    }
    const content = <GroupContent group={group} />;
    return group.displayType === "section" && group.label
      ? <section className={styles.skillSection} key={group.id ?? `${group.label}-${index}`}><h3>{group.label}</h3>{content}</section>
      : <div key={group.id ?? index}>{group.label && <h3 className={styles.groupLabel}>{group.label}</h3>}{content}</div>;
  })}</div>;
}
