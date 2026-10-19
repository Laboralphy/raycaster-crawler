# Musiques MIDI

Partitions General MIDI générées par script, dans l'esprit de Heretic et
Hexen, rendues en OGG pour le jeu. Composition écrite avec Claude Code
(voir `ASSETS.md`, « Assistance par IA »).

## Morceaux

| Morceau | Script | Pour | Ambiance | Durée |
|---|---|---|---|---|
| `main_menu` | `make_main_menu.py` | menu principal | sombre, menaçant ; thème du Grimoire (ré mineur) | 3:00 |
| `forest_night` | `make_forest_night.py` | forêt | nuit, chœurs inquiétants, boîte à musique fausse (mi mineur) | 2:08 |
| `dungeon_gate` | `make_dungeon_gate.py` | donjon | marche lourde, guitare étouffée, cuivres (ré phrygien) | 1:44 |
| `dungeon_vaults` | `make_dungeon_vaults.py` | donjon | mystérieux, harpe 3+3+2, orgue, violoncelle (la mineur) | 1:47 |
| `dungeon_chains` | `make_dungeon_chains.py` | donjon | pédale de do, guitare saturée, trombones (do mineur) | 1:36 |
| `dungeon_crypt` | `make_dungeon_crypt.py` | donjon | harpe en boucle, chœur sur pédale, comme Hexen (ré mineur) | 1:51 |
| `dungeon_ritual` | `make_dungeon_ritual.py` | donjon | triton, guitare saturée, percussions, comme E1M1 (do phrygien) | 1:43 |
| `dungeon_requiem` | `make_dungeon_requiem.py` | donjon | valse funèbre à 3/4, orgue, cor, chœur (mi mineur) | 1:38 |
| `dungeon_gauntlet` | `make_dungeon_gauntlet.py` | donjon | poursuite, riff à l'unisson en doubles croches, comme E2M3 (la mineur) | 1:31 |
| `mines_depths` | `make_mines_depths.py` | mines | grotte immense, gouttes, pioches en écho (fa mineur) | 1:42 |
| `mines_echoes` | `make_mines_echoes.py` | mines | galeries, marimba, clarinette, échos (si mineur) | 1:31 |
| `mines_pit` | `make_mines_pit.py` | mines | hostile, guitare étouffée 3+3+2, triton, comme « Deep » de Hexen (do mineur) | 1:44 |
| `underwater_hunt` | `make_underwater_hunt.py` | salles inondées | traque : basse fretless en doubles croches, taiko, cuivres (si bémol mineur) | 1:36 |
| `boss_medusa` | `make_boss_medusa.py` | boss : la reine Méduse | combat sous l'eau, rapide (fa dièse mineur) | 1:27 |
| `treasure_guardian` | `make_treasure_guardian.py` | salle du trésor | l'or et son gardien : harpe, trombones et tuba (mi phrygien) | 1:29 |
| `boss_warlock` | `make_boss_warlock.py` | boss final : le sorcier | épique ; thème du Grimoire en furie (ré mineur) | 1:33 |
| `ending_homeward` | `make_ending_homeward.py` | cinématique de fin | joyeux ; thème du Grimoire en majeur (ré majeur) | 1:23 |
| `intro_wander` | `make_intro_wander.py` | cinématique d'intro, 1 : la promenade | insouciant puis perdu ; thème de l'aventurier (ré mixolydien) | 0:38 |
| `intro_ambush` | `make_intro_ambush.py` | cinématique d'intro, 2 : l'embuscade | thème du Grimoire menaçant, sortilège, poulet qui caquette et s'enfuit (ré mineur) | 0:32 |
| `intro_revenge` | `make_intro_revenge.py` | cinématique d'intro, 3 : la vengeance | colère qui monte, thème de l'aventurier en mineur, tutti (ré mineur) | 0:20 |

Écartés du jeu (absents de `make_all.sh`, scripts gardés) : le style ne
collait pas à l'ambiance. `dungeon_sanctum` (trop oriental, l'acte II de
Diablo II), `mines_burrow` (trop « nains au travail dans la mine »),
`treasure_hoard` (mignon mais trop paisible), `underwater_flooded` (trop
paisible pour un niveau de méduses et de barracudas).

Hors jeu, pour un projet futur (absent de `make_all.sh`) :
`danmaku_harpsichord` (`make_danmaku_harpsichord.py`), morceau original dans
l'esprit de Touhou Project, clavecin en voix principale (la mineur, 160 bpm,
1:36). Rendu : `SUFFIX=.gu OGG_RMS=-19 ./render.sh danmaku_harpsichord.mid`.
`prelude_dminor` (`make_prelude_dminor.py`), prélude pour clavecin seul dans
le style de BWV 846, écrit pour être joué sur un vrai clavecin (main droite
et main gauche sur deux pistes ; ré mineur, 66 bpm, 2:07, sans boucle).
Rendu : `NOLOOP=1 ./render.sh prelude_dminor.mid`.
`chaconne_gminor` (`make_chaconne_gminor.py`), chaconne pour clavecin seul :
basse obstinée de lamento et sept variations (sol mineur, 3/4, 76 bpm, 2:32,
sans boucle ; partition `chaconne_gminor.ly`). Rendu :
`NOLOOP=1 ./render.sh chaconne_gminor.mid`.

Les trois parties de l'intro suivent la cinématique : elle passe de l'une à
l'autre à l'embuscade (`eventEmbush`) et quand l'aventurier redevient humain
(`eventAdvBack`) ; leurs repères (en secondes) sont dans l'en-tête des scripts.

Tous bouclent : la fin enchaîne sur le début, et le rendu replie la queue de
réverbération sur le début du fichier.

## Fabriquer

```sh
./make_all.sh                          # tout : MIDI puis OGG
./make_all.sh boss_warlock             # un ou plusieurs morceaux
python3 make_boss_warlock.py           # le MIDI seul
fluidsynth -a pulseaudio banque.sf2 boss_warlock.mid  # l'écouter
./render.sh boss_warlock.mid autre.sf2 # rendu avec une autre banque, pour écouter
python3 analyse.py boss_warlock.wav 144  # durée, crête, niveau, spectre
```

Prérequis : Python 3 et NumPy, FluidSynth (`apt install fluidsynth`), FFmpeg.
Banque de rendu par défaut : GeneralUser GS v1.471, celle des OGG du jeu,
dans `~/Musique/soundfonts/`. Ne livrer que des OGG rendus avec une banque
libre (voir `ASSETS.md`).

Pour comparer des banques, `SF2` et `SUFFIX` changent la banque et le nom
des fichiers produits :

```sh
SF2=~/Musique/soundfonts/MuseScore_General\(v0.2.0\).sf2 SUFFIX=.mus ./make_all.sh
ffplay -nodisp -autoexit boss_warlock.mus.ogg
```

Le rendu reste ici (fichiers ignorés par git) ; dans le jeu, chaque morceau
est copié en `resources/snd/ogg/mus_<nom>.ogg`.

## Fichiers

- `midi_kit.py` : écriture de fichiers MIDI, sans dépendance.
- `compose.py` : accords, progressions, mélodies, arpèges, batterie, échos...
- `motifs.py` : thème du Grimoire (menu), en mineur et en majeur ; thème de
  l'aventurier (intro), en mixolydien et en mineur.
- `render.sh` : rendu FluidSynth, bouclage et niveau (`finish.py`), OGG.
- `make_all.sh` : tout régénérer, avec le niveau de chaque morceau.
