export const forest = [{
    generator: 'forest',
    options: '-ls1',
    textures: 't_forest',
    flats: 'resources/gfx/textures/f_forest1.png',
    // ciel (panorama de 360°), à ciel ouvert : pas de plafond
    sky: 'resources/gfx/textures/sky_night.png',
    ceiling: false,
    visual: 'forest',
    music: 'MUSIC_FOREST',
    level: 1,
    transit: {
        entrance: false
    },
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {
        m_myco: {
            levels: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        m_myco2: {
            levels: [5, 6, 7, 8, 9, 10]
        }
    },
    statics: {
        o_tree1: {
            levels: [0, 1]
        },
        o_tree2: {
            levels: [0, 1]
        }
    },
    shops: []
}, {
    generator: 'forest',
    options: '-w1',
    textures: 't_darkwoods',
    flats: 'resources/gfx/textures/f_forest2.png',
    // ciel (panorama de 360°), à ciel ouvert : pas de plafond
    sky: 'resources/gfx/textures/sky_night.png',
    ceiling: false,
    visual: 'darkfall',
    music: 'MUSIC_FOREST',
    level: 1,
    transit: {
        exit: ['d1', 0]
    },
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {},
    statics: {
        o_tree1b: {
            levels: [0, 1]
        },
        o_tree2b: {
            levels: [0, 1]
        }
    },
    shops: []
}];
