"use client"

import * as React from "react"
import {
  ClipboardCopy,
  Copy,
  Dices,
  Download,
  FileJson,
  Shuffle,
  Wand2,
} from "lucide-react"

import { RollResult, rollDamage, rollDice } from "@/lib/dragon/dice"
import {
  exportFileName,
  toFoundryJSON,
  toJSON,
  toMarkdown,
  toPlainText,
} from "@/lib/dragon/export"
import { featureTitle } from "@/lib/dragon/format"
import {
  AGE_CATEGORY,
  AnimusMode,
  CR_RANGE,
  MAX_POWER,
  MIN_POWER,
  animusChance,
  formatCR,
  generateDragon,
  signed,
} from "@/lib/dragon/generator"
import { randomSeed } from "@/lib/dragon/random"
import { TRIBES, getTribe } from "@/lib/dragon/tribes"
import { Feature, StatBlock, TribeId } from "@/lib/dragon/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { DragonStatBlock } from "@/components/dragon-stat-block"

const DEFAULT_SEED = "moonwatcher"
const DICE = [4, 6, 8, 10, 12, 20, 100]
const HISTORY_SIZE = 8

function downloadFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

async function copyToClipboard(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast({ title: `${what} copied to clipboard.` })
  } catch {
    toast({
      title: "Couldn't access the clipboard.",
      description: "Your browser blocked clipboard access for this page.",
      variant: "destructive",
    })
  }
}

function powerLabel(power: number) {
  const [low, high] = CR_RANGE[power - 1]
  return `${AGE_CATEGORY[power - 1]} · CR ${formatCR(low)}–${formatCR(high)}`
}

export function DragonGenerator() {
  const [tribeId, setTribeId] = React.useState<TribeId>("nightwing")
  const [power, setPower] = React.useState(5)
  const [seed, setSeed] = React.useState(DEFAULT_SEED)
  const [animus, setAnimus] = React.useState<AnimusMode>("random")
  const [rolls, setRolls] = React.useState<RollResult[]>([])

  const tribe = getTribe(tribeId)
  const block = React.useMemo(
    () => generateDragon({ tribe: tribeId, power, seed, animus }),
    [tribeId, power, seed, animus]
  )

  const pushRoll = React.useCallback((result: RollResult) => {
    setRolls((prev) => [result, ...prev].slice(0, HISTORY_SIZE))
  }, [])

  function generate() {
    setSeed(randomSeed())
  }

  function randomizeAll() {
    setTribeId(TRIBES[Math.floor(Math.random() * TRIBES.length)].id)
    setPower(MIN_POWER + Math.floor(Math.random() * MAX_POWER))
    setSeed(randomSeed())
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="grid gap-6 lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Hatch a dragon</CardTitle>
            <CardDescription>
              Pick a tribe and a power level. Same seed, same dragon.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="dragon-tribe">Tribe</Label>
              <Select
                value={tribeId}
                onValueChange={(value) => setTribeId(value as TribeId)}
              >
                <SelectTrigger id="dragon-tribe" aria-label="Tribe">
                  <SelectValue placeholder="Choose a tribe" />
                </SelectTrigger>
                <SelectContent>
                  {TRIBES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t.kingdom}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="dragon-power">Power</Label>
                <span className="text-sm font-medium tabular-nums">
                  {power} / {MAX_POWER}
                </span>
              </div>
              <Slider
                id="dragon-power"
                aria-label="Power"
                min={MIN_POWER}
                max={MAX_POWER}
                step={1}
                value={[power]}
                onValueChange={([value]) => setPower(value)}
              />
              <p className="text-xs text-muted-foreground">
                {powerLabel(power)}
                {power >= 6 ? " · legendary actions" : ""}
                {power >= 9 ? " · lair" : ""}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dragon-seed">Seed</Label>
              <Input
                id="dragon-seed"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dragon-animus">Animus magic</Label>
              <Select
                value={animus}
                onValueChange={(value) => setAnimus(value as AnimusMode)}
              >
                <SelectTrigger id="dragon-animus" aria-label="Animus magic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">
                    Random ({Math.round(animusChance(tribe, power) * 1000) / 10}
                    % chance)
                  </SelectItem>
                  <SelectItem value="always">Always animus</SelectItem>
                  <SelectItem value="never">Never animus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={generate}>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </Button>
              <Button variant="secondary" onClick={randomizeAll}>
                <Shuffle className="mr-2 h-4 w-4" />
                Randomize all
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <CardDescription>
              Paste into notes, or import into Foundry VTT (including Forge).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(toMarkdown(block), "Markdown")}
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy as Markdown
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(toPlainText(block), "Stat block")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy as plain text
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadFile(exportFileName(block, ".json"), toJSON(block))
              }
            >
              <FileJson className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
            <Button
              onClick={() =>
                downloadFile(
                  exportFileName(block, ".foundry-actor.json"),
                  toFoundryJSON(block)
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download Foundry VTT actor
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid min-w-0 gap-6">
        <DragonStatBlock block={block} data-testid="dragon-stat-block" />
        <Tabs defaultValue="flavor">
          <TabsList>
            <TabsTrigger value="flavor">Flavor</TabsTrigger>
            <TabsTrigger value="dice">Dice roller</TabsTrigger>
            <TabsTrigger value="lore">Tribe lore</TabsTrigger>
          </TabsList>
          <TabsContent value="flavor">
            <FlavorPanel block={block} />
          </TabsContent>
          <TabsContent value="dice">
            <DicePanel block={block} rolls={rolls} onRoll={pushRoll} />
          </TabsContent>
          <TabsContent value="lore">
            <Card>
              <CardHeader>
                <CardTitle>{tribe.name}</CardTitle>
                <CardDescription>
                  {tribe.kingdom} · {tribe.habitat}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p>{tribe.description}</p>
                <p>
                  <span className="font-medium">Themes:</span>{" "}
                  {tribe.abilityThemes}
                </p>
                <p>
                  <span className="font-medium">Breath:</span>{" "}
                  {tribe.breath.name} ({tribe.breath.shape},{" "}
                  {tribe.breath.save.toUpperCase()} save
                  {tribe.breath.damageType
                    ? `, ${tribe.breath.damageType}`
                    : ""}
                  )
                </p>
                <div className="flex flex-wrap gap-2">
                  {tribe.damageTypes.map((d) => (
                    <Tag key={d}>{d}</Tag>
                  ))}
                  {tribe.variants.map((v) => (
                    <Tag key={v.id} title={v.blurb}>
                      rare: {v.name}
                    </Tag>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Tag({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize"
    >
      {children}
    </span>
  )
}

function FlavorPanel({ block }: { block: StatBlock }) {
  const rare = [...block.variants, ...(block.animus ? ["Animus"] : [])]
  const rows: [string, string][] = [
    ["Age", `${block.ageCategory} (${block.ageYears} years)`],
    ["Appearance", block.flavor.appearance],
    ["Personality", block.flavor.personality],
    ["Quirk", block.flavor.quirk],
    ["Story hook", block.flavor.hook],
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.name}</CardTitle>
        <CardDescription>
          {block.tribeName} · {block.alignment} · Seed{" "}
          <code className="font-mono">{block.seed}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {rare.length ? (
          <div className="flex flex-wrap gap-2">
            {rare.map((r) => (
              <Tag key={r}>{r}</Tag>
            ))}
          </div>
        ) : null}
        <dl className="grid gap-2 sm:grid-cols-[120px_1fr]">
          {rows.map(([label, value]) => (
            <React.Fragment key={label}>
              <dt className="font-medium">{label}</dt>
              <dd className="text-muted-foreground">{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

interface DicePanelProps {
  block: StatBlock
  rolls: RollResult[]
  onRoll: (result: RollResult) => void
}

function rollableFeatures(block: StatBlock): Feature[] {
  const legendary = block.legendary?.actions ?? []
  return [...block.actions, ...block.bonusActions, ...legendary].filter(
    (f) => f.attack || f.save?.damage.length || f.recharge
  )
}

function DicePanel({ block, rolls, onRoll }: DicePanelProps) {
  const features = rollableFeatures(block)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="h-5 w-5" /> Dice roller
        </CardTitle>
        <CardDescription>
          Quick rolls for {block.shortName}&apos;s attacks and abilities.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {DICE.map((die) => (
            <Button
              key={die}
              size="sm"
              variant="outline"
              onClick={() => onRoll(rollDice(`d${die}`, 1, die))}
            >
              d{die}
            </Button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              onRoll(rollDice("Initiative", 1, 20, block.mods.dex))
            }
          >
            Initiative ({signed(block.mods.dex)})
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={`${f.kind}-${f.id}`}
              className="flex flex-wrap items-center gap-2 rounded-md border p-2"
            >
              <span className="mr-auto text-sm font-medium">
                {featureTitle(f)}
              </span>
              {f.attack ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      onRoll(
                        rollDice(
                          `${f.name} to hit`,
                          1,
                          20,
                          f.attack?.bonus ?? 0
                        )
                      )
                    }
                  >
                    Hit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      onRoll(
                        rollDamage(`${f.name} damage`, f.attack?.damage ?? [])
                      )
                    }
                  >
                    Dmg
                  </Button>
                </>
              ) : null}
              {!f.attack && f.save?.damage.length ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onRoll(rollDamage(`${f.name} damage`, f.save?.damage ?? []))
                  }
                >
                  Dmg
                </Button>
              ) : null}
              {f.recharge ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const result = rollDice(`${f.name} recharge`, 1, 6)
                    const threshold = f.recharge ?? 6
                    result.note =
                      result.total >= threshold ? "Recharged!" : "Not yet"
                    onRoll(result)
                  }}
                >
                  Recharge
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <div aria-live="polite" className="grid gap-1">
          {rolls.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rolls yet.</p>
          ) : (
            rolls.map((r, i) => (
              <div
                key={r.id}
                className={
                  i === 0
                    ? "flex items-baseline justify-between rounded-md bg-muted px-3 py-2"
                    : "flex items-baseline justify-between px-3 py-1 text-muted-foreground"
                }
              >
                <span className="text-sm">
                  {r.label}{" "}
                  <span className="text-xs">
                    ({r.expression}: [{r.rolls.join(", ")}])
                    {r.note ? ` · ${r.note}` : ""}
                  </span>
                </span>
                <span
                  className={
                    i === 0
                      ? "text-2xl font-bold tabular-nums"
                      : "font-medium tabular-nums"
                  }
                >
                  {r.total}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
