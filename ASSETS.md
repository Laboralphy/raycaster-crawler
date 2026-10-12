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
| Sprites de monstres et d'objets `resources/gfx/sprites/` | rendus POV-Ray par l'auteur (d'après les crédits) | personnelle | ❓ à confirmer |
| Textures `resources/gfx/textures/t_*`, `f_*` | dessinées par l'auteur (OpenOffice Draw, Gimp, d'après les crédits) | personnelle | ❓ à confirmer |
| Icônes `resources/gfx/icons/icons.png` (176 icônes), `digits.png` | probablement l'auteur | — | ❓ à confirmer |
| Livres `resources/gfx/books/` (dont les pages illustrées `book_of_story0` à `3`) | inconnue | — | ❓ |
| Cadre de l'interface `resources/gfx/frame/` | inconnue | — | ❓ |

## Polices

| Police | Où | Licence | État |
|---|---|---|---|
| UnifrakturMaguntia | dessinée dans le logo (pas livrée en fichier) | SIL OFL 1.1 | ✅ |

## Anomalies relevées

- `MUSIC_TREASURE` référence `mus_bjorn_lynne_the_log_journey_home`
  (faute de frappe) alors que le fichier s'appelle `…_long_journey_home` :
  ce morceau ne peut pas être joué. Sans objet une fois la musique remplacée.

## Avant la publication sur Steam

- [ ] Plus aucun ❌ ni ❓ dans ce document.
- [ ] Crédits à jour dans le jeu (`cs1_credits`) et dans `credits.html`.
- [ ] Les fichiers remplacés sont supprimés du dépôt et du paquet livré.
