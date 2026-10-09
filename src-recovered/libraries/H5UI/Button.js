O2.createObject('H5UI.Button', class Button extends H5UI.Box {
    __construct() {
        super.__construct();
        this.setSize(64, 24);
        this.setColor(this._sColorNormal, this._sColorOver);
        this.setBorder(1, this._sColorBorder);
        this.oText = this.linkControl(new H5UI.Text());
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
});
Object.assign(H5UI.Button.prototype, {
    oText: null,
    _sColorNormal: '#999',
    _sColorOver: '#BBB',
    _sColorSelect: '#DDD',
    _sColorBorder: '#000'
});
