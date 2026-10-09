import { PointerLock } from '../libraries/Raycaster/PointerLock.js';

export const CRAWLERFS_URL = '../../dynamics/crawlerfs/';
export const CONFIG = {
    crawlerfs: {
        l: CRAWLERFS_URL + 'l.php',
        r: CRAWLERFS_URL + 'r.php',
        c: CRAWLERFS_URL + 'c.php',
        a: CRAWLERFS_URL + 'a.php',
    },
    game: {
        interval: 40,
        doomloop: 'interval',
        cpumonitor: false,
        mouse: PointerLock.init()
    },
    raycaster: {
        canvas: 'screen',
        ghostVision: 0,
        smoothTextures: false,
        drawMap: false,
        zoom: 2,
        lowmem: false
    }
};
