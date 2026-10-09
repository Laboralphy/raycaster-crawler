import { LABY } from './LABY.js';

export const GFX_DATA = {
    tiles: {
        o_lootbag: {
            src: 'resources/gfx/sprites/o_lootbags.png',
            width: 32,
            height: 96,
            frames: 5,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ],
                [
                    [1, 1, 1, 1, 1, 1, 1, 1], 1, 1, 0
                ],
                [
                    [2, 2, 2, 2, 2, 2, 2, 2], 1, 1, 0
                ],
                [
                    [3, 3, 3, 3, 3, 3, 3, 3], 1, 1, 0
                ],
                [
                    [4, 4, 4, 4, 4, 4, 4, 4], 1, 1, 0
                ]
            ]
        },
        o_boom: {
            src: 'resources/gfx/sprites/o_boom.png',
            width: 64,
            height: 96,
            frames: 7,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 7, 100, 0
                ]
            ]
        },
        o_teleport: {
            src: 'resources/gfx/sprites/o_teleport.png',
            width: 64,
            height: 96,
            frames: 8,
            noshading: true,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 8, 100, 0
                ]
            ]
        },
        o_tome: {
            src: 'resources/gfx/sprites/o_tome.png',
            width: 32,
            height: 64,
            frames: 8,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 8, 100, 1
                ]
            ]
        },
        o_chicken: {
            src: 'resources/gfx/sprites/o_chicken.png',
            width: 24,
            height: 96,
            frames: 4,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 2, 500, 1
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 2, 250, 1
                ],
                [
                    [2, 2, 2, 2, 2, 2, 2, 2], 2, 500, 1
                ],
                [
                    [2, 2, 2, 2, 2, 2, 2, 2], 2, 250, 1
                ]
            ]
        },
        o_bubbles: {
            src: 'resources/gfx/sprites/o_bubbles.png',
            width: 40,
            height: 96,
            frames: 4,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 4, 100, 1
                ]
            ]
        },
        o_tree1: {
            src: 'resources/gfx/sprites/o_tree1.png',
            width: 64,
            height: 96,
            frames: 1,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        o_tree2: {
            src: 'resources/gfx/sprites/o_tree2.png',
            width: 64,
            height: 96,
            frames: 1,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        o_tree1b: {
            src: 'resources/gfx/sprites/o_tree1b.png',
            width: 64,
            height: 96,
            frames: 1,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        o_tree2b: {
            src: 'resources/gfx/sprites/o_tree2b.png',
            width: 64,
            height: 96,
            frames: 1,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        o_tree1v: {
            src: 'resources/gfx/sprites/o_tree1v.png',
            width: 64,
            height: 96,
            frames: 1,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        o_tree2v: {
            src: 'resources/gfx/sprites/o_tree2v.png',
            width: 64,
            height: 96,
            frames: 1,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        e_hazes: {
            src: 'resources/gfx/sprites/e_hazes.png',
            width: 16,
            height: 24,
            frames: 12,
            noshading: true,
            animations: []
        },
        i_icons: {
            src: 'resources/gfx/icons/icons.png',
            width: 48,
            height: 48,
            frames: 1,
            noshading: true,
            animations: []
        },
        i_digits: {
            src: 'resources/gfx/icons/digits.png',
            width: 8,
            height: 8,
            frames: 19,
            noshading: true,
            animations: []
        },
        d_title: {
            src: 'resources/gfx/icons/title_128.png',
            width: 352,
            height: 128,
            frames: 1,
            noshading: true,
            animations: []
        },
        d_pictures: {
            src: 'resources/gfx/textures/d_pictures.png',
            width: 32,
            height: 32,
            frames: 45,
            animations: []
        },
        p_firebolt: {
            src: 'resources/gfx/sprites/p_firebolt.png',
            width: 48,
            height: 64,
            frames: 11,
            animations: [
                [
                    [8, 8, 8, 8, 8, 8, 8, 8], 3, 100, 0
                ],
                [
                    [4, 5, 6, 7, 0, 1, 2, 3], 1, 1, 0
                ]
            ]
        },
        p_fireball: {
            src: 'resources/gfx/sprites/p_fireball.png',
            width: 50,
            height: 64,
            frames: 20,
            animations: [
                [
                    [16, 16, 16, 16, 16, 16, 16, 16], 4, 100, 0
                ],
                [
                    [8, 10, 12, 14, 0, 2, 4, 6], 2, 100, 1
                ]
            ]
        },
        p_toxicbolt: {
            src: 'resources/gfx/sprites/p_toxicbolt.png',
            width: 50,
            height: 64,
            frames: 20,
            animations: [
                [
                    [16, 16, 16, 16, 16, 16, 16, 16], 4, 100, 0
                ],
                [
                    [8, 10, 12, 14, 0, 2, 4, 6], 2, 100, 1
                ]
            ]
        },
        p_toxicspit: {
            src: 'resources/gfx/sprites/p_toxicspit.png',
            width: 64,
            height: 56,
            frames: 7,
            animations: [
                [
                    [2, 2, 2, 2, 2, 2, 2, 2], 3, 100, 0
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 2, 200, 1
                ]
            ]
        },
        p_thunbolt: {
            src: 'resources/gfx/sprites/p_thunbolt.png',
            width: 64,
            height: 96,
            frames: 15,
            animations: [
                [
                    [10, 10, 10, 10, 10, 10, 10, 10], 5, 100, 0
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 8, 50, 1
                ]
            ]
        },
        p_magbolt: {
            src: 'resources/gfx/sprites/p_magbolt.png',
            width: 48,
            height: 64,
            frames: 14,
            animations: [
                [
                    [8, 8, 8, 8, 8, 8, 8, 8], 6, 100, 0
                ],
                [
                    [4, 5, 6, 7, 0, 1, 2, 3], 1, 0, 0
                ]
            ]
        },
        p_shadbolt: {
            src: 'resources/gfx/sprites/p_shadbolt.png',
            width: 48,
            height: 64,
            frames: 14,
            animations: [
                [
                    [8, 8, 8, 8, 8, 8, 8, 8], 6, 100, 0
                ],
                [
                    [4, 5, 6, 7, 0, 1, 2, 3], 1, 0, 0
                ]
            ]
        },
        p_healbolt: {
            src: 'resources/gfx/sprites/p_healbolt.png',
            width: 48,
            height: 64,
            frames: 14,
            animations: [
                [
                    [8, 8, 8, 8, 8, 8, 8, 8], 6, 100, 0
                ],
                [
                    [4, 5, 6, 7, 0, 1, 2, 3], 1, 50, 0
                ]
            ]
        },
        p_icebolt: {
            src: 'resources/gfx/sprites/p_icebolt.png',
            width: 48,
            height: 64,
            frames: 30,
            animations: [
                [
                    [24, 24, 24, 24, 24, 24, 24, 24], 6, 100, 0
                ],
                [
                    [12, 15, 18, 21, 0, 3, 6, 9], 3, 150, 1
                ]
            ]
        },
        p_medbolt: {
            src: 'resources/gfx/sprites/p_medbolt.png',
            width: 48,
            height: 64,
            frames: 30,
            animations: [
                [
                    [24, 24, 24, 24, 24, 24, 24, 24], 6, 100, 0
                ],
                [
                    [12, 15, 18, 21, 0, 3, 6, 9], 3, 150, 1
                ]
            ]
        },
        p_lightbolt: {
            src: 'resources/gfx/sprites/p_lightbolt.png',
            width: 64,
            height: 96,
            frames: 6,
            animations: [
                [
                    [4, 4, 4, 4, 4, 4, 4, 4], 3, 100, 0
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 3, 50, 1
                ]
            ]
        },
        p_iceball: {
            src: 'resources/gfx/sprites/p_iceball.png',
            width: 64,
            height: 80,
            frames: 5,
            animations: [
                [
                    [1, 1, 1, 1, 1, 1, 1, 1], 4, 100, 0
                ],
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 1, 1, 0
                ]
            ]
        },
        p_slash: {
            src: 'resources/gfx/sprites/p_slash.png',
            width: 64,
            height: 64,
            frames: 4,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 4, 100, 0
                ],
                [
                    [3, 3, 3, 3, 3, 3, 3, 3], 1, 0, 0
                ]
            ]
        },
        p_expfire: {
            src: 'resources/gfx/sprites/p_expfire.png',
            width: 64,
            height: 96,
            frames: 9,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 8, 100, 0
                ],
                [
                    [8, 8, 8, 8, 8, 8, 8, 8], 1, 0, 0
                ]
            ]
        },
        p_exptoxic: {
            src: 'resources/gfx/sprites/p_exptoxic.png',
            width: 64,
            height: 96,
            frames: 9,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 8, 100, 0
                ],
                [
                    [8, 8, 8, 8, 8, 8, 8, 8], 1, 0, 0
                ]
            ]
        },
        p_deathspell: {
            src: 'resources/gfx/sprites/p_deathspell.png',
            width: 64,
            height: 96,
            frames: 10,
            animations: [
                [
                    [0, 0, 0, 0, 0, 0, 0, 0], 9, 100, 0
                ],
                [
                    [9, 9, 9, 9, 9, 9, 9, 9], 1, 1, 0
                ]
            ]
        },
        w_wands: {
            src: 'resources/gfx/sprites/w_wands.png',
            width: 32,
            height: 60,
            frames: 18,
            noshading: true,
            animations: []
        },
        w_daggers: {
            src: 'resources/gfx/sprites/w_daggers.png',
            width: 32,
            height: 64,
            frames: 24,
            noshading: true,
            animations: []
        }
    },
    textures: {
        t_intro: {
            src: 'resources/gfx/textures/t_gray.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_forest: {
            src: 'resources/gfx/textures/t_forest1.png',
            codes: LABY.MAPS.forest.codes,
            metacodes: LABY.MAPS.forest.metacodes
        },
        t_darkwoods: {
            src: 'resources/gfx/textures/t_forest2.png',
            codes: LABY.MAPS.forestwall.codes,
            metacodes: LABY.MAPS.forestwall.metacodes
        },
        t_gray: {
            src: 'resources/gfx/textures/t_gray.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_purple: {
            src: 'resources/gfx/textures/t_mozaic.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_brown: {
            src: 'resources/gfx/textures/t_brown.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_blue: {
            src: 'resources/gfx/textures/t_blue.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_green: {
            src: 'resources/gfx/textures/t_green.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_mines: {
            src: 'resources/gfx/textures/t_mines1.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_mines2: {
            src: 'resources/gfx/textures/t_mines2.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_mines3: {
            src: 'resources/gfx/textures/t_mines3.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_crimson: {
            src: 'resources/gfx/textures/t_crimson.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_golden: {
            src: 'resources/gfx/textures/t_golden.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_treasure: {
            src: 'resources/gfx/textures/t_treasure.png',
            codes: LABY.MAPS.treasure.codes,
            metacodes: LABY.MAPS.treasure.metacodes
        },
        t_brass: {
            src: 'resources/gfx/textures/t_brass.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_iron: {
            src: 'resources/gfx/textures/t_iron.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_fire: {
            src: 'resources/gfx/textures/t_fire.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_magic: {
            src: 'resources/gfx/textures/t_magic.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_water: {
            src: 'resources/gfx/textures/t_water.png',
            codes: LABY.MAPS.normal.codes,
            metacodes: LABY.MAPS.normal.metacodes
        },
        t_graywater: {
            src: 'resources/gfx/textures/t_graywater.png',
            codes: LABY.MAPS.underwater.codes,
            metacodes: LABY.MAPS.underwater.metacodes
        },
        t_credits: {
            src: 'resources/gfx/textures/t_credits.png',
            codes: [
                [0, 0],
                [1, 1],
                [6, 6],
                [7, 7],
                [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
                [8, 8],
                [9, 9],
                [10, 10],
                [11, 11],
                [12, 12],
                [13, 13],
                [14, 14],
                [15, 15],
                [16, 16],
                [21, 21],
                [22, 22],
                [17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20],
                [23, 23],
                [24, 24],
                [25, 25],
                [26, 26],
                [27, 27],
                [28, 28],
                [29, 29],
                [30, 30],
                [31, 31],
                [36, 36],
                [37, 37],
                [32, 32, 32, 32, 33, 33, 33, 33, 34, 34, 34, 34, 35, 35, 35, 35],
                [38, 38],
                [39, 39],
                [40, 40],
                [41, 41],
                [42, 42],
                [43, 43],
                [44, 44],
                [45, 45],
                [46, 46],
                [47, 47],
                [48, 48]
            ],
            metacodes: {
                ' ': 0,
                'A': [0x100, 0x101],
                'B': [0x100902, 0x100903],
                'C': 0x200A05,
                'D': 0x104,
                'E': [0x106, 0x107, 0x108, 0x109, 0x10A, 0x10B, 0x10C, 0x10D],
                'F': [0x10090E, 0x10090F],
                'G': 0x200A11,
                'H': 0x110,
                'I': [0x112, 0x113, 0x114, 0x115, 0x116, 0x117, 0x118, 0x119],
                'J': [0x10091A, 0x10091B],
                'K': 0x200A1D,
                'L': 0x11C,
                'M': [0x11E, 0x11F, 0x120, 0x121, 0x122, 0x123, 0x124, 0x125],
                'N': [0x200A26, 0x200A27]
            }
        }
    },
    visuals: {
        dark: {
            ceilColor: {
                r: 64,
                g: 64,
                b: 64
            },
            floorColor: {
                r: 128,
                g: 128,
                b: 128
            },
            filter: false,
            light: 200,
            fogDistance: 1,
            fogColor: {
                r: 0,
                g: 0,
                b: 0
            }
        },
        darkbrown: {
            ceilColor: {
                r: 64,
                g: 48,
                b: 32
            },
            floorColor: {
                r: 128,
                g: 96,
                b: 64
            },
            filter: {
                r: 1.3,
                g: 1,
                b: 0.8
            },
            light: 200,
            fogDistance: 1,
            fogColor: {
                r: 12,
                g: 8,
                b: 4
            }
        },
        darkpurple: {
            ceilColor: {
                r: 48,
                g: 32,
                b: 64
            },
            floorColor: {
                r: 96,
                g: 64,
                b: 128
            },
            filter: {
                r: 1,
                g: 0.8,
                b: 1.3
            },
            light: 200,
            fogDistance: 1,
            fogColor: {
                r: 8,
                g: 4,
                b: 12
            }
        },
        darkblue: {
            ceilColor: {
                b: 64,
                g: 48,
                r: 32
            },
            floorColor: {
                b: 128,
                g: 96,
                r: 64
            },
            filter: {
                b: 1.3,
                g: 1,
                r: 0.8
            },
            light: 200,
            fogDistance: 1,
            fogColor: {
                b: 12,
                g: 8,
                r: 4
            }
        },
        forest: {
            ceilColor: {
                b: 0,
                g: 0,
                r: 0
            },
            floorColor: {
                b: 32,
                g: 48,
                r: 32
            },
            filter: false,
            light: 50,
            fogDistance: 0.7,
            fogColor: {
                b: 10,
                g: 16,
                r: 10
            }
        },
        darkgreen: {
            ceilColor: {
                r: 20,
                g: 48,
                b: 8
            },
            floorColor: {
                b: 64,
                g: 128,
                r: 64
            },
            filter: {
                b: 0.8,
                g: 1.3,
                r: 0.8
            },
            light: 100,
            fogDistance: 1,
            fogColor: {
                b: 5,
                g: 12,
                r: 5
            }
        },
        darkfall: {
            ceilColor: {
                r: 0,
                g: 0,
                b: 0
            },
            floorColor: {
                r: 96,
                g: 96,
                b: 64
            },
            filter: {
                r: 1.3,
                g: 1,
                b: 0.8
            },
            light: 50,
            fogDistance: 0.7,
            fogColor: {
                r: 24,
                g: 20,
                b: 10
            }
        },
        lightgreen: {
            ceilColor: {
                b: 64,
                g: 128,
                r: 64
            },
            floorColor: {
                b: 64,
                g: 128,
                r: 64
            },
            filter: false,
            light: 100,
            fogDistance: 1,
            fogColor: {
                b: 16,
                g: 32,
                r: 16
            }
        },
        darker: {
            ceilColor: {
                r: 64,
                g: 64,
                b: 64
            },
            floorColor: {
                r: 128,
                g: 128,
                b: 128
            },
            filter: false,
            light: 50,
            fogDistance: 0.75,
            fogColor: {
                r: 0,
                g: 0,
                b: 0
            }
        },
        deeper: {
            ceilColor: {
                r: 64,
                g: 48,
                b: 32
            },
            floorColor: {
                r: 128,
                g: 96,
                b: 64
            },
            filter: false,
            light: 50,
            fogDistance: 0.75,
            fogColor: {
                r: 0,
                g: 0,
                b: 0
            }
        },
        hellish: {
            ceilColor: {
                r: 64,
                g: 48,
                b: 32
            },
            floorColor: {
                r: 128,
                g: 96,
                b: 64
            },
            filter: {
                r: 1.2,
                g: 0.8,
                b: 0.8
            },
            light: 100,
            fogDistance: 0.75,
            fogColor: {
                r: 8,
                g: 1,
                b: 1
            }
        },
        darkest: {
            ceilColor: {
                r: 64,
                g: 64,
                b: 64
            },
            floorColor: {
                r: 128,
                g: 128,
                b: 128
            },
            filter: false,
            light: 10,
            fogDistance: 0.05,
            fogColor: {
                r: 0,
                g: 0,
                b: 0
            }
        },
        sunset: {
            ceilColor: {
                r: 100,
                g: 64,
                b: 32
            },
            floorColor: {
                r: 200,
                g: 128,
                b: 64
            },
            filter: false,
            light: 100,
            fogDistance: 1,
            fogColor: {
                r: 96,
                g: 24,
                b: 12
            }
        },
        valvewater: {
            ceilColor: {
                r: 100,
                g: 160,
                b: 200
            },
            floorColor: {
                r: 66,
                g: 100,
                b: 100
            },
            filter: {
                r: 0.8,
                g: 1,
                b: 1.2
            },
            light: 100,
            fogDistance: 1,
            fogColor: {
                r: 0,
                g: 33,
                b: 48
            }
        },
        underwater: {
            ceilColor: {
                r: 100,
                g: 160,
                b: 200
            },
            floorColor: {
                r: 66,
                g: 100,
                b: 100
            },
            filter: {
                r: 0.8,
                g: 1,
                b: 1.2
            },
            light: 100,
            fogDistance: 1,
            fogColor: {
                r: 0,
                g: 33,
                b: 48
            }
        }
    }
};
