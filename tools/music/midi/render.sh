#!/bin/sh
# Rendu d'un MIDI en OGG avec FluidSynth (via VLC) :
#   ./render.sh main_menu.mid [banque.sf2]
# Banque par défaut : MuseScore General (licence MIT, rendu publiable).
# Qualité Vorbis et fréquence : OGG_Q=1 OGG_RATE=32000 ./render.sh ...
# (32 kHz comme les autres musiques du jeu ; q0 ~ 50 kbit/s, q1 ~ 65, q2 ~ 80)
# La queue du rendu est repliée sur le début (boucle sans trou).
# Niveau : OGG_RMS=-20 (dB RMS visés, crête limitée à -1 dB) ; plus bas pour
# une ambiance discrète, plus haut pour un combat.
set -e
src="$1"
sf2="${2:-$HOME/Musique/soundfonts/MuseScore_General(v0.1.3).sf2}"
q="${OGG_Q:-1}"
rate="${OGG_RATE:-32000}"
level="${OGG_RMS:--20}"
base="${src%.mid}"
cvlc -q "--soundfont=$sf2" "$src" --sout "#transcode{acodec=s16l,channels=2,samplerate=44100}:std{access=file,mux=wav,dst=$base.wav}" vlc://quit >/dev/null 2>&1
python3 "$(dirname "$0")/finish.py" "$src" "$base.wav" "$level" >/dev/null
ffmpeg -v error -y -i "$base.wav" -ar "$rate" -c:a libvorbis -q:a "$q" "$base.ogg"
echo "$base.ogg : $(du -h "$base.ogg" | cut -f1), banque $(basename "$sf2")"
