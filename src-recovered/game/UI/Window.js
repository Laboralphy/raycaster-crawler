O2.createObject('UI.Window', class Window extends H5UI.Box {
    __construct(oParams) {
        super.__construct();
        this.setColor(UI.clWINDOW, UI.clWINDOW);
        this.setBorder(4, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER);
        var oCaption = this.linkControl(new H5UI.Text());
        oCaption.font.setFont('monospace');
        oCaption.font.setSize(12);
        oCaption.font.setColor(UI.clFONT);
        oCaption.setCaption(STRINGS._(oParams.caption));
        oCaption.moveTo(8, 8);
        this._oCaptionBar = oCaption;
        this._aCmdButtons = []
    }

    close() {
        G.ui_close()
    }

    getPlugin(sPlugin) {
        return G.oUI.oPlugins[sPlugin]
    }

    setTitleCaption(s) {
        this._oCaptionBar.setCaption(s)
    }

    setStatusCaption(s) {
        if (this._oStatusBar === null) {
            var oMsg = this.linkControl(new H5UI.Text());
            oMsg._bWordWrap = false;
            oMsg._bAutosize = true;
            oMsg.font.setSize(this._nStatusBarHeight * 0.75 | 0);
            oMsg.font.setFont('arial');
            oMsg.font.setColor('#333333');
            this._oStatusBar = oMsg;
            this._oStatusBar.moveTo(8, this.getHeight() - this._nStatusBarHeight)
        }
        this._oStatusBar.setCaption(s);
        this.invalidate();
        this._oStatusBar.render()
    }

    commandClick() {
        this.getParent().command(this.__command)
    }

    setCommands(a) {
        var aColors = [
            [UI.clWINDOW, '#BBBBBB'],
            ['#6666DD', '#BBBBFF'],
            ['#44DD44', '#BBFFBB'],
            ['#44DDDD', '#BBFFFF'],
            ['#DD4444', '#FFBBBB'],
            ['#DD44DD', '#FFBBFF'],
            ['#DDDD44', '#FFFFBB']
        ];
        var b, aColor, x = 0;
        for (var i = 0; i < a.length; i++) {
            if (a[i] === null) {
                x += 16;
                continue
            }
            b = this.linkControl(new H5UI.Button());
            b.setCaption(STRINGS._(a[i][0]));
            b.setSize(this._nButtonWidth, this._nStatusBarHeight);
            b.moveTo(x + this._nButtonPadding, this.getHeight() - this._nStatusBarHeight - this._nButtonPadding);
            aColor = aColors[a[i][2]];
            b.setColor(aColor[0], aColor[1]);
            b.__command = a[i][1];
            b.onClick = this.commandClick;
            x += this._nButtonWidth + this._nButtonPadding;
            this._aCmdButtons.push(b)
        }
    }

    getCommandButton(n) {
        return this._aCmdButtons[n]
    }

    setSize(w, h) {
        super.setSize(w, h);
        if (this._oStatusBar) {
            this._oStatusBar.moveTo(8, this.getHeight() - this._nStatusBarHeight)
        }
    }
});
Object.assign(UI.Window.prototype, {
    _sClass: 'UI.Window',
    _oStatusBar: null,
    _oCaptionBar: null,
    _nStatusBarHeight: 22,
    _nButtonWidth: 80,
    _nButtonPadding: 4,
    _aCmdButtons: null
});
