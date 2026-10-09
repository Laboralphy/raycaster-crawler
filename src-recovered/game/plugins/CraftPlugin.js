O2.createObject('CraftPlugin', class CraftPlugin {
    uiController(sCommand, xParams) {
        var w;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new UI.CraftWindow(xParams)));
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
                var oCraftedItem = this.oGame.ui_command('reclaim');
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
                    this.oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_LIBRARY_BOOK);
                    this.readRandomRecipe('brew', 1, oMobile.getData('creature'));
                    return true;
                case LABY.BLOCK_WATCH_WALL_2_X:
                    this.oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_WATCH_WALL_2_X_USED);
                    this.readRandomRecipe('brew', 1, oMobile.getData('creature'));
                    return true;
                case LABY.BLOCK_WATCH_WALL_2_Y:
                    this.oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_WATCH_WALL_2_Y_USED);
                    this.readRandomRecipe('brew', 1, oMobile.getData('creature'));
                    return true
            }
        }
        return false
    }

    readRandomRecipe(sType, nLevel, oCreature) {
        var aList = this.getCraftRecipeList(sType, nLevel, oCreature);
        if (aList.length) {
            var sRec = MathTools.rndChoose(aList);
            this.oGame.oBookSystem.read('~craft_' + sType + '_recipe', ['~item_' + sRec]);
            this.oGame.oDungeon.learnCraft(oCreature, sRec)
        }
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('block', this)
    }

    getCraftRecipeList(sType, nLevel, oLearningCreature) {
        var aList = [];
        var aKnown;
        if (oLearningCreature) {
            aKnown = oLearningCreature.oExtraData.craft
        } else {
            aKnown = []
        }
        var sRec = '',
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
        var r, q, oItem;
        if (this.oCraftRecipes === null) {
            this.oCraftRecipes = {
                brew: {},
                cook: {}
            }
        }
        var sType = CRAFT_DATA[sRecipe].type;
        if (!(sRecipe in this.oCraftRecipes[sType])) {
            var aRec = [new Item(sRecipe, 1)];
            for (var i = 0; i < CRAFT_DATA[sRecipe].reagents.length; i++) {
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
        var aCraft = oCreature.oExtraData.craft;
        var aCD = [];
        var aRec;
        var sRec;
        var aAble = [];
        for (var iCraft = 0; iCraft < aCraft.length; iCraft++) {
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
        var oCS = this;
        this.oGame.oUI.command('Craft', 'update', function(sRec) {
            return oCS.craftItem(oCreature, sRec, true)
        })
    }

    craftItem(oCreature, sRecipeId, bTest) {
        if (bTest === undefined) {
            bTest = false
        }
        var oComp, iComp, nNeed, nItemGot, bFailed = false;
        var aRec = this.getCraftRecipe(sRecipeId);
        var oInv = this.oGame.oDungeon.getCreatureInventory(oCreature);
        var aMissingComps = [];
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
        var sRecipeId = this.oGame.oUI.command('Craft', 'get');
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
});
Object.assign(CraftPlugin.prototype, {
    oGame: null,
    bCrafting: false,
    oCraftRecipes: null,
    oRecipeList: null
});
