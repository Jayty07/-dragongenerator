import { Rng, createRng, pick, randInt } from "@/lib/dragon/random"
import {
  TRIBES,
  Tribe,
  TribeAttackDef,
  TribeBreathDef,
  TribeFeatureDef,
  getTribe,
} from "@/lib/dragon/tribes"
import {
  ABILITIES,
  ABILITY_NAMES,
  Ability,
  AttackData,
  DamagePart,
  DamageType,
  Feature,
  FeatureContext,
  SaveData,
  Size,
  SkillId,
  StatBlock,
  TribeId,
} from "@/lib/dragon/types"

export type AnimusMode = "random" | "always" | "never"

export interface GenerateOptions {
  tribe: TribeId
  /** 1 (weak dragonet) to 10 (legendary). */
  power: number
  seed: string
  animus?: AnimusMode
}

export const MIN_POWER = 1
export const MAX_POWER = 10

/* -------------------------------------------------------------------------- */
/*  Scaling tables (index 0 = power 1)                                        */
/* -------------------------------------------------------------------------- */

export const CR_RANGE: [number, number][] = [
  [0.5, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [8, 9],
  [11, 12],
  [13, 15],
  [16, 18],
  [19, 21],
  [23, 26],
]

export const AGE_CATEGORY = [
  "Dragonet",
  "Fledgling",
  "Juvenile",
  "Young",
  "Young Adult",
  "Adult",
  "Mature Adult",
  "Elder",
  "Ancient",
  "Legendary",
]

const AGE_YEARS: [number, number][] = [
  [2, 4],
  [5, 7],
  [8, 12],
  [13, 20],
  [21, 40],
  [41, 80],
  [81, 150],
  [151, 300],
  [301, 600],
  [601, 1500],
]

const SIZE_BY_POWER: Size[] = [
  "sm",
  "med",
  "med",
  "lg",
  "lg",
  "lg",
  "huge",
  "huge",
  "grg",
  "grg",
]

export const SIZE_INFO: Record<
  Size,
  { label: string; die: number; reach: number; tokenSize: number }
> = {
  tiny: { label: "Tiny", die: 4, reach: 5, tokenSize: 0.5 },
  sm: { label: "Small", die: 6, reach: 5, tokenSize: 1 },
  med: { label: "Medium", die: 8, reach: 5, tokenSize: 1 },
  lg: { label: "Large", die: 10, reach: 10, tokenSize: 2 },
  huge: { label: "Huge", die: 12, reach: 10, tokenSize: 3 },
  grg: { label: "Gargantuan", die: 20, reach: 15, tokenSize: 4 },
}

// Anchored on the Monster Manual chromatic dragon progression.
const ABILITY_BASE: Record<Ability, number[]> = {
  str: [12, 15, 19, 21, 23, 25, 26, 27, 29, 30],
  dex: [12, 11, 10, 10, 10, 10, 10, 10, 10, 10],
  con: [12, 15, 17, 19, 21, 23, 24, 25, 27, 29],
  int: [8, 10, 12, 13, 14, 15, 16, 16, 17, 18],
  wis: [10, 11, 11, 12, 12, 13, 13, 14, 15, 15],
  cha: [9, 13, 15, 17, 18, 19, 20, 21, 22, 24],
}

const HP_BY_CR: [number, number][] = [
  [0.5, 22],
  [1, 33],
  [2, 45],
  [3, 60],
  [4, 75],
  [5, 90],
  [6, 110],
  [7, 127],
  [8, 136],
  [9, 152],
  [10, 178],
  [11, 195],
  [12, 205],
  [13, 212],
  [14, 220],
  [15, 230],
  [16, 245],
  [17, 256],
  [18, 275],
  [19, 300],
  [20, 330],
  [21, 367],
  [22, 385],
  [23, 420],
  [24, 480],
  [25, 530],
  [26, 580],
  [30, 780],
]

const AC_BY_CR: [number, number][] = [
  [0.5, 13],
  [1, 14],
  [2, 15],
  [3, 16],
  [4, 17],
  [8, 18],
  [13, 18],
  [15, 19],
  [20, 20],
  [22, 21],
  [24, 22],
  [30, 22],
]

export const XP_BY_CR: Record<string, number> = {
  "0": 10,
  "0.125": 25,
  "0.25": 50,
  "0.5": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "25": 75000,
  "26": 90000,
  "27": 105000,
  "28": 120000,
  "29": 135000,
  "30": 155000,
}

const WALK = [25, 30, 30, 40, 40, 40, 40, 40, 40, 40]
const FLY = [50, 60, 60, 80, 80, 80, 80, 80, 80, 80]
const BLINDSIGHT = [10, 10, 10, 30, 30, 60, 60, 60, 60, 60]

const BITE: [number, number][] = [
  [1, 6],
  [1, 8],
  [1, 10],
  [2, 10],
  [2, 10],
  [2, 10],
  [2, 10],
  [2, 10],
  [2, 10],
  [2, 10],
]
const BITE_RIDER = [0, 0, 1, 1, 1, 2, 2, 2, 3, 4]
const CLAW: ([number, number] | null)[] = [
  null,
  null,
  [1, 6],
  [2, 6],
  [2, 6],
  [2, 6],
  [2, 6],
  [2, 6],
  [2, 8],
  [2, 8],
]

/** Breath damage dice (in d6 equivalents). */
const BREATH_D6 = [2, 4, 7, 10, 13, 15, 16, 18, 21, 26]
const CONE = [15, 15, 15, 30, 30, 30, 60, 60, 90, 90]
const SPHERE = [5, 5, 10, 10, 15, 15, 20, 20, 30, 30]
const SPHERE_RANGE = [30, 30, 60, 60, 60, 90, 90, 120, 120, 150]

/** Base chance of an animus hatchling, before tribe affinity. */
const ANIMUS_CHANCE = [
  0.01, 0.015, 0.02, 0.03, 0.04, 0.05, 0.07, 0.09, 0.12, 0.15,
]

export const SKILL_INFO: Record<SkillId, { label: string; ability: Ability }> =
  {
    acr: { label: "Acrobatics", ability: "dex" },
    ani: { label: "Animal Handling", ability: "wis" },
    arc: { label: "Arcana", ability: "int" },
    ath: { label: "Athletics", ability: "str" },
    dec: { label: "Deception", ability: "cha" },
    his: { label: "History", ability: "int" },
    ins: { label: "Insight", ability: "wis" },
    itm: { label: "Intimidation", ability: "cha" },
    inv: { label: "Investigation", ability: "int" },
    med: { label: "Medicine", ability: "wis" },
    nat: { label: "Nature", ability: "int" },
    prc: { label: "Perception", ability: "wis" },
    prf: { label: "Performance", ability: "cha" },
    per: { label: "Persuasion", ability: "cha" },
    rel: { label: "Religion", ability: "int" },
    slt: { label: "Sleight of Hand", ability: "dex" },
    ste: { label: "Stealth", ability: "dex" },
    sur: { label: "Survival", ability: "wis" },
  }

const GENERAL_PERSONALITY = [
  "Hoards stories instead of gold, and trades them just as shrewdly.",
  "Believes the old prophecies are about it personally.",
  "Laughs loudly and often, especially at inappropriate moments.",
  "Keeps its word no matter what it costs.",
  "Distrusts every other tribe equally, which it considers fair.",
]

const GENERAL_QUIRKS = [
  "Has a torn wing membrane that never quite healed.",
  "One horn is noticeably shorter than the other.",
  "Collects shiny scavenger trinkets and wears them on its horns.",
  "Sneezes sparks when it is startled.",
  "Hums the same four notes whenever it is thinking.",
]

const GENERAL_HOOKS = [
  "Owes a life-debt to one of the adventurers' ancestors.",
  "Wants the party to deliver an egg safely across a war zone.",
  "Is secretly working for the Talons of Peace.",
  "Believes the party is part of a prophecy and won't leave them alone.",
]

const EYE_COLORS = [
  "gold",
  "green",
  "black",
  "silver",
  "amber",
  "violet",
  "ice-blue",
]

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export const abilityMod = (score: number) => Math.floor((score - 10) / 2)

export const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

export function averageDamage(count: number, die: number, bonus = 0) {
  return Math.max(1, Math.floor((count * (die + 1)) / 2) + bonus)
}

export function diceExpression(count: number, die: number, bonus = 0) {
  if (!bonus) return `${count}d${die}`
  return `${count}d${die} ${bonus > 0 ? "+" : "-"} ${Math.abs(bonus)}`
}

export function formatDice(count: number, die: number, bonus = 0) {
  return `${averageDamage(count, die, bonus)} (${diceExpression(
    count,
    die,
    bonus
  )})`
}

export function formatCR(cr: number) {
  if (cr === 0.125) return "1/8"
  if (cr === 0.25) return "1/4"
  if (cr === 0.5) return "1/2"
  return String(cr)
}

export function proficiencyForCR(cr: number) {
  if (cr < 5) return 2
  if (cr < 9) return 3
  if (cr < 13) return 4
  if (cr < 17) return 5
  if (cr < 21) return 6
  if (cr < 25) return 7
  if (cr < 29) return 8
  return 9
}

function interpolate(table: [number, number][], x: number) {
  if (x <= table[0][0]) return table[0][1]
  for (let i = 1; i < table.length; i++) {
    const [x1, y1] = table[i]
    if (x <= x1) {
      const [x0, y0] = table[i - 1]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return table[table.length - 1][1]
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function clampPower(power: number) {
  if (!Number.isFinite(power)) return MIN_POWER
  return Math.min(MAX_POWER, Math.max(MIN_POWER, Math.round(power)))
}

function areaPhrase(
  shape: TribeBreathDef["shape"],
  size: number,
  width: number,
  range: number
) {
  switch (shape) {
    case "cone":
      return `a ${size}-foot cone`
    case "line":
      return `a ${size}-foot line that is ${width} feet wide`
    case "sphere":
      return `a ${size}-foot-radius sphere centered on a point it can see within ${range} feet`
  }
}

function damageText(parts: DamagePart[]) {
  return parts
    .map((p) => `${formatDice(p.count, p.die, p.bonus)} ${p.type} damage`)
    .join(" plus ")
}

export function attackText(attack: AttackData) {
  const kind = attack.type === "melee" ? "Melee" : "Ranged"
  const reach =
    attack.type === "melee"
      ? `reach ${attack.reach} ft.`
      : `range ${attack.range?.normal}${
          attack.range?.long ? `/${attack.range.long}` : ""
        } ft.`
  return `${kind} Weapon Attack: ${signed(
    attack.bonus
  )} to hit, ${reach}, one target. Hit: ${damageText(attack.damage)}.`
}

/* -------------------------------------------------------------------------- */
/*  Name generation                                                           */
/* -------------------------------------------------------------------------- */

export function generateName(tribe: Tribe, rng: Rng) {
  const { single, prefixes, suffixes, compoundChance } = tribe.names
  if (prefixes.length && suffixes.length && rng() < compoundChance) {
    const prefix = pick(rng, prefixes)
    const suffix = pick(rng, suffixes)
    return `${prefix}${suffix}`
  }
  return pick(rng, single)
}

function withEpithet(name: string, epithet: string) {
  if (epithet.startsWith("the ") || epithet.startsWith("of ")) {
    return `${name} ${epithet}`
  }
  return `${name}, ${epithet}`
}

/* -------------------------------------------------------------------------- */
/*  Generator                                                                 */
/* -------------------------------------------------------------------------- */

export function animusChance(tribe: Tribe, power: number) {
  return Math.min(
    0.5,
    ANIMUS_CHANCE[clampPower(power) - 1] * tribe.animusAffinity
  )
}

export function variantChance(chance: number, power: number) {
  return Math.min(0.9, chance * (0.5 + clampPower(power) / 10))
}

export function generateDragon(options: GenerateOptions): StatBlock {
  const tribe = getTribe(options.tribe)
  const power = clampPower(options.power)
  const idx = power - 1
  const seed = options.seed || "dragon"
  const animusMode = options.animus ?? "random"

  // Identity streams are independent of power so the same dragon "grows up"
  // as the slider moves.
  const identityRng = createRng(`${seed}:${tribe.id}:identity`)
  const statRng = createRng(`${seed}:${tribe.id}:${power}`)

  const shortName = generateName(tribe, identityRng)
  const epithet = pick(identityRng, tribe.epithets)
  const alignment = pick(identityRng, tribe.alignments)
  const color = pick(identityRng, tribe.colors)
  const eyes = pick(identityRng, EYE_COLORS)
  const personality =
    identityRng() < 0.7
      ? pick(identityRng, tribe.personality)
      : pick(identityRng, GENERAL_PERSONALITY)
  const quirk =
    identityRng() < 0.7
      ? pick(identityRng, tribe.quirks)
      : pick(identityRng, GENERAL_QUIRKS)
  const hook =
    identityRng() < 0.6
      ? pick(identityRng, tribe.hooks)
      : pick(identityRng, GENERAL_HOOKS)
  const name = power >= 8 ? withEpithet(shortName, epithet) : shortName

  // Rare traits: one uniform roll per trait compared against a power-scaled
  // threshold, so a trait that appears at power N also appears above N.
  const animusRoll = createRng(`${seed}:${tribe.id}:animus`)()
  const animus =
    animusMode === "always"
      ? true
      : animusMode === "never"
      ? false
      : animusRoll < animusChance(tribe, power)

  const activeVariants = tribe.variants.filter(
    (v) =>
      createRng(`${seed}:${tribe.id}:variant:${v.id}`)() <
      variantChance(v.chance, power)
  )

  // Challenge & core numbers
  const [crMin, crMax] = CR_RANGE[idx]
  const cr =
    crMin < 1
      ? statRng() < 0.5
        ? crMin
        : crMax
      : randInt(statRng, crMin, crMax)
  const prof = proficiencyForCR(cr)

  const abilities = {} as Record<Ability, number>
  const mods = {} as Record<Ability, number>
  for (const a of ABILITIES) {
    const score =
      ABILITY_BASE[a][idx] +
      (tribe.abilityMods[a] ?? 0) +
      randInt(statRng, -1, 1)
    abilities[a] = Math.min(30, Math.max(1, score))
    mods[a] = abilityMod(abilities[a])
  }

  const ctx: FeatureContext = {
    name: shortName,
    power,
    prof,
    mods,
    dc: (a) => 8 + prof + mods[a],
    dice: (count, die, bonus = 0) => formatDice(count, die, bonus),
    scale: (low, high) => Math.round(low + ((high - low) * (power - 1)) / 9),
  }

  const size = SIZE_BY_POWER[idx]
  const sizeInfo = SIZE_INFO[size]

  // Hit points
  const hpTarget =
    interpolate(HP_BY_CR, cr) * tribe.hpMultiplier * (0.92 + statRng() * 0.16)
  const perDie = (sizeInfo.die + 1) / 2 + mods.con
  const hdCount = Math.max(1, Math.round(hpTarget / Math.max(1, perDie)))
  const hpBonus = hdCount * mods.con
  const hpAverage = Math.max(
    1,
    Math.floor((hdCount * (sizeInfo.die + 1)) / 2) + hpBonus
  )

  const ac = Math.round(interpolate(AC_BY_CR, cr)) + tribe.acBonus

  // Movement
  const moveBonus = (power >= 4 ? 10 : 0) + (power >= 7 ? 10 : 0)
  const wingless = (tribe.movement.winglessUntil ?? 0) >= power
  const fly = wingless ? 0 : FLY[idx] + (tribe.movement.fly ?? 0)
  const speed = {
    walk: WALK[idx] + (tribe.movement.walk ?? 0),
    fly,
    swim: tribe.movement.swim ? tribe.movement.swim + moveBonus : 0,
    burrow: tribe.movement.burrow ? tribe.movement.burrow + moveBonus : 0,
    climb: tribe.movement.climb ? tribe.movement.climb + moveBonus : 0,
    hover: !!tribe.movement.hover && fly > 0,
    notes: tribe.movement.notes,
  }

  // Saves & skills
  const saves = tribe.saves.map((a) => ({ ability: a, bonus: mods[a] + prof }))
  const skillMap = new Map<SkillId, boolean>()
  skillMap.set("prc", power >= 5)
  skillMap.set("ste", false)
  tribe.skills.forEach((s) => {
    const expertise = !!s.expertise && power >= 4
    skillMap.set(s.id, (skillMap.get(s.id) ?? false) || expertise)
  })
  const skills = Array.from(skillMap.entries())
    .map(([id, expertise]) => {
      const info = SKILL_INFO[id]
      return {
        id,
        label: info.label,
        expertise,
        bonus: mods[info.ability] + prof * (expertise ? 2 : 1),
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
  const perception = skills.find((s) => s.id === "prc")

  // Defenses
  const immunities = unique([
    ...tribe.immunities,
    ...activeVariants.flatMap((v) => v.immunities ?? []),
  ])
  const resistances = unique(tribe.resistances).filter(
    (d) => !immunities.includes(d)
  )

  const senses = {
    blindsight: BLINDSIGHT[idx],
    darkvision: Math.max(tribe.darkvision, power >= 6 ? 120 : 0),
    tremorsense: 0,
    truesight: 0,
    passivePerception: 10 + (perception?.bonus ?? mods.wis),
  }

  const languages = [
    "Draconic",
    ...(power >= 3 ? ["Common"] : []),
    ...(tribe.extraLanguages ?? []),
  ]
  const telepathy = tribe.id === "nightwing" && power >= 7 ? 120 : 0

  // Features
  const traits: Feature[] = []
  const actions: Feature[] = []
  const bonusActions: Feature[] = []
  const reactions: Feature[] = []

  const featureDefs: TribeFeatureDef[] = [
    ...tribe.features,
    ...activeVariants.flatMap((v) => v.features),
  ].filter(
    (f) =>
      (f.minPower === undefined || power >= f.minPower) &&
      (f.maxPower === undefined || power <= f.maxPower)
  )

  for (const def of featureDefs) {
    const feature: Feature = {
      id: def.id,
      name: def.name,
      kind: def.kind,
      text: def.text(ctx),
      recharge: def.recharge,
      perDay: def.perDay?.(power),
      save: def.save?.(ctx),
      icon: def.icon,
    }
    if (def.kind === "trait") traits.push(feature)
    else if (def.kind === "action") actions.push(feature)
    else if (def.kind === "bonus") bonusActions.push(feature)
    else reactions.push(feature)
  }

  // Animus magic
  if (animus) {
    traits.push({
      id: "animus-magic",
      name: "Animus Magic",
      kind: "trait",
      text: `${shortName} is an animus dragon: it can enchant objects—and, at terrible cost, creatures—simply by speaking its intent aloud. Whenever ${shortName} uses animus magic beyond its listed spells, the GM can have it make a DC ${
        10 + power
      } Wisdom saving throw. On a failure, a sliver of its soul erodes: its alignment shifts one step toward evil and it gains a short-term madness.`,
    })
    traits.push({
      id: "innate-spellcasting-animus",
      name: "Innate Spellcasting (Animus)",
      kind: "trait",
      text: animusSpellcastingText(
        shortName,
        power,
        ctx.dc("cha"),
        prof + mods.cha
      ),
    })
  }

  // Attacks
  const attackMod = Math.max(mods.str, mods.dex)
  const toHit = prof + attackMod
  const onHitDc = ctx.dc("con")

  const [biteCount, biteDie] = BITE[idx]
  const biteDamage: DamagePart[] = [
    { count: biteCount, die: biteDie, bonus: attackMod, type: "piercing" },
  ]
  if (tribe.biteRider && BITE_RIDER[idx] > 0) {
    biteDamage.push({
      count: BITE_RIDER[idx],
      die: 6,
      bonus: 0,
      type: tribe.biteRider,
    })
  }
  const bite = makeAttack("bite", "Bite", {
    type: "melee",
    bonus: toHit,
    reach: sizeInfo.reach,
    damage: biteDamage,
  })
  bite.icon = "icons/creatures/abilities/mouth-teeth-rows-red.webp"

  const clawDice = CLAW[idx]
  const claw = clawDice
    ? makeAttack("claw", "Claw", {
        type: "melee",
        bonus: toHit,
        reach: Math.max(5, sizeInfo.reach - 5),
        damage: [
          {
            count: clawDice[0],
            die: clawDice[1],
            bonus: attackMod,
            type: "slashing",
          },
        ],
        critThreshold: power >= 3 ? tribe.clawCritThreshold : undefined,
      })
    : null
  if (claw) claw.icon = "icons/creatures/claws/claw-talons-yellow-red.webp"

  const tribeAttacks = tribe.attacks
    .filter((a) => a.minPower === undefined || power >= a.minPower)
    .map((a) =>
      buildTribeAttack(a, idx, toHit, attackMod, sizeInfo.reach, onHitDc, ctx)
    )

  const tail =
    power >= 6
      ? makeAttack("tail", "Tail", {
          type: "melee",
          bonus: toHit,
          reach: sizeInfo.reach + 5,
          damage: [{ count: 2, die: 8, bonus: attackMod, type: "bludgeoning" }],
        })
      : null
  if (tail) tail.icon = "icons/creatures/abilities/tail-swipe-green.webp"

  // Breath weapon (possibly overridden by a rare variant)
  const breathDef: TribeBreathDef = activeVariants.reduce<TribeBreathDef>(
    (acc, v) => (v.breath ? { ...acc, ...v.breath } : acc),
    tribe.breath
  )
  const breath = buildBreath(breathDef, idx, power, ctx)

  const frightful: Feature | null =
    power >= 6
      ? {
          id: "frightful-presence",
          name: "Frightful Presence",
          kind: "action",
          icon: "icons/magic/death/hand-withered-gray.webp",
          text: `Each creature of ${shortName}'s choice that is within 120 feet of it and aware of it must succeed on a DC ${ctx.dc(
            "cha"
          )} Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to ${shortName}'s Frightful Presence for the next 24 hours.`,
          save: {
            ability: "wis",
            dc: ctx.dc("cha"),
            onSave: "none",
            damage: [],
            condition: "frightened",
            area: { shape: "sphere", size: 120 },
          },
        }
      : null

  const multiattack = buildMultiattack(
    shortName,
    power,
    claw !== null,
    tribeAttacks.filter((_, i) => tribe.attacks[i].inMultiattack),
    frightful !== null
  )

  actions.unshift(
    ...[
      multiattack,
      bite,
      claw,
      ...tribeAttacks,
      tail,
      breath,
      frightful,
    ].filter((f): f is Feature => f !== null)
  )

  // Legendary
  let legendaryResistance = 0
  let legendary: StatBlock["legendary"] = null
  if (power >= 6) {
    legendaryResistance = power >= 8 ? 3 : power === 7 ? 2 : 1
    traits.push({
      id: "legendary-resistance",
      name: "Legendary Resistance",
      kind: "trait",
      perDay: legendaryResistance,
      text: `If ${shortName} fails a saving throw, it can choose to succeed instead.`,
    })

    const count = power >= 10 ? 4 : 3
    const legendaryActions: Feature[] = [
      {
        id: "detect",
        name: "Detect",
        kind: "legendary",
        cost: 1,
        text: `${shortName} makes a Wisdom (Perception) check.`,
      },
    ]
    if (tail) {
      legendaryActions.push({
        id: "tail-attack",
        name: "Tail Attack",
        kind: "legendary",
        cost: 1,
        text: `${shortName} makes a tail attack.`,
      })
    }
    const tl = tribe.legendary
    const tribeAttack = tl.attackId
      ? tribeAttacks.find((a) => a.id === tl.attackId)
      : undefined
    legendaryActions.push({
      id: tl.id,
      name: tl.name,
      kind: "legendary",
      cost: tl.cost,
      text: tl.text(ctx),
      attack: tribeAttack?.attack,
      save: tl.save?.(ctx) ?? tribeAttack?.save,
      weapon: false,
    })
    if (fly > 0) {
      const wingDc = ctx.dc("str")
      const wingDamage: DamagePart = {
        count: 2,
        die: 6,
        bonus: mods.str,
        type: "bludgeoning",
      }
      const radius = size === "grg" ? 15 : 10
      legendaryActions.push({
        id: "wing-attack",
        name: "Wing Attack",
        kind: "legendary",
        cost: 2,
        icon: "icons/creatures/abilities/wings-birdlike-blue.webp",
        text: `${shortName} beats its wings. Each creature within ${radius} feet of it must succeed on a DC ${wingDc} Dexterity saving throw or take ${damageText(
          [wingDamage]
        )} and be knocked prone. ${shortName} can then fly up to half its flying speed.`,
        save: {
          ability: "dex",
          dc: wingDc,
          onSave: "none",
          damage: [wingDamage],
          condition: "prone",
          area: { shape: "sphere", size: radius },
        },
      })
    }
    legendary = {
      count,
      intro: `${shortName} can take ${count} legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. ${shortName} regains spent legendary actions at the start of its turn.`,
      actions: legendaryActions,
    }
  }

  // Lair & regional
  let lair: StatBlock["lair"] = null
  let regional: StatBlock["regional"] = null
  if (power >= 9) {
    const lairActions: Feature[] = tribe.lair.actions.map((def) => ({
      id: def.id,
      name: def.name,
      kind: "lair",
      text: def.text(ctx),
      save: def.save?.(ctx),
    }))
    lairActions.push({
      id: "wingbeat-tremor",
      name: "Wingbeat Tremor",
      kind: "lair",
      text: `${shortName} slams its wings against the ground. Each creature on the ground within 60 feet of it must succeed on a DC ${ctx.dc(
        "str"
      )} Dexterity saving throw or be knocked prone.`,
      save: {
        ability: "dex",
        dc: ctx.dc("str"),
        onSave: "none",
        damage: [],
        condition: "prone",
        area: { shape: "sphere", size: 60 },
      },
    })
    lair = {
      intro: `On initiative count 20 (losing initiative ties), ${shortName} takes a lair action to cause one of the following effects; it can't use the same effect two rounds in a row.`,
      actions: lairActions,
    }
  }
  if (power >= 10) {
    regional = {
      intro: `The region containing ${shortName}'s lair is warped by its presence, creating the following effects. If ${shortName} dies, these effects fade over 1d10 days.`,
      effects: tribe.lair.regional.map((def) => ({
        id: def.id,
        name: def.name,
        kind: "regional",
        text: def.text(ctx),
      })),
    }
  }

  const xp = XP_BY_CR[String(cr)] ?? 0
  const lairXp = lair ? XP_BY_CR[String(Math.min(30, cr + 1))] : undefined

  const [ageMin, ageMax] = AGE_YEARS[idx]
  const ageYears = randInt(
    createRng(`${seed}:${tribe.id}:age:${power}`),
    ageMin,
    ageMax
  )

  const variantNames = activeVariants.map((v) => v.name)
  const appearance = `${capitalize(color)} scales and ${eyes} eyes${
    variantNames.length ? `; marked as ${variantNames.join(" and ")}` : ""
  }${
    animus
      ? ". An unsettling shimmer follows its every word—the sign of an animus"
      : ""
  }.`

  return {
    seed,
    tribe: tribe.id,
    tribeName: tribe.name,
    power,
    name,
    shortName,
    ageCategory: AGE_CATEGORY[idx],
    ageYears,
    size,
    sizeLabel: sizeInfo.label,
    alignment,
    ac,
    acNote: "natural armor",
    hp: {
      average: hpAverage,
      count: hdCount,
      die: sizeInfo.die,
      bonus: hpBonus,
      formula: diceExpression(hdCount, sizeInfo.die, hpBonus),
    },
    speed,
    abilities,
    mods,
    saves,
    skills,
    vulnerabilities: tribe.vulnerabilities,
    resistances,
    immunities,
    conditionImmunities: tribe.conditionImmunities,
    senses,
    languages,
    telepathy,
    cr,
    crLabel: formatCR(cr),
    xp,
    lairXp,
    prof,
    traits,
    actions,
    bonusActions,
    reactions,
    legendary,
    legendaryResistance,
    lair,
    regional,
    animus,
    variants: variantNames,
    habitat: tribe.habitat,
    flavor: { appearance, personality, quirk, hook },
  }
}

function unique<T>(items: T[]): T[] {
  return items.filter((item, i) => items.indexOf(item) === i)
}

function makeAttack(id: string, name: string, attack: AttackData): Feature {
  return {
    id,
    name,
    kind: "action",
    weapon: true,
    attack,
    text: attackText(attack),
  }
}

function buildTribeAttack(
  def: TribeAttackDef,
  idx: number,
  toHit: number,
  attackMod: number,
  reach: number,
  dc: number,
  ctx: FeatureContext
): Feature {
  const damage: DamagePart[] = [
    {
      count: def.counts[idx],
      die: def.die,
      bonus: attackMod,
      type: def.damageType,
    },
  ]
  if (def.rider && def.rider.counts[idx] > 0) {
    damage.push({
      count: def.rider.counts[idx],
      die: def.rider.die,
      bonus: 0,
      type: def.rider.type,
    })
  }
  const feature = makeAttack(def.id, def.name, {
    type: "melee",
    bonus: toHit,
    reach: reach + (def.reachBonus ?? 0),
    damage,
  })
  feature.icon = def.icon
  const onHit = def.onHit?.(ctx)
  if (onHit) {
    feature.text += ` If the target is a creature, it must succeed on a DC ${dc} ${
      ABILITY_NAMES[onHit.ability]
    } saving throw or be ${onHit.condition} ${onHit.duration}.`
    feature.save = {
      ability: onHit.ability,
      dc,
      onSave: "none",
      damage: [],
      condition: onHit.condition,
    }
  }
  return feature
}

function buildBreath(
  def: TribeBreathDef,
  idx: number,
  power: number,
  ctx: FeatureContext
): Feature {
  const dc = ctx.dc("con")
  const width = power >= 8 ? 10 : 5
  const size = def.shape === "sphere" ? SPHERE[idx] : CONE[idx]
  const range = SPHERE_RANGE[idx]
  const recharge = power <= 2 ? 6 : power <= 8 ? 5 : 4

  const damage: DamagePart[] = []
  if (def.damageType && def.damageScale > 0) {
    const count = Math.max(
      1,
      Math.round((BREATH_D6[idx] * def.damageScale * 3.5) / ((def.die + 1) / 2))
    )
    damage.push({ count, die: def.die, bonus: 0, type: def.damageType })
  }

  const area = areaPhrase(def.shape, size, width, range)
  const saveName = `${ABILITY_NAMES[def.save]} saving throw`
  let text = `${ctx.name} ${def.verb} ${area}. `
  if (damage.length) {
    text += `Each creature in that area must make a DC ${dc} ${saveName}, taking ${damageText(
      damage
    )} on a failed save, or half as much damage on a successful one.`
  } else {
    text += `Each creature in that area must succeed on a DC ${dc} ${saveName} or be ${
      def.condition ?? "affected"
    }.`
  }
  const extra = def.extra?.(ctx)
  if (extra) text += ` ${extra}`

  const save: SaveData = {
    ability: def.save,
    dc,
    onSave: damage.length ? "half" : "none",
    damage,
    condition: def.condition,
    area: {
      shape: def.shape,
      size,
      width: def.shape === "line" ? width : undefined,
      range: def.shape === "sphere" ? range : undefined,
    },
  }

  return {
    id: slug(def.id || def.name),
    name: def.name,
    kind: "action",
    recharge,
    text,
    save,
    icon: def.icon,
  }
}

function buildMultiattack(
  name: string,
  power: number,
  hasClaw: boolean,
  extra: Feature[],
  frightful: boolean
): Feature | null {
  if (power < 3 || !hasClaw) return null
  const special = extra[0]
  let attacks: string
  if (power === 3) {
    attacks = special
      ? `two attacks: one with its bite and one with its ${special.name.toLowerCase()}`
      : "two attacks: one with its bite and one with its claws"
  } else {
    attacks = special
      ? `three attacks: one with its bite, one with its claws, and one with its ${special.name.toLowerCase()}`
      : "three attacks: one with its bite and two with its claws"
  }
  const text = frightful
    ? `${name} can use its Frightful Presence. It then makes ${attacks}.`
    : `${name} makes ${attacks}.`
  return { id: "multiattack", name: "Multiattack", kind: "action", text }
}

function animusSpellcastingText(
  name: string,
  power: number,
  dc: number,
  attack: number
) {
  let atWill = ["mage hand", "mending", "prestidigitation"]
  let threePerDay: string[] = []
  let onePerDay: string[] = ["enhance ability", "magic weapon"]
  if (power >= 3) {
    atWill = [...atWill, "magic mouth"]
    threePerDay = ["enhance ability", "magic weapon"]
    onePerDay = ["glyph of warding", "sending"]
  }
  if (power >= 6) {
    threePerDay = ["glyph of warding", "magic weapon", "sending"]
    onePerDay = ["animate objects", "geas", "wall of stone"]
  }
  if (power >= 9) {
    threePerDay = ["animate objects", "sending", "wall of stone"]
    onePerDay = ["geas", "mass suggestion", "true polymorph"]
  }
  if (power >= 10) onePerDay = [...onePerDay, "wish"]

  const lines = [`At will: ${atWill.join(", ")}`]
  if (threePerDay.length) lines.push(`3/day each: ${threePerDay.join(", ")}`)
  lines.push(`1/day each: ${onePerDay.join(", ")}`)
  return `${name}'s innate spellcasting ability is Charisma (spell save DC ${dc}, ${signed(
    attack
  )} to hit with spell attacks). It can innately cast the following spells, requiring no material components. ${lines.join(
    ". "
  )}.`
}

export { TRIBES }
