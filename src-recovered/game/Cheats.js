import { CONFIG } from './config.js';
import { Item } from './Item.js';
import { ITEMS_DATA } from './data/ITEMS_DATA.js';
import { WORLD_DATA } from './data/WORLD_DATA.js';
import { RC } from '../libraries/Raycaster/RC.js';

/**
 * Codes de triche, tapés en pause (touche X) ou, en mode débogage, dans la
 * console du navigateur : cheat('kill').
 *
 * Les codes « joueur » (mellon, go, seed, give) marchent toujours ; les codes
 * de débogage seulement avec CONFIG.game.debug ou l'URL ?debug=1.
 */
export class Cheats {
    constructor(oGame) {
        this.oGame = oGame;
        this.bDebug = !!CONFIG.game.debug || new URLSearchParams(location.search).get('debug') === '1';
    }

    /** Exécute une ligne de commande ; renvoie le message affiché */
    run(sLine) {
        const aArgs = String(sLine).trim().split(/\s+/);
        const sCmd = aArgs.shift().toLowerCase();
        let oCmd = this.PLAYER[sCmd];
        if (!oCmd && this.bDebug) {
            oCmd = this.DEBUG[sCmd];
        }
        if (!oCmd) {
            return this.bDebug ? this.say('unknown command "' + sCmd + '" (help)') : null;
        }
        if (oCmd.ingame && !this.inGame()) {
            return this.say(sCmd + ': start a game first');
        }
        return this.say(oCmd.run.apply(this, aArgs));
    }

    inGame() {
        const g = this.oGame;
        return !!(g.oRaycaster && g.oRaycaster.aMap && g.oDungeon && g.oDungeon.getPlayerLocationArea());
    }

    /** Affiche le message à l'écran ; plusieurs lignes vont dans l'historique (touche I) */
    say(xMessage) {
        if (xMessage === undefined || xMessage === null) {
            return null;
        }
        const aLines = Array.isArray(xMessage) ? xMessage : [xMessage];
        aLines.forEach((s) => console.log('[cheat] ' + s));
        if (this.inGame()) {
            if (aLines.length === 1) {
                this.oGame.sys_popup(aLines[0]);
            } else {
                aLines.forEach((s) => this.oGame.oConsole.notify(s));
                this.oGame.sys_popup(aLines.length + ' lines: see messages (I)');
            }
        }
        return aLines.join('\n');
    }

    player() {
        return this.oGame.oDungeon.getPlayerCreature();
    }

    floorData() {
        const d = this.oGame.oDungeon;
        return WORLD_DATA.dungeons[d.getPlayerLocationArea()][d.getPlayerLocationFloor()];
    }

    /** Donne n objets au joueur ; renvoie combien ont tenu dans l'inventaire */
    giveItem(sItem, n) {
        const d = this.oGame.oDungeon, c = this.player();
        let nGiven = 0;
        while (nGiven < n) {
            const oItem = new Item(sItem, n - nGiven);
            const nStack = oItem.isStackable() ? oItem.stackcount : 1;
            if (!d.pickupItem(c, oItem)) {
                return nGiven + (oItem.isStackable() ? nStack - oItem.stackcount : 0);
            }
            nGiven += nStack;
        }
        return nGiven;
    }

    /** Vérifie une destination : renvoie [zone, étage] ou un message d'erreur */
    destination(sArea, sFloor) {
        const aFloors = WORLD_DATA.dungeons[sArea];
        if (!aFloors) {
            return 'unknown area "' + sArea + '" (levels)';
        }
        const nFloor = sFloor === undefined ? 0 : sFloor | 0;
        if (nFloor < 0 || nFloor >= aFloors.length) {
            return sArea + ' has floors 0 to ' + (aFloors.length - 1);
        }
        return [sArea, nFloor];
    }

    /** Oublie un étage : il sera regénéré (avec la graine de WORLD_DATA) à la prochaine visite */
    forgetFloor(sArea, nFloor) {
        const o = this.oGame.oDungeon.oData;
        ['world', 'hordes', 'objects', 'opendoors', 'drops'].forEach((s) => {
            if (o[s][sArea]) {
                o[s][sArea][nFloor] = s === 'world' ? null : undefined;
            }
        });
        this.oGame.oShopSystem.oShopRegistry = null;
    }
}

Object.assign(Cheats.prototype, {
    oGame: null,
    bDebug: false,

    // toujours disponibles
    PLAYER: {
        mellon: {
            ingame: true,
            run() {
                this.oGame.gc_gotoLocation('mines', 0);
                return 'mines';
            }
        },
        go: {
            ingame: true,
            help: 'go <area> [floor]: travel to a level (levels: list)',
            run(sArea, sFloor) {
                const x = this.destination(sArea, sFloor);
                if (typeof x === 'string') {
                    return x;
                }
                this.oGame.gc_gotoLocation(x[0], x[1]);
                return x[0] + ' ' + x[1];
            }
        },
        seed: {
            ingame: true,
            help: 'seed: seed of the current floor',
            run() {
                return 'seed : ' + this.floorData().seed;
            }
        },
        give: {
            ingame: true,
            help: 'give <item> [count]: add an item (items: list)',
            run(sItem, sCount) {
                if (!(sItem in ITEMS_DATA)) {
                    return this.bDebug ? 'unknown item "' + sItem + '" (items)' : null;
                }
                const n = this.giveItem(sItem, sCount === undefined ? 1 : sCount | 0);
                return this.bDebug ? '+' + n + ' ' + sItem : null;
            }
        }
    },

    // mode débogage seulement
    DEBUG: {
        help: {
            help: 'help: this list',
            run() {
                const aLines = [];
                [this.PLAYER, this.DEBUG].forEach((o) => {
                    for (const s in o) {
                        if (o[s].help) {
                            aLines.push(o[s].help);
                        }
                    }
                });
                return aLines;
            }
        },
        levels: {
            help: 'levels: areas and their floors',
            run() {
                return Object.keys(WORLD_DATA.dungeons).map((s) => {
                    const a = WORLD_DATA.dungeons[s];
                    return s + ' 0-' + (a.length - 1) + ' (' + a.map((d) => d.generator).join(', ') + ')';
                });
            }
        },
        where: {
            ingame: true,
            help: 'where: area, floor, seed and cell',
            run() {
                const g = this.oGame, p = g.getPlayer();
                return g.oDungeon.getPlayerLocationArea() + ' ' + g.oDungeon.getPlayerLocationFloor() +
                    ', seed ' + this.floorData().seed + ', cell ' + p.xSector + ' ' + p.ySector;
            }
        },
        next: {
            ingame: true,
            help: 'next / prev: next or previous floor of this area',
            run() {
                const d = this.oGame.oDungeon;
                const x = this.destination(d.getPlayerLocationArea(), d.getPlayerLocationFloor() + 1);
                if (typeof x === 'string') {
                    return x;
                }
                this.oGame.gc_gotoNextFloor();
                return x[0] + ' ' + x[1];
            }
        },
        prev: {
            ingame: true,
            run() {
                const d = this.oGame.oDungeon;
                const x = this.destination(d.getPlayerLocationArea(), d.getPlayerLocationFloor() - 1);
                if (typeof x === 'string') {
                    return x;
                }
                this.oGame.gc_gotoPrevFloor();
                return x[0] + ' ' + x[1];
            }
        },
        regen: {
            ingame: true,
            help: 'regen [seed]: rebuild this floor (new random seed if none)',
            run(sSeed) {
                const g = this.oGame, dg = g.oDungeon;
                const sArea = dg.getPlayerLocationArea(), nFloor = dg.getPlayerLocationFloor();
                const d = this.floorData();
                d.seed = sSeed === undefined ? Math.random() * 0x10000000 | 0 : sSeed | 0;
                // comme gc_gotoLocation, mais l'étage est oublié après la sauvegarde
                g.sendPluginSignal('exitlevel');
                g.sys_save();
                this.forgetFloor(sArea, nFloor);
                dg.setPlayerLocation(sArea, nFloor, 1);
                g.setDoomloop('stateStartRaycaster');
                return sArea + ' ' + nFloor + ' rebuilt, seed ' + d.seed;
            }
        },
        kill: {
            ingame: true,
            help: 'kill: kill every monster on this floor',
            run() {
                const g = this.oGame, ep = g.oDungeon.oEffectProcessor;
                let n = 0;
                g.oRaycaster.oHorde.aMobiles.slice().forEach((m) => {
                    const c = m.getData('creature');
                    if (m.getType() !== RC.OBJECT_TYPE_MOB || !c || c.getAttribute('dead')) {
                        return;
                    }
                    // le joueur est l'auteur : points, butin et événements comme en combat
                    m.getThinker().oLastAggressor = g.getPlayer();
                    c.modifyAttribute('hp', c.getAttribute('vitality') - c.getAttribute('hp'));
                    ep.checkCreatureAlive(c);
                    ++n;
                });
                return n + ' monster(s) killed';
            }
        },
        god: {
            ingame: true,
            help: 'god: invulnerability on/off',
            run() {
                const c = this.player();
                const bOn = !(c.getBaseAttribute('invulnerable') > 0);
                c.setBaseAttribute('invulnerable', bOn ? 1 : 0);
                return 'god mode ' + (bOn ? 'on' : 'off');
            }
        },
        heal: {
            ingame: true,
            help: 'heal: full life, energy and food, effects removed',
            run() {
                const c = this.player();
                c.modifyAttribute('hp', -c.getAttribute('hp'));
                c.modifyAttribute('mp', -c.getAttribute('mp'));
                c.modifyAttribute('foodp', c.getAttribute('foodmax') - c.getAttribute('foodp'));
                ['confused', 'blind', 'snared', 'rooted', 'held'].forEach((s) => {
                    if (c.getAttribute(s) > 0) {
                        c.modifyAttribute(s, -c.getAttribute(s));
                    }
                });
                return 'healed';
            }
        },
        gold: {
            ingame: true,
            help: 'gold [count]: add gold (default 999)',
            run(sCount) {
                return '+' + this.giveItem('gold', sCount === undefined ? 999 : sCount | 0) + ' gold';
            }
        },
        keys: {
            ingame: true,
            help: 'keys: the 4 coloured keys of this floor + 5 iron keys',
            run() {
                const g = this.oGame, d = g.oDungeon;
                for (let k = 0; k < 4; k++) {
                    d.pickupAreaKey(k);
                }
                d.addGenericKey(5);
                g.oHUD.printKeys(d.getPossessedKeys());
                g.oHUD.printGenericKeys(d.getGenericKeyCount());
                return 'keys';
            }
        },
        tp: {
            ingame: true,
            help: 'tp <x> <y>: teleport to a cell',
            run(sx, sy) {
                const rc = this.oGame.oRaycaster, x = sx | 0, y = sy | 0;
                if (sx === undefined || sy === undefined || !rc.insideMap(x) || !rc.insideMap(y)) {
                    return 'tp <x> <y>, 0 to ' + (rc.aMap.length - 1);
                }
                if (rc.getMapXYPhysical(x, y) !== 0) {
                    return x + ' ' + y + ' is not an empty cell';
                }
                const s = rc.nPlaneSpacing;
                this.oGame.getPlayer().setXY(x * s + (s >> 1), y * s + (s >> 1));
                return 'cell ' + x + ' ' + y;
            }
        },
        items: {
            help: 'items [text]: item names for give',
            run(sFilter) {
                const a = Object.keys(ITEMS_DATA).filter((s) => !sFilter || s.indexOf(sFilter) >= 0);
                const aLines = [];
                for (let i = 0; i < a.length; i += 6) {
                    aLines.push(a.slice(i, i + 6).join(' '));
                }
                return aLines.length ? aLines : 'no item matches "' + sFilter + '"';
            }
        }
    }
});
