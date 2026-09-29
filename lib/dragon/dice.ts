import { DamagePart } from "@/lib/dragon/types"

export interface RollResult {
  id: number
  label: string
  expression: string
  rolls: number[]
  bonus: number
  total: number
  note?: string
}

let rollCounter = 0

const rollDie = (die: number) => 1 + Math.floor(Math.random() * die)

function expressionFor(parts: { count: number; die: number }[], bonus: number) {
  const dice = parts.map((p) => `${p.count}d${p.die}`).join(" + ")
  if (!bonus) return dice
  return `${dice} ${bonus > 0 ? "+" : "-"} ${Math.abs(bonus)}`
}

export function rollDice(
  label: string,
  count: number,
  die: number,
  bonus = 0
): RollResult {
  const rolls = Array.from({ length: count }, () => rollDie(die))
  const total = rolls.reduce((sum, r) => sum + r, 0) + bonus
  let note: string | undefined
  if (count === 1 && die === 20) {
    if (rolls[0] === 20) note = "Natural 20!"
    if (rolls[0] === 1) note = "Natural 1"
  }
  return {
    id: ++rollCounter,
    label,
    expression: expressionFor([{ count, die }], bonus),
    rolls,
    bonus,
    total,
    note,
  }
}

export function rollDamage(label: string, parts: DamagePart[]): RollResult {
  const rolls: number[] = []
  let bonus = 0
  const byType: string[] = []
  for (const part of parts) {
    const partRolls = Array.from({ length: part.count }, () =>
      rollDie(part.die)
    )
    rolls.push(...partRolls)
    bonus += part.bonus
    byType.push(
      `${partRolls.reduce((s, r) => s + r, 0) + part.bonus} ${part.type}`
    )
  }
  return {
    id: ++rollCounter,
    label,
    expression: expressionFor(parts, bonus),
    rolls,
    bonus,
    total: rolls.reduce((sum, r) => sum + r, 0) + bonus,
    note: parts.length > 1 ? byType.join(" + ") : parts[0]?.type,
  }
}
