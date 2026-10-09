O2.createObject('GXIconPad', class GXIconPad extends O876_Raycaster.GXEffect {
    __construct(oRaycaster) {
        super.__construct(oRaycaster);
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d');
        this.oRenderCanvas = O876.CanvasFactory.getCanvas();
        this.oRenderCanvas.width = this.oCanvas.width - this.PAD_X - this.PAD_X;
        this.oRenderCanvas.height = this.PAD_HEIGHT;
        this.oRenderContext = this.oRenderCanvas.getContext('2d')
    }

    setCreature(oCreature) {
        this.oCreature = oCreature;
        this.oEffects = this.oCreature.oEffects
    }

    getIcon(sIcon) {
        var sIconName = 'eff_' + sIcon;
        if (!(sIconName in ICONS)) {
            throw new Error('unknown alteration icon: ' + sIcon)
        }
        if (this.oIcons === null) {
            this.oIcons = {}
        }
        if (!(sIcon in this.oIcons)) {
            var oIcon = this.oRaycaster.oHorde.oTiles.i_icons.oImage;
            this.oIcons[sIcon] = {
                icon: oIcon,
                effect: null,
                visible: true,
                offset: ICONS[sIconName] * this.PAD_ICON_SIZE
            }
        }
        return this.oIcons[sIcon]
    }

    setIconEffect(oEffect) {
        var oIcon = this.getIcon(oEffect.sEffect.substr(1, 4));
        if (oIcon.effect === null) {
            oIcon.effect = oEffect;
            return oIcon
        }
        if (oIcon.effect == oEffect) {
            return oIcon
        }
        if (oIcon.effect.bExpirable && oIcon.effect.nTimeOut < oEffect.nTimeOut) {
            oIcon.effect = oEffect
        }
        return oIcon
    }

    reset() {
        this.sSnapShot = 'xxx';
        this.oIcons = null
    }

    processIcons() {
        var nEffCount = this.oEffects.length;
        var sSnapShot = '';
        var oEffect;
        var iEff;
        for (iEff = 0; iEff < nEffCount; iEff++) {
            oEffect = this.oEffects[iEff];
            sSnapShot += oEffect.sEffect
        }
        if (sSnapShot != this.sSnapShot) {
            this.sSnapShot = sSnapShot;
            for (iEff = 0; iEff < nEffCount; iEff++) {
                oEffect = this.oEffects[iEff];
                this.setIconEffect(oEffect)
            }
            return this.orderIcons()
        } else {
            return false
        }
    }

    compareIcons(oIconA, oIconB) {
        return oIconA.effect.sEffect > oIconB.effect.sEffect
    }

    orderIcons() {
        var aDisplayIcons = [];
        var oIcon;
        for (var iIc in this.oIcons) {
            oIcon = this.oIcons[iIc];
            if (oIcon.effect) {
                if (oIcon.effect.hasExpired()) {
                    oIcon.effect = null;
                    oIcon.visible = false
                } else {
                    aDisplayIcons.push(oIcon);
                    oIcon.visible = true
                }
            }
        }
        aDisplayIcons.sort(this.compareIcons);
        return aDisplayIcons
    }

    isOver() {
        return false
    }

    process() {
        var x = 0;
        var oIcon;
        var a = this.processIcons();
        if (a) {
            this.oRenderContext.clearRect(0, 0, this.oRenderCanvas.width, this.oRenderCanvas.height);
            for (var i in a) {
                oIcon = a[i];
                if (oIcon.visible) {
                    this.oRenderContext.drawImage(oIcon.icon, oIcon.offset, 0, this.PAD_ICON_SIZE, this.PAD_ICON_SIZE, x, 0, this.PAD_ICON_SIZE, this.PAD_ICON_SIZE);
                    x += this.PAD_ICON_SIZE + this.PAD_ICON_SPACING
                }
            }
        }
    }

    render() {
        this.oContext.drawImage(this.oRenderCanvas, this.PAD_X, this.PAD_Y)
    }

    done() {}

    terminate() {}
});
Object.assign(GXIconPad.prototype, {
    sClass: 'IconPad',
    oCanvas: null,
    oContext: null,
    oRenderCanvas: null,
    oRenderContext: null,
    oIcons: null,
    oEffects: null,
    oCreature: null,
    sSnapShot: 'xxx',
    PAD_HEIGHT: 48,
    PAD_Y: 8,
    PAD_X: 8,
    PAD_ICON_SPACING: 2,
    PAD_ICON_SIZE: 48
});
