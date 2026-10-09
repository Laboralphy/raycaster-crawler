import { Window } from './Window.js';
import { STRINGS } from '../data/STRINGS.js';
import { Box } from '../../libraries/H5UI/Box.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class PlayersheetWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: '~win_playersheet'
        });
        this.oParams = oParams;
        this.buildWindowContent()
    }

    displayAttribute(i, sAttribute, sValue, sColor) {
        const nLineHeight = 4;
        const yAttr = this.yText + ((i >> 1) * (this.nFontSize + nLineHeight + 8));
        const oBox = this.linkControl(new Box());
        oBox.setSize((this.nWidth >> 1) - this.nPadding - (this.nPadding >> 1), this.nFontSize + nLineHeight * 2);
        if (i & 1) {
            oBox.moveTo((this.nWidth >> 1) + (this.nPadding >> 1), yAttr)
        } else {
            oBox.moveTo(this.nPadding, yAttr)
        }
        oBox.setBorder(0);
        oBox.setColor(this.sColorBG);
        let oText = oBox.linkControl(new Text());
        oText._bWordWrap = false;
        oText._bAutosize = true;
        oText.font.setSize(this.nFontSize);
        oText.font.setFont('serif');
        oText.font.setColor(this.sColorAttr);
        oText._nLineHeight = nLineHeight;
        oText.moveTo(this.nPadding >> 3, nLineHeight);
        oText.setCaption(sAttribute);
        oText = oBox.linkControl(new Text());
        oText.font.setStyle('bold');
        oText._bWordWrap = false;
        oText._bAutosize = true;
        oText.font.setSize(this.nFontSize);
        oText.font.setFont('monospace');
        oText.font.setColor(sColor);
        oText._nLineHeight = nLineHeight;
        oText.setCaption(sValue);
        oText.render();
        oText.moveTo(oBox.getWidth() - oText.getWidth() - 4, nLineHeight)
    }

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight);
        this.buildData();
        this.setCommands([
            ['~key_gen_close', 'psheet_close', 4]
        ])
    }

    command(sCommand) {
        switch (sCommand) {
            case 'psheet_close':
                this.close();
                break
        }
    }

    getAttrColor(a) {
        if (a > 0) {
            return this.sColorValueBuffed
        } else if (a < 0) {
            return this.sColorValueDebuffed
        } else {
            return this.sColorValueNorm
        }
    }

    getAttrArray(a) {
        if (a === undefined) {
            return ['0', this.getAttrColor(0)]
        } else {
            return [(a[0] + a[1]).toString(), this.getAttrColor(a[1])]
        }
    }

    buildData() {
        const c = this.oParams.creature;
        const oAttr = c.getAttributes();
        const aBaseAttr = ['vitality', 'energy', 'power', 'speed', 'drphysical', 'drmagical', 'drfire', 'drcold', 'drelectricity', 'drtoxic', 'vulnerability', 'luck'];
        let o, sAttr;
        for (let iAttr = 0; iAttr < aBaseAttr.length; iAttr++) {
            sAttr = aBaseAttr[iAttr];
            o = this.getAttrArray(oAttr[sAttr]);
            this.displayAttribute(iAttr, STRINGS._('~attr_' + sAttr), o[0], o[1])
        }
    }
}
Object.assign(PlayersheetWindow.prototype, {
    nWidth: 480,
    nHeight: 360,
    nFontSize: 14,
    nPadding: 24,
    oParams: null,
    yText: 64,
    oTextAttr: null,
    oTextValue: null,
    sColorAttr: '#AAAAAA',
    sColorValueNorm: '#FFFFFF',
    sColorValueBuffed: '#00CC00',
    sColorValueDebuffed: '#CC0000',
    sColorBG: '#444444'
});
