# Attempt to remove all prototype modification

**Status: done (2026-10-19).** All three objectives are met: no prototype
defaults, no `__construct`, no runtime prototype patching. `npm run
report:prototypes` finds nothing left; 432 unit tests.

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
  fields, and the callers are updated. Watch for reads from inside the class
  too: `InventoryWindow.sortItems` is passed unbound to `Array.sort`, so it read
  `InventoryWindow.prototype.aItemOrder` (now `static ITEM_ORDER`). A
  construction snapshot can't see these; grep for `\.prototype\.` instead.
- **Properties deleted on destruction.** `WinControl.__destruct` deleted every
  own property, so a destroyed control fell back to its prototype defaults
  (`_aControls: null`). Without the prototype it would read `undefined` and
  `hasControls()` would crash; it now sets them to `null` and keeps them.
- **Order inside the constructor.** `Transistate` picks its first state in the
  constructor: a default (`pDoomloop`, `_sState`) assigned *after*
  `setDoomloop()` erases it.
- **A parent constructor sized by a subclass.** `Cutscene` builds its canvas
  from `RAYCASTER_WIDTH/HEIGHT`, which `MenuSystem` overrode on its prototype
  (400 x 250). After `super()` is too late: the size became a constructor
  parameter (`super(400, 250)`). Prototype placeholders for methods
  (`getLabyMap: null`, `onRender: null`) must not be copied into the
  constructor, or they hide the subclass methods.
- **A parent constructor that starts the subclass running.** `Engine`
  called `resume()` in its constructor, which runs the first state at once:
  `stateInitialize` calls `Game.onInitialize`, which reads `Game`'s fields
  (`aPlugins === null`...). With real constructors those fields only exist
  after `super()` returns; the loop now starts at the end of `Game`'s
  constructor.
- **Class fields run after `super()`.** A subclass field initialiser
  overwrites whatever the parent constructor (or a virtual `__construct`) set.
- **Construction snapshot.** For a family with many subclasses, recording
  every field a new instance exposes (`for…in` sees own and prototype
  fields alike) before migrating, then comparing after, catches all of the
  above at once (see `test/unit/game/thinkers/construction.test.mjs`).
- **Shared mutable defaults.** An array or object left on a prototype is shared
  by every instance. The tests check this (`assertNotShared`).

## Progress

Snapshot of 2026-10-19: **108 files done, 15 deleted, 0 to go.**

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
| `libraries/O876/SoundSystem.js` | (this branch) | yes (fake `howler`) |
| `game/GC/EffectProcessor.js` | (this branch) | yes |
| `game/EffectProcessor.js` | (this branch) | yes (behaviour snapshot of every effect) |
| `game/BackupSystem.js` | (this branch) | yes |
| `game/LootSystem.js` | (this branch) | yes |
| `game/WeaponAnimator.js` | (this branch) | yes |
| `libraries/O876/Astar/Nood.js` | (this branch) | yes |
| `libraries/Raycaster/GXManager.js` | (this branch) | yes |
| `libraries/Raycaster/Tile.js` | (this branch) | yes |
| `libraries/Raycaster/Horde.js` | (this branch) | yes |
| `libraries/H5UI/WinControl.js` | (this branch) | yes (UI construction snapshot) |
| `libraries/H5UI/Box.js` | (this branch) | yes (UI construction snapshot) |
| `libraries/H5UI/Button.js` | (this branch) | yes (UI construction snapshot) |
| `libraries/H5UI/Image.js` | (this branch) | yes (UI construction snapshot) |
| `libraries/H5UI/ScrollBox.js` | (this branch) | yes (UI construction snapshot) |
| `libraries/H5UI/Text.js` | (this branch) | yes (UI construction snapshot) |
| `libraries/H5UI/TileGrid.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/Icon.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/ProgressBar.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/Screen.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/Window.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/BookWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/ConsoleWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/CraftWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/DescriptorWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/DialogWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/InventoryWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/LoadingWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/MainMenuWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/PlayersheetWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/ShopWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/UI/StubWindow.js` | (this branch) | yes (UI construction snapshot) |
| `game/Dungeon.js` | (this branch) | yes |
| `game/UI/HUD.js` | (this branch) | yes |
| `game/UI/System.js` | (this branch) | yes |
| `game/cutscenes/Cutscene.js` | (this branch) | yes (cutscene construction snapshot) |
| `game/cutscenes/CutsceneIntro.js` | (this branch) | yes (cutscene construction snapshot) |
| `game/cutscenes/CutsceneEnd.js` | (this branch) | yes (cutscene construction snapshot) |
| `game/MenuSystem.js` | (this branch) | yes (cutscene construction snapshot) |
| `libraries/Raycaster/Transistate.js` | (this branch) | yes (`Game.construction.test.mjs`) |
| `libraries/Raycaster/Engine.js` | (this branch) | yes (`Game.construction.test.mjs`) |
| `game/Game.js` | (this branch) | yes (`Game.construction.test.mjs`) |

| `game/plugins/MagicPlugin.js` | (this branch) | yes (`MagicPlugin.timestop.test.mjs`) |

`MagicPlugin.js` lost its prototype defaults in 44f511c; its runtime patch
(objective 3) went last: Time Stop now sets `Animation.bFrozen`,
`Raycaster.bTexturesFrozen` and `Horde.oSoloMobile` instead of swapping
methods.

### Deleted

Unused anywhere in the game, removed instead of migrated:
`libraries/O876/CPUMonitor.js`, `libraries/O876/Easing.js`,
`libraries/O876/Legion.js`, `libraries/Raycaster/Scheduler.js`, and the
library thinkers `CameraKeyboardThinker`, `CameraMouseKeyboardThinker`,
`KbdArrowThinker`, `CommandThinker`, `WanderThinker`, `KeyboardThinker`,
`libraries/O876/Browser.js`, `libraries/O876/Mediator/Mediator.js` and
`Plugin.js`, `libraries/O876/Microsyte.js` and `game/ReikasterMicrosyte.js`
(the old online hi-score pages, imported nowhere).

### To do

Paths are relative to `src-recovered/`. Tags: **P** prototype defaults,
**C** `__construct`, **R** runtime patch. A level only depends on lower levels.
Tick a box once the file is migrated and its tests pass.

#### Level 0: no dependency

All done.

#### Level 1

All done.

#### Level 2

All done.

#### Level 3

All done.

#### Level 4

All done.

#### Level 5

All done.

#### Level 6

All done.

#### Level 7

All done.

#### Level 8

All done.

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
- **2026-10-19**: in-game check of the `Thinker` family. OK: cutscenes,
  player, hazes on monsters, shooters, melee monsters. The raven never stole:
  an old bug (empty re-aim block in `StealerThinker._follow`, since the
  initial commit), fixed outside the migration along with smarter stealing.
  Not checked yet: casters, healers, sentries, monster spells.
- **2026-10-19**: ravens steal in game, with the new "A raven stole Gold x 20
  from you." message.
- **2026-10-19**: Thinker family fully checked in game: healers (heal beam),
  sentries (turret stays put), monster spells (witch queen triple confusion
  shot, acid blob explosion, medusa poison bolt). Casters: no monster uses
  `CasterThinker`, nothing to test.
- **2026-10-19**: deleted the unused `Browser` (its `isChrome` read an
  undefined `isOpera`). `SoundSystem` tested with a mocked `howler`
  (`vi.mock`), then migrated: 234 tests pass.
- **2026-10-19**: both `EffectProcessor` classes tested, then migrated. The
  game one is covered by a behaviour snapshot: each of its 54 effect subtypes
  is applied to a creature, then ticked, then expired. Pre-existing bugs
  found and left as they are (recorded in the snapshot): `exprireEffect_rdth`,
  `_rbod`, `_rmin`, `_rmov` are misspelled, so those resistances never wear
  off; `selectEffects_moveAilment` returns nothing, and `_bodyAilment` and
  `_mindAilment` return an `indexOf` instead of a boolean. 301 tests pass.
- **2026-10-19**: fixed the three effect bugs found above (outside the
  migration): the four `exprireEffect_` typos (remedy, clarity, freedom and
  death ward now wear off), and the ailment selectors, so a remedy only cures
  its own ailments instead of dispelling every effect (permanent item bonuses
  included), and freedom cures snare, root and hold. 308 tests pass.
- **2026-10-19**: level 1 done. `BackupSystem` (fake `localStorage`),
  `LootSystem`, `WeaponAnimator`, `Nood`, `GXManager` and `Tile` tested, then
  migrated; a mutation check (Tile defaults set after reading the data) goes
  red. Deleted the unused `Mediator`, `Plugin`, `Microsyte` and
  `ReikasterMicrosyte`. 335 tests pass.
- **2026-10-19**: `Raycaster/Horde` tested and migrated (its neighbour
  tables are now shared read-only module constants). Then the whole
  `WinControl` family at once, 22 classes (`H5UI` controls, `Icon`,
  `ProgressBar`, `Screen`, `Window` and the 12 game windows): construction
  snapshot first (`test/unit/game/UI/construction.test.mjs`: every class
  built on fake canvases, windows opened with game-like parameters, fields and
  drawing calls of 215 controls), then a scripted migration. Mutation checks
  (`Box` without its `_sClass`, `Button` colours set after use) go red. Found
  by grep, not by the snapshot: `InventoryWindow.prototype.aItemOrder`, now
  `static ITEM_ORDER`, with a sort test. 368 tests pass.
- **2026-10-19**: UI family checked in game: main menu, loading screen,
  inventory (sort, drop, use, equip), player sheet, item descriptions, books
  with pictures and pages, shop and buying, brewing with its progress bar,
  cutscene dialogs, popup messages.
- **2026-10-19**: `Dungeon`, `HUD` and `System` tested, then migrated
  (`HUD.POSITIONS` is a shared read-only module constant). `UI.addUIPlugin`
  no longer patches `System.prototype`: `System.setScreen` looks the
  controller up in `UI.oPlugins`, which also removes the only import cycle
  (`UI.js` no longer imports `System.js`). 403 tests pass.
  Pre-existing bugs found, left as they are: `EffectProcessor.bestowEffect`
  does not return the effect, so equipped items never record their effects
  and swapping rings stacks their bonuses (+4, +8, +12...), recorded as an
  `it.fails` test in `Dungeon.test.mjs`; `Dungeon.isDropStack` calls a
  `Marker.isMarked` that does not exist (the method is never called).
- **2026-10-19**: bug fixes, outside the migration:
  - rings and amulets: `bestowEffect` now returns the effect, so swapping
    them no longer stacks their bonuses; `DataSerializer.saveItem` skips an
    item effect the creature no longer has instead of throwing (possible now
    that items record their effects, e.g. a raven dying with a stolen ring);
  - status icons: `killEffect` marks the effect expired, and `GXIconPad`
    hides an icon whose effect left the creature; a re-applied confusion
    (non-stackable effect, same code) used to leave its icon on forever;
  - Dispel potion: crashed (`i is not defined`) whenever a timed effect was
    active;
  - deleted the unused, broken `Dungeon.isDropStack`.
  407 tests pass.
- **2026-10-19**: new feature, outside the migration: unequipping. In the
  inventory, an equipped ring, amulet or earrings shows **Unequip** in place
  of **Drop** (`Dungeon.unequipItem`, `InventoryPlugin.unequipItem`); the
  weapon cannot be unequipped (the game always expects one in hand), and a
  full bag refuses with "Your inventory is full.". 413 tests pass.
- **2026-10-19**: the cutscene family (`Cutscene`, `CutsceneIntro`,
  `CutsceneEnd`, `MenuSystem`): construction snapshot first, with a mocked
  `Raycaster` recording canvas size, configuration, world and camera
  (`test/unit/game/cutscenes/construction.test.mjs`), then migrated. Mutation
  check (menu size set after `super()`) goes red. 422 tests pass.
- **2026-10-19**: `Transistate`, `Engine` and `Game` migrated. Safety net: a
  real `new Game()` as in `main.js` (fake browser, howler and `Raycaster`,
  fake timers), snapshot of its 87 fields and loop state right after
  construction (`test/unit/game/Game.construction.test.mjs`). `resume()`
  moved from `Engine`'s constructor to the end of `Game`'s; the naive
  version (loop started in `Engine`) goes red. 425 tests pass. Only
  `MagicPlugin`'s runtime patch remains.
- **2026-10-19**: last item, `MagicPlugin`'s Time Stop. It swapped
  `Animation.prototype.animate` and `Raycaster.prototype.textureAnimation`
  and replaced the horde's `think` while the spell ran; it now sets three
  flags the classes check themselves (`Animation.bFrozen`,
  `Raycaster.bTexturesFrozen`, `Horde.oSoloMobile` with `Horde.thinkSolo`).
  Tests first (`MagicPlugin.timestop.test.mjs`); one of them, "no class is
  modified", fails on the old plugin. Writing the tests showed the old
  patch's fragility: an error during Time Stop left every `Animation` in the
  game frozen. Final scan: no `Object.assign(X.prototype`, no
  `X.prototype.y =`, no `__construct` left in `game/` or `libraries/`.
  **The migration is complete.** 432 tests pass.
