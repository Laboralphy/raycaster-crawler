import { shops } from '../WORLD_DATA.shops.js';

export const mines = [{
    generator: 'mines',
    options: '',
    textures: 't_mines3',
    flats: 'resources/gfx/textures/f_mine.png',
    visual: 'deeper',
    music: 'MUSIC_MINES',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_spider: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_skeleton: {
            levels: [3, 4, 5, 6, 7, 8, 9]
        },
        m_imp1: {
            levels: [7, 8, 9, 10]
        }
    },
    shops: [shops.potions_1, shops.jewels_2b]
}, {
    generator: 'mines',
    options: '-ls1',
    textures: 't_mines2',
    flats: 'resources/gfx/textures/f_mine.png',
    visual: 'deeper',
    music: 'MUSIC_MINES',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_skeleton: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_imp1: {
            levels: [3, 4, 5, 6, 7, 8, 9]
        },
        m_cube: {
            levels: [7, 8, 9, 10]
        },
        m_imp2: {
            levels: [7, 8, 9, 10]
        }
    },
    shops: [shops.firstaid_2, shops.blacksmith_3]
}, {
    generator: 'boss',
    options: '',
    textures: 't_mines',
    flats: 'resources/gfx/textures/f_mine.png',
    visual: 'deeper',
    music: 'MUSIC_BOSS',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_zombie: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_skeleton: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_golem: {
            levels: [10]
        }
    },
    shops: []
}];
