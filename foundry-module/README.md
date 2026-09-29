# Wings of Fire Dragon Generator (Foundry VTT module)

Adds a **Hatch Dragon** button to the Actors sidebar of any `dnd5e` world. Pick a tribe, a power from 1 to 10, a seed, and an Animus setting, and the module creates a ready-to-use NPC actor with attacks, breath weapons, legendary actions, and lair/regional effects. There is nothing to download or import by hand.

Requires Foundry VTT v12 or newer with the Dungeons & Dragons Fifth Edition system 4.0 or newer.

## Install

Paste this manifest URL into **Add-on Modules → Install Module → Manifest URL** on the Foundry setup screen:

```
https://github.com/Jayty07/-dragongenerator/releases/latest/download/module.json
```

Forge VTT runs standard Foundry, so you can use the same manifest URL through Forge's option for installing a package from a manifest.

Then enable **Wings of Fire Dragon Generator** in your world under **Game Settings → Manage Modules**.

## Use

1. Open the **Actors** sidebar and click **Hatch Dragon**. The button only appears for users who are allowed to create actors.
2. Choose the tribe, power, and Animus mode. Leave the seed as is or reroll it with the dice button. The dialog previews the dragon's name and CR as you change settings.
3. Click **Hatch**. The actor is created in a **Wings of Fire Dragons** folder and its sheet opens.

The same tribe, power, and seed always produce the same dragon.

## Macro API

```js
const api = game.modules.get("wof-dragon-generator").api
await api.openHatchDialog()
await api.hatchDragon({
  tribe: "icewing",
  power: 8,
  seed: "frostbite",
  animus: "never",
  openSheet: true,
})
```

## Development

The module bundles the generator in `lib/dragon/`, which the website also uses. From the repo root:

```
pnpm foundry:typecheck
pnpm foundry:build   # writes foundry-module/scripts/module.js
```

To test locally, symlink or copy `foundry-module/` into your Foundry `Data/modules/wof-dragon-generator` folder after building.

Publishing a GitHub release (for example, tag `v1.0.0`) runs `.github/workflows/foundry-module-release.yml`. The workflow builds the module, stamps the version into `module.json`, and attaches `module.zip` and `module.json` to the release, which is what the manifest URL points to.
