import { LABY } from '../LABY.js';
import { MapTranslater } from '../../../libraries/O876/MapTranslater.js';

export const medusa = [{
    generator: 'cave',
    map: MapTranslater.process(['#########################', '####################..###', '###########..o#####....##', '####<#####..............#', '###waw###....###?###.o..#', '#..-[-..##..###.?.##....#', '#.......###o###$!.#....##', '#.......###.#####$#...###', '####.######[########.####', '####[####.......####...##', '####...##.......##......#', '####....#..-]-..#o......#', '###.....###wbw###.......#', '###.#.o#####>####.......#', '###o#.############.....##', '###.#.$############..####', '###.#.#############..####', '##..#######...#####...###', '#....#####.....###.....##', '#....#####.....o........#', '#..o..####.........o....#', '#...............#.......#', '#......###......##......#', '##.....####....####....##', '#########################'], {
        '.': LABY.BLOCK_VOID,
        '#': LABY.BLOCK_WALL,
        '$': LABY.BLOCK_TREASURE,
        '?': LABY.BLOCK_SECRET,
        '!': LABY.BLOCK_SECRET_WALL,
        'w': LABY.BLOCK_ELEVATOR_WALL,
        '[': LABY.BLOCK_ELEVATOR_DOOR_PREV,
        '<': LABY.BLOCK_ELEVATOR_SWITCH_PREV,
        'b': LABY.BLOCK_ELEVATOR_EXIT,
        'a': LABY.BLOCK_ELEVATOR_ENTRANCE,
        '-': LABY.BLOCK_ELEVATOR_DOORWAY_X,
        ']': LABY.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED,
        '>': LABY.BLOCK_ELEVATOR_SWITCH_NEXT,
        'o': LABY.BLOCK_SOB_TYPE_1
    }),
    options: '',
    textures: 't_graywater',
    flats: 'resources/gfx/textures/f_water.png',
    torch: 'o_underwater_light',
    visual: 'valvewater',
    music: 'MUSIC_DUNGEON',
    level: 1,
    transit: {
        entrance: false
    },
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {},
    statics: {
        o_bubbles: {
            levels: [0, 1, 2, 3, 4]
        }
    },
    shops: []
}, {
    generator: 'cave',
    options: '-ls1-d1',
    textures: 't_water',
    flats: 'resources/gfx/textures/f_water.png',
    torch: 'o_underwater_light',
    visual: 'underwater',
    music: 'MUSIC_UNDERWATER',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_pira: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        m_zombie_drowned: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        m_medusa: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
    },
    statics: {
        o_bubbles: {
            levels: [0, 1, 2, 3, 4]
        }
    },
    shops: []
}, {
    generator: 'boss',
    options: '-d1',
    textures: 't_water',
    flats: 'resources/gfx/textures/f_water.png',
    torch: 'o_underwater_light',
    visual: 'underwater',
    music: 'MUSIC_BOSS_MEDUSA',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_medusa: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_medusaqueen: {
            levels: [10]
        }
    },
    statics: {
        o_bubbles: {
            levels: [0, 1, 2, 3, 4]
        }
    },
    shops: []
}];
