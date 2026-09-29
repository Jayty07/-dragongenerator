import * as React from "react"

import {
  abilityText,
  acText,
  featureSections,
  featureTitle,
  hpText,
  propertyLines,
  speedText,
  typeLine,
} from "@/lib/dragon/format"
import { ABILITIES, Feature, StatBlock } from "@/lib/dragon/types"
import { cn } from "@/lib/utils"

function TaperedRule() {
  return (
    <svg
      aria-hidden
      className="my-1.5 block h-[5px] w-full fill-[#922610]"
      preserveAspectRatio="none"
      viewBox="0 0 400 5"
    >
      <polyline points="0,0 400,2.5 0,5" />
    </svg>
  )
}

function FeatureEntry({ feature }: { feature: Feature }) {
  return (
    <p className="mb-2 break-inside-avoid leading-snug">
      <span className="font-bold italic">{featureTitle(feature)}.</span>{" "}
      {feature.text}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-4 break-after-avoid border-b border-[#922610] pb-0.5 font-serif text-xl font-normal uppercase tracking-wide text-[#922610]">
      {children}
    </h3>
  )
}

interface DragonStatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  block: StatBlock
}

export function DragonStatBlock({
  block,
  className,
  ...props
}: DragonStatBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-sm border-y-4 border-[#e69a28] bg-[#fdf1dc] px-5 py-4 font-serif text-[15px] text-[#1a1a1a] shadow-[0_0_12px_rgba(0,0,0,0.35)]",
        className
      )}
      {...props}
    >
      <div className="gap-8 lg:columns-2">
        <div className="break-inside-avoid">
          <h2 className="font-serif text-3xl font-bold uppercase leading-tight tracking-wide text-[#7a200d]">
            {block.name}
          </h2>
          <p className="italic">{typeLine(block)}</p>
          <TaperedRule />
          <div className="text-[#7a200d]">
            <p>
              <span className="font-bold">Armor Class</span> {acText(block)}
            </p>
            <p>
              <span className="font-bold">Hit Points</span> {hpText(block)}
            </p>
            <p>
              <span className="font-bold">Speed</span> {speedText(block)}
            </p>
          </div>
          <TaperedRule />
          <div className="grid grid-cols-6 text-center text-[#7a200d]">
            {ABILITIES.map((a) => (
              <div key={a}>
                <div className="font-bold uppercase">{a}</div>
                <div className="text-sm">
                  {abilityText(block.abilities[a], block.mods[a])}
                </div>
              </div>
            ))}
          </div>
          <TaperedRule />
          <div className="text-[#7a200d]">
            {propertyLines(block).map(([label, value]) => (
              <p key={label}>
                <span className="font-bold">{label}</span> {value}
              </p>
            ))}
          </div>
          <TaperedRule />
        </div>
        <div className="mt-2">
          {block.traits.map((f) => (
            <FeatureEntry key={f.id} feature={f} />
          ))}
        </div>
        {featureSections(block).map((section) => (
          <div key={section.title}>
            <SectionHeading>{section.title}</SectionHeading>
            {section.intro ? (
              <p className="mb-2 leading-snug">{section.intro}</p>
            ) : null}
            {section.features.map((f) => (
              <FeatureEntry key={`${section.title}-${f.id}`} feature={f} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
