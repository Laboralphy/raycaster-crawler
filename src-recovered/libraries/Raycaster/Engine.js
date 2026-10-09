O2.createObject('O876_Raycaster.Engine', class Engine extends O876_Raycaster.Transistate {
    __construct() {
        super.__construct('stateInitialize');
        this.resume()
    }

    initRequestAnimationFrame() {
        if ('requestAnimationFrame' in window) {
            return true
        }
        var RAF = null;
        if ('requestAnimationFrame' in window) {
            RAF = window.requestAnimationFrame
        } else if ('webkitRequestAnimationFrame' in window) {
            RAF = window.webkitRequestAnimationFrame
        } else if ('mozRequestAnimationFrame' in window) {
            RAF = window.mozRequestAnimationFrame
        }
        if (RAF) {
            window.requestAnimationFrame = RAF;
            return true
        } else {
            return false
        }
    }

    // À la reprise (resume), l'horloge repart de maintenant : sinon la boucle
    // rattraperait d'un coup tout le temps passé en pause (inventaire,
    // sauvegarde...). La remise à zéro précède l'appel au parent, qui
    // exécute immédiatement une itération de la boucle.
    initDoomloop() {
        this.nLastTimeStamp = Date.now();
        super.initDoomloop()
    }

    _callGameEvent(sEvent) {
        if (sEvent in this && this[sEvent]) {
            var pFunc = this[sEvent];
            var aParams = Array.prototype.slice.call(arguments, 1);
            return pFunc.apply(this, aParams)
        }
        return null
    }

    _halt(sError, oError) {
        if (('console' in window) && ('log' in window.console) && (sError)) {
            console.log(sError);
            if (oError) {
                console.log(oError.toString())
            }
        }
        this.pause();
        this.setDoomloop('stateEnd');
        if (this.oKbdDevice) {
            this.oKbdDevice.unplugEvents()
        }
        if (this.oMouseDevice) {
            this.oMouseDevice.unplugEvents()
        }
    }

    _getKeyboardDevice() {
        if (this.oKbdDevice === null) {
            this.oKbdDevice = new O876_Raycaster.KeyboardDevice();
            this.oKbdDevice.plugEvents()
        }
        return this.oKbdDevice
    }

    _getMouseDevice(oElement) {
        if (this.oMouseDevice === null) {
            if (oElement === undefined) {
                throw new Error('no target element specified for the mouse device')
            }
            this.oMouseDevice = new O876_Raycaster.MouseDevice();
            this.oMouseDevice.plugEvents(oElement)
        }
        return this.oMouseDevice
    }

    getTime() {
        return this.nLastTimeStamp
    }

    enterLevel(sLevel) {
        this._callGameEvent('onExitLevel');
        this.setDoomloop('stateStartRaycaster')
    }

    openDoor(x, y, bStayOpen) {
        var nPhys = this.oRaycaster.getMapXYPhysical(x, y);
        var o = null;
        switch (nPhys) {
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                if (!Marker.getMarkXY(this.oRaycaster.oDoors, x, y)) {
                    o = new O876_Raycaster.GXDoor(this.oRaycaster);
                    o.x = x;
                    o.y = y;
                    if (bStayOpen) {
                        o.setAutoClose(0)
                    }
                    this.oRaycaster.oEffects.addEffect(o)
                }
                break;
            case 9:
                if (!Marker.getMarkXY(this.oRaycaster.oDoors, x, y)) {
                    o = new O876_Raycaster.GXSecret(this.oRaycaster);
                    o.x = x;
                    o.y = y;
                    this.oRaycaster.oEffects.addEffect(o)
                }
                break
        }
        return o
    }

    closeDoor(x, y, bForce) {
        var oDoor = Marker.getMarkXY(this.oRaycaster.oDoors, x, y);
        if (oDoor) {
            oDoor.setAutoClose(1);
            oDoor.close()
        }
        return oDoor
    }

    setObjectIndex(oObject, id) {
        this.oObjectIndex[id] = oObject
    }

    clearObjectIndex(id) {
        delete this.oObjectIndex[id]
    }

    getObjectIndex(id) {
        if (id in this.oObjectIndex) {
            return this.oObjectIndex[id]
        } else {
            throw new Error('game.getObjectIndex: object (' + id + ') not found.')
        }
    }

    spawnMobile(sBlueprint, x, y, fAngle) {
        return this.oRaycaster.oHorde.spawnMobile(sBlueprint, x, y, fAngle)
    }

    stateInitialize() {
        this._callGameEvent('onInitialize');
        this.TIME_FACTOR = this.nInterval = CONFIG.game.interval;
        switch (CONFIG.game.doomloop) {
            case 'interval':
                this.stateRunning = this.stateRunningInt;
                break;
            case 'raf':
                if (this.initRequestAnimationFrame()) {
                    this.stateRunning = this.stateRunningRAF
                } else {
                    this.stateRunning = this.stateRunningInt
                }
                break
        }
        this.setDoomloop('stateMenuLoop');
        this.resume()
    }

    stateMenuLoop() {
        if (this._callGameEvent('onMenuLoop')) {
            this.setDoomloop('stateStartRaycaster')
        }
    }

    stateStartRaycaster() {
        if (this.oRaycaster) {
            this.oRaycaster.finalize()
        } else {
            this.oRaycaster = new O876_Raycaster.Raycaster();
            this.oRaycaster.TIME_FACTOR = this.TIME_FACTOR
        }
        this.oRaycaster.setConfig(CONFIG.raycaster);
        this.oObjectIndex = {};
        this.oRaycaster.initialize();
        this.oThinkerManager = this.oRaycaster.oThinkerManager;
        this.oThinkerManager.oGameInstance = this;
        this._callGameEvent('onLoading', 'lvl', 0, 2);
        this.setDoomloop('stateBuildLevel')
    }

    stateBuildLevel() {
        var oData = this._callGameEvent('onRequestLevelData');
        if (typeof oData != 'object') {
            this._halt('no world data : without world data I can\'t build the world. (onRequestLevelData did not return object)');
            return
        }
        this.oRaycaster.defineWorld(oData);
        try {
            this.oRaycaster.buildLevel()
        } catch (e) {
            console.log(e.stack);
            this._halt('invalid world data (' + e.message + ')');
            return
        }
        this.nShadedTileCount = 0;
        var iStc = '';
        for (iStc in this.oRaycaster.oHorde.oTiles) {
            if (this.oRaycaster.oHorde.oTiles[iStc].bShading) {
                ++this.nShadedTileCount
            }
        }
        this.setDoomloop('stateLoadComplete')
    }

    stateLoadComplete() {
        this._callGameEvent('onLoading', 'gfx', this.oRaycaster.oImages.countLoaded(), this.oRaycaster.oImages.countLoading() + this.nShadedTileCount);
        if (this.oRaycaster.oImages.complete()) {
            this.oRaycaster.backgroundRedim();
            this.nShadedTiles = 0;
            this.setDoomloop('stateShading')
        }
    }

    stateShading() {
        this._callGameEvent('onLoading', 'shd', this.oRaycaster.oImages.countLoaded() + this.nShadedTiles, this.oRaycaster.oImages.countLoading() + this.nShadedTileCount);
        ++this.nShadedTiles;
        if (!this.oRaycaster.shadeProcess()) {
            return
        }
        this.nLastTimeStamp = Date.now();
        this.oFrameCounter = new O876_Raycaster.FrameCounter();
        this.oFrameCounter.start(this.nLastTimeStamp);
        this.setDoomloop('stateRunning');
        this._callGameEvent('onLoading', 'end', 1, 1);
        this._callGameEvent('onEnterLevel')
    }

    stateRunningInt() {
        var nNowTimeStamp = Date.now();
        var nFrames = 0;
        while (this.nLastTimeStamp < nNowTimeStamp) {
            this.oRaycaster.frameProcess();
            this._callGameEvent('onDoomLoop');
            this.nLastTimeStamp += this.nInterval;
            nFrames++
        }
        if (nFrames) {
            this.oRaycaster.frameRender();
            this._callGameEvent('onFrameRendered');
            if (this.oFrameCounter.check(nNowTimeStamp)) {
                this._callGameEvent('onFrameCount', this.oFrameCounter.nFPS, this.oFrameCounter.getAvgFPS(), this.oFrameCounter.nSeconds)
            }
        }
    }

    stateRunningRAF(nTime) {
        var E = window.__transistateMachine;
        requestAnimationFrame(E.stateRunning);
        var nNowTimeStamp = Date.now();
        var nFrames = 0;
        while (E.nLastTimeStamp < nNowTimeStamp) {
            E.oRaycaster.frameProcess();
            E._callGameEvent('onDoomLoop');
            E.nLastTimeStamp += E.nInterval;
            nFrames++
        }
        if (nFrames) {
            E.oRaycaster.frameRender();
            E._callGameEvent('onFrameRendered');
            if (E.oFrameCounter.check(nNowTimeStamp)) {
                E._callGameEvent('onFrameCount', this.oFrameCounter.nFPS, this.oFrameCounter.getAvgFPS(), this.oFrameCounter.nSeconds)
            }
        }
    }

    stateEnd() {
        this.pause()
    }
});
Object.assign(O876_Raycaster.Engine.prototype, {
    TIME_FACTOR: 50,
    oRaycaster: null,
    oKbdDevice: null,
    oMouseDevice: null,
    oThinkerManager: null,
    oObjectIndex: null,
    oFrameCounter: null,
    nLastTimeStamp: 0,
    nShadedTiles: 0,
    nShadedTileCount: 0,
    stateRunning: null
});
