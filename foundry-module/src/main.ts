import { toFoundryActor } from "@/lib/dragon/export"
import {
  AnimusMode,
  MAX_POWER,
  MIN_POWER,
  formatCR,
  generateDragon,
} from "@/lib/dragon/generator"
import { randomSeed } from "@/lib/dragon/random"
import { TRIBES } from "@/lib/dragon/tribes"
import { StatBlock, TribeId } from "@/lib/dragon/types"

const MODULE_ID = "wof-dragon-generator"
const DIALOG_CLASS = "wof-dragon-hatch"
const FOLDER_NAME = "Wings of Fire Dragons"
const ANIMUS_MODES: AnimusMode[] = ["random", "always", "never"]

export interface HatchOptions {
  tribe: TribeId
  power: number
  seed: string
  animus: AnimusMode
  openSheet: boolean
}

const lastOptions: HatchOptions = {
  tribe: "nightwing",
  power: 5,
  seed: "",
  animus: "random",
  openSheet: true,
}

export function buildActorData(options: Omit<HatchOptions, "openSheet">) {
  const block = generateDragon(options)
  const data = toFoundryActor(block)
  delete data._id
  delete data._stats
  return { block, data }
}

async function dragonFolderId(): Promise<string | null> {
  const existing = game.folders?.find(
    (f) => f.type === "Actor" && f.name === FOLDER_NAME
  )
  if (existing) return existing.id
  if (!game.user?.isGM) return null
  const created = await Folder.create({
    name: FOLDER_NAME,
    type: "Actor",
    color: "#7a200d",
  })
  return created?.id ?? null
}

export async function hatchDragon(options: HatchOptions) {
  const { block, data } = buildActorData(options)
  const actor = await Actor.create({ ...data, folder: await dragonFolderId() })
  if (!actor) return null
  ui.notifications.info(
    `Hatched ${block.name} (${block.tribeName}, CR ${formatCR(block.cr)}).`
  )
  if (options.openSheet) actor.sheet?.render(true)
  return actor
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function previewText(block: StatBlock) {
  const extras = [
    block.legendary ? "legendary" : "",
    block.lair ? "lair" : "",
    block.animus ? "animus" : "",
  ].filter(Boolean)
  return `${block.name}: ${block.sizeLabel} dragon, CR ${formatCR(block.cr)}${
    extras.length ? ` (${extras.join(", ")})` : ""
  }`
}

function dialogContent(options: HatchOptions) {
  const tribes = TRIBES.map(
    (t) =>
      `<option value="${t.id}"${t.id === options.tribe ? " selected" : ""}>${
        t.name
      }</option>`
  ).join("")
  const animus = ANIMUS_MODES.map(
    (m) =>
      `<option value="${m}"${m === options.animus ? " selected" : ""}>${
        m.charAt(0).toUpperCase() + m.slice(1)
      }</option>`
  ).join("")
  return `
    <div class="form-group">
      <label>Tribe</label>
      <select name="tribe">${tribes}</select>
    </div>
    <div class="form-group">
      <label>Power <span class="wof-power-value">${options.power}</span></label>
      <input type="range" name="power" min="${MIN_POWER}" max="${MAX_POWER}" step="1" value="${
    options.power
  }">
    </div>
    <div class="form-group">
      <label>Seed</label>
      <div class="wof-seed-row">
        <input type="text" name="seed" value="${escapeHtml(
          options.seed
        )}" placeholder="Leave blank for random">
        <button type="button" class="wof-reroll" title="New seed"><i class="fa-solid fa-dice"></i></button>
      </div>
    </div>
    <div class="form-group">
      <label>Animus magic</label>
      <select name="animus">${animus}</select>
    </div>
    <div class="form-group">
      <label class="checkbox">
        <input type="checkbox" name="openSheet"${
          options.openSheet ? " checked" : ""
        }> Open sheet after hatching
      </label>
    </div>
    <p class="wof-preview hint"></p>
  `
}

function readForm(form: HTMLFormElement): HatchOptions {
  const data = new FormData(form)
  const tribe = String(data.get("tribe"))
  const animus = String(data.get("animus"))
  const power = Number(data.get("power"))
  return {
    tribe: TRIBES.some((t) => t.id === tribe)
      ? (tribe as TribeId)
      : lastOptions.tribe,
    power: Math.min(MAX_POWER, Math.max(MIN_POWER, power || MIN_POWER)),
    seed: String(data.get("seed") ?? "").trim(),
    animus: ANIMUS_MODES.includes(animus as AnimusMode)
      ? (animus as AnimusMode)
      : "random",
    openSheet: data.get("openSheet") !== null,
  }
}

function activateDialog(element: HTMLElement) {
  const form = element.querySelector("form")
  const seedInput = element.querySelector<HTMLInputElement>('[name="seed"]')
  const powerValue = element.querySelector(".wof-power-value")
  const preview = element.querySelector(".wof-preview")
  if (!form || !seedInput || !preview) return
  if (!seedInput.value) seedInput.value = randomSeed()

  const refresh = () => {
    const options = readForm(form)
    if (powerValue) powerValue.textContent = String(options.power)
    preview.textContent = options.seed
      ? previewText(buildActorData(options).block)
      : "Enter a seed to preview."
  }

  form.addEventListener("input", refresh)
  element.querySelector(".wof-reroll")?.addEventListener("click", () => {
    seedInput.value = randomSeed()
    refresh()
  })
  refresh()
}

export async function openHatchDialog() {
  if (!game.user?.can("ACTOR_CREATE")) {
    ui.notifications.warn("You do not have permission to create actors.")
    return null
  }
  const options = await foundry.applications.api.DialogV2.prompt<HatchOptions>({
    window: {
      title: "Hatch a Wings of Fire Dragon",
      icon: "fa-solid fa-dragon",
    },
    classes: [DIALOG_CLASS],
    position: { width: 420 },
    content: dialogContent(lastOptions),
    rejectClose: false,
    ok: {
      label: "Hatch",
      icon: "fa-solid fa-egg",
      callback: (event, button) => {
        if (!button.form) return lastOptions
        return readForm(button.form)
      },
    },
  })
  if (!options) return null
  const seed = options.seed || randomSeed()
  Object.assign(lastOptions, options, { seed: "" })
  return hatchDragon({ ...options, seed })
}

function injectDirectoryButton(html: HTMLElement | ArrayLike<HTMLElement>) {
  if (game.system.id !== "dnd5e" || !game.user?.can("ACTOR_CREATE")) return
  const root = html instanceof HTMLElement ? html : html[0]
  if (!root || root.querySelector(".wof-hatch-dragon")) return
  const button = document.createElement("button")
  button.type = "button"
  button.classList.add("wof-hatch-dragon")
  button.innerHTML = `<i class="fa-solid fa-dragon" inert></i> Hatch Dragon`
  button.addEventListener("click", () => {
    openHatchDialog()
  })
  const container =
    root.querySelector(".header-actions") ?? root.querySelector("header")
  ;(container ?? root).append(button)
}

Hooks.once("init", () => {
  const module = game.modules.get(MODULE_ID)
  if (module) {
    module.api = {
      openHatchDialog,
      hatchDragon,
      buildActorData,
      generateDragon,
      toFoundryActor,
    }
  }
})

Hooks.once("ready", () => {
  if (game.system.id !== "dnd5e") {
    ui.notifications.warn(
      "Wings of Fire Dragon Generator requires the dnd5e game system."
    )
  }
})

Hooks.on("renderActorDirectory", (app, html) => injectDirectoryButton(html))

Hooks.on("renderDialogV2", (app, element) => {
  if (app.options.classes.includes(DIALOG_CLASS)) activateDialog(element)
})
