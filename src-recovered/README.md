# Sources récupérées de crawler.js

Sources du jeu reconstituées à partir de `crawler.js`, qui était compacté
avec le packer de Dean Edwards (`eval(function(p,a,c,k,e,d){…})`) :
décompression, puis découpage en un fichier par classe ou objet.

- Les noms (classes, méthodes, variables) sont ceux d'origine : le packer
  ne renomme rien.
- Les commentaires sont perdus.
- L'arborescence est reconstituée d'après les espaces de noms ;
  `libraries/O876/o2.js` et `libraries/Raycaster/Tools/MathTools.js`
  reprennent des chemins connus de l'ancien projet, les autres
  emplacements sont déduits.
- Le bundle contenait deux fois `CRAFT_DATA`, `ITEMS_DATA`,
  `MONSTERS_BLUEPRINTS` et `SPELLS_DATA` (copies identiques, jamais lues
  entre les deux déclarations) : une seule est conservée.

## Construire

Le code repose sur des variables globales et sur l'ordre de chargement
(une classe doit être déclarée après celle qu'elle étend). Cet ordre est
dans `build-order.json`.

```bash
npm install        # une fois (installe esbuild)
npm run build      # -> crawler.js à la racine, chargé par index.html
```

`npm run build` concatène les sources dans `src-recovered/dist/crawler.js`,
puis le minifie avec esbuild vers `crawler.js`.

## Classes ES

Toutes les classes `o2` (`O2.createClass` / `O2.extendClass`) ont été
converties en classes ES (`class … extends …`, `super`). De `o2.js`, il ne
reste que `O2.createObject`, qui enregistre classes et objets dans leurs
espaces de noms globaux (`H5UI.Box`, `UI.Window`...).

Choix de conversion, pour garder le comportement d'o2 :

- `__inherited(...)` est devenu `super.<méthode>(...)` ;
- `__construct` reste la méthode d'initialisation, appelée par le
  constructeur de la classe racine ;
- les propriétés de données restent sur le prototype
  (`Object.assign(X.prototype, {...})`) : le jeu les lit et les remplace
  à cet endroit (constantes de `GXColorVeil`, sort d'arrêt du temps).

L'ancien `crawler.js` packé est conservé dans
`original/crawler.packed.js` ; pour y revenir :

```bash
cp src-recovered/original/crawler.packed.js crawler.js
```
