export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha"

export const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"]

export type DamageType =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder"

export type Condition =
  | "blinded"
  | "charmed"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"

export type SkillId =
  | "acr"
  | "ani"
  | "arc"
  | "ath"
  | "dec"
  | "his"
  | "ins"
  | "itm"
  | "inv"
  | "med"
  | "nat"
  | "prc"
  | "prf"
  | "per"
  | "rel"
  | "slt"
  | "ste"
  | "sur"

export type Size = "tiny" | "sm" | "med" | "lg" | "huge" | "grg"

export type AreaShape = "cone" | "line" | "sphere"

export type TribeId =
  | "mudwing"
  | "sandwing"
  | "skywing"
  | "seawing"
  | "rainwing"
  | "icewing"
  | "nightwing"
  | "hivewing"
  | "silkwing"
  | "leafwing"

export type FeatureKind =
  | "trait"
  | "action"
  | "bonus"
  | "reaction"
  | "legendary"
  | "lair"
  | "regional"

export interface DamagePart {
  count: number
  die: number
  bonus: number
  type: DamageType
}

export interface Area {
  shape: AreaShape
  /** Cone length, line length, or sphere radius in feet. */
  size: number
  /** Line width in feet. */
  width?: number
  /** Range to the point of origin for spheres, in feet. */
  range?: number
}

export interface AttackData {
  type: "melee" | "ranged"
  bonus: number
  reach?: number
  range?: { normal: number; long?: number }
  damage: DamagePart[]
  critThreshold?: number
}

export interface SaveData {
  ability: Ability
  dc: number
  onSave: "half" | "none"
  damage: DamagePart[]
  condition?: Condition
  area?: Area
}

export interface Feature {
  id: string
  name: string
  kind: FeatureKind
  text: string
  /** Legendary action cost. */
  cost?: number
  /** Recharge on a d6 roll of this value or higher. */
  recharge?: number
  perDay?: number
  attack?: AttackData
  save?: SaveData
  /** Base weapon type for Foundry export. */
  weapon?: boolean
  icon?: string
}

export interface FeatureContext {
  name: string
  power: number
  prof: number
  mods: Record<Ability, number>
  /** 8 + proficiency + the ability modifier. */
  dc: (ability: Ability) => number
  /** Formats dice as "10 (3d6)" or "13 (2d8 + 4)". */
  dice: (count: number, die: number, bonus?: number) => string
  /** Linear interpolation between power 1 and power 10, rounded. */
  scale: (atPower1: number, atPower10: number) => number
}

export type SkillProficiency = { id: SkillId; expertise?: boolean }

export interface Movement {
  walk: number
  fly: number
  swim: number
  burrow: number
  climb: number
  hover: boolean
  notes?: string
}

export interface Senses {
  blindsight: number
  darkvision: number
  tremorsense: number
  truesight: number
  passivePerception: number
}

export interface StatBlock {
  seed: string
  tribe: TribeId
  tribeName: string
  power: number
  name: string
  shortName: string
  ageCategory: string
  ageYears: number
  size: Size
  sizeLabel: string
  alignment: string
  ac: number
  acNote: string
  hp: {
    average: number
    count: number
    die: number
    bonus: number
    formula: string
  }
  speed: Movement
  abilities: Record<Ability, number>
  mods: Record<Ability, number>
  saves: { ability: Ability; bonus: number }[]
  skills: { id: SkillId; label: string; bonus: number; expertise: boolean }[]
  vulnerabilities: DamageType[]
  resistances: DamageType[]
  immunities: DamageType[]
  conditionImmunities: Condition[]
  senses: Senses
  languages: string[]
  telepathy: number
  cr: number
  crLabel: string
  xp: number
  lairXp?: number
  prof: number
  traits: Feature[]
  actions: Feature[]
  bonusActions: Feature[]
  reactions: Feature[]
  legendary: { count: number; intro: string; actions: Feature[] } | null
  legendaryResistance: number
  lair: { intro: string; actions: Feature[] } | null
  regional: { intro: string; effects: Feature[] } | null
  animus: boolean
  variants: string[]
  habitat: string
  flavor: {
    appearance: string
    personality: string
    quirk: string
    hook: string
  }
}

export const ABILITY_NAMES: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
}
