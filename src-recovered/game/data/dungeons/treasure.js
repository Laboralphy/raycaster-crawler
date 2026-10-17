export const treasure = [{
    generator: 'special',
    options: '',
    textures: 't_treasure',
    flats: 'resources/gfx/textures/f_treasure.png',
    visual: 'darkbrown',
    music: 'MUSIC_TREASURE',
    transit: {
        entrance: ['d2', 1, 1],
        exit: false
    },
    level: 1,
    loot: {
        chest: 'basic_chest',
        closet: 'basic_closet',
        bigchest: 'basic_bigchest'
    },
    horde: {},
    shops: []
}];
