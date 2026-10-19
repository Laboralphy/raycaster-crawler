"""Thème du Grimoire (celui du menu), repris comme leitmotiv.

En ré mineur pour le menu et le combat contre le sorcier, en ré majeur pour
le retour triomphal. Une liste par mesure de (hauteur, durée en temps).
"""

THEME_CHORDS = ['Dm', 'Bb', 'Gm', 'A', 'Gm', 'Dm|A', 'Eb', 'Dm']
THEME = [
    [('D4', 2), ('A4', 1.5), ('G4', .5)],
    [('F4', 1), ('E4', .5), ('F4', .5), ('D4', 2)],
    [('A3', 1), ('D4', 1), ('F4', 1), ('G4', 1)],
    [('A4', 3), ('Bb4', .5), ('A4', .5)],
    [('G4', 2), ('F4', 1), ('E4', 1)],
    [('F4', 1.5), ('E4', .5), ('D4', 1), ('C#4', 1)],
    [('Bb3', 1), ('Eb4', 1), ('G4', 1), ('F4', .5), ('Eb4', .5)],
    [('D4', 4)],
]
ANSWER_CHORDS = ['Dm', 'F', 'Gm', 'A', 'Bb', 'A', 'Gm', 'A']
ANSWER = [
    [('A4', 2), ('D5', 2)],
    [('C5', 1.5), ('Bb4', .5), ('A4', 2)],
    [('Bb4', 1), ('A4', 1), ('G4', 1), ('F4', 1)],
    [('E4', 3), ('A4', 1)],
    [('D5', 1.5), ('E5', .5), ('F5', 2)],
    [('E5', 1), ('D5', 1), ('C#5', 2)],
    [('D5', 1), ('C5', 1), ('Bb4', 1), ('G4', 1)],
    [('A4', 4)],
]

# version majeure (fin du jeu)
THEME_MAJOR_CHORDS = ['D', 'Bm', 'D', 'A', 'Em', 'D|A', 'Em|A', 'D']
THEME_MAJOR = [
    [('D4', 2), ('A4', 1.5), ('G4', .5)],
    [('F#4', 1), ('E4', .5), ('F#4', .5), ('D4', 2)],
    [('A3', 1), ('D4', 1), ('F#4', 1), ('G4', 1)],
    [('A4', 3), ('B4', .5), ('A4', .5)],
    [('G4', 2), ('F#4', 1), ('E4', 1)],
    [('F#4', 1.5), ('E4', .5), ('D4', 1), ('C#4', 1)],
    [('B3', 1), ('E4', 1), ('G4', 1), ('F#4', .5), ('E4', .5)],
    [('D4', 4)],
]
ANSWER_MAJOR_CHORDS = ['D', 'A', 'G', 'A', 'D', 'A', 'G', 'A']
ANSWER_MAJOR = [
    [('A4', 2), ('D5', 2)],
    [('C#5', 1.5), ('B4', .5), ('A4', 2)],
    [('B4', 1), ('A4', 1), ('G4', 1), ('F#4', 1)],
    [('E4', 3), ('A4', 1)],
    [('D5', 1.5), ('E5', .5), ('F#5', 2)],
    [('E5', 1), ('D5', 1), ('C#5', 2)],
    [('D5', 1), ('C#5', 1), ('B4', 1), ('G4', 1)],
    [('A4', 4)],
]

# Thème de l'aventurier (cinématique d'introduction) : insouciant en ré
# mixolydien (do naturel) pendant la promenade, puis en ré mineur, héroïque,
# quand il jure de se venger. Même contour dans les deux modes.
HERO_CHORDS = ['D', 'G|D', 'Em|D', 'A|D']
HERO = [
    [('D4', 1), ('F#4', .5), ('A4', .5), ('D5', 1.5), ('C5', .5)],
    [('B4', 1), ('A4', .5), ('G4', .5), ('A4', 2)],
    [('G4', .5), ('F#4', .5), ('E4', 1), ('F#4', .5), ('G4', .5), ('A4', 1)],
    [('E4', 1.5), ('F#4', .5), ('D4', 2)],
]
HERO_MINOR_CHORDS = ['Dm', 'Bb|F', 'Gm|Dm', 'A|Dm']
HERO_MINOR = [
    [('D4', 1), ('F4', .5), ('A4', .5), ('D5', 1.5), ('C5', .5)],
    [('Bb4', 1), ('A4', .5), ('G4', .5), ('A4', 2)],
    [('G4', .5), ('F4', .5), ('E4', 1), ('F4', .5), ('G4', .5), ('A4', 1)],
    [('E4', 1.5), ('F4', .5), ('D4', 2)],
]
