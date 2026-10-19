#!/bin/sh
# Rendu d'un MIDI en OGG avec FluidSynth :
#   ./render.sh main_menu.mid [banque.sf2]
# Banque par défaut : GeneralUser GS (celle des OGG du jeu, rendu publiable) ;
# ou SF2=banque.sf2. Suffixe des fichiers produits, pour comparer des banques :
# SUFFIX=.gu ./render.sh main_menu.mid -> main_menu.gu.ogg
# Qualité Vorbis et fréquence : OGG_Q=1 OGG_RATE=32000 ./render.sh ...
# (32 kHz comme les autres musiques du jeu ; q0 ~ 50 kbit/s, q1 ~ 65, q2 ~ 80)
# La queue du rendu est repliée sur le début (boucle sans trou).
# Niveau : OGG_RMS=-20 (dB RMS visés, crête limitée à -1 dB) ; plus bas pour
# une ambiance discrète, plus haut pour un combat.
# Pièce sans boucle : NOLOOP=1 (la queue est gardée, pas repliée).
set -e
src="$1"
# GeneralUser GS, sous son nom d'origine (espaces) ou celui du paquet (tirets bas)
gu="$HOME/Musique/soundfonts/GeneralUser GS v1.471.sf2"
[ -f "$gu" ] || gu="$HOME/Musique/soundfonts/GeneralUser_GS_v1.471.sf2"
sf2="${2:-${SF2:-$gu}}"
q="${OGG_Q:-1}"
rate="${OGG_RATE:-32000}"
level="${OGG_RMS:--20}"
base="${src%.mid}${SUFFIX}"
[ -f "$sf2" ] || { echo "banque introuvable : $sf2" >&2; exit 1; }
fluidsynth -ni -q -F "$base.wav" -r 44100 -g 0.5 "$sf2" "$src" >/dev/null 2>&1
python3 "$(dirname "$0")/finish.py" "$src" "$base.wav" "$level" ${NOLOOP:+noloop} >/dev/null
ffmpeg -v error -y -i "$base.wav" -ar "$rate" -c:a libvorbis -q:a "$q" "$base.ogg"
echo "$base.ogg : $(du -h "$base.ogg" | cut -f1), banque $(basename "$sf2")"
