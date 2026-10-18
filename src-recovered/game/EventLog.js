import { WORLD_DATA } from './data/WORLD_DATA.js';

export class EventLog {
    oProgressDigest = null;

    getItemRef(oInv, sSlot) {
        if (sSlot in oInv.oEquipSlots && oInv.oEquipSlots[sSlot]) {
            return oInv.oEquipSlots[sSlot].resref
        } else {
            return null
        }
    }

    process(oGame) {
        if (this.oProgressDigest === null) {
            this.oProgressDigest = {
                d: null,
                f: null,
                r: null,
                x: null,
                y: null,
                a: null,
                s: null,
                hp: null,
                mp: null,
                fp: null,
                ks: null,
                kg: null,
                iw: null,
                ia: null,
                ir: null,
                ie: null,
                cr: null
            }
        }
        const oPlayer = oGame.getPlayer();
        const oDungeon = oGame.oDungeon;
        const oCreature = oDungeon.getPlayerCreature();
        const oInventory = oDungeon.getCreatureInventory(oCreature);
        const dd = oDungeon.getPlayerLocationArea();
        const df = oDungeon.getPlayerLocationFloor();
        const oCandidate = {
            d: dd,
            f: df,
            r: WORLD_DATA.dungeons[dd][df].seed,
            x: oPlayer.xSector,
            y: oPlayer.ySector,
            a: Math.round(oPlayer.fTheta * 1000) / 1000,
            s: oGame.oScore.getScore(oPlayer),
            hp: oCreature.getAttribute('vitality') - oCreature.getAttribute('hp'),
            mp: oCreature.getAttribute('energy') - oCreature.getAttribute('mp'),
            fp: oCreature.getAttribute('foodp') / 10 | 0,
            ks: oDungeon.getPossessedKeys(),
            kg: oDungeon.getGenericKeyCount(),
            iw: this.getItemRef(oInventory, 'hand'),
            ia: this.getItemRef(oInventory, 'neck'),
            ir: this.getItemRef(oInventory, 'finger'),
            ie: this.getItemRef(oInventory, 'ears'),
            cr: oCreature.oExtraData.craft.length
        };
        const oDigest = {};
        let bEmpty = true;
        for (const sKey in oCandidate) {
            if (this.oProgressDigest[sKey] != oCandidate[sKey]) {
                oDigest[sKey] = oCandidate[sKey];
                this.oProgressDigest[sKey] = oCandidate[sKey];
                bEmpty = false
            }
        }
        if (!bEmpty) {
            const oPostData = {
                f: 'ru_log_*remote_addr',
                d: oDigest
            }
        }
    }
}
