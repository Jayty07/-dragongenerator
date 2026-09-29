import {
  abilityText,
  acText,
  featureSections,
  featureTitle,
  hpText,
  propertyLines,
  speedText,
  tokenSize,
  typeLine,
} from "@/lib/dragon/format"
import { createRng } from "@/lib/dragon/random"
import {
  ABILITIES,
  Ability,
  DamagePart,
  Feature,
  SaveData,
  StatBlock,
} from "@/lib/dragon/types"

/* -------------------------------------------------------------------------- */
/*  Markdown / plain text                                                     */
/* -------------------------------------------------------------------------- */

export function toMarkdown(block: StatBlock): string {
  const out: string[] = []
  out.push(`## ${block.name}`)
  out.push(`*${typeLine(block)}*`)
  out.push("")
  out.push("___")
  out.push(`- **Armor Class** ${acText(block)}`)
  out.push(`- **Hit Points** ${hpText(block)}`)
  out.push(`- **Speed** ${speedText(block)}`)
  out.push("___")
  out.push(`| ${ABILITIES.map((a) => a.toUpperCase()).join(" | ")} |`)
  out.push(`|${ABILITIES.map(() => ":---:").join("|")}|`)
  out.push(
    `| ${ABILITIES.map((a) =>
      abilityText(block.abilities[a], block.mods[a])
    ).join(" | ")} |`
  )
  out.push("___")
  for (const [label, value] of propertyLines(block)) {
    out.push(`- **${label}** ${value}`)
  }
  out.push("___")
  for (const trait of block.traits) {
    out.push(`***${featureTitle(trait)}.*** ${trait.text}`)
    out.push("")
  }
  for (const section of featureSections(block)) {
    out.push(`### ${section.title}`)
    if (section.intro) {
      out.push(section.intro)
      out.push("")
    }
    for (const f of section.features) {
      out.push(`***${featureTitle(f)}.*** ${f.text}`)
      out.push("")
    }
  }
  out.push("### Flavor")
  out.push(
    `- **Tribe** ${block.tribeName} · **Age** ${block.ageCategory} (${block.ageYears} years) · **Habitat** ${block.habitat}`
  )
  if (block.variants.length || block.animus) {
    out.push(
      `- **Rare Traits** ${[
        ...block.variants,
        ...(block.animus ? ["Animus"] : []),
      ].join(", ")}`
    )
  }
  out.push(`- **Appearance** ${block.flavor.appearance}`)
  out.push(`- **Personality** ${block.flavor.personality}`)
  out.push(`- **Quirk** ${block.flavor.quirk}`)
  out.push(`- **Hook** ${block.flavor.hook}`)
  out.push("")
  out.push(`*Seed: ${block.seed} · Power ${block.power}/10*`)
  return out.join("\n")
}

export function toPlainText(block: StatBlock): string {
  return toMarkdown(block)
    .split("\n")
    .filter((line) => line !== "___" && !/^\|[:\-|]+\|$/.test(line))
    .map((line) =>
      line
        .replace(/^#+\s*/, "")
        .replace(/^- /, "")
        .replace(/\*+/g, "")
        .replace(/^\| (.*) \|$/, (_, row: string) =>
          row.split(" | ").join("   ")
        )
    )
    .join("\n")
}

export function toJSON(block: StatBlock): string {
  return JSON.stringify(block, null, 2)
}

/* -------------------------------------------------------------------------- */
/*  Foundry VTT (dnd5e) actor                                                 */
/* -------------------------------------------------------------------------- */

const FOUNDRY_ID_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function foundryId(seed: string) {
  const rng = createRng(seed)
  let id = ""
  for (let i = 0; i < 16; i++) {
    id += FOUNDRY_ID_CHARS[Math.floor(rng() * FOUNDRY_ID_CHARS.length)]
  }
  return id
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const paragraph = (text: string) => `<p>${escapeHtml(text)}</p>`

type ActivationType =
  | "action"
  | "bonus"
  | "reaction"
  | "legendary"
  | "lair"
  | "special"
  | ""

type FoundryData = Record<string, unknown>

interface ItemOptions {
  activation: ActivationType
  cost?: number
  consumeLegendary?: boolean
  consumeLegendaryResistance?: boolean
  sort: number
}

function damageParts(parts: DamagePart[], includeMod: boolean): FoundryData[] {
  return parts.map((p, i) => ({
    custom: { enabled: false, formula: "" },
    number: p.count,
    denomination: p.die,
    bonus: includeMod && i === 0 && p.bonus ? "@mod" : "",
    types: [p.type],
    scaling: { number: 1 },
  }))
}

function activationData(type: ActivationType, cost?: number): FoundryData {
  return {
    type,
    value: type === "legendary" ? cost ?? 1 : type ? 1 : null,
    condition: "",
    override: false,
  }
}

function consumptionData(feature: Feature, opts: ItemOptions): FoundryData {
  const targets: FoundryData[] = []
  if (feature.recharge || feature.perDay) {
    targets.push({ type: "itemUses", target: "", value: "1", scaling: {} })
  }
  if (opts.consumeLegendary) {
    targets.push({
      type: "attribute",
      target: "resources.legact.value",
      value: String(opts.cost ?? 1),
      scaling: {},
    })
  }
  if (opts.consumeLegendaryResistance) {
    targets.push({
      type: "attribute",
      target: "resources.legres.value",
      value: "1",
      scaling: {},
    })
  }
  return { targets, scaling: { allowed: false, max: "" }, spellSlot: true }
}

function saveActivity(
  id: string,
  save: SaveData,
  feature: Feature,
  opts: ItemOptions,
  sort: number
): FoundryData {
  const area = save.area
  const isArea = !!area && area.shape !== undefined
  const template = isArea
    ? {
        count: "",
        contiguous: false,
        type: area.shape,
        size: String(area.size),
        width: area.width ? String(area.width) : "",
        height: "",
        units: "ft",
      }
    : {
        count: "",
        contiguous: false,
        type: "",
        size: "",
        width: "",
        height: "",
        units: "ft",
      }
  return {
    _id: id,
    type: "save",
    name: "",
    img: "",
    sort,
    activation: activationData(opts.activation, opts.cost),
    consumption: consumptionData(feature, opts),
    description: { chatFlavor: "" },
    duration: {
      concentration: false,
      value: "",
      units: "inst",
      special: "",
      override: false,
    },
    effects: [],
    range: area?.range
      ? { value: String(area.range), units: "ft", special: "", override: false }
      : { units: isArea ? "self" : "", special: "", override: false },
    target: {
      template,
      affects: { count: "", type: "creature", choice: false, special: "" },
      prompt: true,
      override: false,
    },
    uses: { spent: 0, max: "", recovery: [] },
    damage: {
      onSave: save.onSave,
      parts: damageParts(save.damage, false),
    },
    save: {
      ability: [save.ability],
      dc: { calculation: "", formula: String(save.dc) },
    },
    flags: {},
  }
}

function attackActivity(
  id: string,
  feature: Feature,
  opts: ItemOptions,
  finesse: boolean
): FoundryData {
  const attack = feature.attack
  const isWeapon = !!feature.weapon
  return {
    _id: id,
    type: "attack",
    name: "",
    img: "",
    sort: 0,
    activation: activationData(opts.activation, opts.cost),
    consumption: consumptionData(feature, opts),
    description: { chatFlavor: "" },
    duration: {
      concentration: false,
      value: "",
      units: "inst",
      special: "",
      override: false,
    },
    effects: [],
    range: { override: false, units: "ft", special: "" },
    target: {
      template: {
        count: "",
        contiguous: false,
        type: "",
        size: "",
        width: "",
        height: "",
        units: "ft",
      },
      affects: { count: "1", type: "creature", choice: false, special: "" },
      prompt: true,
      override: false,
    },
    uses: { spent: 0, max: "", recovery: [] },
    attack: {
      ability: isWeapon ? "" : finesse ? "dex" : "str",
      bonus: "",
      critical: { threshold: attack?.critThreshold ?? null },
      flat: false,
      type: { value: attack?.type ?? "melee", classification: "weapon" },
    },
    damage: {
      critical: { bonus: "" },
      includeBase: isWeapon,
      parts: isWeapon
        ? damageParts(attack?.damage.slice(1) ?? [], false)
        : damageParts(attack?.damage ?? [], true),
    },
    flags: {},
  }
}

function utilityActivity(
  id: string,
  feature: Feature,
  opts: ItemOptions
): FoundryData {
  return {
    _id: id,
    type: "utility",
    name: "",
    img: "",
    sort: 0,
    activation: activationData(opts.activation, opts.cost),
    consumption: consumptionData(feature, opts),
    description: { chatFlavor: "" },
    duration: {
      concentration: false,
      value: "",
      units: "",
      special: "",
      override: false,
    },
    effects: [],
    range: { units: "", special: "", override: false },
    target: {
      template: {
        count: "",
        contiguous: false,
        type: "",
        size: "",
        width: "",
        height: "",
        units: "",
      },
      affects: { count: "", type: "", choice: false, special: "" },
      prompt: true,
      override: false,
    },
    uses: { spent: 0, max: "", recovery: [] },
    roll: { formula: "", name: "", prompt: false, visible: false },
    flags: {},
  }
}

function usesData(feature: Feature): FoundryData {
  if (feature.recharge) {
    return {
      max: "1",
      spent: 0,
      recovery: [
        {
          period: "recharge",
          formula: String(feature.recharge),
          type: "recoverAll",
        },
      ],
    }
  }
  if (feature.perDay) {
    return {
      max: String(feature.perDay),
      spent: 0,
      recovery: [{ period: "day", type: "recoverAll", formula: "" }],
    }
  }
  return { max: "", spent: 0, recovery: [] }
}

function stats(): FoundryData {
  return {
    systemId: "dnd5e",
    systemVersion: "4.0.0",
    coreVersion: "12.331",
    exportSource: null,
  }
}

function featureItem(
  block: StatBlock,
  feature: Feature,
  opts: ItemOptions,
  defaultIcon: string
): FoundryData {
  const idSeed = `${block.seed}:${block.tribe}:${block.power}:${feature.kind}:${feature.id}`
  const itemId = foundryId(idSeed)
  const activities: Record<string, FoundryData> = {}

  const needsActivity =
    opts.activation !== "" || !!feature.save || opts.consumeLegendaryResistance
  if (feature.attack) {
    const id = foundryId(`${idSeed}:attack`)
    activities[id] = attackActivity(
      id,
      feature,
      opts,
      block.mods.dex > block.mods.str
    )
  }
  if (feature.save) {
    const id = foundryId(`${idSeed}:save`)
    // A save that rides on an attack is resolved after the hit, not as a
    // separate action.
    const saveOpts = feature.attack
      ? { ...opts, consumeLegendary: false, activation: "special" as const }
      : opts
    activities[id] = saveActivity(id, feature.save, feature, saveOpts, 100000)
  }
  if (!feature.attack && !feature.save && needsActivity) {
    const id = foundryId(`${idSeed}:utility`)
    activities[id] = utilityActivity(id, feature, opts)
  }

  const description = { value: paragraph(feature.text), chat: "" }
  const common = {
    _id: itemId,
    name: feature.name,
    img: feature.icon ?? defaultIcon,
    effects: [],
    folder: null,
    sort: opts.sort,
    flags: {},
    _stats: stats(),
  }

  if (feature.weapon && feature.attack) {
    const [base] = feature.attack.damage
    const finesse = block.mods.dex > block.mods.str
    return {
      ...common,
      type: "weapon",
      system: {
        description,
        identifier: feature.id,
        quantity: 1,
        weight: { value: 0, units: "lb" },
        price: { value: 0, denomination: "gp" },
        equipped: true,
        identified: true,
        proficient: null,
        range: {
          value: null,
          long: null,
          units: "ft",
          reach: feature.attack.reach ?? 5,
        },
        uses: usesData(feature),
        damage: {
          base: {
            number: base.count,
            denomination: base.die,
            bonus: "",
            types: [base.type],
            custom: { enabled: false, formula: "" },
            scaling: { mode: "", number: null, formula: "" },
          },
        },
        properties: finesse ? ["fin"] : [],
        type: { value: "natural", baseItem: "" },
        activities,
      },
    }
  }

  return {
    ...common,
    type: "feat",
    system: {
      description,
      identifier: feature.id,
      type: { value: "monster", subtype: "" },
      requirements: "",
      properties: [],
      uses: usesData(feature),
      activities,
    },
  }
}

function descriptionItem(
  block: StatBlock,
  id: string,
  name: string,
  html: string,
  sort: number
): FoundryData {
  return {
    _id: foundryId(`${block.seed}:${block.tribe}:${block.power}:desc:${id}`),
    name,
    type: "feat",
    img: "icons/creatures/reptiles/dragon-horned-blue.webp",
    system: {
      description: { value: html, chat: "" },
      identifier: id,
      type: { value: "monster", subtype: "" },
      requirements: "",
      properties: [],
      uses: { max: "", spent: 0, recovery: [] },
      activities: {},
    },
    effects: [],
    folder: null,
    sort,
    flags: {},
    _stats: stats(),
  }
}

const LANGUAGE_KEYS: Record<string, string> = {
  Draconic: "draconic",
  Common: "common",
}

function biography(block: StatBlock) {
  const rare = [...block.variants, ...(block.animus ? ["Animus"] : [])]
  return [
    `<p><strong>${escapeHtml(block.tribeName)}</strong> · ${escapeHtml(
      block.ageCategory
    )} (${block.ageYears} years) · Power ${block.power}/10</p>`,
    rare.length
      ? `<p><strong>Rare traits:</strong> ${escapeHtml(rare.join(", "))}</p>`
      : "",
    `<p><strong>Appearance:</strong> ${escapeHtml(
      block.flavor.appearance
    )}</p>`,
    `<p><strong>Personality:</strong> ${escapeHtml(
      block.flavor.personality
    )}</p>`,
    `<p><strong>Quirk:</strong> ${escapeHtml(block.flavor.quirk)}</p>`,
    `<p><strong>Hook:</strong> ${escapeHtml(block.flavor.hook)}</p>`,
    `<p><em>Generated by the Wings of Fire dragon generator (seed ${escapeHtml(
      block.seed
    )}).</em></p>`,
  ].join("")
}

export function toFoundryActor(block: StatBlock): FoundryData {
  const saveSet = new Set<Ability>(block.saves.map((s) => s.ability))
  const abilities = ABILITIES.reduce<Record<string, FoundryData>>((acc, a) => {
    acc[a] = {
      value: block.abilities[a],
      proficient: saveSet.has(a) ? 1 : 0,
      bonuses: { check: "", save: "" },
    }
    return acc
  }, {})

  const skills = block.skills.reduce<Record<string, FoundryData>>((acc, s) => {
    acc[s.id] = { value: s.expertise ? 2 : 1 }
    return acc
  }, {})

  const languageKeys = block.languages
    .map((l) => LANGUAGE_KEYS[l])
    .filter((l): l is string => !!l)
  const customLanguages = [
    ...block.languages.filter((l) => !LANGUAGE_KEYS[l]),
    ...(block.telepathy ? [`telepathy ${block.telepathy} ft.`] : []),
  ].join("; ")

  const items: FoundryData[] = []
  let sort = 100000
  const next = () => (sort += 100000)

  for (const trait of block.traits) {
    const isLegRes = trait.id === "legendary-resistance"
    items.push(
      featureItem(
        block,
        trait,
        {
          activation: isLegRes
            ? "special"
            : trait.perDay || trait.recharge
            ? "special"
            : "",
          consumeLegendaryResistance: isLegRes,
          sort: next(),
        },
        "icons/creatures/reptiles/dragon-horned-blue.webp"
      )
    )
  }
  for (const action of block.actions) {
    items.push(
      featureItem(
        block,
        action,
        { activation: "action", sort: next() },
        "icons/skills/melee/blade-tips-triple-steel.webp"
      )
    )
  }
  for (const bonus of block.bonusActions) {
    items.push(
      featureItem(
        block,
        bonus,
        { activation: "bonus", sort: next() },
        "icons/skills/movement/feet-winged-boots-brown.webp"
      )
    )
  }
  for (const reaction of block.reactions) {
    items.push(
      featureItem(
        block,
        reaction,
        { activation: "reaction", sort: next() },
        "icons/magic/holy/barrier-shield-winged-blue.webp"
      )
    )
  }
  if (block.legendary) {
    items.push(
      descriptionItem(
        block,
        "legendary-actions",
        "Legendary Actions",
        paragraph(block.legendary.intro),
        next()
      )
    )
    for (const la of block.legendary.actions) {
      items.push(
        featureItem(
          block,
          la,
          {
            activation: "legendary",
            cost: la.cost ?? 1,
            consumeLegendary: true,
            sort: next(),
          },
          "icons/creatures/reptiles/dragon-horned-blue.webp"
        )
      )
    }
  }
  if (block.lair) {
    items.push(
      descriptionItem(
        block,
        "lair-actions",
        "Lair Actions",
        paragraph(block.lair.intro),
        next()
      )
    )
    for (const la of block.lair.actions) {
      items.push(
        featureItem(
          block,
          la,
          { activation: "lair", sort: next() },
          "icons/magic/earth/barrier-stone-explosion-debris.webp"
        )
      )
    }
  }
  if (block.regional) {
    items.push(
      descriptionItem(
        block,
        "regional-effects",
        "Regional Effects",
        paragraph(block.regional.intro) +
          `<ul>${block.regional.effects
            .map(
              (e) =>
                `<li><strong>${escapeHtml(e.name)}.</strong> ${escapeHtml(
                  e.text
                )}</li>`
            )
            .join("")}</ul>`,
        next()
      )
    )
  }

  const size = tokenSize(block)

  return {
    name: block.name,
    type: "npc",
    img: "icons/creatures/reptiles/dragon-horned-blue.webp",
    system: {
      abilities,
      attributes: {
        ac: { calc: "natural", flat: block.ac, formula: "" },
        hp: {
          value: block.hp.average,
          max: block.hp.average,
          temp: null,
          tempmax: null,
          formula: block.hp.formula,
        },
        movement: {
          walk: block.speed.walk,
          fly: block.speed.fly,
          swim: block.speed.swim,
          burrow: block.speed.burrow,
          climb: block.speed.climb,
          units: "ft",
          hover: block.speed.hover,
        },
        senses: {
          darkvision: block.senses.darkvision,
          blindsight: block.senses.blindsight,
          tremorsense: block.senses.tremorsense,
          truesight: block.senses.truesight,
          units: "ft",
          special: "",
        },
        spellcasting: block.animus ? "cha" : "",
      },
      details: {
        biography: { value: biography(block), public: "" },
        alignment: block.alignment,
        type: {
          value: "dragon",
          subtype: block.tribeName,
          swarm: "",
          custom: "",
        },
        environment: block.habitat,
        cr: block.cr,
        spellLevel: block.animus ? Math.min(20, block.power * 2) : 0,
      },
      traits: {
        size: block.size,
        di: { value: block.immunities, bypasses: [], custom: "" },
        dr: { value: block.resistances, bypasses: [], custom: "" },
        dv: { value: block.vulnerabilities, bypasses: [], custom: "" },
        ci: { value: block.conditionImmunities, custom: "" },
        languages: { value: languageKeys, custom: customLanguages },
      },
      skills,
      resources: {
        legact: {
          value: block.legendary?.count ?? 0,
          max: block.legendary?.count ?? 0,
        },
        legres: {
          value: block.legendaryResistance,
          max: block.legendaryResistance,
        },
        lair: { value: !!block.lair, initiative: block.lair ? 20 : null },
      },
    },
    prototypeToken: {
      name: block.shortName,
      displayName: 20,
      actorLink: false,
      width: size,
      height: size,
      disposition: -1,
      texture: { src: "icons/creatures/reptiles/dragon-horned-blue.webp" },
      sight: {
        enabled: true,
        range: Math.max(block.senses.darkvision, block.senses.blindsight),
      },
    },
    items,
    effects: [],
    folder: null,
    flags: {
      "wof-dragon-generator": {
        seed: block.seed,
        tribe: block.tribe,
        power: block.power,
      },
    },
    _stats: stats(),
  }
}

export function toFoundryJSON(block: StatBlock): string {
  return JSON.stringify(toFoundryActor(block), null, 2)
}

export function exportFileName(block: StatBlock, suffix: string) {
  const base = block.shortName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return `${base || "dragon"}-${block.tribe}-p${block.power}${suffix}`
}
