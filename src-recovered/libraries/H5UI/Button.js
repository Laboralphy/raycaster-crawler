import { Box } from './Box.js';
import { Text } from './Text.js';

export class Button extends Box {
    __construct() {
        super.__construct();
        this.setSize(64, 24);
        this.setColor(this._sColorNormal, this._sColorOver);
        this.setBorder(1, this._sColorBorder);
        this.oText = this.linkControl(new Text());
        this.oText.font.setFont('Arial');
        this.oText.font.setSize(12);
        this.oText.font.setColor('#000');
        this.oText.moveTo(4, 4);
        this.oText.setCaption('Button');
        this.oText.align('center')
    }

    setCaption(sCaption) {
        this.oText.setCaption(sCaption);
        this.realignControls()
    }

    getCaption() {
        return this.oText._sCaption
    }

    highlight(b) {
        if (b) {
            this.setColor(this._sColorSelect, this._sColorOver)
        } else {
            this.setColor(this._sColorNormal, this._sColorOver)
        }
    }
}
Object.assign(Button.prototype, {
    oText: null,
    _sColorNormal: '#999',
    _sColorOver: '#BBB',
    _sColorSelect: '#DDD',
    _sColorBorder: '#000'
});
