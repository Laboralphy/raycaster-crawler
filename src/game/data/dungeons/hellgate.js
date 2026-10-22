import { LABY } from '../LABY.js';
import { shops } from '../WORLD_DATA.shops.js';

// porte de l'enfer : on y arrive par le portail de la salle au trésor.
// Petite salle d'arrivée, pont au-dessus du vide, grande salle avec deux
// magasins, sortie vers le donjon infernal. Pas de monstres.
//
// Carte fixe, une lettre par case (voir HELLGATE_LEGEND) ; la carte doit
// être carrée. Le vide (~) et le ciel du pont sont faits par le
// LevelProcessor HellgateBridge (levels/HellgateBridge.js).
const HELLGATE_LEGEND = {
    '#': LABY.BLOCK_WALL,
    '.': LABY.BLOCK_VOID,
    '~': LABY.BLOCK_ABYSS,               // le vide autour du pont
    'S': LABY.BLOCK_SHOP,
    // ascenseur d'entrée (retour au portail de la salle au trésor)
    'E': LABY.BLOCK_ELEVATOR_ENTRANCE,
    'p': LABY.BLOCK_ELEVATOR_DOOR_PREV,
    '<': LABY.BLOCK_ELEVATOR_SWITCH_PREV,
    // ascenseur de sortie
    'X': LABY.BLOCK_ELEVATOR_EXIT,
    'n': LABY.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED,
    '>': LABY.BLOCK_ELEVATOR_SWITCH_NEXT,
    'w': LABY.BLOCK_ELEVATOR_WALL,
    'y': LABY.BLOCK_ELEVATOR_DOORWAY_Y,
    '|': LABY.BLOCK_DOOR,
    'T': LABY.BLOCK_TORCH_N,
    'U': LABY.BLOCK_TORCH_S,
    'W': LABY.BLOCK_WINDOW,              // fenêtre sur le vide
    '?': LABY.BLOCK_SECRET,
    '!': LABY.BLOCK_SECRET_WALL,
    '/': LABY.BLOCK_HELL_FENCE
};

const HELLGATE_MAP = [
    '~~~~~~~~~~~~~~~~#########',
    '~~~~~~~~~~~~~~~~######S##',
    '~~~~~~~~~~~~~~~~####.T..#',
    '~~~~~~~~~~~~~~~~###!....#',
    '~~~~~~~~~~~~~~~~###?....#',
    '~~~~~~~~~~~~~~~~###?#####',
    '~~~~~~~~~~~~~~~~#.T.T.###',
    '~~~~~~~~~~~~~~~~#.....###',
    '~~~~~~~~~~~~~~~~#.#.#.###',
    '####W##W#~~~~~~~#.....###',
    '###.....#~~~~~~~#.....###',
    '#wy.....#///////#.....yw#',
    '<Ep.....|.......|.....nX>',
    '#wy.....#///////#.....yw#',
    '###.....#~~~~~~~#.....###',
    '####W##W#~~~~~~~#.....###',
    '~~~~~~~~~~~~~~~~#.#.#.###',
    '~~~~~~~~~~~~~~~~#.....###',
    '~~~~~~~~~~~~~~~~#.U.U.###',
    '~~~~~~~~~~~~~~~~###?#####',
    '~~~~~~~~~~~~~~~~###?....#',
    '~~~~~~~~~~~~~~~~###!....#',
    '~~~~~~~~~~~~~~~~####.U..#',
    '~~~~~~~~~~~~~~~~######S##',
    '~~~~~~~~~~~~~~~~#########'
];

export const hellgate = [{
    map: HELLGATE_MAP.map((s) => Array.from(s, (c) => HELLGATE_LEGEND[c])),
    textures: 't_gothic',
    flats: 'resources/gfx/textures/f_gothic.png',
    sky: 'resources/gfx/textures/sky_hell.png',
    visual: 'hellkeep',
    music: 'MUSIC_DUNGEON',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {},
    shops: [shops.potions_3, shops.jewels_2r]
}];
