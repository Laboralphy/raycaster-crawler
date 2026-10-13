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
        // langue des textes : 'en', 'fr', ou 'auto' (celle du navigateur) ;
        // l'URL peut la forcer : index.html?lang=fr
        lang: 'auto',
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
        lowmem: false,
        // niveaux éclairés par des torches : distance (en pixels, un bloc en
        // fait 64) par niveau d'ombre, sur 15 ; plus petit = plus sombre.
        // Remplace le "light" du visuel s'il est plus grand.
        torchLevelLight: 35,
        // lumière posée au centre de chaque case vide qui touche une cheminée
        // (raycaster-386, en pixels) : pleine intensité v jusqu'à r0, nulle à r1
        fireplaceLight: {
            r0: 32,
            r1: 160,
            v: 0.8
        }
    }
};
