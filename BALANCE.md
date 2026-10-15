# Équilibrer le jeu

Où sont les réglages (or, butin, monstres, magasins, potions, taille des
niveaux), comment les lire et comment les changer. Les valeurs citées sont
celles du code au 15 octobre 2026.

Après toute modification d'un fichier de `src-recovered/game/`, reconstruire
le jeu : `npm run build`.

## Sommaire

1. [Où sont les réglages](#où-sont-les-réglages)
2. [Les formules à connaître](#les-formules-à-connaître)
3. [Le butin : coffres, placards, monstres](#le-butin--coffres-placards-monstres)
4. [Les magasins](#les-magasins)
5. [Les monstres](#les-monstres)
6. [Le joueur](#le-joueur)
7. [Potions et nourriture](#potions-et-nourriture)
8. [Bijoux et armes](#bijoux-et-armes)
9. [Artisanat](#artisanat)
10. [Taille et densité des niveaux](#taille-et-densité-des-niveaux)
11. [Méthode de travail](#méthode-de-travail)
12. [Anomalies relevées](#anomalies-relevées)

## Où sont les réglages

Tout est dans `src-recovered/game/data/`, sauf mention contraire.

| Fichier | Ce qu'on y règle |
|---|---|
| `WORLD_DATA.dungeons.js` | Pour chaque étage : monstres possibles (`horde`), tables de butin (`loot`), magasins (`shops`), générateur et options (taille du niveau) |
| `LOOT_DATA.js` | Contenu des coffres, gros coffres, placards, et butin de chaque monstre |
| `WORLD_DATA.shops.js` | Ce que vend chaque magasin, et à quel prix |
| `MONSTERS_BLUEPRINTS.js` | Vitalité, vitesse, arme, résistances et score de chaque monstre |
| `ITEMS_DATA.js` | Objets : potions, nourriture, armes, bijoux (effets, taille des piles) |
| `SPELLS_DATA.js` | Ce que tire chaque arme : dégâts, coût en énergie, nombre de projectiles |
| `CRAFT_DATA.js` | Recettes d'artisanat |
| `../Dungeon.js` | Le joueur au départ (`setupPlayerCreature`) ; le niveau des monstres (`setupMobCreature`) |
| `../EffectProcessor.js` | Facteurs de dégâts, de soin, de résistance (fin du fichier) |
| `../Game.js` | Faim (`clockSecond`), niveau des monstres (`onEnterLevel`, `const nLevel = 1`) |
| `../plugins/ShopPlugin.js` | Réapprovisionnement des magasins |
| `laby/core/LevelToolKit.js` | Nombre de monstres par pièce (`spawnMobs`) |

## Les formules à connaître

### Les codes d'effet

Les effets (dégâts, soins, bonus) sont écrits sous la forme d'un code de
7 caractères, par exemple `brheaCA` :

| Position | Exemple | Sens |
|---|---|---|
| 1 | `b` | famille : `b` potion, `m` projectile, `p` poison, `i` objet porté, `n` naturel (monstre)… |
| 2 à 5 | `rhea` | l'effet : `rhea` soin, `rene` énergie, `rfdp` nourriture, `xphy` dégâts physiques, `xmag` magiques, `xfir` feu, `xcld` froid, `xele` électricité, `xtox` toxiques, `rphy` résistance physique, `bpow` puissance… |
| 6 | `C` | **niveau** |
| 7 | `A` | **durée** en secondes (`A` = instantané) |

Niveau et durée s'écrivent avec cet alphabet, où la position donne la valeur :

```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
A=0  B=1  C=2  D=3  E=4  F=5  G=6  K=10  P=15  T=19  U=20  e=30  8=60  /=63
```

Durées spéciales : `9` (61) = 2 minutes, `+` (62) = 3 minutes, `/` (63) =
permanent.

### Ce que vaut un niveau

Réglages en fin de `EffectProcessor.js` :

| Effet | Formule | Exemple |
|---|---|---|
| Dégâts (`x…`) | niveau × d6, soit **3,5 par niveau** en moyenne (`DAMAGE_FACTOR_* = 6`) | `xxphyCA` : 2d6, 7 en moyenne |
| Soin instantané (`rhea`, durée `A`) | **6 PV par niveau** (`HEAL_FACTOR`) | `brheaCA` : 12 PV |
| Soin dans la durée (`rhea` avec durée) | **niveau PV par seconde**, pendant la durée | `brheaCe` : 2 PV/s × 30 s = 60 PV |
| Énergie (`rene`) | 10 par niveau (`ENERGY_FACTOR`) ; dans la durée : niveau par seconde | `breneCA` : 20 |
| Nourriture (`rfdp`) | 100 points par niveau (`FOOD_FACTOR`) | `brfdpCA` : 200 |
| Vitalité max (`bxhp`) | +10 par niveau (`VITALITY_FACTOR`) | `bbxhpD8` : +30 pendant 60 s |
| Puissance (`bpow`) | +1 niveau à **chaque** effet des projectiles tirés, soit +1d6 de dégâts par point | `bbpowBe` : +1 pendant 30 s |

Pour rendre tout le jeu plus ou moins dangereux d'un coup, changer
`DAMAGE_FACTOR_*` (taille du dé) ou `HEAL_FACTOR`.

### Résistances

Une résistance de niveau r multiplie les dégâts reçus par
1 − log₁₀(r + 1) / 2 :

| Niveau | 1 | 2 | 3 | 4 | 6 | 9 |
|---|---|---|---|---|---|---|
| Dégâts reçus | 85 % | 76 % | 70 % | 65 % | 58 % | 50 % |

Un bonus de vitesse (`hasted`) de niveau n multiplie la vitesse par
1 + 0,1 × n. La chance (`luck`) d'une créature fait de même pour les
effets secondaires qui la visent, mais à la baisse : chaque point réduit
leur probabilité.

## Le butin : coffres, placards, monstres

### Le format d'une table (`LOOT_DATA.js`)

```js
basic_chest: {
    chances: { 0: 1, 1: 5, 2: 4 },   // nombre d'objets : 0 (poids 1), 1 (poids 5), 2 (poids 4)
    items: {
        gold: 20,                    // 1 pièce d'or, poids 20
        'gold*2': 5,                 // 2 pièces d'or, poids 5
        GKEY: 5,                     // 1 clé de fer (clé générique)
        pot_heal_1: 9,
        ...
    }
}
```

- **`chances`** : combien d'objets sortent. Le jeu tire un nombre selon les
  poids : ici 0 objet 1 fois sur 10, 1 objet 5 fois sur 10, 2 objets
  4 fois sur 10, soit 1,3 objet en moyenne.
- **`items`** : pour chaque objet sorti, lequel. Plus le poids est grand,
  plus l'objet est fréquent. Probabilité = poids ÷ somme des poids.
- **`nom*N`** donne N exemplaires d'un coup (`'gold*5'` : 5 pièces).
- **`GKEY`** donne une clé de fer (`'GKEY*2'` : deux).
- Les noms d'objets sont ceux de `ITEMS_DATA.js` (liste en jeu : `items`
  avec les codes de débogage).

### Qui utilise quelle table

| Source | Table | Où c'est décidé |
|---|---|---|
| Coffre (`BLOCK_TREASURE`, souvent derrière un passage secret) | `loot.chest` de l'étage | `WORLD_DATA.dungeons.js` |
| Gros coffre (`BLOCK_WATCH_TREASURE`, dans les salles de garde) | `loot.bigchest` de l'étage | idem |
| Placard (laboratoires, cuisines) | `loot.closet` de l'étage | idem |
| Monstre tué | la table qui porte **le nom du monstre** (`m_spider`…) | `LOOT_DATA.js` |
| Sort « nourriture » | `spell_summon_food` | `LOOT_DATA.js` |

Le contenu est tiré **à l'ouverture** du coffre ou **à la mort** du monstre,
pas à la génération du niveau.

### Ce que donnent les tables aujourd'hui (moyennes)

| Table | Objets | Or | Potions de soin ou de régénération |
|---|---|---|---|
| `basic_chest` | 1,3 | 0,42 | 0,24 |
| `basic_bigchest` | 3,5 | 2,17 | 0,57 |
| `basic_closet` | 1,0 | 0 | 0 |
| `m_bigface`, `m_madface` | 0,5 | 0,25 | 0 |
| la plupart des autres monstres | 0,5 à 0,75 | 0,31 à 0,47 | 0 |
| `m_wasp` | 0,25 | 0 | 0 |
| boss (sauf la reine Méduse) | 0,75 | 0,47 | 0 |
| `m_medusaqueen` | 1 | 0 | baguette `wand_lyte_3` à coup sûr |

Un étage de donjon ou de mine compte environ 35 à 45 coffres et 40 à
60 monstres : **15 à 20 pièces d'or dans les coffres, à peu près autant sur
les monstres**. Les prix en magasin vont de 1 à 20 pièces.

### Recettes

**Plus d'or dans les coffres** : dans `basic_chest`, augmenter le poids de
`gold` ou ajouter des tas plus gros :

```js
gold: 20, 'gold*3': 10, 'gold*10': 2,
```

**Plus d'objets par coffre** : déplacer les poids de `chances` vers le haut
(`{ 1: 4, 2: 4, 3: 2 }` : jamais vide, 1,8 objet en moyenne).

**Plus d'or sur les monstres** : dans la table du monstre, augmenter le
poids de `gold`, ou mettre `'gold*N'` pour les gros monstres. Les boss
donnent aujourd'hui le même butin qu'un monstre ordinaire : leur donner une
table à part, par exemple `chances: { 3: 1 }` avec `'gold*25'`.

**Un butin qui progresse avec la profondeur** : tous les étages utilisent
aujourd'hui les trois mêmes tables. Créer des tables par zone dans
`LOOT_DATA.js` (copier `basic_chest` en `mines_chest`, avec plus d'or et des
potions de niveau 2), puis les indiquer dans l'étage :

```js
// WORLD_DATA.dungeons.js, étage mines[0]
loot: {
    chest: 'mines_chest',
    closet: 'basic_closet',
    bigchest: 'mines_bigchest'
},
```

**Des coffres moins vides** : retirer la ligne `0: …` de `chances`.

## Les magasins

### Le format (`WORLD_DATA.shops.js`)

```js
firstaid_2: [
    ['pot_heal_1', 2],     // objet, prix en pièces d'or
    ['pot_heal_2', 4],
    ['pot_heal_2', 4],     // une ligne = un exemplaire à vendre
    ...
],
```

- **Changer un prix** : changer le nombre.
- **Vendre plusieurs exemplaires** : répéter la ligne.
- **Ajouter un objet** : ajouter une ligne avec un nom de `ITEMS_DATA.js`.
- L'objet acheté est barré (« épuisé »), puis **revient 11 secondes après la
  fermeture du magasin** : réglage `11000` (en millisecondes de jeu) dans
  `ShopPlugin.generateShop`. Pour qu'un achat soit définitif, mettre une très
  grande valeur ; pour un réapprovisionnement à chaque visite d'étage, il
  faudrait un petit changement de code.

### Quels magasins à quel étage

Dans `WORLD_DATA.dungeons.js`, la propriété `shops` de chaque étage :

```js
shops: [shops.firstaid_2, shops.magic_2]
```

- Le nombre d'éléments est le **nombre de magasins** construits dans
  l'étage : le jeu ajoute lui-même l'option `-s2` au générateur.
- Le premier magasin trouvé dans le niveau vend la première liste, le
  deuxième la deuxième, etc. ; s'il y a plus de magasins que de listes, on
  recommence au début.
- Un étage sans magasin : `shops: []`.

Magasins actuels : `d1[1]` premiers soins et magie, `d1[2]` bijoux et
potions, `d1[3]` potions et bijoux, `d1[4]` potions et deux premiers soins,
`mines[0]` potions et bijoux, `mines[1]` premiers soins et forgeron (voir
[Anomalies](#anomalies-relevées)).

### Repères de prix

| Objet | Prix | Pour comparaison |
|---|---|---|
| `pot_heal_1` (12 PV) | 2 | `pot_regen_1` (60 PV en 30 s) : 3 |
| `pot_ether_1` (20 énergie) | 4 | |
| `wand_fyre_2` | 10 | |
| `dag_kopper`, `dag_sylver` | 15, 18 | |
| bijoux | 5 à 20 | |
| herbes `ccc_herb1` à `5` | 1 à 5 | |

Pour décider d'un prix, comparer au **revenu d'un étage** (environ 30 à
40 pièces aujourd'hui, voir plus haut) : un objet à 20 pièces coûte un
demi-étage de fouille.

## Les monstres

### Les caractéristiques (`MONSTERS_BLUEPRINTS.js`)

```js
"m_madface": {
    ...
    "data": {
        "vitality": 15,        // points de vie
        "speed": 100,          // vitesse de déplacement
        "weapon": "dag_brass", // son arme : c'est elle qui fait les dégâts
        "flags": "0",          // "B" : boss
        "properties": null,    // effets permanents, ex. ["nrphyC/"] : résistance physique 2
        "score": 150           // points de score quand on le tue
    }
}
```

- **Points de vie** : `vitality`.
- **Dégâts** : ils viennent de l'**arme** (`weapon`, dans `ITEMS_DATA.js`),
  qui renvoie à un sort de `SPELLS_DATA.js`. Pour un monstre plus dangereux,
  lui donner une autre arme ou créer une arme qui lui est propre
  (`dag_madface`…) avec un sort plus fort. Changer `dag_brass` changerait
  tous les monstres qui l'utilisent.
- **Résistances** : `properties`, par exemple `"nrphyC/"` (résistance
  physique de niveau 2, permanente) : −24 % de dégâts physiques reçus.

| Monstre | Vitalité | Arme | Dégâts moyens par coup |
|---|---|---|---|
| `m_myco` | 4 | `dag_brass` | 7 |
| `m_bigface` | 6 | `dag_brass` | 7 |
| `m_wasp` | 3 | `dag_poisonsting_1` | 7 + poison |
| `m_spider` | 6 | `dag_poisonsting_1` | 7 + poison |
| `m_madface`, `m_pira` | 15 | `dag_brass` | 7 |
| `m_acidblob`, `m_fireblob` | 10 | explosion | 17,5 |
| `m_imp1`, `m_imp2` | 13, 11 | `wand_imp_1` | 14 |
| `m_cube` | 10 | 3 boules de feu | 3 × 7 |
| `m_turret` | 30 | `wand_turret_1` | 10,5 |
| `m_bigarmor` | 25 | `dag_steel` | 10,5 |
| `m_warlock` | 25 | `wand_warlock_1` | 7 + aveuglement, vulnérabilité |
| `m_medusa` | 15 | `wand_medusa_1` | 14 + poison |
| `m_phanto` | 30 | `wand_imp_1` | 14 |
| boss | 200 à 220 | selon le boss | 7 à 14 |

Le joueur a 100 PV : un monstre à 7 de dégâts doit le toucher environ
14 fois.

### Le niveau des monstres : un réglage qui existe mais ne sert pas

`Dungeon.setupMobCreature` sait renforcer un monstre selon un niveau :
vitalité × niveau, et +niveau à chaque résistance. Mais le niveau est fixé
à 1 dans `Game.onEnterLevel` (`const nLevel = 1`), et la propriété
`level: 1` de chaque étage n'est lue nulle part.

Pour des monstres plus forts en profondeur sans toucher à leurs fiches, il
suffirait de remplacer `const nLevel = 1` par le `level` de l'étage
(`this.getWorldData().level`), puis de régler `level` étage par étage
(1, 1, 2, 2, 3…). Attention : niveau 2 = vitalité **doublée**. C'est un
changement de code, à faire ensemble si tu choisis cette voie.

### Quels monstres à quel étage (`horde`)

```js
horde: {
    m_bigface: { levels: [0, 1, 2, 3, 4, 5, 6] },
    m_madface: { levels: [3, 4, 5, 6, 7, 8, 9, 10] },
},
```

Le générateur pose des **points d'apparition** numérotés de 0 à 10 : le
numéro est la distance à l'entrée (0 tout près, 9 au fond, 10 = X, les
pièces les plus éloignées). À chaque point, le jeu tire au hasard **un des
monstres** dont `levels` contient ce numéro.

- **Repousser un monstre au fond de l'étage** : retirer les petits numéros
  de ses `levels`.
- **Le rendre plus fréquent** : l'ajouter à plus de numéros, ou retirer
  les autres monstres de ces numéros.
- Un numéro sans aucun monstre = point d'apparition vide.

## Le joueur

Dans `Dungeon.setupPlayerCreature` :

| Réglage | Valeur | Sens |
|---|---|---|
| `vitality` | 100 | points de vie max |
| `energy` | 100 | énergie max (les baguettes en consomment) |
| `speed` | 160 | vitesse de déplacement |
| `foodmax` | 1000 | nourriture max |
| `foodc` | 10 | perte de nourriture toutes les 10 s ; une fois à 0, perte de **10 PV** toutes les 10 s |
| `aStartingStuff` | baguette de glace, dague d'acier, 3 `pot_heal_3`, 3 `pot_ether_3`, ingrédients | équipement de départ |

- Avec 1000 points de nourriture, le joueur tient **environ 17 minutes**
  sans manger (`clockSecond` dans `Game.js`, tous les 10 s).
- **Pas de régénération naturelle** : ni PV, ni énergie. Tout passe par les
  potions, la nourriture et l'eau.

Armes du joueur (attaque normale, puis attaque chargée) :

| Arme | Attaque | Coût | Attaque chargée | Coût |
|---|---|---|---|---|
| `dag_steel` (départ) | 10,5 | 0 | — | — |
| `dag_sylver`, `dag_jade`, `dag_gawld` | 14, 17,5, 21 | 0 | — | — |
| `dag_kopper` | 7 physique + 14 électrique | 0 | — | — |
| `wand_yce_1` (départ) | 3,5 froid | 1 | 3 boules de 10,5 + ralentissement | 3 |
| `wand_fyre_2` | 7 feu | 1 | 3 boules de 7 | 5 |
| `wand_lyte_3` | 7 électrique | 1 | 5 éclairs de 10,5 | 3 |

Délai entre deux attaques : `speed` de l'arme dans `ITEMS_DATA.js`
(700 ms pour les dagues, 300 ms pour les baguettes du joueur).

## Potions et nourriture

Dans `ITEMS_DATA.js`, propriété `properties` (codes d'effet) :

| Objet | Code | Effet |
|---|---|---|
| `pot_heal_1` / `2` / `3` | `brheaCA` / `FA` / `KA` | 12 / 30 / 60 PV d'un coup |
| `pot_regen_1` / `2` / `3` | `brheaCe` / `Fe` / `Ke` | 2 / 5 / 10 PV par seconde pendant 30 s, soit 60 / 150 / 300 PV |
| `pot_ether_1` / `2` / `3` | `breneCA` / `FA` / `KA` | 20 / 50 / 100 énergie |
| `pot_power_1` / `2` / `3` | `bbpowBe` / `Ce` / `De` | +1 / +2 / +3 dés de dégâts pendant 30 s |
| `pot_vital_1` / `2` / `3` | `bbxhpD8` / `G8` / `J8` | +30 / +60 / +90 PV max pendant 60 s |
| `pot_res…_1` / `2` / `3` | `…C8` / `E8` / `G8` | résistance 2 / 4 / 6 (−24 / −35 / −42 %) pendant 60 s |
| `ccc_bread`, `ccc_vegs` | `brfdpCA` | 200 nourriture |
| `ccc_meat` | `brfdpEA` | 400 nourriture |
| `ccc_meal` | `brfdpKA`, `breneCA` | 1000 nourriture et 20 énergie |
| `ccc_h2o` | `brfdpBA`, `breneBA` | 100 nourriture et 10 énergie |

- **Rendre une potion plus forte** : changer la 6ᵉ lettre (le niveau).
- **La faire durer** : changer la 7ᵉ lettre.
- `stack` : nombre d'exemplaires par case d'inventaire (10 pour les
  potions, 999 pour l'or).

## Bijoux et armes

Bijoux (`ITEMS_DATA.js`, types `ring`, `amulet`, `earings`) : effets
permanents tant qu'ils sont portés (durée `/`).

| Bijou | Effet |
|---|---|
| `ring_power_1` / `2` / `3` | +2 / +4 / +6 dés de dégâts (`ibpowC/`…) : très fort, +7 à +21 par projectile |
| `ring_thermdef_*`, `ring_elecdef_*`, `ring_integrity_*`, `ear_magres_*` | résistances 2 / 4 / 6 |
| `ear_magplus_*` | énergie max +20 / +40… |
| `amu_luck_*` | chance : réduit la probabilité que les effets secondaires des attaques ennemies (aveuglement, poison, ralentissement…) vous touchent |
| `amu_health`, `amu_antidote`… | immunités (poison, maladies…) |

Armes : `ITEMS_DATA.js` donne le délai (`speed`) et la liste des sorts
(`spells`, avec le temps de charge `time` en ms). Le sort, dans
`SPELLS_DATA.js`, donne :

```js
"mis_iceball_1": {
    "blueprint": "p_iceball",  // le projectile (son image, sa vitesse)
    "cost": 3,                 // énergie consommée
    "options": "l3",           // l1, l3, l5 : 1, 3 ou 5 projectiles en éventail ; w1/w2/w3 : ondulations
    "effects": ["mxcldDA", "masnrDF"],   // froid 3d6, ralentissement 3 pendant 5 s
    "chances": [1, 1]                    // probabilité de chaque effet (0,25 = une fois sur 4)
}
```

## Artisanat

`CRAFT_DATA.js` : chaque recette donne son type (`brew` pour les potions),
son niveau et ses ingrédients :

```js
"pot_heal_2": { "type": "brew", "level": 2, "reagents": [["ccc_h2o", 1], ["ccc_herb1", 2]] },
```

L'artisanat permet de transformer les herbes (vendues 1 à 5 pièces) en
potions : si les herbes sont très bon marché, les potions vendues en
magasin perdent leur intérêt. Garder ces deux prix cohérents.

## Taille et densité des niveaux

### Les options du générateur (`options` dans `WORLD_DATA.dungeons.js`)

| Option | Sens |
|---|---|
| `-lsN` | taille du labyrinthe : (N + 4) × (N + 4) pièces. Plus de pièces = plus de monstres, de coffres et de temps de jeu |
| `-rsN` | taille des pièces : N × 2 + 9 cases (donjon), N × 4 + 13 (mines) |
| `-rlN` / `-rmN` | moins / plus de vraies pièces par rapport aux couloirs (±10 % par point) |
| `-sN` | nombre de magasins : **ne pas l'écrire**, le jeu l'ajoute d'après `shops` |
| `-p1` | portail vers une autre zone : ajouté par le jeu (`Adventure.config`) |
| `-tN` | algorithme du labyrinthe |

Les options se mettent bout à bout : `'-rs1-ls2'`.

### Le nombre de monstres

`LevelToolKit.spawnMobs` pose **1 à 4 monstres par pièce** (sauf près de
l'entrée). Ce nombre n'est pas réglable depuis les données : la fonction a
un paramètre `nMoreOrLess` (−3 à +3) qui n'est jamais utilisé. Le brancher
sur une option (`-mN`) serait un petit changement dans les générateurs.

Pour changer la difficulté sans toucher au code : agrandir le niveau
(`-ls`), ou rendre la `horde` plus dure (monstres plus forts aux mêmes
numéros).

## Méthode de travail

1. **Changer une seule chose à la fois**, et noter la valeur d'avant.
2. `npm run build`, puis lancer le jeu avec `?debug=1` à la fin de l'URL.
3. Tester avec les codes de débogage (pause, touche X, ou `cheat('…')`
   dans la console) :
   - `go mines 1` : aller à l'étage voulu ;
   - `regen 12345` : refaire l'étage avec une graine fixe, pour comparer
     avant et après sur **le même niveau** ;
   - `god`, `heal` : traverser vite ; `kill` : vider l'étage et voir le
     butin des monstres ;
   - `gold 50`, `give pot_heal_2 5` : tester un magasin ou une situation ;
   - `where` : noter l'étage et la graine d'un niveau à problème.
4. **Jouer l'étage sans triche** au moins une fois : PV restants à la
   sortie, or gagné, potions utilisées.
5. Garder un **budget par étage**, par exemple :
   - or gagné ≈ 1 à 1,5 objet intéressant du magasin de l'étage ;
   - soins trouvés ≈ dégâts subis en jouant correctement, moins une marge
     (sinon le joueur accumule les potions et rien ne lui fait peur).

Une évolution utile : un script qui calcule ces moyennes pour chaque étage
(nombre de monstres, PV totaux, or, potions), à partir des mêmes données
que le jeu. Voir la discussion du 15 octobre 2026.

## Anomalies relevées

À corriger ou à décider :

- **`mines[1]` utilise `shops.blacksmith_2`, qui n'existe pas** (il n'y a
  que `blacksmith_3`) : le second magasin de cet étage est indéfini.
  Remplacer par `shops.blacksmith_3`, ou créer `blacksmith_2`.
- **`pot_regen_1` soigne 5 fois plus que `pot_heal_1`** (60 PV contre 12)
  pour 3 pièces au lieu de 2.
- **Les boss donnent le même butin qu'un monstre ordinaire** (0,47 pièce
  d'or en moyenne), sauf la reine Méduse.
- **Le niveau des monstres est fixé à 1** et la propriété `level` des
  étages ne sert pas (voir [Les monstres](#les-monstres)).
- **Les monstres n'ont pas de `power`** dans leurs fiches : leurs dégâts
  dépendent uniquement de leur arme.
- **Les achats reviennent après 11 secondes** de jeu : on peut acheter le
  même objet à volonté.
- **Tous les étages partagent les mêmes tables de butin** : le butin ne
  progresse pas avec la profondeur.
