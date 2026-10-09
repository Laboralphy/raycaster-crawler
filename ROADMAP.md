# Reikaster Underland — feuille de route

Prototype de dungeon crawler en raycasting (vers 2010-2013), construit sur une
très ancienne version du moteur qui est devenu `../raycaster-386`. Les sources
avaient été perdues : seul subsistait `crawler.js`, compacté. Ce document fait
le point sur la reprise du projet (état au 9 octobre 2026).

## Lancer le jeu

```bash
npm install        # une fois (esbuild + outils)
npm run build      # src-recovered/ -> crawler.js (chargé par index.html)
npm start          # node server.js -> http://localhost:8080/
```

`npm run check:laby` vérifie la cohérence des niveaux générés.

## Organisation

| Chemin | Rôle |
|---|---|
| `index.html`, `styles.css`, `resources/` | page du jeu et ressources (images, sons, docs) |
| `crawler.js` | **généré** par `npm run build` (bundle esbuild depuis `src-recovered/game/main.js`) ; suivi par git pour que le jeu tourne sans build |
| `src-recovered/` | sources du jeu reconstituées (voir son `README.md`) |
| `src-recovered/libraries/` | bibliothèques : `O876/` (outils, A*, o2), `Raycaster/` (moteur), `H5UI/` (UI canvas) |
| `src-recovered/game/` | le jeu : `Game.js`, `Dungeon.js`, `UI/`, `GC/`, `plugins/`, `thinkers/`, `gx/`, `data/` |
| `laby/` | générateur de niveaux (JavaScript, sans dépendance), porté depuis l'ancien PHP |
| `server.js` | serveur HTTP statique ; répond aussi à `/dynamics/laby/laby.php` (URL historique appelée par le jeu) en générant le niveau avec `laby/` |

## Fait

### 1. Générateur de niveaux : PHP → JavaScript (`laby/`)
- Le jeu appelait `dynamics/laby/laby.php?g=…&s=…&o=…` (PHP 5, cassé sous PHP 8).
- Portage complet en JS des générateurs utilisés (forest, dungeon, boss,
  special, mines, cave) plus magetower et trivial. Le portage a d'abord été
  validé identique au PHP sur 5 000 niveaux, puis le PHP a été supprimé.
- `whiteroom` volontairement **non porté** (appartient à un autre jeu).
- Générateur aléatoire remplacé par mulberry32 (graine → niveau toujours
  identique, mais différent de l'ancienne version).
- Bugs corrigés : clés/portes verrouillées incohérentes dans les mines,
  clé posée sur une autre clé ou une porte, salles sans porte, et divers bugs
  latents (dimensions inversées, segment négatif, portail sans impasse…).
- Options limitées à 20 par le serveur (la génération est synchrone).

### 2. Récupération des sources du jeu (`src-recovered/`)
- `crawler.js` était compacté avec le packer de Dean Edwards : décompressé,
  puis découpé en 167 fichiers (un par classe/objet, noms d'origine ; les
  commentaires sont perdus). Arborescence en partie déduite.
- Copie de l'ancien fichier : `src-recovered/original/crawler.packed.js`.
- Doublons retirés (`CRAFT_DATA`, `ITEMS_DATA`, `MONSTERS_BLUEPRINTS`,
  `SPELLS_DATA`, déclarés deux fois à l'identique) et clé dupliquée
  `mspage_button_close` dans `STRINGS` (gardé `'Close'`).

### 3. Build avec esbuild
- D'abord concaténation des fichiers (`build-order.json`) puis minification ;
  remplacé à l'étape 6 par un vrai bundle de modules ES.

### 4. Classes `o2` → classes ES
- Les 128 classes (`O2.createClass` / `O2.extendClass` / `__inherited`) sont
  des classes ES (`class … extends …`, `super`). `o2.js` ne contient plus
  que `O2.createObject` (enregistrement dans les espaces de noms globaux).
  Plus d'`eval` ni de `Function.caller` : le code supporte le mode strict.
- Choix conservateurs, à revoir plus tard :
  - `__construct(...)` reste la méthode d'initialisation, appelée par le
    `constructor` de la classe racine (pas encore de vrais constructeurs) ;
  - les propriétés de données restent sur le **prototype**
    (`Object.assign(X.prototype, {...})`) : le jeu en dépend
    (`GXColorVeil.prototype.SNARE`, `UI.InventoryWindow.prototype.aItemOrder`,
    et le sort d'arrêt du temps de `MagicPlugin` remplace
    `Animation.prototype.animate` / `Raycaster.prototype.textureAnimation`).
- Vérifié par test différentiel (bac à sable Node, DOM factice) : 128 classes,
  5 424 propriétés, 3 141 appels de méthode identiques à l'original.
  Testé par l'auteur dans le navigateur : « ça a l'air de fonctionner ».
- Globales implicites corrigées (oublis de `var`, interdits en mode strict) :
  `fBx`, `fBy`, `yOfsCeil` (`Raycaster.js`), `aShop` (`ShopPlugin.closeShop`).

### 5. Bug corrigé : rattrapage de temps après une pause
- `Engine.initDoomLoop` (faute de casse) n'était jamais appelée : à chaque
  `resume()` (inventaire, sauvegarde, changement de niveau…), la boucle
  rejouait d'un coup tout le temps passé en pause (250 itérations pour 10 s).
  Renommée `initDoomloop`, l'horloge est remise à zéro avant l'appel au parent.

### 6. Modules ES (`import` / `export`)
- Les 167 fichiers sont des modules ES ; `npm run build` lance esbuild en
  bundle depuis `game/main.js` (`--bundle --format=iife`, cible es2015).
  `build-order.json`, `build.js` et `o2.js` sont supprimés.
- Conversion automatique (acorn + eslint-scope) : chaque
  `O2.createObject('NS.X', …)` devient `export class X` / `export const X`,
  chaque `NS.X` est remplacé par un import (renommé `NS_X` en cas de
  collision, ex. `GC_Item`, `O876_Horde`). Aucune référence à un espace de
  noms n'est restée non résolue.
- Registres explicites à la place des recherches par nom sur `window` :
  `PLUGINS` dans `Game.js`, `THINKERS` (`game/thinkers/THINKERS.js`)
  enregistré dans `ThinkerManager` par `main()`. `O876.ClassLoader`
  supprimé.
- `WORLD_DATA` : module qui regroupe `shops` et `dungeons` ; `newGame` le
  restaure en place (`Object.assign`) au lieu de le réaffecter.
- `ICONS` déclaré (`export const`) ; `H5UI.initRoot` écrivait `UI.root` au
  lieu de `H5UI.root` (jamais appelée, corrigée).
- Bug introduit par l'étape 4, corrigé : dans `class Image` (H5UI),
  `new Image()` construisait un contrôle H5UI au lieu d'un `<img>`
  (`new window.Image()`).
- Ordre d'évaluation vérifié statiquement : aucun module n'utilise au
  chargement (`extends`, valeurs calculées) un import pas encore évalué.
- Testé dans un navigateur piloté (Electron), comparé à la version
  précédente : menu, cinématique d'intro, niveau généré, déplacements,
  inventaire, fiche de personnage, livre de sorts, sorts, monstres qui
  attaquent ; mêmes messages de console dans les deux versions.

### 7. `var` → `const` / `let`
- Plus aucun `var` dans `src-recovered/` : 1 188 `const`, 739 `let`.
- Conversion automatique (eslint-scope), conservatrice : `const` seulement
  si la variable est initialisée et jamais réaffectée ; conversion sur place
  seulement si la portée de bloc ne change rien (toutes les utilisations
  dans le bloc, après la déclaration ; pas de variable de boucle capturée
  par une closure ; pas de variable non initialisée dans une boucle, qui
  garderait sa valeur d'un tour à l'autre avec `var`). Les 22 autres
  (variables déclarées dans un `case`, ou utilisées hors de leur bloc) sont
  déclarées par un `let` en tête de fonction, comme le faisait `var`.
- Vérifié : aucun `let`/`const` utilisé avant sa déclaration, aucune
  `const` réaffectée ; partie jouée dans le navigateur jusqu'à la mort du
  personnage, sans erreur.

## À faire

### Étape suivante : brancher raycaster-386
Le moteur cible (`../raycaster-386`, ESM, TypeScript compilé) est un portage
de `o876-raycaster-engine`, plus récent que le `O876_Raycaster` du jeu. Il
fournit le rendu et une couche de simulation (portes, acteurs, collisions,
déclencheurs) mais pas `Engine`, les thinkers, `Horde`/`Mobile`, les effets
`GX*`, les périphériques d'entrée ni la minicarte. Approche proposée :
1. rapatrier dans le jeu ce que 386 ne fournit pas (boucle, thinkers,
   mobiles, GX, entrées) ;
2. isoler l'accès au moteur derrière une façade (le jeu utilise une
   trentaine de membres de `oRaycaster` : `nPlaneSpacing`, `oHorde`,
   `oEffects`, `oCamera`, `cloneWall`, `getMapXYPhysical`, `aMap`,
   `castRay`, `textureAnimation`, `shadeProcess`…) ;
3. remplacer le rendu derrière la façade par `Renderer` / `MapHelper` de
   386 (conversion de la carte en `LevelMap`, sprites, `cloneWall` →
   décalcomanies) ;
4. éventuellement, simulation 386 pour les portes et les collisions.

### Globales restantes
- `window.G` (instance de `Game`, lue dans 8 fichiers),
  `window.__keyboardDevice`, `window.__mouseDevice`.
- `libraries/Raycaster/Engine.js` importe `CONFIG` depuis `game/`.
- Fichiers non importés (code mort, hors bundle) : `ReikasterMicrosyte`,
  `MW.LABY`, thinkers `Camera*`, `Kbd*`, `Command`, `Keyboard`, `Wander`,
  `O876` `Horde` / `Legion` / `Mediator` / `Microsyte`…

### Plus tard
- Remplacer `__construct` par de vrais `constructor` (attention : `this`
  inaccessible avant `super()`, et champs de classe initialisés après
  `super()`).
- Passer les propriétés de données du prototype en champs d'instance, au cas
  par cas (vérifier qu'elles ne sont ni lues ni remplacées sur le prototype).

### Bugs connus, non corrigés
- `GXIconPad.compareIcons` et `InventoryWindow.sortItems` : comparateurs de
  `sort()` qui renvoient un booléen (`a.x > b.x`) au lieu d'un nombre → tri
  incohérent des icônes d'effets / des objets de même type.
- Mode `requestAnimationFrame` du moteur cassé : `Engine.stateRunningRAF` lit
  `window.__transistateMachine`, qui n'est jamais affecté, et
  `this.oFrameCounter` alors que `this` n'est pas le moteur. Sans effet tant
  que `CONFIG.game.doomloop` vaut `'interval'` (valeur actuelle).
- Microsyte (commentaires, tableau des scores) et sauvegarde distante :
  dépendaient de scripts PHP `dynamics/crawlerfs/*.php` absents ; non
  fonctionnels. `sys_storeData` en mode distant est vide.
