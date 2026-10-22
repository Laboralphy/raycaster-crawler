import { shops } from '../WORLD_DATA.shops.js';

export const d1 = [{
    generator: 'dungeon',
    options: '',
    textures: 't_gray',
    flats: 'resources/gfx/textures/f_gray.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    visual: 'dark',
    music: 'MUSIC_DUNGEON',
    level: 1,
    transit: {
        entrance: ['forest', 1, 2]
    },
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_goblin: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_wasp: {
            levels: [4, 5, 6, 7, 8, 9]
        },
        m_goblin_warrior: {
            levels: [7, 8, 9, 10]
        }
    },
    shops: []
}, {
    generator: 'dungeon',
    options: '-rs1-ls1',
    textures: 't_blue',
    flats: 'resources/gfx/textures/f_blue.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    visual: 'darkblue',
    music: 'MUSIC_DUNGEON',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_goblin: {
            levels: [0, 1, 2, 3, 4, 5, 6]
        },
        m_goblin_warrior: {
            levels: [3, 4, 5, 6, 7, 8, 9, 10]
        },
        m_acidblob: {
            levels: [2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_wasp: {
            levels: [7, 8, 9]
        }
    },
    shops: [shops.firstaid_2, shops.magic_2]
}, {
    generator: 'dungeon',
    options: '-ls2',
    textures: 't_green',
    flats: 'resources/gfx/textures/f_green.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    visual: 'darkgreen',
    music: 'MUSIC_DUNGEON',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_myco3: {
            levels: [0, 1, 2, 3, 4, 5, 6]
        },
        m_wasp: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        m_acidblob: {
            levels: [3, 4, 5, 6, 7, 8, 9]
        },
        m_imp1: {
            levels: [7, 8, 9, 10]
        },
        m_imp2: {
            levels: [7, 8, 9, 10]
        }
    },
    shops: [shops.jewels_2, shops.potions_1]
}, {
    generator: 'dungeon',
    options: '-ls2-rs1',
    textures: 't_iron',
    flats: 'resources/gfx/textures/f_gray.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    visual: 'dark',
    music: 'MUSIC_DUNGEON',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_raven: {
            levels: [0, 1, 2, 3, 4, 5, 6]
        },
        m_fireblob: {
            levels: [7, 8, 9]
        },
        m_turret: {
            levels: [3, 4, 5, 6]
        },
        m_cube: {
            levels: [7, 8, 9, 10]
        }
    },
    shops: [shops.potions_2, shops.jewels_2r]
}];
