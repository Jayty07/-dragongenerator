import { SIZE_INFO, signed } from "@/lib/dragon/generator"
import { ABILITY_NAMES, Feature, StatBlock } from "@/lib/dragon/types"

const list = (items: string[]) => items.join(", ")

export function featureTitle(feature: Feature) {
  const tags: string[] = []
  if (feature.recharge) {
    tags.push(
      feature.recharge >= 6 ? "Recharge 6" : `Recharge ${feature.recharge}–6`
    )
  }
  if (feature.perDay) tags.push(`${feature.perDay}/Day`)
  if (feature.cost && feature.cost > 1)
    tags.push(`Costs ${feature.cost} Actions`)
  return tags.length ? `${feature.name} (${tags.join(", ")})` : feature.name
}

export function typeLine(block: StatBlock) {
  return `${block.sizeLabel} dragon (${
    block.tribeName
  }), ${block.alignment.toLowerCase()}`
}

export function acText(block: StatBlock) {
  return `${block.ac} (${block.acNote})`
}

export function hpText(block: StatBlock) {
  return `${block.hp.average} (${block.hp.formula})`
}

export function speedText(block: StatBlock) {
  const { walk, fly, swim, burrow, climb, hover, notes } = block.speed
  const parts = [`${walk} ft.`]
  if (burrow) parts.push(`burrow ${burrow} ft.`)
  if (climb) parts.push(`climb ${climb} ft.`)
  if (fly) parts.push(`fly ${fly} ft.${hover ? " (hover)" : ""}`)
  if (swim) parts.push(`swim ${swim} ft.`)
  const text = list(parts)
  return notes ? `${text}; ${notes}` : text
}

export function savesText(block: StatBlock) {
  return list(
    block.saves.map(
      (s) => `${ABILITY_NAMES[s.ability].slice(0, 3)} ${signed(s.bonus)}`
    )
  )
}

export function skillsText(block: StatBlock) {
  return list(block.skills.map((s) => `${s.label} ${signed(s.bonus)}`))
}

export function sensesText(block: StatBlock) {
  const { blindsight, darkvision, tremorsense, truesight, passivePerception } =
    block.senses
  const parts: string[] = []
  if (blindsight) parts.push(`blindsight ${blindsight} ft.`)
  if (darkvision) parts.push(`darkvision ${darkvision} ft.`)
  if (tremorsense) parts.push(`tremorsense ${tremorsense} ft.`)
  if (truesight) parts.push(`truesight ${truesight} ft.`)
  parts.push(`passive Perception ${passivePerception}`)
  return list(parts)
}

export function languagesText(block: StatBlock) {
  const langs = list(block.languages)
  return block.telepathy ? `${langs}, telepathy ${block.telepathy} ft.` : langs
}

export function challengeText(block: StatBlock) {
  const xp = block.xp.toLocaleString("en-US")
  const lair = block.lairXp
    ? `, or ${block.lairXp.toLocaleString(
        "en-US"
      )} XP when encountered in its lair`
    : ""
  return `${block.crLabel} (${xp} XP${lair})`
}

export function abilityText(score: number, mod: number) {
  return `${score} (${signed(mod)})`
}

export function propertyLines(block: StatBlock): [string, string][] {
  const lines: [string, string][] = []
  if (block.saves.length) lines.push(["Saving Throws", savesText(block)])
  if (block.skills.length) lines.push(["Skills", skillsText(block)])
  if (block.vulnerabilities.length)
    lines.push(["Damage Vulnerabilities", list(block.vulnerabilities)])
  if (block.resistances.length)
    lines.push(["Damage Resistances", list(block.resistances)])
  if (block.immunities.length)
    lines.push(["Damage Immunities", list(block.immunities)])
  if (block.conditionImmunities.length)
    lines.push(["Condition Immunities", list(block.conditionImmunities)])
  lines.push(["Senses", sensesText(block)])
  lines.push(["Languages", languagesText(block)])
  lines.push(["Challenge", challengeText(block)])
  lines.push(["Proficiency Bonus", signed(block.prof)])
  return lines
}

export interface FeatureSection {
  title: string
  intro?: string
  features: Feature[]
}

export function featureSections(block: StatBlock): FeatureSection[] {
  const sections: FeatureSection[] = [
    { title: "Actions", features: block.actions },
  ]
  if (block.bonusActions.length)
    sections.push({ title: "Bonus Actions", features: block.bonusActions })
  if (block.reactions.length)
    sections.push({ title: "Reactions", features: block.reactions })
  if (block.legendary)
    sections.push({
      title: "Legendary Actions",
      intro: block.legendary.intro,
      features: block.legendary.actions,
    })
  if (block.lair)
    sections.push({
      title: "Lair Actions",
      intro: block.lair.intro,
      features: block.lair.actions,
    })
  if (block.regional)
    sections.push({
      title: "Regional Effects",
      intro: block.regional.intro,
      features: block.regional.effects,
    })
  return sections
}

export function tokenSize(block: StatBlock) {
  return SIZE_INFO[block.size].tokenSize
}
