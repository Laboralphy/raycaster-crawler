import { shops } from '../WORLD_DATA.shops.js';

// donjon infernal : chevaliers, succubes, cubes ; le chevalier noir au bout
export const hellkeep = [{
    generator: 'dungeon',
    options: '-ls2',
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
    horde: {
        m_succubus: {
            levels: [0, 1, 2, 3, 4, 5, 6]
        },
        m_cube: {
            levels: [3, 4, 5, 6, 7, 8, 9]
        },
        m_bigarmor: {
            levels: [5, 6, 7, 8, 9, 10]
        }
    },
    shops: [shops.potions_3, shops.firstaid_2]
}, {
    generator: 'dungeon',
    options: '-ls2-rs1',
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
    horde: {
        m_bigarmor: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        m_succubus: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_cube: {
            levels: [6, 7, 8, 9, 10]
        }
    },
    shops: [shops.firstaid_2, shops.magic_2]
}, {
    generator: 'boss',
    options: '-ls1',
    textures: 't_gothic',
    flats: 'resources/gfx/textures/f_gothic.png',
    sky: 'resources/gfx/textures/sky_hell.png',
    visual: 'hellkeep',
    music: 'MUSIC_BOSS',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_succubus: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_bigarmorboss: {
            levels: [10]
        }
    },
    shops: []
}];
