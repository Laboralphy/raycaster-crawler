# Sources récupérées de crawler.js

Sources du jeu reconstituées à partir de `crawler.js`, qui était compacté
avec le packer de Dean Edwards (`eval(function(p,a,c,k,e,d){…})`) :
décompression, puis découpage en un fichier par classe ou objet.

- Les noms (classes, méthodes, variables) sont ceux d'origine : le packer
  ne renomme rien.
- Les commentaires sont perdus.
- L'arborescence est reconstituée d'après les espaces de noms ;
  `libraries/Raycaster/Tools/MathTools.js` (et `libraries/O876/o2.js`,
  supprimé depuis) reprennent des chemins connus de l'ancien projet, les
  autres emplacements sont déduits.
- Le bundle contenait deux fois `CRAFT_DATA`, `ITEMS_DATA`,
  `MONSTERS_BLUEPRINTS` et `SPELLS_DATA` (copies identiques, jamais lues
  entre les deux déclarations) : une seule est conservée.

## Construire

Les sources sont des modules ES (`import` / `export`). esbuild les
assemble depuis le point d'entrée `game/main.js` :

```bash
npm install        # une fois (installe esbuild)
npm run build      # -> crawler.js à la racine, chargé par index.html
```

Les fichiers qu'aucun module n'importe (ex. `ReikasterMicrosyte.js`,
`MW.LABY.js`, plusieurs thinkers et outils de `libraries/`) sont du code
mort : ils restent dans l'arborescence mais n'entrent pas dans le bundle.

## Modules ES

Chaque fichier exporte sa classe ou son objet sous son nom court : l'ancien
`O2.createObject('H5UI.Box', class Box …)` est devenu `export class Box …`,
et `H5UI.Box` s'écrit `Box` dans les modules qui l'importent. Quand deux
noms courts entrent en collision, l'import est renommé d'après l'ancien
espace de noms (`import { Item as GC_Item }`).

- Les objets `H5UI` et `UI` existent toujours, mais ne contiennent plus que
  leurs propres données et fonctions (`UI.INTFMODE_*`, `H5UI.getCanvas`…),
  pas les classes.
- Classes cherchées par leur nom : `Game.addPlugin('Shop')` lit le registre
  `PLUGINS` de `Game.js` ; `ThinkerManager.createThinker('Rusher')` lit le
  registre rempli par `ThinkerManager.registerThinkers(THINKERS)` dans
  `main()` (`game/thinkers/THINKERS.js`). Un nouveau plugin ou thinker
  désigné par son nom doit y être ajouté.
- `WORLD_DATA` (`game/data/WORLD_DATA.js`) regroupe `shops` et `dungeons` ;
  `Game.newGame` le restaure en place (`Object.assign`) : ne pas le
  réaffecter.
- Globales restantes, posées sur `window` : `G` (l'instance de `Game`,
  créée dans `main()`), `__keyboardDevice` et `__mouseDevice`.
- `libraries/Raycaster/Engine.js` importe `CONFIG` depuis `game/` : le moteur
  dépend encore de la configuration du jeu.

## Classes ES

Les classes `o2` (`O2.createClass` / `O2.extendClass`) avaient d'abord été
converties en classes ES (`class … extends …`, `super`). Choix de conversion,
pour garder le comportement d'o2 :

- `__inherited(...)` est devenu `super.<méthode>(...)` ;
- `__construct` reste la méthode d'initialisation, appelée par le
  constructeur de la classe racine ;
- les propriétés de données restent sur le prototype
  (`Object.assign(X.prototype, {...})`) : le jeu les lit et les remplace
  à cet endroit (constantes de `GXColorVeil`, sort d'arrêt du temps).

L'ancien `crawler.js` packé est conservé dans
`original/crawler.packed.js` ; pour y revenir :

```bash
cp src/original/crawler.packed.js crawler.js
```
