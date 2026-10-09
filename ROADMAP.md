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

### 8. Rendu par raycaster-386
- Dépendance npm `@laboralphy/raycaster386` (1.0.0, version publiée ; la
  1.1.0 locale n'est pas publiée).
- `libraries/Raycaster/Raycaster.js` garde son rôle et son interface pour le
  jeu (carte `aMap`, `getMapXY*`, caméra, `oHorde`, effets GX, arme,
  `castRay` pour la ligne de vue des monstres) mais tout le dessin passe par
  un `Renderer` 386 : rayons, murs, sol/plafond, sprites, brouillard,
  décalcomanies. `XMap.js` supprimé.
- Correspondances : phys et offset des cases identiques ; le code de texture
  (octet 0-7) devient un matériau 386 (`codes[n][0]` faces nord/sud,
  `codes[n][1]` est/ouest, `flats.codes[n]` sol/plafond). `aMap` reste la
  référence (le jeu l'écrit directement) : les cases modifiées sont recopiées
  dans le Renderer avant chaque image.
- Sprites : chaque image, les mobiles des cases vues reçoivent un sprite 386
  (réserve réutilisée), avec l'image calculée comme avant
  (direction 8 secteurs, `Animation`) ; échelle 0.961 / `nScale` pour garder
  le rapport sprites/murs de l'ancien moteur ; surcouches (`oOverlay`)
  rapprochées d'une unité. Le filtre de couleur de l'ancien moteur (sprites
  seulement) est appliqué aux images des sprites.
- `cloneWall` → `Renderer.paintSurface` ; dégradés plafond/sol → image de
  fond ; `shadeProcess()` prépare le Renderer après chargement ;
  `textureAnimation()` réenregistre les matériaux animés ; `GXFlood` appelle
  `updateWallTextures()` après avoir modifié l'atlas des murs.
- Corrigé au passage : `setMapXYTag` utilisait une variable inexistante.
- Non repris : second étage (`uppermap`, aucun niveau ne l'utilise).
- Testé dans le navigateur : intro, forêt, donjons (gris, cramoisi), mines,
  sprites, portes, barreaux, décalcomanies, combat ; 25 i/s (plafond de la
  boucle) contre 20-22 pour l'ancien rendu dans le même environnement.

### 9. Son : howler.js
- `SoundSystem` (éléments `<audio>`, 16 canaux recyclés, lecture au premier
  `load()` par `autoplay`) remplacé par une petite couche sur howler.js :
  bruitages décodés une fois (Web Audio) et rejoués sans délai, plusieurs
  instances d'un même son possibles ; musique lue en flux (html5) et en
  boucle.
- Les bruitages de `SOUNDS` (sauf `MUSIC_*`) sont préchargés au démarrage.
- Un même morceau demandé deux fois continue au lieu de recommencer
  (cinématique d'intro puis forêt).
- Interface réduite à ce que le jeu utilise : `play(fichier, volume)`,
  `playMusic`, `mute`/`unmute` (pause de la musique, comme avant),
  `preload`, `free`. `crossFadeMusic` et la gestion des canaux, inutilisés,
  ont disparu.

## À faire

### Écarts visuels avec l'ancien moteur
- **Champ de vision** : 386 dérive la focale de la largeur
  (`width / 2 × 16 / 9`, soit ~59°), l'ancien moteur avait 90° (et des murs
  étirés verticalement de 1.25). Tout paraît ~1.8× plus proche. Pour
  retrouver l'ancienne vue, il faut une focale (ou un FOV) réglable dans
  raycaster-386.
- Ombrage des sprites un peu différent (l'ancien moteur calculait leur
  distance d'ombrage avec un facteur 1.333).

### raycaster386 1.0.0 : à signaler / vérifier en 1.1.0
- Un tileset créé après le premier `render()` n'est jamais ombré (dessiné
  vide). Contourné : tilesets créés au chargement, `compute()` explicite
  pour les suivants.
- Avertissement Chrome « Multiple readback operations using getImageData »
  (lecture du canvas par le rendu des sols à chaque image).

### Suite possible
- Portes, collisions et déplacements par la couche simulation de 386
  (`DoorPolicy`, `moveActor`) à la place de `GXDoor` / `Mobile`.
- Rapatrier dans `game/` ce que 386 ne fournit pas (boucle `Engine`,
  thinkers, `Horde`/`Mobile`, effets GX, entrées) : ce n'est plus une
  bibliothèque.

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
