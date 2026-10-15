# Ressources du jeu — licences et remplacements

Suivi de l'origine et de la licence de chaque ressource (musiques, sons,
images, polices), en vue de la publication sur Steam (jeu gratuit). Tout ce
qui est livré doit pouvoir être **redistribué dans un jeu publié** : une
ressource dont l'origine ou la licence est inconnue est à traiter comme
interdite tant qu'elle n'est pas vérifiée.

État au 12 octobre 2026.

## Règles

| Acceptable | Interdit |
|---|---|
| Création personnelle (y compris générée par nos scripts) | Ressources extraites d'un autre jeu (Lineage 2, etc.) |
| CC0 / domaine public | Licences « non commerciales » (CC BY-NC, « free for non commercial projects ») : Steam peut être considéré comme commercial, même pour un jeu gratuit |
| CC BY 3.0 / 4.0 : **créditer** l'auteur (fenêtre de crédits + `credits.html`) | Origine ou licence inconnue |
| SIL Open Font License (polices) | CC BY-SA : possible, mais oblige à publier les œuvres dérivées sous la même licence ; à éviter |

Pour chaque nouvelle ressource : noter ici l'auteur, la licence, l'URL
d'origine et la date de vérification, et l'ajouter aux crédits si la licence
l'exige (`src-recovered/game/data/STRINGS.js`, clé `cs1_credits`, et
`resources/doc/menu/credits.html`).

Légende : ✅ réglé · 🔄 remplacement prêt, pas encore branché · ❌ à remplacer ·
❓ à vérifier

## Musiques (`resources/snd/ogg/`)

Les musiques sont choisies par `src-recovered/game/data/SOUNDS.js` (clés
`MUSIC_*`), et chaque niveau nomme sa clé dans `WORLD_DATA.dungeons.js`.
Toutes sont des créations personnelles : partitions MIDI générées par script
(`tools/music/midi/`), rendues en OGG avec la banque GeneralUser GS.

| Fichier | Clé | Utilisé pour | État |
|---|---|---|---|
| `mus_main_menu` | `MUSIC_MENU` | menu principal | ✅ |
| `mus_forest_night` | `MUSIC_FOREST`, `MUSIC_CUTSCENE` | les deux forêts, cinématique d'intro | ✅ |
| `mus_dungeon_gate`, `_vaults`, `_chains`, `_sanctum` | `MUSIC_DUNGEON` | donjons (tirage au hasard) | ✅ |
| `mus_mines_depths`, `_echoes`, `_burrow` | `MUSIC_MINES` | mines (tirage au hasard) | ✅ |
| `mus_underwater_flooded` | `MUSIC_UNDERWATER` | niveau sous l'eau, salles inondées | ✅ |
| `mus_boss_warlock` | `MUSIC_BOSS` | boss sorcier, boss des mines | ✅ |
| `mus_boss_medusa` | `MUSIC_BOSS_MEDUSA` | boss reine Méduse | ✅ |
| `mus_treasure_hoard` | `MUSIC_TREASURE` | salle du trésor | ✅ |
| `mus_ending_homeward` | `MUSIC_END` | cinématique de fin | ✅ |

### Musiques MIDI (`tools/music/midi/`)

Partitions General MIDI générées par script (`midi_kit.py`), dans l'esprit
de Heretic et Hexen. Le jeu lit de l'OGG : `render.sh` rend le MIDI avec
FluidSynth puis l'encode. Liste, ambiances et commandes :
`tools/music/midi/README.md`.

⚠️ **Banque de sons** : l'OGG livré contient les échantillons de la banque
SoundFont utilisée pour le rendu ; seule une banque à licence libre convient.

- Banque des OGG livrés : **GeneralUser GS v1.471**, par S. Christian
  Collins (https://schristiancollins.com/generaluser.php). Sa licence permet
  d'utiliser librement, y compris commercialement, la musique produite avec
  elle — à confirmer en relisant le fichier de licence fourni avec la banque
  (non relu au 14 octobre 2026).
- Autre banque libre, pour comparer : **MuseScore General** 0.2 (licence
  MIT ; créditer FluidR3 de Frank Wen et les auteurs cités dans sa licence
  si elle sert à un OGG livré).
- À ne pas utiliser pour l'OGG publié (échantillons d'origine commerciale ou
  inconnue) : « Yamaha Tyros 4 », « Timbres of Heaven ».

### Anciennes musiques XM (`tools/music/xm/`)

Modules XM générés par script (instruments synthétisés FM, sans
échantillons extérieurs), exportés par `export_ogg.py`. Remplacés dans le jeu
par les musiques MIDI le 14 octobre 2026 ; les scripts restent disponibles.

## Bruitages (`resources/snd/ogg/`)

| Fichiers | Utilisés pour | Origine | État |
|---|---|---|---|
| `a_*` (portes, coffres, clés, éclaboussures…) | actions | inconnue | ❓ |
| `atk_*`, `hit_*`, `hit_spell0`, `fx_teleport`, `amb_gloom` | attaques, impacts, sorts | inconnue | ❓ |
| `amb_bubbles0` à `3` | niveaux sous l'eau | inconnue | ❓ |
| `m_*` (chant, poulet, mouche, corbeau, rugissement), `x_death` | monstres | inconnue | ❓ |

À faire : retrouver l'origine de chaque bruitage (création, banque de sons,
autre jeu). Ce qui n'est pas retrouvé est à remplacer, par exemple par des
sons CC0 (freesound.org filtré sur CC0, Kenney.nl, OpenGameArt) ou générés.

## Images

| Ressource | Origine | Licence | État |
|---|---|---|---|
| Portraits muraux `resources/gfx/textures/d_pictures.png` | Dungeon Crawl Stone Soup tiles ([OpenGameArt](https://opengameart.org/content/dungeon-crawl-32x32-tiles)), mis en cadre par nous | CC0 (vérifié sur la page et dans le README du paquet) | ✅ remplace des images de Lineage 2 ; crédité |
| Logo `resources/gfx/icons/title_128.png` | création, police UnifrakturMaguntia | SIL OFL (police) | ✅ |
| Torche `resources/gfx/sprites/o_torch_1.png` | création (reprise du projet « mansion ») | personnelle | ✅ |
| Sprites de monstres et d'objets `resources/gfx/sprites/` | modélisés et rendus avec POV-Ray par l'auteur | personnelle | ✅ (confirmé par l'auteur) |
| Textures `resources/gfx/textures/t_*`, `f_*` | dessinées par l'auteur avec OpenOffice Draw (assemblage Gimp) | personnelle | ✅ (confirmé par l'auteur) |
| Panneau de magasin (panneau 79 des textures `t_*` de 5120 px) | sac d'or provisoire dessiné par `tools/gfx/make_shop_panel.py` ; remplace une marchande qui ressemblait à Shantae (WayForward) | personnelle | 🔄 provisoire, en attendant le dessin définitif |
| Icônes des objets `resources/gfx/icons/icons.png` (176 icônes) | dessinées par l'auteur avec OpenOffice Draw | personnelle | ✅ (confirmé par l'auteur) |
| Chiffres du HUD `resources/gfx/icons/digits.png` | dessinés par l'auteur | personnelle | ✅ (confirmé par l'auteur) |
| Livre de l'histoire `resources/gfx/books/book_of_story0.png` (vieux livre), `book_of_story1.png` (sorcier en prière), `book_of_story3.png` (château la nuit) | images récupérées à droite et à gauche il y a plus de 8 ans ; origine introuvable | inconnue | ❌ à remplacer |
| Livre de l'histoire `book_of_story2.png` (monstres dans une salle) | ressemble aux monstres POV-Ray du jeu | — | ❓ à confirmer |
| Autres pages de livres `resources/gfx/books/book_*` (sorts, alchimie, clés, dague, baguette…) | même style que les icônes (OpenOffice Draw ?) | — | ❓ à confirmer |
| Cadre décoratif autour de l'écran (ancien `resources/gfx/frame/`) | extrait d'une vidéo d'histoires pour enfants, il y a 13 ans | non libre | ✅ supprimé (le jeu n'a plus de cadre) |

## Polices

| Police | Où | Licence | État |
|---|---|---|---|
| UnifrakturMaguntia | dessinée dans le logo (pas livrée en fichier) | SIL OFL 1.1 | ✅ |

## Assistance par IA

Ce qui a été fait avec un assistant IA (Claude, Anthropic), à déclarer selon
les règles de chaque plateforme. Le jeu d'origine (2010-2013) — moteur,
code, sprites, textures, histoire — est le travail de l'auteur, sans IA.

| Partie | Rôle de l'IA | Depuis |
|---|---|---|
| **Code** : reprise du projet en 2026 (récupération des sources, classes ES, modules ES, `const`/`let`), générateur de niveaux en JavaScript, torches et éclairage, outils de vérification | code écrit ou modifié avec l'assistant, relu et testé par l'auteur | octobre 2026 |
| **Musique** : modules XM (`tools/music/xm/`) et partitions MIDI (`tools/music/midi/`) | composition (notes, harmonies, structure) et synthèse des instruments écrites par l'IA, sous forme de scripts (`tools/music/`) ; choix et validation par l'auteur | octobre 2026 |
| **Logo** `title_128.png` | rendu par un script écrit par l'IA (police libre UnifrakturMaguntia, effets) ; pas de générateur d'images | octobre 2026 |
| **Panneau de magasin provisoire** (sac d'or, panneau 79 des textures de murs) | dessiné par un script écrit par l'IA (`tools/gfx/make_shop_panel.py`, formes simples) ; pas de générateur d'images | octobre 2026 |
| **Portraits muraux** `d_pictures.png` | choix et mise en cadre par un script ; les dessins sont ceux, humains, des artistes de Dungeon Crawl (CC0) : pas de contenu généré | octobre 2026 |
| **Textes** | renommage du livre en « Grimoire of Power » dans les textes existants ; titre « Give Back My Grimoire! » choisi par l'auteur parmi des propositions | octobre 2026 |

Déclarations correspondantes :

- **itch.io** (champ « Generative AI Disclosure ») : oui ; cocher **Code** et
  **Sound** ; **Graphics** par prudence (logo).
- **Steam** (règles de janvier 2026) : l'aide au développement (code) n'est
  plus à déclarer ; déclarer la **musique** générée et, par prudence, le
  **logo**.
- **Page du projet** (portfolio) : dire clairement ce qui vient de l'auteur
  et ce qui a été fait avec l'IA.

À tenir à jour : toute nouvelle ressource produite avec l'IA s'ajoute à ce
tableau.

## Anomalies relevées

Aucune pour l'instant.

## Avant la publication sur Steam

- [ ] Plus aucun ❌ ni ❓ dans ce document.
- [ ] Licence de GeneralUser GS v1.471 relue (musiques).
- [ ] Crédits à jour dans le jeu (`cs1_credits`) et dans `credits.html`.
- [ ] Les fichiers remplacés sont supprimés du dépôt et du paquet livré.
