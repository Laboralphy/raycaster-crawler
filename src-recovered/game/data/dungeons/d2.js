import { shops } from '../WORLD_DATA.shops.js';

// fin du donjon : on y revient du donjon infernal ; le boss mène au trésor
export const d2 = [{
    generator: 'dungeon',
    options: '-ts3-rs1-t1',
    textures: 't_crimson',
    flats: 'resources/gfx/textures/f_red.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    visual: 'hellish',
    music: 'MUSIC_DUNGEON',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_bigarmor: {
            levels: [0, 1, 2, 3, 4, 5, 6]
        },
        m_skeleton: {
            levels: [0, 1, 2, 3, 4, 5, 6]
        },
        m_fireblob: {
            levels: [3, 4, 5, 6, 7, 8, 9]
        },
        m_warlock: {
            levels: [7, 8, 9, 10]
        },
        m_pumpkin: {
            levels: [9, 10]
        }
    },
    shops: [shops.potions_3, shops.firstaid_2, shops.firstaid_2]
}, {
    generator: 'boss',
    options: '',
    textures: 't_crimson',
    flats: 'resources/gfx/textures/f_red.png',
    visual: 'hellish',
    music: 'MUSIC_BOSS',
    transit: {
        exit: ['treasure', 0, 0]
    },
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_warlock: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_warlock2: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_warlockboss: {
            levels: [10]
        }
    },
    shops: []
}];
