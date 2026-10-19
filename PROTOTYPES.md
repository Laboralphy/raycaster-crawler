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

- **Subclass overrides hidden by the parent constructor.** The `GX*` effects
  set `sClass` on their own prototype (`'Door'`, `'Secret'`...). If
  `GXEffect`'s constructor sets `this.sClass = 'Effect'`, the instance property
  hides the subclass value, and `DataSerializer.saveOpenDoors` / `Game` no
  longer recognise doors. Same risk for any default a subclass redefines.
- **`__construct` is virtual.** The base constructor calls `this.__construct()`,
  so it runs the *subclass* version. Converting a parent to a real constructor
  while its subclasses still use `__construct` silently skips their setup
  (22 subclasses of `GXEffect`/`Thinker`/`Transistate` rely on this).
  `Thinker` and `GC/EffectProcessor` even test `'__construct' in this`.
- **Order inside the constructor.** `Transistate` picks its first state in the
  constructor: a default (`pDoomloop`, `_sState`) assigned *after*
  `setDoomloop()` erases it.
- **Class fields run after `super()`.** A subclass field initialiser
  overwrites whatever the parent constructor (or a virtual `__construct`) set.
- **Shared mutable defaults.** An array or object left on a prototype is shared
  by every instance. The tests check this (`assertNotShared`).

## Progress

Snapshot of 2026-10-19: **26 files done, 95 to go.**

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

`MagicPlugin.js` lost its prototype defaults in 44f511c but still patches
`Animation` and `Raycaster` at runtime (objective 3), so it stays in the to-do
list.

### To do

Paths are relative to `src-recovered/`. Tags: **P** prototype defaults,
**C** `__construct`, **R** runtime patch. A level only depends on lower levels.
Tick a box once the file is migrated and its tests pass.

#### Level 0: no dependency (safety net written)

| File | Tags | Tests | Notes |
|---|---|---|---|
| [ ] `game/GC/Creature.js` | P C | yes | |
| [ ] `game/GC/Inventory.js` | P C | yes | `findAllItems` sort typo (`stakcount`), sort does nothing |
| [ ] `libraries/H5UI/Font.js` | P C | yes | |
| [ ] `libraries/O876/Astar/NoodList.js` | P C | yes | |
| [ ] `libraries/O876/Astar/Point.js` | P C | yes | |
| [ ] `libraries/O876/Browser.js` | C | **no** | |
| [ ] `libraries/O876/CPUMonitor.js` | P C | yes | unused, could be deleted |
| [ ] `libraries/O876/Easing.js` | P C | yes | unused, could be deleted |
| [ ] `libraries/O876/Horde.js` | P C | yes | |
| [ ] `libraries/O876/Legion.js` | P C | yes | unused; `indexOf` bug (`it.fails`) |
| [ ] `libraries/O876/SoundSystem.js` | P C | **no** | depends on the `howler` package only |
| [ ] `libraries/Raycaster/Blueprint.js` | P C | yes | |
| [ ] `libraries/Raycaster/GXEffect.js` | P C | yes | `sClass` trap, see above |
| [ ] `libraries/Raycaster/ImageLoader.js` | P C | yes | |
| [ ] `libraries/Raycaster/KeyboardDevice.js` | P C | yes | |
| [ ] `libraries/Raycaster/MobileDispenser.js` | P C | yes | |
| [ ] `libraries/Raycaster/MobileRegister.js` | P C | yes | |
| [ ] `libraries/Raycaster/MouseDevice.js` | P C | yes | |
| [ ] `libraries/Raycaster/Scheduler.js` | P C | yes | unused; `schedule` bug (`it.fails`) |
| [ ] `libraries/Raycaster/Thinker.js` | P C | yes | tests `'__construct' in this` |
| [ ] `libraries/Raycaster/ThinkerManager.js` | P C | yes | |
| [ ] `libraries/Raycaster/Transistate.js` | P C | yes | constructor order trap, see above |

#### Level 1

| File | Tags | Tests |
|---|---|---|
| [ ] `game/BackupSystem.js` | P C | no |
| [ ] `game/GC/EffectProcessor.js` | P C | no |
| [ ] `game/LootSystem.js` | P C | no |
| [ ] `game/WeaponAnimator.js` | P C | no |
| [ ] `game/gx/GXBlind.js` | P C | no |
| [ ] `game/gx/GXColorVeil.js` | P C | no |
| [ ] `game/gx/GXConfused.js` | P C | no |
| [ ] `game/gx/GXIconPad.js` | P C | no |
| [ ] `game/gx/GXTimeStop.js` | P C | no |
| [ ] `game/gx/GXUnderwater.js` | P C | no |
| [ ] `game/thinkers/MobThinker.js` | P C | no |
| [ ] `game/thinkers/TimedThinker.js` | P | partly (via `Thinker` tests) |
| [ ] `libraries/O876/Astar/Nood.js` | P C | no |
| [ ] `libraries/O876/Mediator/Mediator.js` | P C | no |
| [ ] `libraries/O876/Microsyte.js` | P C | no |
| [ ] `libraries/Raycaster/CommandThinker.js` | P | no |
| [ ] `libraries/Raycaster/GXDoor.js` | P C | partly (via `GXEffect` tests) |
| [ ] `libraries/Raycaster/GXManager.js` | P C | no |
| [ ] `libraries/Raycaster/GXMessage.js` | P C | no |
| [ ] `libraries/Raycaster/GXSecret.js` | P C | partly (via `GXEffect` tests) |
| [ ] `libraries/Raycaster/KeyboardThinker.js` | P | no |
| [ ] `libraries/Raycaster/LinearThinker.js` | P C | partly (via `Thinker` tests) |
| [ ] `libraries/Raycaster/MissileThinker.js` | P C | no |
| [ ] `libraries/Raycaster/MouseKeyboardThinker.js` | P | no |
| [ ] `libraries/Raycaster/NonLinearThinker.js` | P C | no |
| [ ] `libraries/Raycaster/Tile.js` | P C | no |
| [ ] `libraries/Raycaster/WanderThinker.js` | P C | no |

#### Level 2

| File | Tags | Tests |
|---|---|---|
| [ ] `game/EffectProcessor.js` | P C | no |
| [ ] `game/thinkers/CasterThinker.js` | P | no |
| [ ] `game/thinkers/MagicMissileThinker.js` | P | no |
| [ ] `game/thinkers/SentryThinker.js` | P | no |
| [ ] `game/thinkers/ShooterThinker.js` | P | no |
| [ ] `game/thinkers/StealerThinker.js` | P | no |
| [ ] `libraries/H5UI/WinControl.js` | P C | no |
| [ ] `libraries/Raycaster/CameraKeyboardThinker.js` | P C | no |
| [ ] `libraries/Raycaster/CameraMouseKeyboardThinker.js` | P C | no |
| [ ] `libraries/Raycaster/GXFade.js` | P C | no |
| [ ] `libraries/Raycaster/GXFlash.js` | P C | no |
| [ ] `libraries/Raycaster/Horde.js` | P C | no |
| [ ] `libraries/Raycaster/KbdArrowThinker.js` | C | no |

#### Level 3

| File | Tags | Tests |
|---|---|---|
| [ ] `game/Dungeon.js` | P C | no |
| [ ] `game/UI/Screen.js` | P | no |
| [ ] `game/gx/GXFlood.js` | P C | no |
| [ ] `game/thinkers/PlayerKeyboardThinker.js` | P C | no |
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
