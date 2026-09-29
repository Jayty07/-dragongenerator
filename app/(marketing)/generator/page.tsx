import { DragonGenerator } from "@/components/dragon-generator"

export const metadata = {
  title: "Wings of Fire Dragon Generator",
  description:
    "Generate D&D 5e stat blocks for Wings of Fire dragons and export them to Foundry VTT.",
}

export default function GeneratorPage() {
  return (
    <section className="container grid gap-8 py-8 md:py-12">
      <div className="flex max-w-[58rem] flex-col gap-4">
        <h1 className="font-heading text-3xl leading-[1.1] sm:text-5xl">
          Wings of Fire Dragon Generator
        </h1>
        <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Turn any of the ten tribes of Pyrrhia and Pantala into a D&amp;D 5e
          stat block, from a CR 1/2 dragonet to a CR 20+ legend with lair
          actions. Copy it as Markdown, or download a Foundry VTT actor you can
          import on Forge.
        </p>
      </div>
      <DragonGenerator />
    </section>
  )
}
