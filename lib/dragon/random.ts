export type Rng = () => number

function hashString(input: string): number {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h1 ^ h2) >>> 0
}

/** Deterministic PRNG (mulberry32) seeded from an arbitrary string. */
export function createRng(seed: string): Rng {
  let a = hashString(seed)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

export function pick<T>(rng: Rng, items: T[]): T {
  return items[Math.floor(rng() * items.length)]
}

const SEED_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"

export function randomSeed(length = 8): string {
  let seed = ""
  for (let i = 0; i < length; i++) {
    seed += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)]
  }
  return seed
}
