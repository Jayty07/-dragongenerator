> [!NOTE]
> This project has been officially archived and will no longer receive updates. See the [Templates](https://vercel.com/templates/next.js) directory for Next.js starters.
>
> I started this project when the Next.js App Router was in public preview. Because the framework has since stabilized and undergone significant architectural changes, the code in this repository:
>
> - Does not reflect current best practices.
> - May contain deprecated APIs or patterns.
> - Is not recommended for use in production environments.

# Taxonomy

An open source application built using the new router, server components and everything new in Next.js 13.

## About this project

This project as an experiment to see how a modern app (with features like authentication, subscriptions, API routes, static pages for docs ...etc) would work in Next.js 13 and server components.

## Features

- New `/app` dir,
- Routing, Layouts, Nested Layouts and Layout Groups
- Data Fetching, Caching and Mutation
- Loading UI
- Route handlers
- Metadata files
- Server and Client Components
- API Routes and Middlewares
- Authentication using **NextAuth.js**
- ORM using **Prisma**
- Database on **PlanetScale**
- UI Components built using **Radix UI**
- Documentation and blog using **MDX** and **Contentlayer**
- Subscriptions using **Stripe**
- Styled using **Tailwind CSS**
- Validations using **Zod**
- Written in **TypeScript**

## Roadmap

- [x] ~Add MDX support for basic pages~
- [x] ~Build marketing pages~
- [x] ~Subscriptions using Stripe~
- [x] ~Responsive styles~
- [x] ~Add OG image for blog using @vercel/og~
- [x] Dark mode

## Known Issues

A list of things not working right now:

1. ~GitHub authentication (use email)~
2. ~[Prisma: Error: ENOENT: no such file or directory, open '/var/task/.next/server/chunks/schema.prisma'](https://github.com/prisma/prisma/issues/16117)~
3. ~[Next.js 13: Client side navigation does not update head](https://github.com/vercel/next.js/issues/42414)~
4. [Cannot use opengraph-image.tsx inside catch-all routes](https://github.com/vercel/next.js/issues/48162)

## Why not tRPC, Turborepo or X?

I might add this later. For now, I want to see how far we can get using Next.js only.

If you have some suggestions, feel free to create an issue.

## Wings of Fire Dragon Generator

A public page at [`/generator`](http://localhost:3000/generator) (also linked from the main nav) turns any of the ten Wings of Fire tribes into a D&D 5e stat block. It needs no login, subscription, or database. Everything is generated in pure TypeScript in the browser.

### Using the generator

1. Pick a **tribe**: MudWing, SandWing, SkyWing, SeaWing, RainWing, IceWing, NightWing, HiveWing, SilkWing, or LeafWing.
2. Drag the **power** slider from 1 to 10:
   - Power 1 is a CR 1/2–1 dragonet.
   - Power 6 and up adds Frightful Presence, Legendary Resistance, and legendary actions.
   - Power 9 adds lair actions, and power 10 adds regional effects. Power 10 dragons are CR 23–26.
   - Breath weapon damage, area, and recharge scale with power.
3. Click **Generate** to roll a new seed, or **Randomize all** to also pick a random tribe and power. The seed field is editable, and the same tribe, power, and seed always produce the same dragon. Moving the slider keeps the dragon's name and personality, so you can watch the same dragon grow up.
4. **Animus magic** is rare. The chance rises with power and varies by tribe; SeaWings, IceWings, and NightWings are the most likely. You can also force it on or off. An animus dragon gains the Animus Magic trait and innate spellcasting.
5. Some tribes can also roll rare variants: MudWing bigwings, SkyWing firescales, NightWing moonborn seers, HiveWing wrist-stingers, SilkWing flamesilk, and LeafWing leafspeak.
6. The **Flavor** tab shows appearance, personality, a quirk, and a story hook. The **Dice roller** tab has quick to-hit, damage, recharge, and initiative rolls.

The code lives in `lib/dragon/`: tribe data in `tribes.ts`, the scaling engine in `generator.ts`, and the Markdown/JSON/Foundry serializers in `export.ts`. The UI lives in `components/dragon-generator.tsx`.

### Exporting

- **Copy as Markdown / plain text**: the full stat block, ready to paste into Homebrewery, Obsidian, Discord, and similar tools.
- **Download JSON**: the raw generated `StatBlock` object, for your own tools.
- **Download Foundry VTT actor**: a `dnd5e` NPC actor (`*.foundry-actor.json`) with:
  - Abilities, save proficiencies, and skills
  - AC, HP, speeds, senses, size, CR, and damage/condition immunities
  - Bite, claw, and tail as natural weapons with attack activities
  - Breath weapons as save activities with area templates, damage, and recharge
  - Legendary actions and legendary resistance tied to the actor's resources, plus lair actions and regional effects

The actor targets the activity-based dnd5e data model (system 4.x and newer, Foundry v12+). Foundry migrates it automatically on import.

### Foundry VTT module

If you play in Foundry, you don't need the website. The `foundry-module/` folder packages the same generator as a Foundry module that adds a **Hatch Dragon** button to the Actors sidebar and creates the NPC actor directly. Install it with this manifest URL, which also works on Forge:

```
https://github.com/Jayty07/-dragongenerator/releases/latest/download/module.json
```

See [`foundry-module/README.md`](foundry-module/README.md) for usage, the macro API, and how to publish a release.

### Importing into Foundry VTT (and Forge VTT)

Forge VTT hosts a standard Foundry server, so these steps are the same on Forge and on a self-hosted install:

1. Open your world. It must use the **Dungeons & Dragons Fifth Edition** (`dnd5e`) system.
2. In the **Actors** sidebar, click **Create Actor**, give it any name, and pick type **NPC**.
3. Right-click the new actor in the sidebar and choose **Import Data**.
4. Choose the downloaded `*.foundry-actor.json` file and confirm. The actor is replaced with the generated dragon, including its name, items, and token settings.

The plain JSON download is not a Foundry document. Use the Foundry actor download for VTT imports.

## Running Locally

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.example` to `.env.local` and update the variables.

```sh
cp .env.example .env.local
```

3. Start the development server:

```sh
pnpm dev
```

## License

Licensed under the [MIT license](https://github.com/shadcn/taxonomy/blob/main/LICENSE.md).
