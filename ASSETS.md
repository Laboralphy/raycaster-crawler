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
`MUSIC_*`) et par `Game.sys_cutscene` (cinématiques).

| Fichier | Utilisé pour | Auteur / origine | Licence | État | Remplacement |
|---|---|---|---|---|---|
| `mus_bjorn_lynne_no_survivors` | menu (`MUSIC_MENU`) | Bjorn A. Lynne (Shockwave-Sound) | « libre pour projets non commerciaux » | ❌ | à composer |
| `mus_bjorn_lynne_in_the_cave` | mines (`MUSIC_MINES`) | Bjorn A. Lynne | idem | ❌ | à composer |
| `mus_bjorn_lynne_proud_warriors` | combats de boss (`MUSIC_BOSS`) | Bjorn A. Lynne | idem | ❌ | à composer |
| `mus_bjorn_lynne_victorious_days` | salle du trésor (`MUSIC_TREASURE`) | Bjorn A. Lynne | idem | ❌ | à composer |
| `mus_bjorn_lynne_the_long_journey_home` | salle du trésor (`MUSIC_TREASURE`) | Bjorn A. Lynne | idem | ❌ | à composer — voir « Anomalies » |
| `mus_bjorn_lynne_methydias_cloudship` | cinématique de fin | Bjorn A. Lynne | idem | ❌ | à composer |
| `mus_night_ambience` | forêt (`MUSIC_FOREST`) et cinématique d'intro | inconnue | inconnue | 🔄 | `tools/music/forest_ambience.xm` (jour) et `forest_night.xm` (nuit) |
| `mus_yewbic_ambience01`, `02`, `03`, `07` | donjons (`MUSIC_DUNGEON`) | Yewbic (freesound.org) | ❓ Freesound mélange CC0, CC BY et CC BY-NC : vérifier chaque son | ❓ | selon la licence |
| `mus_laurent_underwater_mamori` | niveaux sous l'eau (`MUSIC_UNDERWATER`) | inconnue (« Laurent » ?) | inconnue | ❓ | à identifier, sinon à composer |

### Musiques composées (création personnelle)

Générées par script, au format XM (ouvrable et modifiable dans OpenMPT) :
aucune contrainte de licence. Instruments synthétisés (FM, bruit filtré), pas
d'échantillons extérieurs.

| Fichier | Script | Ambiance | Durée |
|---|---|---|---|
| `tools/music/forest_ambience.xm` | `tools/music/make_forest.py` | forêt de jour, paisible (ré dorien, 80 bpm) | 1:36, en boucle |
| `tools/music/forest_night.xm` | `tools/music/make_forest_night.py` | forêt de nuit, inquiétante (mi phrygien, 60 bpm) | 1:36, en boucle |

Pour les brancher : exporter en OGG (le jeu ne lit pas le XM), les placer
dans `resources/snd/ogg/` et les référencer dans `SOUNDS.js`. Les deux
forêts du jeu (`forest`, visuel `forest`, et `darkfall`) partagent
aujourd'hui `MUSIC_FOREST` : une clé `MUSIC_FOREST_NIGHT` permettrait la
version nuit dans la seconde.

### Musiques MIDI (`tools/music/midi/`)

Partitions General MIDI générées par script (`midi_kit.py`), dans l'esprit
de Heretic et Hexen. Le jeu lit de l'OGG : `render.sh` rend le MIDI avec
FluidSynth (via VLC) puis l'encode.

14 morceaux, tous en boucle : menu, forêt de nuit, 4 donjons, 3 mines,
salles inondées, boss Méduse, salle du trésor, boss sorcier, fin. Liste,
ambiances et commandes : `tools/music/midi/README.md`.

⚠️ **Banque de sons** : l'OGG livré contient les échantillons de la banque
SoundFont utilisée pour le rendu. La banque « Yamaha Tyros 4 » est une copie
non officielle d'échantillons Yamaha : très bien pour écouter, mais à ne pas
utiliser pour l'OGG publié. `render.sh` prend par défaut **MuseScore
General** (licence MIT) : le rendu peut être livré sans restriction. Toute
autre banque utilisée pour un OGG livré doit être notée ici avec sa licence.

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

- `MUSIC_TREASURE` référence `mus_bjorn_lynne_the_log_journey_home`
  (faute de frappe) alors que le fichier s'appelle `…_long_journey_home` :
  ce morceau ne peut pas être joué. Sans objet une fois la musique remplacée.

## Avant la publication sur Steam

- [ ] Plus aucun ❌ ni ❓ dans ce document.
- [ ] Crédits à jour dans le jeu (`cs1_credits`) et dans `credits.html`.
- [ ] Les fichiers remplacés sont supprimés du dépôt et du paquet livré.
