#!/bin/sh
# Régénère tous les morceaux (MIDI + OGG) : ./make_all.sh
# ou seulement certains : ./make_all.sh boss_warlock mines_depths
# Niveau RMS de chaque morceau (dB) : plus bas pour les ambiances, plus haut
# pour les combats.
set -e
cd "$(dirname "$0")"
LEVELS="main_menu:-20 forest_night:-22
dungeon_gate:-20 dungeon_vaults:-21 dungeon_chains:-19
dungeon_crypt:-20 dungeon_ritual:-19 dungeon_requiem:-21 dungeon_gauntlet:-19
mines_depths:-22 mines_echoes:-21 mines_pit:-21
underwater_hunt:-19 boss_medusa:-18 treasure_guardian:-20
boss_warlock:-18 ending_homeward:-20
intro_wander:-21 intro_ambush:-20 intro_revenge:-19"
for entry in $LEVELS; do
    name=${entry%%:*}
    level=${entry#*:}
    if [ $# -gt 0 ] && ! echo " $* " | grep -q " $name "; then continue; fi
    python3 "make_$name.py"
    OGG_RMS=$level ./render.sh "$name.mid"
done
rm -rf __pycache__
