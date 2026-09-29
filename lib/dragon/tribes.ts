import {
  Ability,
  AreaShape,
  Condition,
  DamageType,
  FeatureContext,
  SaveData,
  SkillProficiency,
  TribeId,
} from "@/lib/dragon/types"

export interface TribeFeatureDef {
  id: string
  name: string
  kind: "trait" | "action" | "bonus" | "reaction"
  minPower?: number
  maxPower?: number
  recharge?: number
  perDay?: (power: number) => number
  icon?: string
  text: (ctx: FeatureContext) => string
  save?: (ctx: FeatureContext) => SaveData
}

export interface TribeLegendaryDef {
  id: string
  name: string
  cost: number
  text: (ctx: FeatureContext) => string
  /** Reuses a tribe attack by id when set. */
  attackId?: string
  save?: (ctx: FeatureContext) => SaveData
}

export interface TribeAttackDef {
  id: string
  name: string
  minPower?: number
  damageType: DamageType
  die: number
  /** Number of damage dice at power 1..10. */
  counts: number[]
  rider?: { type: DamageType; die: number; counts: number[] }
  reachBonus?: number
  inMultiattack: boolean
  icon?: string
  onHit?: (ctx: FeatureContext) => {
    ability: Ability
    condition: Condition
    duration: string
  }
}

export interface TribeBreathDef {
  id: string
  name: string
  /** e.g. "exhales fire in" */
  verb: string
  shape: AreaShape
  damageType: DamageType | null
  save: Ability
  die: number
  /** Multiplier against the baseline breath damage curve. */
  damageScale: number
  condition?: Condition
  extra?: (ctx: FeatureContext) => string
  icon?: string
}

export interface RareVariantDef {
  id: string
  name: string
  /** Base chance at power 5; scaled mildly by power. */
  chance: number
  blurb: string
  features: TribeFeatureDef[]
  immunities?: DamageType[]
  breath?: Partial<TribeBreathDef>
}

export interface Tribe {
  id: TribeId
  name: string
  kingdom: "Pyrrhia" | "Pantala"
  description: string
  habitat: string
  abilityThemes: string
  alignments: string[]
  colors: string[]
  abilityMods: Partial<Record<Ability, number>>
  saves: Ability[]
  skills: SkillProficiency[]
  /** Primary damage types, used for flavor and summaries. */
  damageTypes: DamageType[]
  /** Elemental rider on the bite, if any. */
  biteRider: DamageType | null
  clawCritThreshold?: number
  breath: TribeBreathDef
  movement: {
    walk?: number
    fly?: number
    swim?: number
    burrow?: number
    climb?: number
    hover?: boolean
    notes?: string
    /** Tribe members at or below this power have no flying speed. */
    winglessUntil?: number
  }
  darkvision: number
  extraLanguages?: string[]
  resistances: DamageType[]
  immunities: DamageType[]
  vulnerabilities: DamageType[]
  conditionImmunities: Condition[]
  acBonus: number
  hpMultiplier: number
  features: TribeFeatureDef[]
  attacks: TribeAttackDef[]
  legendary: TribeLegendaryDef
  lair: {
    actions: TribeFeatureDef[]
    regional: TribeFeatureDef[]
  }
  variants: RareVariantDef[]
  animusAffinity: number
  names: {
    single: string[]
    prefixes: string[]
    suffixes: string[]
    compoundChance: number
  }
  epithets: string[]
  personality: string[]
  quirks: string[]
  hooks: string[]
}

const lairTrait = (
  id: string,
  name: string,
  text: (ctx: FeatureContext) => string,
  save?: (ctx: FeatureContext) => SaveData
): TribeFeatureDef => ({ id, name, kind: "trait", text, save })

export const TRIBES: Tribe[] = [
  {
    id: "mudwing",
    name: "MudWing",
    kingdom: "Pyrrhia",
    description:
      "Broad, heavily armored swamp dragons with brown and amber scales. MudWings hatch in siblinghoods led by the first-hatched 'bigwings' and prize loyalty above everything. They can hold their breath for an hour while wallowing and breathe fire only when their bodies are warm.",
    habitat: "Swamp",
    abilityThemes:
      "Raw strength and endurance, sibling pack tactics, mud camouflage, fire when warm.",
    alignments: ["Lawful Neutral", "Neutral Good", "Lawful Good", "Neutral"],
    colors: [
      "mud-brown",
      "amber",
      "tawny",
      "deep umber",
      "bronze-flecked brown",
      "ochre",
    ],
    abilityMods: { str: 2, con: 2, dex: -1, cha: -1 },
    saves: ["str", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "ste" }, { id: "ath", expertise: true }],
    damageTypes: ["fire", "bludgeoning"],
    biteRider: "fire",
    breath: {
      id: "fire-breath",
      name: "Fire Breath",
      verb: "exhales fire in",
      shape: "cone",
      damageType: "fire",
      save: "dex",
      die: 6,
      damageScale: 0.9,
      extra: (c) =>
        `${c.name} can't use this action if its body has been chilled (for example, after an hour in freezing conditions).`,
      icon: "icons/magic/fire/flame-burning-earth-orange.webp",
    },
    movement: { swim: 30 },
    darkvision: 60,
    resistances: ["fire"],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 1,
    hpMultiplier: 1.1,
    features: [
      {
        id: "hold-breath",
        name: "Hold Breath",
        kind: "trait",
        text: (c) => `${c.name} can hold its breath for 1 hour.`,
      },
      {
        id: "mud-camouflage",
        name: "Mud Camouflage",
        kind: "trait",
        text: (c) =>
          `${c.name} has advantage on Dexterity (Stealth) checks made to hide in mud, swamps, or murky water, and can attempt to hide there even when only lightly obscured.`,
      },
      {
        id: "siblinghood-tactics",
        name: "Siblinghood Tactics",
        kind: "trait",
        minPower: 3,
        text: (c) =>
          `${c.name} has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally isn't incapacitated.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "wallow",
      name: "Wallow",
      cost: 2,
      text: (c) =>
        `${c.name} sinks into mud or water within 5 feet of it, moves up to half its speed without provoking opportunity attacks, and takes the Hide action.`,
    },
    lair: {
      actions: [
        lairTrait(
          "mud-geyser",
          "Mud Geyser",
          (c) =>
            `Scalding mud erupts in a 20-foot-radius sphere centered on a point ${
              c.name
            } can see within 120 feet. Each creature there must succeed on a DC ${c.dc(
              "con"
            )} Strength saving throw or be restrained until initiative count 20 on the next round.`,
          (c) => ({
            ability: "str",
            dc: c.dc("con"),
            onSave: "none",
            damage: [],
            condition: "restrained",
            area: { shape: "sphere", size: 20, range: 120 },
          })
        ),
        lairTrait(
          "sucking-mire",
          "Sucking Mire",
          (c) =>
            `The ground in a 40-foot square within 120 feet of ${c.name} turns to sucking mire and becomes difficult terrain until initiative count 20 on the next round. Creatures that end their turn there sink up to their knees and are knocked prone.`
        ),
      ],
      regional: [
        lairTrait(
          "choking-fog",
          "Choking Fog",
          () =>
            "Within 6 miles of the lair, warm fog rises from the swamp every dusk. The area beyond 60 feet from any creature is lightly obscured."
        ),
        lairTrait(
          "warm-waters",
          "Warm Waters",
          () =>
            "Streams within 3 miles of the lair run brown and warm, and crocodiles and herons there regard MudWings as kin."
        ),
      ],
    },
    variants: [
      {
        id: "bigwings",
        name: "Bigwings",
        chance: 0.12,
        blurb:
          "First-hatched of its siblinghood: larger, braver, and fireproof.",
        immunities: ["fire"],
        features: [
          {
            id: "bigwings",
            name: "Bigwings",
            kind: "trait",
            text: (c) =>
              `${c.name} is the first-hatched of its siblinghood. It is immune to fire, and allies within 30 feet of it that can see it have advantage on saving throws against being frightened.`,
          },
          {
            id: "shield-the-siblings",
            name: "Shield the Siblings",
            kind: "reaction",
            text: (c) =>
              `When a creature ${c.name} can see targets an ally within 5 feet of it with an attack, ${c.name} becomes the target instead.`,
          },
        ],
      },
    ],
    animusAffinity: 0.6,
    names: {
      single: [
        "Clay",
        "Reed",
        "Umber",
        "Sepia",
        "Marsh",
        "Crane",
        "Cattail",
        "Pheasant",
        "Newt",
        "Sora",
        "Ochre",
        "Sienna",
        "Bog",
        "Tamarack",
        "Loam",
        "Russet",
        "Heron",
        "Bittern",
        "Asha",
        "Crocodile",
      ],
      prefixes: ["Mud", "Silt", "Bog", "Mire", "Fen"],
      suffixes: ["wallow", "runner", "hide", "tail", "stomp"],
      compoundChance: 0.15,
    },
    epithets: ["the Unsinkable", "the Mire-Warden", "Siblingshield"],
    personality: [
      "Fiercely loyal to its siblings; will never leave one behind.",
      "Slow to anger, impossible to stop once roused.",
      "Thinks every problem looks smaller after a good meal.",
      "Deeply suspicious of anyone who talks too fast.",
    ],
    quirks: [
      "A crust of dried mud is always flaking off its wings.",
      "Bits of reed are tangled around its horns.",
      "Smells faintly of peat smoke.",
      "Missing a notch of its ear-frill from a sibling scuffle.",
    ],
    hooks: [
      "Searching for a sibling carried off by raiders.",
      "Guarding a clutch of eggs hidden in a sunken ruin.",
    ],
  },
  {
    id: "sandwing",
    name: "SandWing",
    kingdom: "Pyrrhia",
    description:
      "Pale gold desert dragons with forked black tongues and a venomous barbed tail. SandWings can go weeks without water, swim through loose sand, and survive heat that would kill other tribes. Their kingdom has been torn by bitter succession wars.",
    habitat: "Desert",
    abilityThemes:
      "Agility and cunning, lethal tail venom, heat endurance, sand burrowing.",
    alignments: ["Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Good"],
    colors: [
      "pale gold",
      "sand-white",
      "dusty tan",
      "sun-bleached cream",
      "burnished copper",
    ],
    abilityMods: { dex: 2, wis: 1, str: -1 },
    saves: ["dex", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "ste" }, { id: "sur" }, { id: "dec" }],
    damageTypes: ["fire", "poison"],
    biteRider: "fire",
    breath: {
      id: "fire-breath",
      name: "Fire Breath",
      verb: "exhales fire in",
      shape: "cone",
      damageType: "fire",
      save: "dex",
      die: 6,
      damageScale: 1,
      icon: "icons/magic/fire/flame-burning-earth-orange.webp",
    },
    movement: { burrow: 20, notes: "burrow (sand only)" },
    darkvision: 60,
    resistances: ["fire", "poison"],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 0,
    hpMultiplier: 1,
    features: [
      {
        id: "desert-walker",
        name: "Desert Walker",
        kind: "trait",
        text: (c) =>
          `${c.name} ignores difficult terrain made of sand or loose earth, is naturally adapted to extreme heat, and can go without water for up to 2 weeks.`,
      },
      {
        id: "heat-shimmer",
        name: "Heat Shimmer",
        kind: "bonus",
        minPower: 5,
        recharge: 5,
        text: (c) =>
          `${c.name} kicks up a veil of glittering sand and heat haze. Until the start of its next turn, attack rolls against it have disadvantage.`,
      },
    ],
    attacks: [
      {
        id: "tail-barb",
        name: "Tail Barb",
        damageType: "piercing",
        die: 8,
        counts: [1, 1, 1, 1, 2, 2, 2, 2, 2, 3],
        rider: {
          type: "poison",
          die: 6,
          counts: [1, 1, 2, 2, 3, 4, 5, 6, 7, 8],
        },
        reachBonus: 5,
        inMultiattack: true,
        icon: "icons/creatures/abilities/stinger-poison-green.webp",
        onHit: (c) => ({
          ability: "con",
          condition: "poisoned",
          duration:
            c.power >= 6 ? "for 1 minute" : "until the end of its next turn",
        }),
      },
    ],
    legendary: {
      id: "barb-strike",
      name: "Barb Strike",
      cost: 2,
      attackId: "tail-barb",
      text: (c) => `${c.name} makes one Tail Barb attack.`,
    },
    lair: {
      actions: [
        lairTrait(
          "sandstorm",
          "Sandstorm",
          (c) =>
            `A whirling sandstorm fills a 20-foot-radius sphere centered on a point within 120 feet. The area is heavily obscured until initiative count 20 on the next round, and each creature in it must succeed on a DC ${c.dc(
              "con"
            )} Constitution saving throw or be blinded until the end of its next turn.`,
          (c) => ({
            ability: "con",
            dc: c.dc("con"),
            onSave: "none",
            damage: [],
            condition: "blinded",
            area: { shape: "sphere", size: 20, range: 120 },
          })
        ),
        lairTrait(
          "sinking-sand",
          "Sinking Sand",
          (c) =>
            `Sand liquefies beneath up to three creatures ${
              c.name
            } can see within 60 feet. Each must succeed on a DC ${c.dc(
              "con"
            )} Strength saving throw or be restrained until the end of its next turn.`
        ),
      ],
      regional: [
        lairTrait(
          "brackish-water",
          "Brackish Water",
          () =>
            "Water sources within 6 miles of the lair turn brackish; creatures other than SandWings need twice as much water to avoid exhaustion."
        ),
        lairTrait(
          "mirages",
          "Mirages",
          () =>
            "Mirages shimmer on the horizon within 3 miles of the lair. Wisdom (Survival) checks to navigate there have disadvantage."
        ),
      ],
    },
    variants: [],
    animusAffinity: 1,
    names: {
      single: [
        "Blister",
        "Burn",
        "Blaze",
        "Thorn",
        "Cactus",
        "Vulture",
        "Onyx",
        "Jackal",
        "Addax",
        "Oasis",
        "Dune",
        "Mesquite",
        "Sidewinder",
        "Fennec",
        "Scorpion",
        "Sirocco",
        "Saguaro",
        "Jerboa",
        "Armadillo",
        "Pronghorn",
      ],
      prefixes: ["Sun", "Dust", "Sand", "Dune", "Six"],
      suffixes: ["strike", "runner", "fang", "-Claws", "shimmer"],
      compoundChance: 0.2,
    },
    epithets: ["the Barbed", "Dunestrider", "the Unthirsting"],
    personality: [
      "Always calculating the odds, and usually right.",
      "Charming, soft-spoken, and utterly untrustworthy.",
      "Pragmatic to a fault; sentiment is a luxury of the well-watered.",
      "Collects gossip about the royal succession like treasure.",
    ],
    quirks: [
      "Flicks its forked tongue to taste the air mid-conversation.",
      "Its tail barb is painted with a tiny black sun.",
      "Wears a bandolier of stolen scavenger trinkets.",
      "A pale scar runs the length of its snout from a sandstorm.",
    ],
    hooks: [
      "Hunting the thief who stole a piece of its hoard.",
      "Secretly backing a claimant to the SandWing throne.",
    ],
  },
  {
    id: "skywing",
    name: "SkyWing",
    kingdom: "Pyrrhia",
    description:
      "Red and orange mountain dragons with enormous wings, the fastest flyers in Pyrrhia. Queen Scarlet's arena made them notorious fighters. Very rarely a SkyWing hatches with firescales, burning so hot that its touch sets things alight.",
    habitat: "Mountain",
    abilityThemes:
      "Speed and aerial mastery, diving strikes, arena brawling, fire.",
    alignments: ["Lawful Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral"],
    colors: [
      "crimson",
      "flame-orange",
      "ruby red",
      "sunset gold",
      "copper-red",
    ],
    abilityMods: { str: 1, dex: 2, cha: 1, int: -1, wis: -1 },
    saves: ["dex", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "ste" }, { id: "acr" }, { id: "itm" }],
    damageTypes: ["fire", "slashing"],
    biteRider: "fire",
    breath: {
      id: "fire-breath",
      name: "Fire Breath",
      verb: "exhales fire in",
      shape: "cone",
      damageType: "fire",
      save: "dex",
      die: 6,
      damageScale: 1,
      icon: "icons/creatures/abilities/dragon-fire-breath-orange.webp",
    },
    movement: { fly: 20 },
    darkvision: 60,
    resistances: [],
    immunities: ["fire"],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 0,
    hpMultiplier: 1,
    features: [
      {
        id: "flyby",
        name: "Flyby",
        kind: "trait",
        text: (c) =>
          `${c.name} doesn't provoke opportunity attacks when it flies out of an enemy's reach.`,
      },
      {
        id: "diving-strike",
        name: "Diving Strike",
        kind: "trait",
        minPower: 3,
        text: (c) =>
          `If ${
            c.name
          } flies at least 30 feet straight toward a target and then hits it with a claw attack on the same turn, the target takes an extra ${c.dice(
            c.scale(1, 6),
            8
          )} slashing damage. If the target is a creature, it must succeed on a DC ${c.dc(
            "str"
          )} Strength saving throw or be knocked prone.`,
      },
      {
        id: "arena-fighter",
        name: "Arena Fighter",
        kind: "reaction",
        minPower: 5,
        text: (c) =>
          `${c.name} adds ${c.prof} to its AC against one melee attack that would hit it. To do so, it must see the attacker.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "swoop",
      name: "Swoop",
      cost: 2,
      text: (c) =>
        `${c.name} flies up to half its flying speed without provoking opportunity attacks and makes one claw attack at any point during the move.`,
    },
    lair: {
      actions: [
        lairTrait(
          "searing-updraft",
          "Searing Updraft",
          (c) =>
            `A blast of volcanic air roars upward. Each flying creature within 120 feet of ${
              c.name
            } must succeed on a DC ${c.dc(
              "str"
            )} Strength saving throw or be pushed 20 feet in a direction of ${
              c.name
            }'s choice.`
        ),
        lairTrait(
          "rockfall",
          "Rockfall",
          (c) =>
            `Stones crash down from the cliffs onto up to three 10-foot squares within 120 feet. Each creature there must make a DC ${c.dc(
              "con"
            )} Dexterity saving throw, taking ${c.dice(
              3,
              10
            )} bludgeoning damage on a failed save.`,
          (c) => ({
            ability: "dex",
            dc: c.dc("con"),
            onSave: "none",
            damage: [{ count: 3, die: 10, bonus: 0, type: "bludgeoning" }],
          })
        ),
      ],
      regional: [
        lairTrait(
          "favorable-thermals",
          "Favorable Thermals",
          () =>
            "Within 6 miles of the lair, SkyWings ride perfect thermals; their flying speed increases by 10 feet."
        ),
        lairTrait(
          "smoking-vents",
          "Smoking Vents",
          () =>
            "Volcanic vents within 1 mile of the lair belch smoke; the area is lightly obscured."
        ),
      ],
    },
    variants: [
      {
        id: "firescales",
        name: "Firescales",
        chance: 0.06,
        blurb: "Hatched with blazing scales that burn anything they touch.",
        immunities: ["fire"],
        features: [
          {
            id: "firescales",
            name: "Firescales",
            kind: "trait",
            text: (c) =>
              `${
                c.name
              }'s scales burn with unnatural heat. A creature that touches it or hits it with a melee attack while within 5 feet takes ${c.dice(
                c.scale(1, 6),
                10
              )} fire damage, flammable objects it touches ignite, and its melee attacks deal an extra ${c.dice(
                c.scale(1, 4),
                6
              )} fire damage.`,
          },
        ],
      },
    ],
    animusAffinity: 0.5,
    names: {
      single: [
        "Peril",
        "Ruby",
        "Hawk",
        "Kestrel",
        "Cliff",
        "Flame",
        "Garnet",
        "Osprey",
        "Vermilion",
        "Carmine",
        "Harrier",
        "Merlin",
        "Cinder",
        "Ember",
        "Magma",
        "Tourmaline",
        "Sunstone",
        "Falcon",
      ],
      prefixes: ["Sky", "Sun", "Blaze", "Cloud", "Fire"],
      suffixes: ["strike", "talon", "wing", "burst"],
      compoundChance: 0.12,
    },
    epithets: ["Arena Champion", "the Swift", "Skyrender"],
    personality: [
      "Treats every conversation like a duel it intends to win.",
      "Restless; can't stay grounded for more than an hour.",
      "Loyal to the queen, whoever the queen happens to be.",
      "Proud of its arena record and eager to add to it.",
    ],
    quirks: [
      "Wing membranes are patterned with old arena scars.",
      "Always perches on the highest point in a room.",
      "Wears a gold arena band around one horn.",
      "Its eyes glow faintly orange in the dark.",
    ],
    hooks: [
      "Fled the arena and is hunted by its former keepers.",
      "Carries urgent messages across the Claws of the Clouds.",
    ],
  },
  {
    id: "seawing",
    name: "SeaWing",
    kingdom: "Pyrrhia",
    description:
      "Blue and green ocean dragons with webbed talons, gills, and bioluminescent stripes that they flash to speak Aquatic in the dark. SeaWings breathe underwater and are powerful swimmers, but they cannot breathe fire.",
    habitat: "Coastal, Underwater",
    abilityThemes:
      "Amphibious strength, bioluminescent signaling, crushing water jets, deep-sea senses.",
    alignments: ["Lawful Neutral", "Lawful Good", "Neutral", "Lawful Evil"],
    colors: [
      "ocean blue",
      "sea-green",
      "teal",
      "deep navy",
      "turquoise",
      "silver-blue",
    ],
    abilityMods: { str: 1, con: 2, cha: -1 },
    saves: ["dex", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "ath" }, { id: "ste" }, { id: "ins" }],
    damageTypes: ["bludgeoning", "cold"],
    biteRider: null,
    breath: {
      id: "tidal-jet",
      name: "Tidal Jet",
      verb: "blasts a torrent of pressurized seawater in",
      shape: "line",
      damageType: "bludgeoning",
      save: "dex",
      die: 8,
      damageScale: 0.9,
      condition: "prone",
      extra: () =>
        "A creature that fails the save is also pushed 10 feet away and knocked prone.",
      icon: "icons/magic/water/water-iceberg-bubbles.webp",
    },
    movement: { fly: -10, swim: 50 },
    darkvision: 120,
    extraLanguages: ["Aquatic"],
    resistances: ["cold"],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 0,
    hpMultiplier: 1.05,
    features: [
      {
        id: "amphibious",
        name: "Amphibious",
        kind: "trait",
        text: (c) => `${c.name} can breathe air and water.`,
      },
      {
        id: "aquatic-speech",
        name: "Aquatic Speech",
        kind: "trait",
        text: (c) =>
          `${c.name} communicates silently by flashing patterns along its glowing stripes (Aquatic). Any creature that knows Aquatic and can see it understands, even underwater or in total darkness.`,
      },
      {
        id: "luminescent-flash",
        name: "Luminescent Flash",
        kind: "bonus",
        recharge: 5,
        icon: "icons/magic/lightning/bolt-beam-strike-blue.webp",
        text: (c) =>
          `${c.name}'s stripes flare blindingly bright. Each creature within ${
            c.power >= 6 ? 30 : 15
          } feet of it that can see it must succeed on a DC ${c.dc(
            "con"
          )} Constitution saving throw or be blinded until the end of its next turn.`,
        save: (c) => ({
          ability: "con",
          dc: c.dc("con"),
          onSave: "none",
          damage: [],
          condition: "blinded",
          area: { shape: "sphere", size: c.power >= 6 ? 30 : 15 },
        }),
      },
      {
        id: "deep-diver",
        name: "Deep Diver",
        kind: "trait",
        minPower: 4,
        text: (c) =>
          `${c.name} ignores the effects of deep-water pressure, has advantage on Strength (Athletics) checks made to swim, and can take the Dash action as a bonus action while swimming.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "riptide",
      name: "Riptide",
      cost: 2,
      text: (c) =>
        `${
          c.name
        } churns the water around it. Each creature within 15 feet must succeed on a DC ${c.dc(
          "str"
        )} Strength saving throw or be pulled 10 feet toward ${
          c.name
        } and have its speed reduced to 0 until the end of its next turn.`,
      save: (c) => ({
        ability: "str",
        dc: c.dc("str"),
        onSave: "none",
        damage: [],
        area: { shape: "sphere", size: 15 },
      }),
    },
    lair: {
      actions: [
        lairTrait(
          "whirlpool",
          "Whirlpool",
          (c) =>
            `A whirlpool forms in a 20-foot-radius sphere of water within 120 feet. Each creature there must make a DC ${c.dc(
              "con"
            )} Strength saving throw, taking ${c.dice(
              3,
              8
            )} bludgeoning damage and being pulled 10 feet toward the center on a failed save.`,
          (c) => ({
            ability: "str",
            dc: c.dc("con"),
            onSave: "none",
            damage: [{ count: 3, die: 8, bonus: 0, type: "bludgeoning" }],
            area: { shape: "sphere", size: 20, range: 120 },
          })
        ),
        lairTrait(
          "plankton-bloom",
          "Plankton Bloom",
          (c) =>
            `Bioluminescent plankton flare within 60 feet of ${c.name}. Until initiative count 20 on the next round, invisible creatures in the water there are outlined in light and can't benefit from being invisible.`
        ),
      ],
      regional: [
        lairTrait(
          "treacherous-seas",
          "Treacherous Seas",
          () =>
            "Waters within 6 miles of the lair are calm for SeaWings but treacherous for ships; checks to pilot water vehicles have disadvantage."
        ),
        lairTrait(
          "glowing-shoals",
          "Glowing Shoals",
          () =>
            "Schools of glowing fish gather within 1 mile of the lair, filling the water with dim light."
        ),
      ],
    },
    variants: [],
    animusAffinity: 1.8,
    names: {
      single: [
        "Riptide",
        "Anemone",
        "Coral",
        "Turtle",
        "Whirlpool",
        "Shark",
        "Orca",
        "Auklet",
        "Pike",
        "Barracuda",
        "Lagoon",
        "Nautilus",
        "Moray",
        "Kelp",
        "Urchin",
        "Marlin",
        "Pearl",
        "Squid",
        "Albacore",
        "Cuttlefish",
      ],
      prefixes: ["Tide", "Wave", "Sea", "Deep", "Salt"],
      suffixes: ["runner", "caller", "song", "crest"],
      compoundChance: 0.15,
    },
    epithets: ["of the Deep Palace", "Tidecaller", "the Luminous"],
    personality: [
      "Formal and courtly; never forgets a slight to its family.",
      "Endlessly curious about anything that washes ashore.",
      "Speaks in Aquatic flashes when it thinks no one is watching.",
      "Brave to the point of recklessness in the water, cautious on land.",
    ],
    quirks: [
      "Its gill slits flutter when it is lying.",
      "Stripes pulse softly in time with its heartbeat.",
      "Wears pearls threaded through its horn-frills.",
      "Always slightly damp, no matter how long it has been on land.",
    ],
    hooks: [
      "Investigating a string of shipwrecks near the Summer Palace.",
      "Searching for a lost animus-touched treasure beneath the waves.",
    ],
  },
  {
    id: "rainwing",
    name: "RainWing",
    kingdom: "Pyrrhia",
    description:
      "Rainforest dragons whose scales shift color at will—and with their moods. Often dismissed as lazy sun-nappers, RainWings can become effectively invisible against any background, hang from branches by prehensile tails, and spit a deadly corrosive venom.",
    habitat: "Forest",
    abilityThemes:
      "Color-change camouflage, corrosive venom, agility, climbing.",
    alignments: ["Chaotic Good", "Neutral Good", "Chaotic Neutral", "Neutral"],
    colors: [
      "iridescent purple",
      "sunburst gold",
      "electric blue",
      "rose pink",
      "lime green",
      "shimmering teal",
    ],
    abilityMods: { dex: 3, cha: 1, str: -2, con: -1 },
    saves: ["dex", "con", "wis", "cha"],
    skills: [
      { id: "prc" },
      { id: "ste", expertise: true },
      { id: "acr" },
      { id: "prf" },
    ],
    damageTypes: ["acid"],
    biteRider: null,
    breath: {
      id: "venom-spit",
      name: "Venom Spit",
      verb: "spits corrosive venom in",
      shape: "line",
      damageType: "acid",
      save: "dex",
      die: 8,
      damageScale: 1,
      extra: (c) =>
        `The venom keeps eating through scales and flesh: a creature that fails the save takes ${c.dice(
          c.scale(1, 5),
          6
        )} acid damage at the start of its next turn unless it or an ally uses an action to wash the venom off.`,
      icon: "icons/magic/acid/projectile-faceted-glob.webp",
    },
    movement: { fly: -10, climb: 40 },
    darkvision: 60,
    resistances: ["acid", "poison"],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: -1,
    hpMultiplier: 0.9,
    features: [
      {
        id: "chromatic-camouflage",
        name: "Chromatic Camouflage",
        kind: "bonus",
        text: (c) => {
          const base = `${c.name} shifts its scales to match its surroundings and becomes invisible.`
          if (c.power >= 9)
            return `${base} It can move freely while invisible, and attacking or using Venom Spit only ends the invisibility at the end of its turn.`
          if (c.power >= 6)
            return `${base} It can move freely while invisible; the invisibility ends if it attacks or uses Venom Spit.`
          return `${base} The invisibility ends if it moves more than 10 feet in a turn, attacks, or uses Venom Spit.`
        },
      },
      {
        id: "emotional-scales",
        name: "Emotional Scales",
        kind: "trait",
        text: (c) =>
          `Unless it concentrates (as if on a spell), ${c.name}'s scales reveal its mood. Creatures that can see it have advantage on Wisdom (Insight) checks against it.`,
      },
      {
        id: "prehensile-tail",
        name: "Prehensile Tail",
        kind: "trait",
        text: (c) =>
          `${c.name} can climb difficult surfaces, including upside down on branches and ceilings, without an ability check, and can hold an object or grapple with its tail.`,
      },
      {
        id: "sun-soaked",
        name: "Sun-Soaked",
        kind: "trait",
        minPower: 2,
        text: (c) =>
          `If ${
            c.name
          } spends a short rest basking in direct sunlight, it regains an extra ${c.dice(
            c.scale(1, 8),
            8
          )} hit points.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "vanish",
      name: "Vanish",
      cost: 1,
      text: (c) => `${c.name} uses Chromatic Camouflage.`,
    },
    lair: {
      actions: [
        lairTrait(
          "writhing-vines",
          "Writhing Vines",
          (c) =>
            `Vines and hanging moss lash out at up to three creatures ${
              c.name
            } can see within 60 feet. Each must succeed on a DC ${c.dc(
              "dex"
            )} Dexterity saving throw or be restrained until initiative count 20 on the next round.`,
          (c) => ({
            ability: "dex",
            dc: c.dc("dex"),
            onSave: "none",
            damage: [],
            condition: "restrained",
          })
        ),
        lairTrait(
          "downpour",
          "Downpour",
          (c) =>
            `Torrential rain falls within 60 feet of ${c.name}. Until initiative count 20 on the next round, the area is heavily obscured for creatures other than RainWings.`
        ),
      ],
      regional: [
        lairTrait(
          "thick-canopy",
          "Thick Canopy",
          () =>
            "Within 6 miles of the lair, fruit is abundant and the canopy grows thick; the forest floor is lightly obscured."
        ),
        lairTrait(
          "chattering-sentinels",
          "Chattering Sentinels",
          (c) =>
            `Sloths, tree frogs, and birds chatter warnings; ${c.name} can't be surprised within 1 mile of its lair.`
        ),
      ],
    },
    variants: [],
    animusAffinity: 1,
    names: {
      single: [
        "Kinkajou",
        "Mangrove",
        "Grandeur",
        "Tamarin",
        "Bromeliad",
        "Jambu",
        "Coconut",
        "Liana",
        "Orchid",
        "Magnificent",
        "Exquisite",
        "Boto",
        "Tapir",
        "Heliconia",
        "Toucan",
        "Mango",
        "Passionflower",
        "Splendor",
        "Dazzling",
        "Marmoset",
      ],
      prefixes: [],
      suffixes: [],
      compoundChance: 0,
    },
    epithets: ["the Radiant", "Venomfang", "the Unseen"],
    personality: [
      "Cheerful and easily distracted by anything shiny or delicious.",
      "Secretly far more observant than it lets anyone believe.",
      "Takes its sun-time extremely seriously; do not interrupt.",
      "Wants desperately to prove RainWings are not lazy.",
    ],
    quirks: [
      "Its scales flush pink whenever it is embarrassed.",
      "Always has a piece of fruit tucked in its tail.",
      "Hangs upside down to think.",
      "Its venom fangs click softly when it is irritated.",
    ],
    hooks: [
      "Investigating RainWings who went missing from the canopy.",
      "Trying to master Venom Spit to earn a place on the queen's council.",
    ],
  },
  {
    id: "icewing",
    name: "IceWing",
    kingdom: "Pyrrhia",
    description:
      "Silver-white dragons of the frozen north with serrated claws, diamond-hard scales, and a lethal frost breath. IceWing society is rigidly ranked into Circles, and a rare few IceWings are animus dragons.",
    habitat: "Arctic",
    abilityThemes:
      "Endurance and discipline, killing frost, serrated claws, ice walking.",
    alignments: ["Lawful Neutral", "Lawful Evil", "Lawful Good", "Neutral"],
    colors: [
      "diamond white",
      "pale silver",
      "ice blue",
      "moonstone",
      "frost-grey with blue tips",
    ],
    abilityMods: { str: 1, con: 2, wis: 1, dex: -1, cha: -1 },
    saves: ["str", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "ste" }, { id: "his" }, { id: "itm" }],
    damageTypes: ["cold", "slashing"],
    biteRider: "cold",
    clawCritThreshold: 19,
    breath: {
      id: "frost-breath",
      name: "Frost Breath",
      verb: "exhales a deadly frost in",
      shape: "cone",
      damageType: "cold",
      save: "con",
      die: 8,
      damageScale: 0.85,
      extra: (c) =>
        c.power >= 5
          ? "A creature that fails the save by 5 or more also has its speed halved until the end of its next turn as ice creeps over its limbs."
          : "",
      icon: "icons/creatures/abilities/dragon-ice-breath-blue.webp",
    },
    movement: { burrow: 20, notes: "burrow (snow and ice only)" },
    darkvision: 60,
    resistances: [],
    immunities: ["cold"],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 1,
    hpMultiplier: 1.05,
    features: [
      {
        id: "ice-walk",
        name: "Ice Walk",
        kind: "trait",
        text: (c) =>
          `${c.name} can move across and climb icy surfaces without an ability check, and difficult terrain made of ice or snow costs it no extra movement.`,
      },
      {
        id: "serrated-claws",
        name: "Serrated Claws",
        kind: "trait",
        minPower: 3,
        text: (c) =>
          `${c.name}'s claw attacks score a critical hit on a roll of 19 or 20.`,
      },
      {
        id: "diamond-scales",
        name: "Diamond Scales",
        kind: "trait",
        text: (c) =>
          `When a creature scores a critical hit against ${c.name}, roll a d6. On a 5 or 6, the critical hit becomes a normal hit.`,
      },
      {
        id: "circle-of-rank",
        name: "Circle of Rank",
        kind: "trait",
        minPower: 5,
        text: (c) =>
          `${c.name} has advantage on saving throws against being charmed or frightened.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "frost-aura",
      name: "Frost Aura",
      cost: 2,
      text: (c) =>
        `Killing cold radiates from ${
          c.name
        }. Each creature within 10 feet of it must make a DC ${c.dc(
          "con"
        )} Constitution saving throw, taking ${c.dice(
          c.scale(2, 8),
          6
        )} cold damage on a failed save, or half as much on a successful one.`,
      save: (c) => ({
        ability: "con",
        dc: c.dc("con"),
        onSave: "half",
        damage: [{ count: c.scale(2, 8), die: 6, bonus: 0, type: "cold" }],
        area: { shape: "sphere", size: 10 },
      }),
    },
    lair: {
      actions: [
        lairTrait(
          "freezing-fog",
          "Freezing Fog",
          (c) =>
            `Freezing fog fills a 20-foot-radius sphere within 120 feet, heavily obscuring it until initiative count 20 on the next round. Each creature in the fog must make a DC ${c.dc(
              "con"
            )} Constitution saving throw, taking ${c.dice(
              3,
              6
            )} cold damage on a failed save.`,
          (c) => ({
            ability: "con",
            dc: c.dc("con"),
            onSave: "none",
            damage: [{ count: 3, die: 6, bonus: 0, type: "cold" }],
            area: { shape: "sphere", size: 20, range: 120 },
          })
        ),
        lairTrait(
          "falling-icicles",
          "Falling Icicles",
          (c) =>
            `Jagged icicles fall on up to three creatures ${
              c.name
            } can see within 120 feet. Each must succeed on a DC ${c.dc(
              "con"
            )} Dexterity saving throw or take ${c.dice(
              3,
              10
            )} piercing damage.`,
          (c) => ({
            ability: "dex",
            dc: c.dc("con"),
            onSave: "none",
            damage: [{ count: 3, die: 10, bonus: 0, type: "piercing" }],
          })
        ),
      ],
      regional: [
        lairTrait(
          "bitter-cold",
          "Bitter Cold",
          () =>
            "Within 6 miles of the lair, the cold is extreme. Creatures without cold resistance must make a DC 10 Constitution saving throw each hour or gain a level of exhaustion."
        ),
        lairTrait(
          "ice-sculptures",
          "Ice Sculptures",
          () =>
            "Frozen sculptures of vanquished enemies appear in the ice within 1 mile of the lair, a warning to intruders."
        ),
      ],
    },
    variants: [],
    animusAffinity: 1.8,
    names: {
      single: [
        "Hailstorm",
        "Snowfall",
        "Glacier",
        "Icicle",
        "Narwhal",
        "Polar",
        "Lynx",
        "Tundra",
        "Snowflake",
        "Crystal",
        "Permafrost",
        "Blizzard",
        "Ermine",
        "Beluga",
        "Avalanche",
        "Sleet",
        "Floe",
        "Rime",
        "Aurora",
        "Ptarmigan",
      ],
      prefixes: ["Frost", "Snow", "Ice", "Hail"],
      suffixes: ["bite", "fang", "claw", "shard"],
      compoundChance: 0.1,
    },
    epithets: ["of the First Circle", "the Unmelting", "Frostclaw"],
    personality: [
      "Obsessed with rank; knows everyone's Circle within minutes.",
      "Coldly polite, which is somehow worse than rudeness.",
      "Hides a deep love of warm places it would never admit to.",
      "Keeps meticulous records of every debt owed to it.",
    ],
    quirks: [
      "Its breath fogs the air even in summer.",
      "One claw is chipped, and it hides that talon when it can.",
      "Frost forms on anything it rests on for long.",
      "Its eyes are an unsettling pale violet.",
    ],
    hooks: [
      "Seeking an ancient animus-enchanted artifact buried in the glacier.",
      "Disgraced to a lower Circle and determined to climb back.",
    ],
  },
  {
    id: "nightwing",
    name: "NightWing",
    kingdom: "Pyrrhia",
    description:
      "Purple-black dragons whose wing undersides are scattered with silver scales like stars. Secretive and self-important, NightWings claim powers of mind reading and prophecy—and those hatched under the full moons truly have them. They breathe fire and once lived on a volcanic island.",
    habitat: "Forest, Underdark, Volcanic",
    abilityThemes:
      "Intellect and mystery, mind reading, prophecy, night camouflage, fire.",
    alignments: ["Lawful Evil", "Neutral", "Lawful Neutral", "Neutral Good"],
    colors: [
      "purple-black with silver starscales",
      "midnight black",
      "deep violet",
      "ink-blue with silver flecks",
    ],
    abilityMods: { int: 3, wis: 2, cha: 1, str: -1, con: -1 },
    saves: ["dex", "int", "wis", "cha"],
    skills: [
      { id: "prc" },
      { id: "ste" },
      { id: "ins", expertise: true },
      { id: "arc" },
      { id: "his" },
    ],
    damageTypes: ["fire", "psychic"],
    biteRider: "fire",
    breath: {
      id: "fire-breath",
      name: "Fire Breath",
      verb: "exhales fire in",
      shape: "cone",
      damageType: "fire",
      save: "dex",
      die: 6,
      damageScale: 0.9,
      icon: "icons/creatures/abilities/dragon-breath-purple.webp",
    },
    movement: {},
    darkvision: 120,
    resistances: ["fire"],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 0,
    hpMultiplier: 0.95,
    features: [
      {
        id: "night-camouflage",
        name: "Night Camouflage",
        kind: "trait",
        text: (c) =>
          `${c.name} has advantage on Dexterity (Stealth) checks made in dim light or darkness.`,
      },
      {
        id: "mind-reader",
        name: "Mind Reader",
        kind: "trait",
        text: (c) =>
          `${
            c.name
          } can read the surface thoughts of any creature it can see within ${
            c.scale(3, 12) * 10
          } feet, as the detect thoughts spell (no concentration required). The creature can make a DC ${c.dc(
            "int"
          )} Wisdom saving throw to shield its thoughts; on a success, it is immune to this trait for 24 hours.`,
      },
      {
        id: "foretelling",
        name: "Foretelling",
        kind: "reaction",
        minPower: 4,
        perDay: (p) => (p >= 8 ? 3 : 1),
        text: (c) =>
          `When a creature ${c.name} can see makes an attack roll against it, ${c.name} imposes disadvantage on the roll—it saw this coming.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "read-intent",
      name: "Read Intent",
      cost: 1,
      text: (c) =>
        `${c.name} reads the mind of one creature it can see within 60 feet. Until the end of that creature's next turn, it has disadvantage on attack rolls against ${c.name}.`,
    },
    lair: {
      actions: [
        lairTrait(
          "deepening-shadows",
          "Deepening Shadows",
          () =>
            "Magical darkness fills a 20-foot-radius sphere within 120 feet until initiative count 20 on the next round. NightWings can see through it."
        ),
        lairTrait(
          "prophetic-whispers",
          "Prophetic Whispers",
          (c) =>
            `One creature within 120 feet hears whispers of its own doom and must succeed on a DC ${c.dc(
              "int"
            )} Wisdom saving throw or take ${c.dice(
              3,
              8
            )} psychic damage and be frightened of ${
              c.name
            } until initiative count 20 on the next round.`,
          (c) => ({
            ability: "wis",
            dc: c.dc("int"),
            onSave: "none",
            damage: [{ count: 3, die: 8, bonus: 0, type: "psychic" }],
            condition: "frightened",
          })
        ),
      ],
      regional: [
        lairTrait(
          "long-nights",
          "Long Nights",
          () =>
            "Within 6 miles of the lair, nights feel unnaturally long and dark; the moons seem to linger in the sky."
        ),
        lairTrait(
          "prophetic-dreams",
          "Prophetic Dreams",
          () =>
            "Creatures that sleep within 1 mile of the lair have vivid, unsettling dreams about their futures."
        ),
      ],
    },
    variants: [
      {
        id: "moonborn",
        name: "Moonborn Seer",
        chance: 0.1,
        blurb: "Hatched under the light of the full moons, with true visions.",
        features: [
          {
            id: "moonborn-seer",
            name: "Moonborn Seer",
            kind: "trait",
            text: (c) =>
              `${c.name} was hatched under the full moons. It can't be surprised, has advantage on initiative rolls, and can cast augury once per day without components.`,
          },
        ],
      },
    ],
    animusAffinity: 1.6,
    names: {
      single: ["Vigilance", "Greatness", "Battlewinner", "Mastermind"],
      prefixes: [
        "Star",
        "Moon",
        "Death",
        "Fate",
        "Morrow",
        "Mighty",
        "Quick",
        "Night",
        "Shadow",
        "Dusk",
        "Dark",
        "Secret",
        "Silver",
        "Void",
        "Stone",
        "Clear",
      ],
      suffixes: [
        "flight",
        "watcher",
        "seer",
        "speaker",
        "bringer",
        "claws",
        "strike",
        "fall",
        "gaze",
        "sight",
        "whisper",
        "stalker",
        "mover",
        "keeper",
        "dreamer",
        "veil",
      ],
      compoundChance: 0.92,
    },
    epithets: ["the Farseer", "Mindreader", "of the Three Moons"],
    personality: [
      "Speaks in cryptic half-prophecies, whether or not it has any.",
      "Quietly reads everyone's thoughts and politely pretends not to.",
      "Bookish and precise; corrects others' history constantly.",
      "Secretive to the point of paranoia.",
    ],
    quirks: [
      "Its silver starscales form a recognizable constellation.",
      "Tilts its head as though listening to thoughts only it can hear.",
      "Smells faintly of volcanic ash.",
      "Keeps a scroll of 'confirmed' prophecies it wrote itself.",
    ],
    hooks: [
      "Had a vision of the party's future and needs them to avert it.",
      "Hunting a rogue NightWing who stole forbidden scrolls.",
    ],
  },
  {
    id: "hivewing",
    name: "HiveWing",
    kingdom: "Pantala",
    description:
      "Pantalan dragons patterned like wasps and bees—yellow, orange, red, and black. HiveWings live in vast tree-hives under a single queen, and each bears some insect weapon: a venomous tail stinger, paralytic wrist-stingers, or toxic sprays. They do not breathe fire.",
    habitat: "Forest, Urban",
    abilityThemes:
      "Venom and paralysis, hive coordination, intimidation, toxic sprays.",
    alignments: ["Lawful Evil", "Lawful Neutral", "Neutral", "Lawful Good"],
    colors: [
      "yellow and black banded",
      "orange and black",
      "crimson with black stripes",
      "amber with obsidian bands",
    ],
    abilityMods: { str: 1, dex: 1, con: 1, wis: -1 },
    saves: ["dex", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "itm" }, { id: "ath" }],
    damageTypes: ["poison", "piercing"],
    biteRider: null,
    breath: {
      id: "toxic-spray",
      name: "Toxic Spray",
      verb: "sprays burning toxins in",
      shape: "cone",
      damageType: "poison",
      save: "con",
      die: 6,
      damageScale: 0.8,
      condition: "poisoned",
      extra: () =>
        "A creature that fails the save is also poisoned until the end of its next turn.",
      icon: "icons/skills/toxins/cauldron-bubbles-overflow-green.webp",
    },
    movement: {},
    darkvision: 60,
    resistances: [],
    immunities: ["poison"],
    vulnerabilities: [],
    conditionImmunities: ["poisoned"],
    acBonus: 0,
    hpMultiplier: 1,
    features: [
      {
        id: "hive-link",
        name: "Hive Link",
        kind: "trait",
        text: (c) =>
          `${c.name} can communicate telepathically with other HiveWings within 1 mile. (A HiveWing queen with the right power can seize control through this link.)`,
      },
      {
        id: "swarm-tactics",
        name: "Swarm Tactics",
        kind: "trait",
        minPower: 3,
        text: (c) =>
          `${c.name} has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally isn't incapacitated.`,
      },
    ],
    attacks: [
      {
        id: "stinger",
        name: "Stinger",
        damageType: "piercing",
        die: 6,
        counts: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3],
        rider: {
          type: "poison",
          die: 6,
          counts: [1, 1, 2, 2, 3, 3, 4, 5, 6, 7],
        },
        reachBonus: 5,
        inMultiattack: true,
        icon: "icons/creatures/abilities/stinger-poison-green.webp",
        onHit: (c) => ({
          ability: "con",
          condition: c.power >= 5 ? "paralyzed" : "poisoned",
          duration: "until the end of its next turn",
        }),
      },
    ],
    legendary: {
      id: "sting",
      name: "Sting",
      cost: 2,
      attackId: "stinger",
      text: (c) => `${c.name} makes one Stinger attack.`,
    },
    lair: {
      actions: [
        lairTrait(
          "resin-walls",
          "Oozing Resin",
          (c) =>
            `Sticky resin oozes across a 20-foot square within 120 feet. Each creature there must succeed on a DC ${c.dc(
              "con"
            )} Dexterity saving throw or be restrained until initiative count 20 on the next round.`,
          (c) => ({
            ability: "dex",
            dc: c.dc("con"),
            onSave: "none",
            damage: [],
            condition: "restrained",
          })
        ),
        lairTrait(
          "insect-cloud",
          "Insect Cloud",
          (c) =>
            `A cloud of stinging insects fills a 20-foot-radius sphere within 120 feet. Each creature there must succeed on a DC ${c.dc(
              "con"
            )} Constitution saving throw or be poisoned until initiative count 20 on the next round.`,
          (c) => ({
            ability: "con",
            dc: c.dc("con"),
            onSave: "none",
            damage: [],
            condition: "poisoned",
            area: { shape: "sphere", size: 20, range: 120 },
          })
        ),
      ],
      regional: [
        lairTrait(
          "teeming-insects",
          "Teeming Insects",
          () =>
            "Insects are unnaturally abundant within 6 miles of the hive; the constant droning gives disadvantage on Wisdom (Perception) checks that rely on hearing."
        ),
        lairTrait(
          "humming-trees",
          "Humming Hive-Trees",
          (c) =>
            `Hive-trees within 1 mile hum with a single will; ${c.name} knows whenever a non-HiveWing enters or leaves the area.`
        ),
      ],
    },
    variants: [
      {
        id: "wrist-stingers",
        name: "Wrist Stingers",
        chance: 0.35,
        blurb: "Hidden wrist-stingers loaded with paralytic nerve toxin.",
        features: [
          {
            id: "wrist-sting",
            name: "Wrist Sting",
            kind: "bonus",
            recharge: 5,
            text: (c) =>
              `${
                c.name
              } jabs one creature within 5 feet with a hidden wrist-stinger. The target must succeed on a DC ${c.dc(
                "con"
              )} Constitution saving throw or be paralyzed for 1 minute. It can repeat the save at the end of each of its turns, ending the effect on a success.`,
            save: (c) => ({
              ability: "con",
              dc: c.dc("con"),
              onSave: "none",
              damage: [],
              condition: "paralyzed",
            }),
          },
        ],
      },
    ],
    animusAffinity: 0.4,
    names: {
      single: [
        "Aphid",
        "Bombardier",
        "Cadelle",
        "Cicada",
        "Cricket",
        "Hornet",
        "Katydid",
        "Locust",
        "Mandible",
        "Mosquito",
        "Scarab",
        "Vinegaroon",
        "Wasp",
        "Yellowjacket",
        "Weevil",
        "Sawfly",
        "Mantis",
        "Earwig",
        "Bumblebee",
        "Jewel",
      ],
      prefixes: [],
      suffixes: [],
      compoundChance: 0,
    },
    epithets: ["of the Hive", "Stingcrowned", "the Venom-Sworn"],
    personality: [
      "Utterly devoted to the queen and suspicious of free thinkers.",
      "Hides a rebellious streak behind perfect manners.",
      "Loves rules, schedules, and orderly lines.",
      "Terrified of the queen's mind control, and hiding it poorly.",
    ],
    quirks: [
      "Its stinger twitches when it is annoyed.",
      "Wears the colors of its home hive on a woven sash.",
      "Buzzes faintly when it hums to itself.",
      "Has an unusual pattern of bands that marks its bloodline.",
    ],
    hooks: [
      "Escaped the hive's control and is desperate to stay free.",
      "Sent by the queen to retrieve something the party now owns.",
    ],
  },
  {
    id: "silkwing",
    name: "SilkWing",
    kingdom: "Pantala",
    description:
      "Butterfly-winged Pantalan dragons with four vivid wings, antennae, and silk-spinning glands in their wrists. SilkWings are born wingless and emerge from cocoons at their Metamorphosis around age six; a rare few spin flamesilk, glowing threads of living fire.",
    habitat: "Forest, Urban",
    abilityThemes:
      "Grace and charm, silk snares and ropes, four-winged flight, rare flamesilk.",
    alignments: ["Neutral Good", "Chaotic Good", "Neutral", "Lawful Good"],
    colors: [
      "sky blue and black",
      "monarch orange",
      "emerald and gold",
      "lilac with silver eyespots",
      "sunflower yellow",
    ],
    abilityMods: { dex: 2, wis: 1, cha: 2, str: -2, con: -1 },
    saves: ["dex", "con", "wis", "cha"],
    skills: [
      { id: "prc" },
      { id: "ste" },
      { id: "acr" },
      { id: "prf" },
      { id: "ins" },
    ],
    damageTypes: ["bludgeoning"],
    biteRider: null,
    breath: {
      id: "silk-snare",
      name: "Silk Snare",
      verb: "sprays sticky silk in",
      shape: "line",
      damageType: null,
      save: "dex",
      die: 6,
      damageScale: 0,
      condition: "restrained",
      extra: (c) =>
        `A restrained creature can use its action to make a DC ${c.dc(
          "con"
        )} Strength check, freeing itself on a success. The silk can also be cut (AC 10; ${c.scale(
          5,
          40
        )} hit points; vulnerable to fire).`,
      icon: "icons/creatures/webs/web-spider-casting-caught-purple.webp",
    },
    movement: { fly: 10, hover: true, winglessUntil: 2 },
    darkvision: 60,
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 0,
    hpMultiplier: 0.9,
    features: [
      {
        id: "pre-metamorphosis",
        name: "Pre-Metamorphosis",
        kind: "trait",
        maxPower: 2,
        text: (c) =>
          `${c.name} hasn't undergone its Metamorphosis yet and has no wings. It gains a flying speed when it emerges from its cocoon.`,
      },
      {
        id: "four-wings",
        name: "Four Wings",
        kind: "trait",
        minPower: 3,
        text: (c) =>
          `${c.name} can hover and doesn't provoke opportunity attacks when it flies out of an enemy's reach.`,
      },
      {
        id: "silk-line",
        name: "Silk Line",
        kind: "bonus",
        text: (c) =>
          `${c.name} shoots a silk line up to 60 feet to anchor on a surface, then pulls itself up to 30 feet along it.`,
      },
      {
        id: "antennae",
        name: "Antennae",
        kind: "trait",
        text: (c) =>
          `${c.name} has advantage on Wisdom (Perception) checks that rely on smell or vibration.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "reel-in",
      name: "Reel In",
      cost: 1,
      text: (c) =>
        `${
          c.name
        } flings a strand of silk at one creature within 30 feet. The target must succeed on a DC ${c.dc(
          "dex"
        )} Dexterity saving throw or be pulled up to 15 feet toward ${c.name}.`,
      save: (c) => ({
        ability: "dex",
        dc: c.dc("dex"),
        onSave: "none",
        damage: [],
      }),
    },
    lair: {
      actions: [
        lairTrait(
          "silk-webs",
          "Silk Webs",
          (c) =>
            `Silk webs spread across a 20-foot square within 120 feet, becoming difficult terrain. Each creature there must succeed on a DC ${c.dc(
              "con"
            )} Dexterity saving throw or be restrained until initiative count 20 on the next round.`,
          (c) => ({
            ability: "dex",
            dc: c.dc("con"),
            onSave: "none",
            damage: [],
            condition: "restrained",
          })
        ),
        lairTrait(
          "wing-gust",
          "Wing Gust",
          (c) =>
            `A kaleidoscope of wings stirs the air. Each creature of ${
              c.name
            }'s choice within 60 feet must succeed on a DC ${c.dc(
              "cha"
            )} Wisdom saving throw or be charmed until initiative count 20 on the next round.`,
          (c) => ({
            ability: "wis",
            dc: c.dc("cha"),
            onSave: "none",
            damage: [],
            condition: "charmed",
          })
        ),
      ],
      regional: [
        lairTrait(
          "drifting-threads",
          "Drifting Threads",
          () =>
            "Glittering silk threads drift through the air within 6 miles of the lair, snagging on anything that passes."
        ),
        lairTrait(
          "butterfly-clouds",
          "Butterfly Clouds",
          () =>
            "Clouds of butterflies and moths gather within 1 mile, and flowering vines bloom year-round."
        ),
      ],
    },
    variants: [
      {
        id: "flamesilk",
        name: "Flamesilk",
        chance: 0.1,
        blurb: "Spins flamesilk: glowing threads of living fire.",
        immunities: ["fire"],
        breath: {
          id: "flamesilk-stream",
          name: "Flamesilk Stream",
          verb: "spins a stream of burning flamesilk in",
          damageType: "fire",
          damageScale: 0.8,
          icon: "icons/magic/fire/projectile-fireball-embers-yellow.webp",
        },
        features: [
          {
            id: "flamesilk",
            name: "Flamesilk",
            kind: "trait",
            text: (c) =>
              `${c.name} is immune to fire. Its wrists glow like embers, shedding dim light in a 10-foot radius, and its silk burns anything it touches.`,
          },
        ],
      },
    ],
    animusAffinity: 0.4,
    names: {
      single: [
        "Blue",
        "Luna",
        "Swordtail",
        "Monarch",
        "Admiral",
        "Io",
        "Cinnabar",
        "Morpho",
        "Sulphur",
        "Tau",
        "Atlas",
        "Hairstreak",
        "Skipper",
        "Fritillary",
        "Comet",
        "Silverspot",
        "Peacock",
        "Emperor",
        "Glasswing",
        "Checkerspot",
      ],
      prefixes: [],
      suffixes: [],
      compoundChance: 0,
    },
    epithets: ["the Unbound", "Silkspinner", "the Weaver"],
    personality: [
      "Gentle and idealistic, and braver than it looks.",
      "Dreams of freedom from the hives and talks about it constantly.",
      "A gifted artist who weaves silk tapestries of every place it visits.",
      "Nervous around HiveWings, for very good reasons.",
    ],
    quirks: [
      "Its antennae droop when it is sad.",
      "Always has a spool of silk wound around one wrist.",
      "One of its four wings has a torn, mended edge.",
      "Glittering scales dust anything it brushes against.",
    ],
    hooks: [
      "Hiding a flamesilk sibling from the HiveWing queen.",
      "Carrying messages for the Chrysalis resistance.",
    ],
  },
  {
    id: "leafwing",
    name: "LeafWing",
    kingdom: "Pantala",
    description:
      "Green and brown Pantalan dragons with leaf-shaped wings, long thought extinct after the Tree Wars. LeafWings photosynthesize, guard the last great forest (the Poison Jungle), and a gifted few have leafspeak, the power to command plants.",
    habitat: "Forest",
    abilityThemes:
      "Wisdom and resilience, photosynthesis, toxic spores, rare leafspeak.",
    alignments: ["Neutral Good", "Neutral", "Chaotic Good", "Lawful Neutral"],
    colors: [
      "forest green",
      "olive and brown",
      "autumn russet with green veins",
      "emerald",
      "sage with mossy speckles",
    ],
    abilityMods: { str: 1, con: 1, wis: 2, cha: -1 },
    saves: ["str", "con", "wis", "cha"],
    skills: [{ id: "prc" }, { id: "ste" }, { id: "nat" }, { id: "sur" }],
    damageTypes: ["poison", "piercing"],
    biteRider: null,
    breath: {
      id: "toxic-spores",
      name: "Toxic Spores",
      verb: "hurls a burst of toxic spores and pollen into",
      shape: "sphere",
      damageType: "poison",
      save: "con",
      die: 6,
      damageScale: 0.8,
      condition: "poisoned",
      extra: () =>
        "A creature that fails the save is also poisoned until the end of its next turn.",
      icon: "icons/skills/toxins/symbol-poison-drop-skull-green.webp",
    },
    movement: { climb: 30 },
    darkvision: 60,
    resistances: ["poison"],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
    acBonus: 0,
    hpMultiplier: 1,
    features: [
      {
        id: "photosynthesis",
        name: "Photosynthesis",
        kind: "trait",
        text: (c) =>
          `If ${
            c.name
          } starts its turn in direct sunlight with at least 1 hit point, it regains ${c.scale(
            2,
            15
          )} hit points.`,
      },
      {
        id: "woodland-camouflage",
        name: "Woodland Camouflage",
        kind: "trait",
        text: (c) =>
          `${c.name} has advantage on Dexterity (Stealth) checks made to hide in forests or thick vegetation.`,
      },
      {
        id: "poison-jungle-survivor",
        name: "Poison Jungle Survivor",
        kind: "trait",
        minPower: 4,
        text: (c) =>
          `${c.name} has advantage on saving throws against poison and can identify any plant on sight.`,
      },
    ],
    attacks: [],
    legendary: {
      id: "grasping-roots",
      name: "Grasping Roots",
      cost: 2,
      text: (c) =>
        `Roots erupt beneath one creature ${
          c.name
        } can see within 30 feet. The target must succeed on a DC ${c.dc(
          "wis"
        )} Strength saving throw or be restrained until the end of its next turn.`,
      save: (c) => ({
        ability: "str",
        dc: c.dc("wis"),
        onSave: "none",
        damage: [],
        condition: "restrained",
      }),
    },
    lair: {
      actions: [
        lairTrait(
          "bursting-roots",
          "Bursting Roots",
          (c) =>
            `Roots burst from the ground in a 20-foot-radius sphere within 120 feet, turning it into difficult terrain. Each creature there must succeed on a DC ${c.dc(
              "wis"
            )} Strength saving throw or be restrained until initiative count 20 on the next round.`,
          (c) => ({
            ability: "str",
            dc: c.dc("wis"),
            onSave: "none",
            damage: [],
            condition: "restrained",
            area: { shape: "sphere", size: 20, range: 120 },
          })
        ),
        lairTrait(
          "poison-thorns",
          "Poison Thorns",
          (c) =>
            `Poisonous thorns bloom around up to three creatures within 120 feet. Each must make a DC ${c.dc(
              "wis"
            )} Dexterity saving throw, taking ${c.dice(
              3,
              6
            )} poison damage on a failed save.`,
          (c) => ({
            ability: "dex",
            dc: c.dc("wis"),
            onSave: "none",
            damage: [{ count: 3, die: 6, bonus: 0, type: "poison" }],
          })
        ),
      ],
      regional: [
        lairTrait(
          "overgrowth",
          "Overgrowth",
          () =>
            "Plants within 6 miles of the lair grow at a supernatural rate; paths vanish overnight and travel speed through the area is halved."
        ),
        lairTrait(
          "poison-blooms",
          "Poison Blooms",
          () =>
            "Poisonous plants bloom year-round within 1 mile. A creature that forages there must succeed on a DC 15 Intelligence (Nature) check or be poisoned for 1 hour."
        ),
      ],
    },
    variants: [
      {
        id: "leafspeak",
        name: "Leafspeak",
        chance: 0.2,
        blurb: "Can speak to plants and command them to move.",
        features: [
          {
            id: "leafspeak",
            name: "Leafspeak",
            kind: "action",
            text: (c) =>
              `${
                c.name
              } commands the plants within 60 feet of it. Up to ${c.scale(
                1,
                4
              )} creatures of its choice standing on or near vegetation must succeed on a DC ${c.dc(
                "wis"
              )} Strength saving throw or be restrained by vines until the end of their next turn. Alternatively, ${
                c.name
              } casts plant growth without components.`,
            save: (c) => ({
              ability: "str",
              dc: c.dc("wis"),
              onSave: "none",
              damage: [],
              condition: "restrained",
            }),
          },
        ],
      },
    ],
    animusAffinity: 0.5,
    names: {
      single: [
        "Sundew",
        "Willow",
        "Hazel",
        "Mandrake",
        "Sequoia",
        "Belladonna",
        "Hemlock",
        "Nettle",
        "Foxglove",
        "Oleander",
        "Bryony",
        "Sumac",
        "Wisteria",
        "Mahogany",
        "Aspen",
        "Rowan",
        "Burdock",
        "Yew",
        "Cypress",
        "Juniper",
      ],
      prefixes: [],
      suffixes: [],
      compoundChance: 0,
    },
    epithets: ["the Evergreen", "Rootcaller", "of the Poison Jungle"],
    personality: [
      "Carries a grudge against HiveWings that is centuries old.",
      "Patient as a tree and about as easy to move.",
      "Talks to plants constantly, whether or not they answer.",
      "Fiercely protective of every living thing in its forest.",
    ],
    quirks: [
      "Its wing edges turn gold and red in autumn.",
      "Moss grows in the crevices of its scales.",
      "Always smells of crushed leaves and rain.",
      "Keeps seeds from every place it has visited in a pouch.",
    ],
    hooks: [
      "Seeking allies to reclaim a stolen piece of the old forest.",
      "Tracking a poison that is killing the Poison Jungle itself.",
    ],
  },
]

export const TRIBE_MAP: Record<TribeId, Tribe> = TRIBES.reduce(
  (acc, tribe) => ({ ...acc, [tribe.id]: tribe }),
  {} as Record<TribeId, Tribe>
)

export function getTribe(id: TribeId): Tribe {
  return TRIBE_MAP[id]
}
