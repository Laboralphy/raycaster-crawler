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
        // champ de vision horizontal, en degrés (celui de l'ancien moteur : 90)
        fov: 90,
        zoom: 2,
        lowmem: false
    }
};
