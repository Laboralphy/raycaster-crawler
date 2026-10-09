import { UI } from './UI.js';
import { Box } from '../../libraries/H5UI/Box.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class ProgressBar extends Box {
    __construct(oParams) {
        super.__construct();
        this.setColor(UI.clDARK_WINDOW, UI.clDARK_WINDOW);
        this.setBorder(1, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER);
        this.oBar = this.linkControl(new Box());
        this.setBarColor(UI.clBAR);
        this.oCaption = this.linkControl(new Text());
        this.oCaption.font.setFont('monospace');
        this.oCaption.font.setSize(12);
        this.oCaption.font.setColor(UI.clFONT);
        this.oCaption.setCaption(this.sCaption);
        this.oCaption.moveTo(8, 8)
    }

    setBarColor(c) {
        this.oBar.setColor(c, c);
        this.oBar.setBorder(1, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER)
    }

    setMax(n) {
        this._set('nMax', n)
    }

    setProgress(n) {
        this._set('nProgress', n);
        this.oBar.setSize(Math.max(1, this.getWidth() * this.nProgress / this.nMax | 0), this.getHeight())
    }

    setCaption(sCaption) {
        this.oCaption.setCaption(sCaption)
    }
}
Object.assign(ProgressBar.prototype, {
    _sClass: 'UI.ProgressBar',
    nMax: 100,
    nProgress: 0,
    oBar: null,
    sCaption: '',
    oCaption: null
});
