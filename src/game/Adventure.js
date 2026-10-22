import { LABY } from './data/LABY.js';
import { SOUNDS } from './data/SOUNDS.js';
import { STRINGS } from './data/STRINGS.js';
import { GXUnderwater } from './gx/GXUnderwater.js';
import { CovenThrone } from './levels/CovenThrone.js';
import { ForestTorchLights } from './levels/ForestTorchLights.js';
import { HellgateBridge } from './levels/HellgateBridge.js';
import { RC } from '../libraries/Raycaster/RC.js';
import { MathTools } from '../libraries/Raycaster/Tools/MathTools.js';

export class Adventure {
    oEvents = null;
    oLevelProcessors = null;
    oVariables = null;
    AF_STORY_READ = 0;

    setAdventureFlag(oCreature, nFlag, bFlag) {
        const n32 = nFlag >> 5;
        const nBit = nFlag & 31;
        const sFlag = 'f_' + n32.toString();
        let nValue = oCreature.getAttribute(sFlag);
        if (bFlag) {
            nValue |= 1 << nBit
        } else {
            nValue &= 0xFFFFFFFF ^ (1 << nBit)
        }
        oCreature.setBaseAttribute(sFlag, nValue)
    }

    getAdventureFlag(oCreature, nFlag) {
        const n32 = nFlag >> 5;
        const nBit = nFlag & 31;
        const sFlag = 'f_' + n32.toString();
        const nValue = oCreature.getAttribute(sFlag);
        return (nValue & (1 << nBit))
    }

    /**
     * Retouche d'un étage au chargement : une sous-classe de LevelProcessor
     * (game/levels), lancée par l'évènement « buildLevel ».
     */
    defineLevelProcessor(d, f, pClass) {
        if (this.oLevelProcessors === null) {
            this.oLevelProcessors = {}
        }
        this.oLevelProcessors[d + '/' + f] = pClass;
        this.defineEvent(d, f, 'buildLevel', 'eventProcessLevel')
    }

    eventProcessLevel(oGame, oLevel) {
        const pClass = this.oLevelProcessors[oLevel.area + '/' + oLevel.floor];
        new pClass(oLevel).run()
    }

    defineEvent(d, f, s, p) {
        if (this.oEvents === null) {
            this.oEvents = {}
        }
        if (!(d in this.oEvents)) {
            this.oEvents[d] = []
        }
        if (this.oEvents[d][f] === undefined) {
            this.oEvents[d][f] = {}
        }
        this.oEvents[d][f][s] = p
    }

    eventReadBookOfStory(oGame) {
        const oPlayer = oGame.oDungeon.getPlayerCreature();
        if (oPlayer.getAttribute('f_story') === 0) {
            oGame.oBookSystem.read('~book_of_the_story');
            oPlayer.setBaseAttribute('f_story', 1);
            oGame.setDoomloop('stateStoryBook')
        }
    }

    eventUnsealDoor(oGame, x, y) {
        const rc = oGame.oRaycaster;
        const h = rc.oHorde;
        const nHLen = h.getMobileCount();
        let iHorde, oMob, oCreature, oBP;
        const rcp = rc.nPlaneSpacing;
        const xBlock = x * rcp + (rcp >> 1);
        const yBlock = y * rcp + (rcp >> 1);
        for (iHorde = 1; iHorde < nHLen; iHorde++) {
            oMob = h.getMobile(iHorde);
            oCreature = oMob.getData('creature');
            oBP = oMob.getBlueprint();
            if (oBP && oBP.nType == RC.OBJECT_TYPE_MOB) {
                if (oCreature.getAttribute('f_boss')) {
                    if (oCreature.getAttribute('dead') === 0) {
                        oGame.sys_notify('door_sealed', [x, y]);
                        oGame.sys_playSound(SOUNDS.DOOR_LOCKED, xBlock, yBlock);
                        return
                    }
                }
            }
        }
        rc.setMapXY(x, y, rc.aWorld.walls.metacodes[LABY.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED]);
        oGame.sys_notify('door_unsealed', [x, y]);
        oGame.sys_playSound(SOUNDS.DOOR_UNLOCKED, xBlock, yBlock);
        oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED)
    }

    eventGotRelic(oGame) {
        // le score est tenu par ScorePlugin (Dungeon n'a pas de getScore)
        const nScore = oGame.oScore.getScore(oGame.getPlayer());
        oGame.oDialogSystem.display(STRINGS._('~m_relic', [nScore.toString()]), {
            'dlg_endgame': [STRINGS._('~key_endgame'), 5, oGame.sys_endGame]
        })
    }

    eventEscapeGame(oGame) {
        oGame.sys_notify('cant_go_there')
    }

    eventEnterUnderwaterLevel(oGame) {
        oGame.oRaycaster.oEffects.addEffect(new GXUnderwater(oGame.oRaycaster));
        oGame.oUnderwater.waterIn()
    }

    eventEnterValvedLevel(oGame) {
        oGame.registerPluginSignal('block', oGame.oUnderwater)
    }

    seedLevels(d) {
        let iLevel, oDungeon, nLevelCount, sDungeon = '';
        for (sDungeon in d) {
            nLevelCount = d[sDungeon].length;
            for (iLevel = 0; iLevel < nLevelCount; iLevel++) {
                oDungeon = d[sDungeon][iLevel];
                oDungeon.seed = Math.random() * 0x10000000 | 0;
                if ('shops' in oDungeon) {
                    oDungeon.options += '-s' + oDungeon.shops.length.toString()
                }
            }
        }
    }

    config(d) {
        this.oEvents = {};
        this.oLevelProcessors = {};
        const d1 = d.d1;
        const d2 = d.d2;
        const mines = d.mines;
        const medusa = d.medusa;
        if (this.oVariables === null) {
            this.oVariables = {
                portalToMines: MathTools.rnd(1, 2)
            }
        }
        // ajoute des sorties sans écraser celles déjà posées (un étage peut
        // avoir à la fois un portail et une sortie vers une autre zone)
        const link = (oLevel, oTransit) => {
            oLevel.transit = Object.assign({}, oLevel.transit, oTransit)
        };
        this.seedLevels(d);
        this.defineEvent('forest', 0, 'enterLevel', 'eventReadBookOfStory');
        this.defineEvent('forest', 0, 'entranceSwitch', 'eventEscapeGame');
        // parcours principal : d1 -> cryptes -> donjon infernal -> d2 -> trésor
        // (point d'arrivée 1 : ascenseur d'entrée, 2 : ascenseur de sortie)
        link(d1[3], { exit: ['crypts', 0, 1] });
        link(d.crypts[0], { entrance: ['d1', 3, 2] });
        link(d.crypts[2], { exit: ['hellkeep', 0, 1] });
        link(d.hellkeep[0], { entrance: ['crypts', 2, 2] });
        link(d.hellkeep[2], { exit: ['d2', 0, 1] });
        link(d2[0], { entrance: ['hellkeep', 2, 2] });
        this.defineEvent('crypts', 2, 'activateSealedDoor', 'eventUnsealDoor');
        this.defineEvent('hellkeep', 2, 'activateSealedDoor', 'eventUnsealDoor');
        this.defineEvent('d2', 1, 'activateSealedDoor', 'eventUnsealDoor');
        this.defineEvent('coven', 1, 'activateSealedDoor', 'eventUnsealDoor');
        this.defineLevelProcessor('coven', 1, CovenThrone);
        this.defineEvent('treasure', 0, 'openRelicChest', 'eventGotRelic');
        // portail de la pièce de la relique -> porte de l'enfer -> donjon infernal
        d.treasure[0].options += '-p1';
        link(d.treasure[0], { portal: 'hellgate' });
        link(d.hellgate[0], { entrance: ['treasure', 0, 3], exit: ['hellkeep', 0, 1] });
        this.defineLevelProcessor('hellgate', 0, HellgateBridge);
        this.defineLevelProcessor('forest', 0, ForestTorchLights);
        this.defineLevelProcessor('forest', 1, ForestTorchLights);
        // zones annexes, par portail (point d'arrivée 3 : ascenseur du portail)
        const nPortalToMines = this.oVariables.portalToMines;
        d1[nPortalToMines].options += '-p1';
        link(d1[nPortalToMines], { portal: 'mines' });
        mines[0].transit = {
            entrance: ['d1', nPortalToMines, 3]
        };
        mines[2].transit = {
            exit: ['d1', nPortalToMines, 3]
        };
        this.defineEvent('mines', 2, 'activateSealedDoor', 'eventUnsealDoor');
        // la méduse reste sur l'ancien d1[4], devenu d2[0]
        d2[0].options += '-p1';
        link(d2[0], { portal: 'medusa' });
        medusa[0].transit = {
            entrance: ['d2', 0, 3]
        };
        medusa[2].transit = {
            exit: ['d2', 0, 3]
        };
        this.defineEvent('medusa', 0, 'enterLevel', 'eventEnterValvedLevel');
        this.defineEvent('medusa', 1, 'enterLevel', 'eventEnterUnderwaterLevel');
        this.defineEvent('medusa', 2, 'enterLevel', 'eventEnterUnderwaterLevel');
        this.defineEvent('medusa', 2, 'activateSealedDoor', 'eventUnsealDoor')
    }

    notify(oGame, s) {
        const d = oGame.oDungeon.getPlayerLocationArea();
        const f = oGame.oDungeon.getPlayerLocationFloor();
        const aArgs = Array.prototype.slice.call(arguments, 2);
        aArgs.unshift(oGame);
        if (d in this.oEvents && this.oEvents[d][f] !== undefined && s in this.oEvents[d][f] && this.oEvents[d][f][s]) {
            this[this.oEvents[d][f][s]].apply(this, aArgs)
        }
    }
}
