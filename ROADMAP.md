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
| `crawler.js` | **généré** par `npm run build` ; suivi par git pour que le jeu tourne sans build |
| `src-recovered/` | sources du jeu reconstituées (voir son `README.md`) |
| `src-recovered/libraries/` | bibliothèques : `O876/` (outils, A*, o2), `Raycaster/` (moteur), `H5UI/` (UI canvas) |
| `src-recovered/game/` | le jeu : `Game.js`, `Dungeon.js`, `UI/`, `GC/`, `plugins/`, `thinkers/`, `gx/`, `data/` |
| `src-recovered/build-order.json` | ordre de chargement des fichiers (concaténation) |
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
- `src-recovered/build.js` concatène les fichiers selon `build-order.json`,
  puis esbuild minifie vers `crawler.js` (cible es2015).

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

## À faire

### Étape suivante : modules ES (`import` / `export`)
Objectif : supprimer `build-order.json` et les globales, esbuild bundle
depuis `game/main.js` (`--bundle --format=iife`).

Points durs repérés :
- **Classes cherchées par leur nom** : `Game.addPlugin` fait
  `window[sPlugin + 'Plugin']` ; `ThinkerManager.createThinker` charge
  `sThinker + 'Thinker'` via `O876.ClassLoader` (noms venant des données,
  ex. `thinker: 'Timed'` dans `BLUEPRINTS_DATA`). Il faudra des registres
  explicites (nom → classe).
- **Données globales réaffectées** : `Game.newGame` fait
  `WORLD_DATA = JSON.parse(this.sWorldBackup)` ; un `import` ne peut pas être
  réaffecté depuis un autre module → objet d'état partagé, ou mutation en
  place.
- **Globale implicite au premier niveau** : `game/data/ICONS.js` commence par
  `ICONS = {` sans `var` (interdit dans un module).
- **Espaces de noms fusionnés** : `O2.createObject` fusionne dans un objet
  existant (ex. `H5UI` créé implicitement par `H5UI.Font` puis complété par
  l'objet `H5UI`, `WORLD_DATA.shops` / `WORLD_DATA.dungeons`, `UI`).
- **Globales posées sur `window`** : `window.__mouseDevice` (gestionnaires
  d'événements de la souris), `ReikasterMicrosyte` appelé depuis des
  `onclick` HTML ; `main()` est lancée
  par `window.addEventListener('load', main)` dans `game/main.js`.
- Ordre d'évaluation : certaines valeurs sont calculées au chargement
  (ex. `CONFIG.game.mouse: O876_Raycaster.PointerLock.init()`).

Approche suggérée : procéder par couches, des feuilles (`libraries/O876`) vers
`game/`, en gardant temporairement un module « pont » qui réexpose les
symboles sur `window` tant que tout n'est pas converti ; vérifier à chaque
étape par build + test dans le navigateur.

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
