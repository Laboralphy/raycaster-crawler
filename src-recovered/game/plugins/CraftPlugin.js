import { Item } from '../Item.js';
import { CraftWindow } from '../UI/CraftWindow.js';
import { UI } from '../UI/UI.js';
import { CRAFT_DATA } from '../data/CRAFT_DATA.js';
import { LABY } from '../data/LABY.js';
import { STRINGS } from '../data/STRINGS.js';

export class CraftPlugin {
    uiController(sCommand, xParams) {
        let w;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new CraftWindow(xParams)));
                break;
            case 'up':
                w = this.getWidget();
                if (!w.oPopup._bVisible) {
                    w.selectUp()
                }
                break;
            case 'down':
                w = this.getWidget();
                if (!w.oPopup._bVisible) {
                    w.selectDown()
                }
                break;
            case 'get':
                w = this.getWidget();
                return w.getSelectedRecipe();
            case 'craft':
                w = this.getWidget();
                w.resetProgress();
                w.oPopup.show();
                w.setCraftItem(xParams);
                break;
            case 'progress':
                w = this.getWidget();
                return w.progress(xParams);
            case 'reclaim':
                w = this.getWidget();
                w.displayMessage(STRINGS._('~m_craft_success'));
                return w.getCraftItem(xParams);
            case 'fail':
                w = this.getWidget();
                w.displayMessage(STRINGS._('~m_craft_more') + '\n' + xParams.join(', ') + '.');
                break;
            case 'abort':
                w = this.getWidget();
                w.oPopup.hide();
                break;
            case 'off':
                w = this.getWidget();
                if (w.oPopup._bVisible) {
                    w.oPopup.hide();
                    return false
                } else {
                    this.oScreen.hide()
                }
                return true;
            case 'update':
                w = this.getWidget();
                w.updateCraftableFlag(xParams);
                break
        }
    }

    time() {
        if (this.oGame.nIntfMode == UI.INTFMODE_CRAFT && this.bCrafting) {
            if (this.oGame.ui_command('progress')) {
                const oCraftedItem = this.oGame.ui_command('reclaim');
                this.oGame.oDungeon.pickupItem(this.oGame.oDungeon.getPlayerCreature(), oCraftedItem);
                this.bCrafting = false;
                this.updateCraftWindow(this.oGame.oDungeon.getPlayerCreature());
                this.oGame.unregisterPluginSignal('time', this);
                this.oGame.sendPluginSignal('craft', this.oGame.getPlayer(), oCraftedItem)
            }
        }
    }

    block(nBlock, oMobile, x, y) {
        if (oMobile == this.oGame.getPlayer()) {
            switch (nBlock) {
                case LABY.BLOCK_LIVING_FIREPLACE:
                    this.openCraft(this.oGame.oDungeon.getPlayerCreature(), 'cook');
                    return true;
                case LABY.BLOCK_LABO_ALCHEMY:
                    this.openCraft(this.oGame.oDungeon.getPlayerCreature(), 'brew');
                    return true;
                case LABY.BLOCK_LABO_BOOK:
                    this.oGame.oBookSystem.readShelf(x, y, 'recipe');
                    this.oGame.oBookSystem.markShelfRead(x, y);
                    return true;
                case LABY.BLOCK_WATCH_WALL_2_X:
                    this.oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_WATCH_WALL_2_X_USED);
                    this.oGame.oBookSystem.readShelf(x, y, 'recipe');
                    return true;
                case LABY.BLOCK_WATCH_WALL_2_Y:
                    this.oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_WATCH_WALL_2_Y_USED);
                    this.oGame.oBookSystem.readShelf(x, y, 'recipe');
                    return true
            }
        }
        return false
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('block', this)
    }

    getCraftRecipeList(sType, nLevel, oLearningCreature) {
        const aList = [];
        let aKnown;
        if (oLearningCreature) {
            aKnown = oLearningCreature.oExtraData.craft
        } else {
            aKnown = []
        }
        let sRec = '',
            oRec;
        for (sRec in CRAFT_DATA) {
            oRec = CRAFT_DATA[sRec];
            if (oRec.type == sType && oRec.level <= nLevel && aKnown.indexOf(sRec) < 0) {
                aList.push(sRec)
            }
        }
        return aList
    }

    getCraftRecipe(sRecipe) {
        let r, q, oItem;
        if (this.oCraftRecipes === null) {
            this.oCraftRecipes = {
                brew: {},
                cook: {}
            }
        }
        const sType = CRAFT_DATA[sRecipe].type;
        if (!(sRecipe in this.oCraftRecipes[sType])) {
            const aRec = [new Item(sRecipe, 1)];
            for (let i = 0; i < CRAFT_DATA[sRecipe].reagents.length; i++) {
                r = CRAFT_DATA[sRecipe].reagents[i][0];
                q = CRAFT_DATA[sRecipe].reagents[i][1];
                oItem = new Item(r, q);
                aRec.push(oItem)
            }
            this.oCraftRecipes[sType][sRecipe] = aRec
        }
        return this.oCraftRecipes[sType][sRecipe]
    }

    openCraft(oCreature, sType) {
        const aCraft = oCreature.oExtraData.craft;
        const aCD = [];
        let aRec;
        let sRec;
        const aAble = [];
        for (let iCraft = 0; iCraft < aCraft.length; iCraft++) {
            sRec = aCraft[iCraft];
            aRec = this.getCraftRecipe(sRec);
            if (CRAFT_DATA[sRec].type == sType) {
                aCD.push(aRec);
                if (this.craftItem(oCreature, sRec, true)) {
                    aAble.push(sRec)
                }
            }
        }
        this.oGame.ui_open('Craft', {
            title: 'Brewing potion',
            message: 'What will you brew ?',
            recipes: aCD,
            able: aAble,
            image: this.oGame.oRaycaster.oHorde.oTiles.i_icons.oImage
        })
    }

    updateCraftWindow(oCreature) {
        const oCS = this;
        this.oGame.oUI.command('Craft', 'update', function(sRec) {
            return oCS.craftItem(oCreature, sRec, true)
        })
    }

    craftItem(oCreature, sRecipeId, bTest) {
        if (bTest === undefined) {
            bTest = false
        }
        let oComp, iComp, nNeed, nItemGot, bFailed = false;
        const aRec = this.getCraftRecipe(sRecipeId);
        const oInv = this.oGame.oDungeon.getCreatureInventory(oCreature);
        const aMissingComps = [];
        for (iComp = 1; iComp < aRec.length; iComp++) {
            oComp = aRec[iComp];
            nNeed = oComp.stackcount;
            nItemGot = oInv.countItemStacks(oComp.resref);
            if (nNeed > nItemGot) {
                aMissingComps.push(oComp.name);
                bFailed = true;
                if (bTest) {
                    return false
                }
            }
        }
        if (bTest) {
            return true
        }
        if (bFailed) {
            this.oGame.ui_command('fail', aMissingComps);
            return false
        }
        for (iComp = 1; iComp < aRec.length; iComp++) {
            oComp = aRec[iComp];
            nNeed = oComp.stackcount;
            oInv.removeItemStack(oComp.resref, nNeed)
        }
        this.bCrafting = true;
        this.oGame.ui_command('craft', new Item(sRecipeId, aRec[0].stackcount));
        this.oGame.registerPluginSignal('time', this);
        return true
    }

    craftSelectedItem() {
        const sRecipeId = this.oGame.oUI.command('Craft', 'get');
        if (sRecipeId !== null) {
            this.craftItem(this.oGame.oDungeon.getPlayerCreature(), sRecipeId)
        }
    }

    abort() {
        if (this.bCrafting) {
            this.oGame.ui_command('abort');
            this.bCrafting = false;
            this.oGame.unregisterPluginSignal('time', this);
            this.updateCraftWindow(this.oGame.oDungeon.getPlayerCreature());
            return true
        } else {
            if (this.oGame.oUI.command('', 'off')) {
                this.oGame.getPlayer().oThinker.bActive = true;
                this.oGame.nIntfMode = UI.INTFMODE_NONE;
                return true
            }
        }
        return false
    }
}
Object.assign(CraftPlugin.prototype, {
    oGame: null,
    bCrafting: false,
    oCraftRecipes: null,
    oRecipeList: null
});
