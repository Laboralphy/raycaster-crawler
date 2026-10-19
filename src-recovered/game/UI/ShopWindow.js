import { Item } from '../Item.js';
import { Icon } from './Icon.js';
import { UI } from './UI.js';
import { Window } from './Window.js';
import { ICONS } from '../data/ICONS.js';
import { STRINGS } from '../data/STRINGS.js';
import { Box } from '../../libraries/H5UI/Box.js';
import { ScrollBox } from '../../libraries/H5UI/ScrollBox.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class ShopWindow extends Window {
    constructor(oParams) {
        super({
            caption: '~win_shop'
        });
        this._sClass = 'UI.ShopWindow';
        this.nWidth = 512;
        this.nHeight = 356;
        this.oPopup = null;
        this.aItems = null;
        this.aPrices = null;
        this.nIconSize = 48;
        this.xTab = 32;
        this.yTab = 32;
        this.oSelector = null;
        this.oGold = null;
        this.nOptionHeight = 58;
        this.nOptionVisible = 4;
        this.ySelected = null;
        this.clSOLDOUT_TEXTCOLOR = '#800';
        this.clSOLDOUT_COLOR = '#444444';
        this.clSOLDOUT_BORDER = '#666666';
        this.clSOLDOUT_SELECT = '#444455';
        this.oParams = oParams;
        this.nOptionWidth = this.nWidth - this.xTab - this.xTab;
        this.yIcon = (this.nOptionHeight - UI.INV_ICON_SIZE) >> 1;
        this.buildWindowContent()
    }

    setIconStackCounter(oIcon, oItem) {
        oIcon.setStackCounter(oItem && oItem.isStackable() ? oItem.stackcount : 0)
    }

    buildOption(oItem, nPrice, bSoldOut) {
        const oOption = this.oSelector.linkControl(new Box());
        oOption.__bSoldOut = bSoldOut;
        oOption.setSize(this.nOptionWidth, this.nOptionHeight);
        oOption.setColor(bSoldOut ? this.clSOLDOUT_COLOR : UI.clDARK_WINDOW);
        oOption.setBorder(1, bSoldOut ? this.clSOLDOUT_BORDER : UI.clWINDOW_BORDER);
        oOption.onClick = this.optionClick;
        oOption.onDblclick = this.optionDblclick;
        let oIcon = oOption.linkControl(new Icon());
        oIcon.setSize(UI.INV_ICON_SIZE, UI.INV_ICON_SIZE);
        oIcon.moveTo(this.yIcon, this.yIcon);
        oIcon.setImage(this.oParams.image);
        oIcon._set('_bRedCross', bSoldOut);
        oIcon.xStart = oItem.icon * UI.INV_ICON_SIZE;
        if (oItem.stackcount > 1) {
            oIcon.setStackCounter(oItem.stackcount)
        }
        const oCaption = oOption.linkControl(new Text());
        oCaption.font.setFont('monospace');
        oCaption.font.setSize(12);
        oCaption.font.setColor(bSoldOut ? this.clSOLDOUT_TEXTCOLOR : UI.clFONT);
        oCaption.setAutosize(true);
        oCaption.moveTo(64, 16);
        oCaption.setCaption(bSoldOut ? STRINGS._('~win_shop_soldout') : oItem.name);
        oIcon = oOption.linkControl(new Icon());
        oIcon.setSize(UI.INV_ICON_SIZE, UI.INV_ICON_SIZE);
        oIcon.moveTo(this.nOptionWidth - 1 - UI.INV_ICON_SIZE - this.yIcon, this.yIcon);
        oIcon.setImage(this.oParams.image);
        oIcon.xStart = ICONS.itm_gold * UI.INV_ICON_SIZE;
        oIcon.setStackCounter(nPrice);
        return oOption
    }

    updateContent() {}

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight);
        this.oSelector = this.linkControl(new ScrollBox());
        this.oSelector.moveTo(this.xTab, this.yTab), this.oSelector.setSize(this.nOptionWidth, this.nOptionHeight * this.nOptionVisible);
        this.onMouseWheelUp = function() {
            this.command('shop_prev')
        };
        this.onMouseWheelDown = function() {
            this.command('shop_next')
        };
        let oOption, oItem;
        let nPrice, sItem, iItem;
        const aItems = this.oParams.items;
        this.aItems = [];
        this.aPrices = [];
        for (iItem = 0; iItem < aItems.length; iItem++) {
            sItem = aItems[iItem][0];
            nPrice = aItems[iItem][1];
            oOption = this.buildOption(oItem = new Item(sItem), nPrice, aItems[iItem][2]);
            oOption.__y = iItem;
            oOption.moveTo(0, iItem * oOption.getHeight());
            this.aItems.push(oItem);
            this.aPrices.push(nPrice)
        }
        const oIcon = this.linkControl(new Icon());
        oIcon.setSize(UI.INV_ICON_SIZE, UI.INV_ICON_SIZE);
        oIcon.moveTo(this.nOptionWidth + this.xTab - UI.INV_ICON_SIZE - this.yIcon, this.nOptionHeight * this.nOptionVisible + this.yTab + this.yIcon);
        oIcon.setImage(this.oParams.image);
        oIcon.xStart = ICONS.itm_gold * UI.INV_ICON_SIZE;
        oIcon.setStackCounter(this.oParams.gold);
        this.oGold = oIcon;
        this.setCommands([
            ['~key_gen_close', 'shop_close', 4], null, ['~key_shop_buy', 'shop_buy', 1],
            ['~key_inv_look', 'shop_look', 1]
        ]);
        const p = this.oPopup = this.linkControl(new Window({
            caption: STRINGS._('~win_shop_message')
        }));
        p.hide();
        p.setSize(320, 160);
        p.moveTo((this.nWidth - p.getWidth()) >> 1, (this.nHeight - p.getHeight()) >> 1);
        const oCaption = p.linkControl(new Text());
        oCaption.font.setFont('monospace');
        oCaption.font.setSize(12);
        oCaption.font.setColor(UI.clFONT);
        oCaption.moveTo(20, 40);
        oCaption.setSize((this.nWidth - oCaption._x) >> 1, 60);
        oCaption.setAutosize(false);
        oCaption.setWordWrap(true);
        p.setCommands([
            ['~key_gen_close', 'shop_popup_close', 4]
        ]);
        p.command = function(s) {
            this.getParent().command(s)
        }
    }

    displayMessage(sMessage) {
        this.oPopup.setTitleCaption(STRINGS._('~win_information'));
        const pm = this.oPopup.getControl(1);
        pm.setCaption(sMessage);
        this.oPopup.show()
    }

    buySelectedItem() {
        const oItem = this.getSelectedItem();
        const nPrice = this.aPrices[this.ySelected];
        const oOption = this.getSelectedOption();
        if (!oOption.__bSoldOut) {
            if (this.getPlugin('Shop').buy(oItem.resref, nPrice)) {
                this.oGold.setStackCounter(this.oParams.gold -= nPrice);
                oOption.__bSoldOut = true;
                this.oParams.items[this.ySelected][2] = true;
                const oIcon = oOption.getControl(0);
                const oText = oOption.getControl(1);
                oIcon._set('_bRedCross', true);
                oText.setCaption(STRINGS._('~win_shop_soldout'));
                oText.font.setColor(this.clSOLDOUT_TEXTCOLOR);
                oOption.setColor(this.clSOLDOUT_COLOR)
            }
        }
    }

    command(sCommand) {
        let y;
        switch (sCommand) {
            case 'shop_close':
                this.getPlugin('Shop').closeShop();
                this.close();
                break;
            case 'shop_buy':
                this.buySelectedItem();
                break;
            case 'shop_next':
                y = this.oSelector.getScrollY() + this.nOptionHeight;
                y = Math.min(y, (Math.max(0, this.getOptionCount() - this.nOptionVisible)) * this.nOptionHeight);
                this.oSelector.scrollTo(0, y);
                break;
            case 'shop_prev':
                y = this.oSelector.getScrollY() - this.nOptionHeight;
                y = Math.max(0, y);
                this.oSelector.scrollTo(0, y);
                break;
            case 'shop_popup_close':
                this.oPopup.hide();
                break;
            case 'shop_look':
                this.getPlugin('Descriptor').displayDescriptionWindow(this.getSelectedItem());
                break
        }
    }

    optionClick() {
        this.getParent().getParent().getParent().select(this.__y)
    }

    optionDblclick() {
        const p = this.getParent().getParent().getParent();
        p.select(this.__y);
        p.command('shop_buy')
    }

    getOption(n) {
        return this.oSelector.getContainer().getControl(n)
    }

    getSelectedOption() {
        return this.getOption(this.ySelected)
    }

    getOptionCount() {
        return this.oSelector.getContainer().getControlCount()
    }

    getSelectedItem() {
        return this.aItems[this.ySelected]
    }

    select(y) {
        const nOptionCount = this.getOptionCount();
        y = Math.max(0, Math.min(nOptionCount - 1, y));
        let o;
        if (this.ySelected !== y) {
            if (this.ySelected !== null) {
                o = this.getOption(this.ySelected);
                o.setBorder(1, o.__bSoldOut ? this.clSOLDOUT_BORDER : UI.clWINDOW_BORDER);
                o.setColor(o.__bSoldOut ? this.clSOLDOUT_COLOR : UI.clDARK_WINDOW)
            }
            o = this.getOption(this.ySelected = y);
            o.setBorder(3, UI.clSELECT_BORDER);
            o.setColor(o.__bSoldOut ? this.clSOLDOUT_SELECT : UI.clSELECT_WINDOW)
        }
    }
}
