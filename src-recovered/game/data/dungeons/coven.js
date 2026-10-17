import { shops } from '../WORLD_DATA.shops.js';

// le cercle des sorcières : corbeaux et sorcières, la reine des sorcières au bout
// (générateur dungeon : magetower ne produit ni ascenseurs, ni monstres, ni torches)
export const coven = [{
    generator: 'dungeon',
    options: '-ls1-rs2',
    textures: 't_mozaic',
    flats: 'resources/gfx/textures/f_mozaic.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    music: 'MUSIC_DUNGEON',
    visual: 'dark',
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_raven: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        m_bat: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        m_witch: {
            levels: [6, 7, 8, 9, 10]
        },
        m_witch_dark: {
            levels: [6, 7, 8, 9, 10]
        }
    },
    shops: [shops.potions_1, shops.jewels_2b]
}, {
    generator: 'boss',
    options: '-d1',
    textures: 't_mozaic',
    flats: 'resources/gfx/textures/f_mozaic.png',
    // ciel vu par les fenêtres du bord de la carte
    sky: 'resources/gfx/textures/sky_night.png',
    music: 'MUSIC_BOSS_MEDUSA',
    visual: 'normal',
    // lumière ambiante (le visuel en donne une, mais les étages à torches
    // sont plafonnés à CONFIG.raycaster.torchLevelLight = 35) : plus haut = plus clair
    light: 120,
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_witch: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_witch_dark: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        m_witch_queen: {
            levels: [10]
        }
    },
    shops: []
}];
