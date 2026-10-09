import { CRAFT_DATA } from '../data/CRAFT_DATA.js';
import { LABY } from '../data/LABY.js';

export class ScorePlugin {
    setGame(g) {
        this.oGame = g;
        this.oMonsters = {};
        this.oGame.registerPluginSignal('kill', this);
        this.oGame.registerPluginSignal('block', this);
        this.oGame.registerPluginSignal('craft', this)
    }

    getMonsterValue(oMonster) {
        const sMonsterId = oMonster.getBlueprint().sId;
        if (sMonsterId in this.oMonsters) {
            return this.oMonsters[sMonsterId]
        }
        return this.oMonsters[sMonsterId] = oMonster.getData('score')
    }

    givePoints(oMob, nAmount) {
        const oCreature = oMob.getData('creature');
        oCreature.modifyAttribute('score', nAmount)
    }

    getInventoryValue(oWho) {
        const d = this.oGame.oDungeon;
        const oCreature = oWho.getData('creature');
        const oInv = d.getCreatureInventory(oCreature);
        const aItems = oInv.getAllObjects();
        const nItemCount = aItems.length;
        let oItem, nItemValue;
        let nScore = 0;
        for (let iItem = 0; iItem < nItemCount; iItem++) {
            oItem = aItems[iItem];
            if (oItem.resref === 'gold') {
                nItemValue = oItem.stackcount
            } else {
                nItemValue = oItem.stackcount * d.getItemLevel(oItem)
            }
            if (!isNaN(nItemValue)) {
                nScore += nItemValue
            }
        }
        return nScore
    }

    getScore(oWho) {
        const oCreature = oWho.getData('creature');
        return this.getInventoryValue(oWho) * this.POINTS_INVENTORY + oCreature.getAttribute('score')
    }

    kill(oKiller, oVictim) {
        this.givePoints(oKiller, this.getMonsterValue(oVictim))
    }

    block(nBlockCode, oMobile, x, y) {
        switch (nBlockCode) {
            case LABY.BLOCK_SECRET:
                this.givePoints(oMobile, this.POINTS_SECRET);
                break;
            case LABY.BLOCK_KEY_0:
            case LABY.BLOCK_KEY_1:
            case LABY.BLOCK_KEY_2:
            case LABY.BLOCK_KEY_3:
                this.givePoints(oMobile, this.POINTS_COLOR_KEY);
                break
        }
    }

    craft(oCrafter, oItem) {
        this.givePoints(oCrafter, CRAFT_DATA[oItem.resref].level * this.POINTS_CRAFT_PER_LEVEL)
    }
}
Object.assign(ScorePlugin.prototype, {
    oGame: null,
    oMonsters: null,
    POINTS_INVENTORY: 5,
    POINTS_CRAFT_PER_LEVEL: 25,
    POINTS_SECRET: 50,
    POINTS_COLOR_KEY: 50
});
