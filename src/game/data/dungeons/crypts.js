import { shops } from '../WORLD_DATA.shops.js';

// cryptes : plus grandes que les mines (6x6 pièces au lieu de 4x4 et 5x5)
export const crypts = [{
    generator: 'mines',
    options: '-ls2',
    textures: 't_crypt',
    flats: 'resources/gfx/textures/f_crypt.png',
    music: 'MUSIC_DUNGEON',
    visual: 'deeper',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_spider: {
            levels: [0, 1, 2, 3, 4]
        },
        m_zombie: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_skeleton: {
            levels: [6, 7, 8, 9, 10]
        }
    },
    shops: [shops.potions_1, shops.jewels_2b]
}, {
    generator: 'mines',
    options: '-ls2',
    textures: 't_crypt_2',
    flats: 'resources/gfx/textures/f_crypt_2.png',
    music: 'MUSIC_DUNGEON',
    visual: 'darker',
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
        m_zombie: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7]
        },
        m_skeleton: {
            levels: [3, 4, 5, 6, 7, 8, 9, 10]
        }
    },
    shops: [shops.firstaid_2, shops.blacksmith_3]
}, {
    generator: 'boss',
    options: '-ls1',
    textures: 't_crypt_2',
    flats: 'resources/gfx/textures/f_crypt_2.png',
    visual: 'darker',
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
        m_zombie_monarch: {
            levels: [10]
        }
    },
    shops: []
}];
