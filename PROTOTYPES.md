# Attempt to remove all prototype modification

## Objectives

The recovered sources still carry the class style of the original 2010-2013
code. The goal is plain ES classes, with no behaviour change:

1. **No prototype defaults**: remove every `Object.assign(X.prototype, {...})`
   block. Defaults move into the constructor (or into class fields).
2. **Real constructors**: replace `constructor(...aArgs) { this.__construct(...aArgs) }`
   + `__construct()` with a plain `constructor()`, and `super.__construct(...)`
   with `super(...)` in subclasses.
3. **No runtime prototype patching**: `MagicPlugin` (time stop) swaps
   `Animation.prototype.animate` and `Raycaster.prototype.textureAnimation`
   while the spell runs. It needs another mechanism (a flag, or patching the
   instances).

Method: work from the bottom of the dependency graph up. Before migrating a
level, write unit tests for its classes (a safety net), then migrate, then
check that `npm test` stays green and the game still runs.

```bash
npm test                    # unit tests (vitest, test/unit/)
npm run report:prototypes   # what is left, by dependency level
```

## Traps to watch

- **Subclass overrides hidden by the parent constructor.** A default the
  parent constructor assigns hides the value a subclass puts on its prototype.
  Seen with `sClass` in the `GX*` effects (`DataSerializer.saveOpenDoors` and
  `Game` recognise doors by `sClass === 'Door'`); solved by having each
  subclass assign its own value right after `super()`.
- **`__construct` is virtual.** The base constructor calls `this.__construct()`,
  so it runs the *subclass* version. Converting a parent to a real constructor
  while its subclasses still use `__construct` silently skips their setup
  (22 subclasses of `GXEffect`/`Thinker`/`Transistate` rely on this).
  `Thinker` and `GC/EffectProcessor` even test `'__construct' in this`.
- **Prototype used as a namespace.** Constants read through the prototype
  from outside (`GXColorVeil.prototype.SNARE` in `Game.js`) become `static`
  fields, and the callers are updated.
- **Order inside the constructor.** `Transistate` picks its first state in the
  constructor: a default (`pDoomloop`, `_sState`) assigned *after*
  `setDoomloop()` erases it.
- **Class fields run after `super()`.** A subclass field initialiser
  overwrites whatever the parent constructor (or a virtual `__construct`) set.
- **Construction snapshot.** For a family with many subclasses, recording
  every field a new instance exposes (`for…in` sees own and prototype
  fields alike) before migrating, then comparing after, catches all of the
  above at once (see `test/unit/game/thinkers/construction.test.mjs`).
- **Shared mutable defaults.** An array or object left on a prototype is shared
  by every instance. The tests check this (`assertNotShared`).

## Progress

Snapshot of 2026-10-19: **65 files done, 10 deleted, 46 to go.**

### Done

| File | Commit | Unit tests |
|---|---|---|
| `game/GC/Item.js` | 1e6379d | yes |
| `game/Item.js` | 1e6379d | no |
| `game/Adventure.js` | 44f511c | no |
| `game/Cheats.js` | 44f511c | no |
| `game/EventLog.js` | 44f511c | no |
| `game/GC/Effect.js` | 44f511c | no |
| `game/plugins/BookPlugin.js` | 44f511c | no |
| `game/plugins/ConsolePlugin.js` | 44f511c | no |
| `game/plugins/CraftPlugin.js` | 44f511c | no |
| `game/plugins/DescriptorPlugin.js` | 44f511c | no |
| `game/plugins/DialogPlugin.js` | 44f511c | no |
| `game/plugins/InventoryPlugin.js` | 44f511c | no |
| `game/plugins/PlayersheetPlugin.js` | 44f511c | no |
| `game/plugins/ScorePlugin.js` | 44f511c | no |
| `game/plugins/ShopPlugin.js` | 44f511c | no |
| `game/plugins/StubPlugin.js` | 44f511c | no |
| `game/plugins/UnderwaterPlugin.js` | 44f511c | no |
| `game/plugins/WoundPlugin.js` | 44f511c | no |
| `libraries/O876/Astar/Land.js` | 44f511c | no |
| `libraries/O876/Mediator/Plugin.js` | 44f511c | no |
| `libraries/Raycaster/Animation.js` | 44f511c | no |
| `libraries/Raycaster/FrameCounter.js` | 44f511c | no |
| `libraries/Raycaster/Minimap.js` | 44f511c | no |
| `libraries/Raycaster/Mobile.js` | 44f511c | no |
| `libraries/Raycaster/Raycaster.js` | 44f511c | no |
| `libraries/Raycaster/Sprite.js` | 44f511c | no |
| `game/GC/Creature.js` | (this branch) | yes |
| `game/GC/Inventory.js` | (this branch) | yes |
| `libraries/H5UI/Font.js` | (this branch) | yes |
| `libraries/O876/Astar/NoodList.js` | (this branch) | yes |
| `libraries/O876/Astar/Point.js` | (this branch) | yes |
| `libraries/O876/Horde.js` | (this branch) | yes |
| `libraries/Raycaster/Blueprint.js` | (this branch) | yes |
| `libraries/Raycaster/ImageLoader.js` | (this branch) | yes |
| `libraries/Raycaster/KeyboardDevice.js` | (this branch) | yes |
| `libraries/Raycaster/MobileDispenser.js` | (this branch) | yes |
| `libraries/Raycaster/MobileRegister.js` | (this branch) | yes |
| `libraries/Raycaster/MouseDevice.js` | (this branch) | yes |
| `libraries/Raycaster/ThinkerManager.js` | (this branch) | yes |
| `libraries/Raycaster/GXEffect.js` | (this branch) | yes |
| `game/gx/GXBlind.js` | (this branch) | yes |
| `game/gx/GXColorVeil.js` | (this branch) | yes |
| `game/gx/GXConfused.js` | (this branch) | yes |
| `game/gx/GXIconPad.js` | (this branch) | yes |
| `game/gx/GXTimeStop.js` | (this branch) | yes |
| `game/gx/GXUnderwater.js` | (this branch) | yes |
| `libraries/Raycaster/GXDoor.js` | (this branch) | yes |
| `libraries/Raycaster/GXMessage.js` | (this branch) | yes |
| `libraries/Raycaster/GXSecret.js` | (this branch) | yes |
| `libraries/Raycaster/GXFade.js` | (this branch) | yes |
| `libraries/Raycaster/GXFlash.js` | (this branch) | yes |
| `game/gx/GXFlood.js` | (this branch) | yes |
| `libraries/Raycaster/Thinker.js` | (this branch) | yes |
| `libraries/Raycaster/MouseKeyboardThinker.js` | (this branch) | yes |
| `libraries/Raycaster/LinearThinker.js` | (this branch) | yes |
| `libraries/Raycaster/NonLinearThinker.js` | (this branch) | yes |
| `libraries/Raycaster/MissileThinker.js` | (this branch) | yes |
| `game/thinkers/MagicMissileThinker.js` | (this branch) | yes |
| `game/thinkers/PlayerKeyboardThinker.js` | (this branch) | yes |
| `game/thinkers/TimedThinker.js` | (this branch) | yes |
| `game/thinkers/MobThinker.js` | (this branch) | yes |
| `game/thinkers/CasterThinker.js` | (this branch) | yes |
| `game/thinkers/ShooterThinker.js` | (this branch) | yes |
| `game/thinkers/SentryThinker.js` | (this branch) | yes |
| `game/thinkers/StealerThinker.js` | (this branch) | yes |

`MagicPlugin.js` lost its prototype defaults in 44f511c but still patches
`Animation` and `Raycaster` at runtime (objective 3), so it stays in the to-do
list.

### Deleted

Unused anywhere in the game, removed instead of migrated:
`libraries/O876/CPUMonitor.js`, `libraries/O876/Easing.js`,
`libraries/O876/Legion.js`, `libraries/Raycaster/Scheduler.js`, and the
library thinkers `CameraKeyboardThinker`, `CameraMouseKeyboardThinker`,
`KbdArrowThinker`, `CommandThinker`, `WanderThinker`, `KeyboardThinker`.

### To do

Paths are relative to `src-recovered/`. Tags: **P** prototype defaults,
**C** `__construct`, **R** runtime patch. A level only depends on lower levels.
Tick a box once the file is migrated and its tests pass.

#### Level 0: no dependency

| File | Tags | Tests | Notes |
|---|---|---|---|
| [ ] `libraries/O876/Browser.js` | C | **no** | |
| [ ] `libraries/O876/SoundSystem.js` | P C | **no** | depends on the `howler` package only |
| [ ] `libraries/Raycaster/Transistate.js` | P C | yes | constructor order trap, see above |

#### Level 1

| File | Tags | Tests |
|---|---|---|
| [ ] `game/BackupSystem.js` | P C | no |
| [ ] `game/GC/EffectProcessor.js` | P C | no |
| [ ] `game/LootSystem.js` | P C | no |
| [ ] `game/WeaponAnimator.js` | P C | no |
| [ ] `libraries/O876/Astar/Nood.js` | P C | no |
| [ ] `libraries/O876/Mediator/Mediator.js` | P C | no |
| [ ] `libraries/O876/Microsyte.js` | P C | no |
| [ ] `libraries/Raycaster/GXManager.js` | P C | no |
| [ ] `libraries/Raycaster/Tile.js` | P C | no |

#### Level 2

| File | Tags | Tests |
|---|---|---|
| [ ] `game/EffectProcessor.js` | P C | no |
| [ ] `libraries/H5UI/WinControl.js` | P C | no |
| [ ] `libraries/Raycaster/Horde.js` | P C | no |

#### Level 3

| File | Tags | Tests |
|---|---|---|
| [ ] `game/Dungeon.js` | P C | no |
| [ ] `game/UI/Screen.js` | P | no |
| [ ] `libraries/H5UI/Box.js` | P | no |
| [ ] `libraries/H5UI/Image.js` | P | no |
| [ ] `libraries/H5UI/ScrollBox.js` | P | no |
| [ ] `libraries/H5UI/Text.js` | P C | no |
| [ ] `libraries/H5UI/TileGrid.js` | P | no |

#### Level 4

| File | Tags | Tests |
|---|---|---|
| [ ] `game/UI/HUD.js` | P C | no |
| [ ] `game/UI/Icon.js` | P | no |
| [ ] `game/UI/ProgressBar.js` | P C | no |
| [ ] `game/cutscenes/Cutscene.js` | P C | no |
| [ ] `game/plugins/MagicPlugin.js` | R | no |
| [ ] `libraries/H5UI/Button.js` | P C | no |
| [ ] `libraries/Raycaster/Engine.js` | P C | no |

#### Level 5

| File | Tags | Tests |
|---|---|---|
| [ ] `game/MenuSystem.js` | P C | no |
| [ ] `game/UI/Window.js` | P C | no |
| [ ] `game/cutscenes/CutsceneEnd.js` | P C | no |
| [ ] `game/cutscenes/CutsceneIntro.js` | P C | no |

#### Level 6

| File | Tags | Tests |
|---|---|---|
| [ ] `game/UI/BookWindow.js` | P C | no |
| [ ] `game/UI/ConsoleWindow.js` | P C | no |
| [ ] `game/UI/CraftWindow.js` | P C | no |
| [ ] `game/UI/DescriptorWindow.js` | P C | no |
| [ ] `game/UI/DialogWindow.js` | P C | no |
| [ ] `game/UI/InventoryWindow.js` | P C | no |
| [ ] `game/UI/LoadingWindow.js` | P C | no |
| [ ] `game/UI/MainMenuWindow.js` | P C | no |
| [ ] `game/UI/PlayersheetWindow.js` | P C | no |
| [ ] `game/UI/ShopWindow.js` | P C | no |
| [ ] `game/UI/StubWindow.js` | P C | no |

#### Level 7

| File | Tags | Tests | Notes |
|---|---|---|---|
| [ ] `game/UI/System.js` | P C | no | import cycle: `UI.js` imports `System.js`, which imports windows that import `UI.js` |

#### Level 8

| File | Tags | Tests |
|---|---|---|
| [ ] `game/Game.js` | P | no |

## Log

- **2026-10-18** (44f511c): 24 files migrated (plugins, `Adventure`, `Cheats`,
  `EventLog`, `GC/Effect`, `Land`, `Mediator/Plugin`, `Animation`,
  `FrameCounter`, `Minimap`, `Mobile`, `Raycaster`, `Sprite`), and the
  prototype defaults of `MagicPlugin`.
- **2026-10-19** (1e6379d): `GC/Item` and `game/Item` migrated.
- **2026-10-19**: vitest added; 131 tests covering `GC/Item` and 20 of the 22
  level 0 files (`Browser` and `SoundSystem` still untested). Checked that a
  naive migration of `GXEffect` or `Transistate` turns 7 tests red.
  `npm run report:prototypes` lists what is left.
- **2026-10-19**: deleted the unused `CPUMonitor`, `Easing`, `Legion` and
  `Scheduler` (and their tests).
- **2026-10-19**: migrated the 13 level 0 classes nothing extends (`Creature`,
  `Inventory`, `Font`, `NoodList`, `Point`, O876 `Horde`, `Blueprint`,
  `ImageLoader`, `KeyboardDevice`, `MobileDispenser`, `MobileRegister`,
  `MouseDevice`, `ThinkerManager`). Tests green, game boots to the main menu.
- **2026-10-19**: migrated the `GXEffect` family (`GXEffect` and its 12
  subclasses), after adding tests for every subclass with a fake canvas
  (`test/unit/canvas.mjs`). `GXColorVeil.SNARE/ROOT/HOLD` are now static, read
  by `Game.js`; the unused `GXDoor.nAutoClose` (typo of `nAutoclose`) is gone.
  159 tests green, game boots to the main menu.
- **2026-10-19**: in-game check of the `GXEffect` family. OK: door left open
  then save/reload, red flash when hit, confusion, secret wall, time stop
  (`learn` debug cheat added for it), status icons, popup messages, medusa
  flood then underwater, blindness and the snare/root/hold veils (`affect`
  debug cheat). The whole family is checked.
- **2026-10-19**: deleted the 6 unused library thinkers; migrated the
  `Thinker` family (`Thinker` and its 12 subclasses that had prototype
  defaults or `__construct`), after recording a construction snapshot of the
  18 remaining thinkers and adding behaviour tests (`Linear`, `NonLinear`,
  `MouseKeyboard`, `Missile`). `MobThinker.EFFECT_HAZES` is now a module
  constant, still shared by all mobs. 203 tests green, game boots.
