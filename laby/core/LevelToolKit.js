const Blox = require('./Blox');
const SecretGenerator = require('./SecretGenerator');
const { RangeException, looseEq } = require('./errors');

/** Codes de blocs du niveau (null pour un code non défini par le générateur) */
function getBlockCodes(oLevel, ...aNames) {
    return aNames.map((s) => (s in oLevel.B ? oLevel.B[s] : null));
}

/**
 * Construit des magasins dans les impasses (pièces à une seule issue).
 * @return {number} nombre de magasins qui n'ont pas pu être construits
 */
function spawnShops(aRooms, nShopCount) {
    aRooms = aRooms.slice();
    while (nShopCount > 0 && aRooms.length > 0) {
        const oRoom = aRooms.shift();
        oRoom.setRoomData('type', 'shop');
        oRoom.setRoomData('helper', 'dungeon/Shop');
        --nShopCount;
    }
    return nShopCount;
}

/** Place les magasins restants à la place de coffres pris au hasard */
function spawnLastShops(oLevel, nShopCount) {
    if (nShopCount > 0) {
        const [BLOCK_TREASURE, BLOCK_SHOP] = getBlockCodes(oLevel, 'BLOCK_TREASURE', 'BLOCK_SHOP');
        const w = oLevel.getWidth();
        const h = oLevel.getHeight();
        let aChests = [];
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                if (oLevel.getCell(x, y) == BLOCK_TREASURE) {
                    aChests.push([x, y]);
                }
            }
        }
        aChests = oLevel.oRnd.shuffle(aChests);
        while (nShopCount > 0) {
            const aChest = aChests.shift();
            if (aChest) {
                oLevel.setCell(aChest[0], aChest[1], BLOCK_SHOP);
            }
            --nShopCount;
        }
    }
}

/** Fabrique des portes dans les issues du périmètre d'une pièce */
function spawnDoors(oLevel, oRoom) {
    const [BLOCK_DOOR, BLOCK_DOORWAY_X, BLOCK_DOORWAY_Y] = getBlockCodes(oLevel, 'BLOCK_DOOR', 'BLOCK_DOORWAY_X', 'BLOCK_DOORWAY_Y');
    const nDoors = oRoom.getRoomData('doormask');
    const oPeri = oRoom.getPeri();
    const pw = oPeri.getWidth();
    const ph = oPeri.getHeight();
    const aDoors = [];
    if (nDoors & 1) {
        oPeri.setCell(pw >> 1, 0, BLOCK_DOOR);
        oPeri.setCell((pw >> 1) - 1, 0, BLOCK_DOORWAY_X);
        oPeri.setCell((pw >> 1) + 1, 0, BLOCK_DOORWAY_X);
        aDoors[0] = [pw >> 1, 0];
    }
    if (nDoors & 8) {
        oPeri.setCell(0, ph >> 1, BLOCK_DOOR);
        oPeri.setCell(0, (ph >> 1) - 1, BLOCK_DOORWAY_Y);
        oPeri.setCell(0, (ph >> 1) + 1, BLOCK_DOORWAY_Y);
        aDoors[3] = [0, ph >> 1];
    }
    if (nDoors & 4) {
        oPeri.setCell(pw >> 1, ph - 1, BLOCK_DOOR);
        oPeri.setCell((pw >> 1) - 1, ph - 1, BLOCK_DOORWAY_X);
        oPeri.setCell((pw >> 1) + 1, ph - 1, BLOCK_DOORWAY_X);
        aDoors[2] = [pw >> 1, ph - 1];
    }
    if (nDoors & 2) {
        oPeri.setCell(pw - 1, ph >> 1, BLOCK_DOOR);
        oPeri.setCell(pw - 1, (ph >> 1) - 1, BLOCK_DOORWAY_Y);
        oPeri.setCell(pw - 1, (ph >> 1) + 1, BLOCK_DOORWAY_Y);
        aDoors[1] = [pw - 1, ph >> 1];
    }
    oRoom.setRoomData('doors', aDoors);
    return aDoors;
}

/** Creuse des fenêtres dans la bordure du niveau, en face des cases vides */
function spawnWindows(oLevel) {
    const [nVoidCode, nWindowCode] = getBlockCodes(oLevel, 'BLOCK_VOID', 'BLOCK_WINDOW');
    const w = oLevel.getWidth();
    const h = oLevel.getHeight();
    for (let x = 0; x < w; x += 3) {
        if (oLevel.getCell(x, 1) == nVoidCode) {
            oLevel.setCell(x, 0, nWindowCode);
        }
        if (oLevel.getCell(x, h - 2) == nVoidCode) {
            oLevel.setCell(x, h - 1, nWindowCode);
        }
    }
    for (let y = 0; y < h; y += 3) {
        if (oLevel.getCell(1, y) == nVoidCode) {
            oLevel.setCell(0, y, nWindowCode);
        }
        if (oLevel.getCell(w - 2, y) == nVoidCode) {
            oLevel.setCell(w - 1, y, nWindowCode);
        }
    }
}

////// PORTES VERROUILLÉES ////// PORTES VERROUILLÉES //////

function spawnLockedDoorsAndKeys(oLevel) {
    const [oLockMap, oKeyMap] = spawnLabyKeys(oLevel, Math.min(4, Math.max(1, oLevel.getMapWidth() - 3)));
    lockDoors(oLevel, oLockMap, oKeyMap);
}

/**
 * Choisit n paires (pièce-clé, pièce-porte), la clé étant toujours plus
 * proche de l'entrée que la porte.
 * @return [oLockMap (Map y -> Map x -> [nPorte, nClé]), liste des pièces-clés [x, y]]
 */
function spawnLabyKeys(oLevel, n) {
    const oLaby = oLevel.getMap();
    const aLevelRooms = oLevel.getRooms();
    const aKeys = { keys: [], doors: [] };
    let aRooms = [];
    for (let y = 0; y < oLaby.getHeight(); y++) {
        for (let x = 0; x < oLaby.getWidth(); x++) {
            const oRoom = aLevelRooms[y][x];
            if (oRoom.getRoomData('type') !== 'corridor') {
                aRooms.push({ room: oRoom, x, y, km: oLaby.getCellKm(x, y) });
            }
        }
    }
    aRooms = oLevel.oRnd.shuffle(aRooms);
    while (aRooms.length > 1 && n > 0) {
        let aKeyRoom = aRooms.shift();
        let aDoorRoom = aRooms.shift();
        if (aKeyRoom.km > aDoorRoom.km) {
            [aKeyRoom, aDoorRoom] = [aDoorRoom, aKeyRoom];
        }
        aKeys.keys.push([aKeyRoom.x, aKeyRoom.y]);
        aKeyRoom.room.setRoomData('key', aKeys.keys.length);
        aKeys.doors.push([aDoorRoom.x, aDoorRoom.y]);
        n--;
    }
    const oLockMap = new Map();
    aKeys.doors.forEach(([x, y], nKey) => {
        if (!oLockMap.has(y)) {
            oLockMap.set(y, new Map());
        }
        const nDoors = oLaby.getDoorMask(x, y);
        try {
            // porte par laquelle on arrive depuis l'entrée
            const nKm = oLaby.getCellKm(x, y) - 1;
            let nDR = 0;
            if ((nDoors & 1) && oLaby.getCellKm(x, y - 1) == nKm) nDR = 1;
            if ((nDoors & 2) && oLaby.getCellKm(x + 1, y) == nKm) nDR = 2;
            if ((nDoors & 4) && oLaby.getCellKm(x, y + 1) == nKm) nDR = 3;
            if ((nDoors & 8) && oLaby.getCellKm(x - 1, y) == nKm) nDR = 4;
            const oRoom = aLevelRooms[y][x];
            oRoom.setRoomData('lockeddoor', nDR);
            oRoom.setRoomData('lockcode', nKey + 1);
            oLockMap.get(y).set(x, [nDR, nKey]);
        } catch (e) {
            if (!(e instanceof RangeException)) throw e;
        }
    });
    return [oLockMap, aKeys.keys];
}

function lockDoors(oLevel, oLockMap, oKeyMap) {
    const [BLOCK_LOCKEDDOOR_0, BLOCK_DOOR] = getBlockCodes(oLevel, 'BLOCK_LOCKEDDOOR_0', 'BLOCK_DOOR');
    const aLockedDoors = [];
    const aRooms = oLevel.getRooms();
    const rw = oLevel.getRoomWidth();
    const rh = oLevel.getRoomHeight();
    for (const [y, aY] of oLockMap) {
        for (const [x, [nDoor, nKey]] of aY) {
            const aDoor = (aRooms[y][x].getRoomData('doors') || [])[nDoor - 1];
            if (!aDoor) {
                continue; // pas de porte d'arrivée identifiée : rien à verrouiller
            }
            const xDoor = aDoor[0] + x * (rw - 1);
            const yDoor = aDoor[1] + y * (rh - 1);
            oLevel.setCell(xDoor, yDoor, BLOCK_LOCKEDDOOR_0 + nKey);
            aLockedDoors[nKey] = [xDoor, yDoor];
        }
    }
    // placer les clés ; si impossible, la porte reste ouverte
    oKeyMap.forEach(([x, y], nKey) => {
        if (buildKeyHolder(oLevel, x, y, nKey) === false && aLockedDoors[nKey]) {
            const [xDoor, yDoor] = aLockedDoors[nKey];
            oLevel.setCell(xDoor, yDoor, BLOCK_DOOR);
        }
    });
}

/**
 * Place la clé nKey dans la pièce (xRoom, yRoom).
 * @param {function} [fAllowed] filtre (x, y) => bool des emplacements autorisés
 * @return {Array|false} position [x, y] de la clé, false si aucun emplacement
 */
function buildKeyHolder(oLevel, xRoom, yRoom, nKey, fAllowed = null) {
    const [BLOCK_VOID, BLOCK_WALL, BLOCK_KEY_0] = getBlockCodes(oLevel, 'BLOCK_VOID', 'BLOCK_WALL', 'BLOCK_KEY_0');
    const rw = oLevel.getRoomWidth();
    const rh = oLevel.getRoomHeight();
    yRoom *= rh - 1;
    xRoom *= rw - 1;
    const aSquare = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    const aXYHolder = [];
    // case vide entourée de vide
    for (let y = 1; y < rh - 1; y++) {
        for (let x = 1; x < rw - 1; x++) {
            const x0 = xRoom + x;
            const y0 = yRoom + y;
            if (oLevel.getCell(x0, y0) != BLOCK_VOID) {
                continue;
            }
            let nEmpty = 0;
            for (const aXY of aSquare) {
                if (oLevel.getCell(x0 + aXY[0], y0 + aXY[1]) == BLOCK_VOID) {
                    nEmpty += 1;
                }
            }
            if (nEmpty >= 8) {
                aXYHolder.push([x0, y0]);
            }
        }
    }
    // mur accessible
    for (let y = 1; y < rh - 1; y++) {
        for (let x = 1; x < rw - 1; x++) {
            const x0 = xRoom + x;
            const y0 = yRoom + y;
            if (oLevel.getCell(x0, y0) == BLOCK_WALL) {
                let nMask = 0;
                oLevel.getCellNeighborhood(x0, y0).forEach((c, n) => {
                    if (!looseEq(c, BLOCK_VOID)) {
                        nMask |= 1 << n;
                    }
                });
                if (nMask !== 15) {
                    aXYHolder.push([x0, y0]);
                }
            }
        }
    }
    // dans la bordure
    const get = (x, y) => oLevel.getCell(x, y);
    for (let x = 1; x < rw - 1; x++) {
        if (get(xRoom + x, yRoom) == BLOCK_WALL &&
            get(xRoom + x, Math.max(0, yRoom - 1)) != BLOCK_VOID &&
            get(xRoom + x - 1, yRoom) == BLOCK_WALL &&
            get(xRoom + x + 1, yRoom) == BLOCK_WALL &&
            get(xRoom + x, yRoom + 1) == BLOCK_VOID) {
            aXYHolder.push([xRoom + x, yRoom]);
        }
        if (get(xRoom + x, yRoom + rh - 1) == BLOCK_WALL &&
            get(xRoom + x, Math.min(oLevel.getHeight() - 1, yRoom + rh)) != BLOCK_VOID &&
            get(xRoom + x - 1, yRoom + rh - 1) == BLOCK_WALL &&
            get(xRoom + x + 1, yRoom + rh - 1) == BLOCK_WALL &&
            get(xRoom + x, yRoom + rh - 2) == BLOCK_VOID) {
            aXYHolder.push([xRoom + x, yRoom + rh - 1]);
        }
    }
    for (let y = 1; y < rh - 1; y++) {
        if (get(xRoom, yRoom + y) == BLOCK_WALL &&
            get(Math.max(0, xRoom - 1), yRoom + y) != BLOCK_VOID &&
            get(xRoom, yRoom + y - 1) == BLOCK_WALL &&
            get(xRoom, yRoom + y + 1) == BLOCK_WALL &&
            get(xRoom + 1, yRoom + y) == BLOCK_VOID) {
            aXYHolder.push([xRoom, yRoom + y]);
        }
        if (get(xRoom + rw - 1, yRoom + y) == BLOCK_WALL &&
            get(Math.min(oLevel.getWidth() - 1, xRoom + rw), yRoom + y) != BLOCK_VOID &&
            get(xRoom + rw - 1, yRoom + y - 1) == BLOCK_WALL &&
            get(xRoom + rw - 1, yRoom + y + 1) == BLOCK_WALL &&
            get(xRoom + rw - 2, yRoom + y) == BLOCK_VOID) {
            aXYHolder.push([xRoom + rw - 1, yRoom + y]);
        }
    }
    const aAllowed = fAllowed ? aXYHolder.filter(([x, y]) => fAllowed(x, y)) : aXYHolder;
    if (aAllowed.length) {
        const aXY = oLevel.oRnd.choose(aAllowed);
        oLevel.setCell(aXY[0], aXY[1], BLOCK_KEY_0 + nKey);
        return aXY;
    }
    return false;
}

/** Place des pièces secrètes dans les zones de murs pleins */
function spawnSecretPlaces(oLevel, oSecret = null) {
    const oBlox = new Blox();
    if (oSecret === null) {
        oSecret = new SecretGenerator(oLevel.B);
    }
    oBlox.buildBlox(oLevel);
    oBlox.buildSecretRoomSystem(oSecret);
}

/** Décore aléatoirement les murs (torches, grilles, alcôves) */
function makeFancyWalls(oLevel) {
    const [BLOCK_WALL, BLOCK_WALL_GRATE, BLOCK_WALL_ALCOVE] =
        getBlockCodes(oLevel, 'BLOCK_WALL', 'BLOCK_WALL_GRATE', 'BLOCK_WALL_ALCOVE');
    const w = oLevel.getWidth();
    const h = oLevel.getHeight();
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            if (oLevel.getCell(x, y) == BLOCK_WALL) {
                // 4 et 5 donnaient un mur à torche : les torches sont
                // maintenant posées par spawnTorches (tirage conservé pour
                // que le reste du niveau ne change pas)
                switch (oLevel.oRnd.getRandom(0, 10)) {
                    case 6:
                        oLevel.setCell(x, y, BLOCK_WALL_GRATE);
                        break;
                    case 7:
                        oLevel.setCell(x, y, BLOCK_WALL_ALCOVE);
                        break;
                }
            }
        }
    }
}

/** Place des monstres, de niveau croissant avec la distance à l'entrée */
function spawnMobs(oLevel, nMoreOrLess = 0) {
    const [BLOCK_VOID, BLOCK_MOB_LEVEL_0] = getBlockCodes(oLevel, 'BLOCK_VOID', 'BLOCK_MOB_LEVEL_0');
    const oMap = oLevel.getMap();
    const mw = oLevel.getMapWidth();
    const mh = oLevel.getMapHeight();
    const rw = oLevel.getRoomWidth();
    const rh = oLevel.getRoomHeight();
    nMoreOrLess = Math.min(3, Math.max(-3, nMoreOrLess));
    for (let y = 0; y < mh; y++) {
        for (let x = 0; x < mw; x++) {
            if (oMap.getCellKm(x, y) > 1 && !(oMap.isExit(x, y) || oMap.isEntrance(x, y))) {
                const n100 = Math.min(100, Math.max(0, oMap.getCellKm101(x, y)));
                let nMobs = oLevel.oRnd.getRandom(1, 4 + nMoreOrLess);
                let nMaxLoop = 6;
                const xRoom = x * (rw - 1);
                const yRoom = y * (rh - 1);
                do {
                    const xRnd = oLevel.oRnd.getRandom(0, rw >> 1) + (rw >> 2);
                    const yRnd = oLevel.oRnd.getRandom(0, rh >> 1) + (rh >> 2);
                    if (oLevel.getCell(xRnd + xRoom, yRnd + yRoom) == BLOCK_VOID) {
                        oLevel.setCell(xRnd + xRoom, yRnd + yRoom, BLOCK_MOB_LEVEL_0 + Math.floor(n100 / 10));
                        nMobs--;
                    }
                    nMaxLoop--;
                } while (nMobs > 0 && nMaxLoop > 0);
            }
        }
    }
}

/**
 * Pose des torches murales sur des cases vides devant un mur plein, loin des
 * ascenseurs et à au moins nSpacing cases les unes des autres. Le code posé
 * (BLOCK_TORCH_N, _E, _S, _W) indique de quel côté de la case est le mur.
 * À appeler en dernier : seules les cases restées vides sont choisies.
 */
function spawnTorches(oLevel, nSpacing = 4) {
    const [BLOCK_VOID, BLOCK_WALL, BLOCK_TORCH_N, BLOCK_ELEVATOR_WALL, BLOCK_ELEVATOR_PORTAL] = getBlockCodes(
        oLevel, 'BLOCK_VOID', 'BLOCK_WALL', 'BLOCK_TORCH_N', 'BLOCK_ELEVATOR_WALL', 'BLOCK_ELEVATOR_PORTAL');
    if (BLOCK_TORCH_N === null) {
        return;
    }
    // même ordre que BLOCK_TORCH_N, _E, _S, _W
    const aDirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const w = oLevel.getWidth();
    const h = oLevel.getHeight();
    const isElevator = (n) => n >= BLOCK_ELEVATOR_WALL && n <= BLOCK_ELEVATOR_PORTAL;
    // le jeu cherche une case vide à deux cases des ascenseurs pour y placer le joueur
    const nearElevator = (x, y) => {
        for (let yi = Math.max(0, y - 2); yi <= Math.min(h - 1, y + 2); yi++) {
            for (let xi = Math.max(0, x - 2); xi <= Math.min(w - 1, x + 2); xi++) {
                if (isElevator(oLevel.getCell(xi, yi))) {
                    return true;
                }
            }
        }
        return false;
    };
    const aCandidates = [];
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            if (oLevel.getCell(x, y) != BLOCK_VOID || nearElevator(x, y)) {
                continue;
            }
            const aWalls = [];
            aDirs.forEach(([dx, dy], iDir) => {
                if (oLevel.getCell(x + dx, y + dy) == BLOCK_WALL) {
                    aWalls.push(iDir);
                }
            });
            if (aWalls.length) {
                aCandidates.push({ x, y, aWalls });
            }
        }
    }
    const aTorches = [];
    for (const c of oLevel.oRnd.shuffle(aCandidates)) {
        if (aTorches.some((t) => Math.max(Math.abs(t.x - c.x), Math.abs(t.y - c.y)) < nSpacing)) {
            continue;
        }
        const iDir = c.aWalls[oLevel.oRnd.getRandom(0, c.aWalls.length - 1)];
        oLevel.setCell(c.x, c.y, BLOCK_TORCH_N + iDir);
        aTorches.push(c);
    }
}

/** Efface les marqueurs posés au-delà de l'octet de poids faible (zones sans monstres...) */
function removeNoSpawn(oLevel) {
    const w = oLevel.getWidth();
    const h = oLevel.getHeight();
    for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
            oLevel.setCell(x, y, oLevel.getCell(x, y) & 0xFF);
        }
    }
}

module.exports = {
    getBlockCodes,
    spawnShops,
    spawnLastShops,
    spawnDoors,
    spawnWindows,
    spawnLockedDoorsAndKeys,
    spawnLabyKeys,
    lockDoors,
    buildKeyHolder,
    spawnSecretPlaces,
    makeFancyWalls,
    spawnMobs,
    spawnTorches,
    removeNoSpawn,
};
