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
| `dungeon_sanctum` | `make_dungeon_sanctum.py` | donjon | oriental, shanai, tympanon, peaux (mi phrygien dominant) | 1:31 |
| `mines_depths` | `make_mines_depths.py` | mines | grotte immense, gouttes, pioches en écho (fa mineur) | 1:42 |
| `mines_echoes` | `make_mines_echoes.py` | mines | galeries, marimba, clarinette, échos (si mineur) | 1:31 |
| `mines_burrow` | `make_mines_burrow.py` | mines | araignées et diablotins, pizzicati qui grouillent (mi mineur) | 1:26 |
| `underwater_flooded` | `make_underwater_flooded.py` | salles inondées | humide, dangereux, menace qui monte (do dièse mineur) | 1:48 |
| `boss_medusa` | `make_boss_medusa.py` | boss : la reine Méduse | combat sous l'eau, rapide (fa dièse mineur) | 1:27 |
| `treasure_hoard` | `make_treasure_hoard.py` | salle du trésor | or qui scintille, émerveillement (mi lydien) | 1:00 |
| `boss_warlock` | `make_boss_warlock.py` | boss final : le sorcier | épique ; thème du Grimoire en furie (ré mineur) | 1:33 |
| `ending_homeward` | `make_ending_homeward.py` | cinématique de fin | joyeux ; thème du Grimoire en majeur (ré majeur) | 1:23 |

Tous bouclent : la fin enchaîne sur le début, et le rendu replie la queue de
réverbération sur le début du fichier.

## Fabriquer

```sh
./make_all.sh                          # tout : MIDI puis OGG
./make_all.sh boss_warlock             # un ou plusieurs morceaux
python3 make_boss_warlock.py           # le MIDI seul (à écouter dans VLC)
./render.sh boss_warlock.mid autre.sf2 # rendu avec une autre banque, pour écouter
python3 analyse.py boss_warlock.wav 144  # durée, crête, niveau, spectre
```

Prérequis : Python 3 et NumPy, VLC avec son module FluidSynth, FFmpeg.
Banque de rendu par défaut : MuseScore General (licence MIT) ; ne livrer
que des OGG rendus avec une banque libre (voir `ASSETS.md`).

## Fichiers

- `midi_kit.py` : écriture de fichiers MIDI, sans dépendance.
- `compose.py` : accords, progressions, mélodies, arpèges, batterie, échos...
- `motifs.py` : thème du Grimoire (menu), en mineur et en majeur.
- `render.sh` : rendu FluidSynth (VLC), bouclage et niveau (`finish.py`), OGG.
- `make_all.sh` : tout régénérer, avec le niveau de chaque morceau.
