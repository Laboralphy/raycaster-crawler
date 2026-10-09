O2.createObject('Game', class Game extends O876_Raycaster.Engine {
    addPlugin(sPlugin) {
        if (this.aPlugins === null) {
            this.aPlugins = []
        }
        var p, oPlugin, sClass = sPlugin + 'Plugin';
        if (!(sClass in window)) {
            throw new Error('Game.addPlugin: plugin ' + sClass + ' not found')
        }
        p = window[sPlugin + 'Plugin'];
        oPlugin = new p();
        if (!('setGame' in oPlugin)) {
            throw new Error('Game.addPlugin: plugin ' + sClass + ' has no method "setGame"')
        }
        oPlugin.setGame(this);
        if (('uiController' in oPlugin)) {
            UI.addUIPlugin(sPlugin, oPlugin)
        }
        this.aPlugins.push(oPlugin);
        return oPlugin
    }

    registerPluginSignal(s, o) {
        if (this.oPluginSignalRegister === null) {
            this.oPluginSignalRegister = {}
        }
        if (s in o) {
            if (!(s in this.oPluginSignalRegister)) {
                this.oPluginSignalRegister[s] = []
            }
            if (this.oPluginSignalRegister[s].indexOf(o) < 0) {
                this.oPluginSignalRegister[s].push(o)
            }
        }
    }

    unregisterPluginSignal(s, o) {
        if (this.oPluginSignalRegister === null) {
            return
        }
        if (!(s in this.oPluginSignalRegister)) {
            return
        }
        var n = this.oPluginSignalRegister[s].indexOf(o);
        if (n >= 0) {
            ArrayTools.removeItem(this.oPluginSignalRegister[s], n)
        }
    }

    sendPluginSignal(s) {
        var i, p, pi, n;
        if (this.oPluginSignalRegister && (s in this.oPluginSignalRegister)) {
            p = this.oPluginSignalRegister[s];
            n = p.length;
            if (n) {
                var aArgs;
                if (arguments.length > 1) {
                    aArgs = Array.prototype.slice.call(arguments, 1)
                } else {
                    aArgs = []
                }
                for (i = 0; i < n; i++) {
                    pi = p[i];
                    pi[s].apply(pi, aArgs)
                }
            }
        }
    }

    invokeLabyGenerator(sGenerator, nSeed, sOptions) {
        nSeed = nSeed || 0;
        sOptions = sOptions || '';
        return JSON.parse(XHR.getSync(this.sGeneratorUrl + '?g=' + sGenerator + '&s=' + nSeed.toString() + '&o=' + sOptions))
    }

    newGame() {
        this.sys_statusbar(STRINGS._('~key_mainscreen_html'));
        this.oWeaponAnimator = new WeaponAnimator();
        this.oDungeon = new Dungeon();
        this.oSerializer = new DataSerializer();
        this.oLootSystem = new LootSystem();
        WORLD_DATA = JSON.parse(this.sWorldBackup);
        this.oAdventure = new Adventure()
    }

    enterPointerLockedMode() {
        if (this.bMPL && this.oRaycaster && this.getPlayer().bActive && !this.oUI.oScreen._bVisible) {
            this.oMPL.requestPointerLock(this.oCanvas);
            this.oMPL.setHook(this.getPlayer().oThinker.readMouseMovement, this.getPlayer().oThinker)
        }
        this._getMouseDevice().nSecurityDelay = 10
    }

    exitPointerLockedMode() {
        if (this.bMPL) {
            this.oMPL.exitPointerLock()
        }
    }

    onInitialize() {
        this.aPopupMessages = [];
        this.aPopupMessages.__currentMessage = null;
        STRINGS.l = STRINGS.en;
        this.oStrings = STRINGS.l;
        KEYS._INT_ESCAPE = KEYS.ESCAPE;
        KEYS._INT_SAVE = KEYS.F12;
        KEYS._INT_INVENTORY = KEYS.ALPHANUM.E;
        KEYS._INT_SHEET = KEYS.ALPHANUM.P;
        KEYS._INT_PAUSE = KEYS.PAUSE;
        KEYS._INT_RIGHT = KEYS.RIGHT;
        KEYS._INT_LEFT = KEYS.LEFT;
        KEYS._INT_UP = KEYS.UP;
        KEYS._INT_DOWN = KEYS.DOWN;
        KEYS._INT_ENTER = KEYS.ENTER;
        KEYS._INT_DELETE = KEYS.BACKSPACE;
        KEYS._INT_INFO = KEYS.SPACE;
        KEYS._CNT_ACTION = KEYS.SPACE;
        KEYS._CNT_RIGHT = KEYS.RIGHT;
        KEYS._CNT_LEFT = KEYS.LEFT;
        KEYS._CNT_FORWARD = KEYS.UP;
        KEYS._CNT_BACKWARD = KEYS.DOWN;
        KEYS._CNT_STRAFE = KEYS.ALPHANUM.C;
        KEYS._CNT_FIRE = KEYS.ALPHANUM.X;
        KEYS._CNT_ACTION = KEYS.SPACE;
        KEYS._CNTFPS_A_RIGHT = KEYS.ALPHANUM.D;
        KEYS._CNTFPS_A_LEFT = KEYS.ALPHANUM.Q;
        KEYS._CNTFPS_A_FORWARD = KEYS.ALPHANUM.Z;
        KEYS._CNTFPS_A_BACKWARD = KEYS.ALPHANUM.S;
        KEYS._CNTFPS_Q_RIGHT = KEYS.ALPHANUM.D;
        KEYS._CNTFPS_Q_LEFT = KEYS.ALPHANUM.A;
        KEYS._CNTFPS_Q_FORWARD = KEYS.ALPHANUM.W;
        KEYS._CNTFPS_Q_BACKWARD = KEYS.ALPHANUM.S;
        KEYS._CNT_FIRE = KEYS.ALPHANUM.X;
        this.oCanvas = typeof CONFIG.raycaster.canvas == 'string' ? document.getElementById(CONFIG.raycaster.canvas) : CONFIG.raycaster.canvas;
        this.oContext = this.oCanvas.getContext('2d');
        this._getKeyboardDevice();
        this.oControls = {
            normal: {
                forward: KEYS._CNT_FORWARD,
                backward: KEYS._CNT_BACKWARD,
                left: KEYS._CNT_LEFT,
                right: KEYS._CNT_RIGHT,
                use: KEYS._CNT_ACTION,
                fire: KEYS._CNT_FIRE,
                strafe: KEYS._CNT_STRAFE
            },
            fps: {
                forward_f: KEYS._CNTFPS_Q_FORWARD,
                backward_f: KEYS._CNTFPS_Q_BACKWARD,
                strafeleft_f: KEYS._CNTFPS_Q_LEFT,
                straferight_f: KEYS._CNTFPS_Q_RIGHT,
                use: KEYS._CNT_ACTION
            }
        };
        this.oControls.ALIASES = {};
        this.oControls.ALIASES[KEYS._CNTFPS_A_FORWARD] = KEYS._CNTFPS_Q_FORWARD;
        this.oControls.ALIASES[KEYS._CNTFPS_A_LEFT] = KEYS._CNTFPS_Q_LEFT;
        this._getMouseDevice(this.oCanvas);
        this.oMPL = O876_Raycaster.PointerLock;
        this.bMPL = this.oMPL.init();
        if (this.oSoundSystem === null) {
            this.oSoundSystem = new SoundSystem();
            this.oSoundSystem.addChans(16)
        }
        this.oPathFinder = new Astar.Land();
        this.oPathFinder.isCellWalkable = function(x, y) {
            try {
                return (this.getCell(x, y) & 0xFF00) === 0
            } catch (e) {
                return false
            }
        }, this.ui_init();
        this.oDialogSystem = this.addPlugin('Dialog');
        this.oInventorySystem = this.addPlugin('Inventory');
        this.oCraftSystem = this.addPlugin('Craft');
        this.oBookSystem = this.addPlugin('Book');
        this.oDescriptorSystem = this.addPlugin('Descriptor');
        this.oPlayerSheetSystem = this.addPlugin('Playersheet');
        this.oShopSystem = this.addPlugin('Shop');
        this.oMagicSystem = this.addPlugin('Magic');
        this.oConsole = this.addPlugin('Console');
        this.oUnderwater = this.addPlugin('Underwater');
        this.oScore = this.addPlugin('Score');
        this.oBackupSystem = new BackupSystem();
        this.oBackupSystem.init(this.sSaveFile);
        this.sWorldBackup = JSON.stringify(WORLD_DATA);
        this.oEventLog = new EventLog()
    }

    onMenuLoop() {
        if (this.oMenuSystem === null) {
            this.sys_statusbar('');
            this.oMenuSystem = new MenuSystem();
            this.oMenuSystem.setFinalCanvas(this.oCanvas);
            this.sys_playMusic(SOUNDS.MUSIC_MENU);
            this.oHUD.clear()
        }
        this.oMenuSystem.render();
        if (this.nIntfMode != UI.INTFMODE_MAINMENU) {
            this.nIntfMode = UI.INTFMODE_MAINMENU;
            this.oContext.clearRect(0, 0, this.oCanvas.width, this.oCanvas.height);
            this.ui_open('Mainmenu', {
                options: STRINGS._(['~mmenu_newgame', '~mmenu_htp', '~mmenu_credits'])
            })
        }
        var nMenuAction = this.menuInputProcess();
        this.ui_render();
        switch (nMenuAction) {
            case 1:
                this.oBackupSystem.clear();
                this.ui_close();
                this.oMenuSystem.finalize();
                this.oMenuSystem = null;
                this.sys_cutscene('intro', 'stateStartAdventure');
                return false;
            case 2:
                location.href = 'resources/doc/menu/htp.html';
                break;
            case 3:
                location.href = 'resources/doc/menu/credits.html';
                break
        }
        return false
    }

    onLoading(sWhat, nLoaded, nTotal) {
        this.oUI.cmdLoading('set', {
            caption: sWhat,
            n: nLoaded,
            max: nTotal
        });
        this.ui_render()
    }

    onRequestLevelData() {
        this.oConfusedEffect = null;
        this.oBlindEffect = null;
        this.oVeilEffect = null;
        return this.rld_loadLevel()
    }

    onEnterLevel() {
        var pNoFlash = this.sys_flash;
        this.sys_flash = function() {};
        this.oUI.oScreen.hide();
        this.oUI.clear();
        UI.oIconsItems = this.oRaycaster.oHorde.oTiles.i_icons.oImage;
        this.oHUD.setTiles(this.oRaycaster.oHorde.oTiles.i_digits.oImage);
        this.oLootBags = Marker.create();
        var x, y;
        var df = function(rc, c, xBlock, yBlock, n) {
            var p = rc.oHorde.oTiles.d_pictures;
            var xPic = ((xBlock + yBlock + n) % p.nFrames) * p.nWidth;
            c.getContext('2d').drawImage(p.oImage, xPic, 0, p.nWidth, p.nHeight, 16, 28, p.nWidth, p.nHeight)
        };
        for (y = 0; y < this.oRaycaster.aMap.length; y++) {
            for (x = 0; x < this.oRaycaster.aMap[y].length; x++) {
                if (this.oRaycaster.aMap[y][x] == 0x12B) {
                    if (this.oRaycaster.insideMap(x - 1) && this.oRaycaster.getMapXYPhysical(x - 1, y) === 0) {
                        this.oRaycaster.cloneWall(x, y, 0, df)
                    }
                    if (this.oRaycaster.insideMap(y + 1) && this.oRaycaster.getMapXYPhysical(x, y + 1) === 0) {
                        this.oRaycaster.cloneWall(x, y, 1, df)
                    }
                    if (this.oRaycaster.insideMap(x + 1) && this.oRaycaster.getMapXYPhysical(x + 1, y) === 0) {
                        this.oRaycaster.cloneWall(x, y, 2, df)
                    }
                    if (this.oRaycaster.insideMap(y - 1) && this.oRaycaster.getMapXYPhysical(x, y - 1) === 0) {
                        this.oRaycaster.cloneWall(x, y, 3, df)
                    }
                }
            }
        }
        this.oPathFinder.init(this.oRaycaster.aMap);
        this.oMPL.setHook(null);
        var oPlayerThinker = this.oThinkerManager.createThinker('PlayerKeyboard');
        oPlayerThinker.oKeyboard = this._getKeyboardDevice();
        oPlayerThinker.oMouse = this._getMouseDevice();
        oPlayerThinker.oMouse.clearEvents();
        if (this.bMPL) {
            oPlayerThinker.defineKeys(this.oControls.fps);
            oPlayerThinker.oKeyboard.setAliases(this.oControls.ALIASES)
        } else {
            oPlayerThinker.defineKeys(this.oControls.normal)
        }
        this.oMPL.setHook(oPlayerThinker.readMouseMovement, oPlayerThinker);
        this.oRaycaster.oCamera.nBlueprintType = RC.OBJECT_TYPE_PLAYER;
        this.oRaycaster.oCamera.setThinker(oPlayerThinker);
        this.oRaycaster.oCamera.slide(0, 0);
        var oPC = this.oDungeon.getPlayerCreature();
        this.oRaycaster.oCamera.setData('creature', oPC);
        oPC.setOnAttributeChanged(this.playerAttributeChanged.bind(this));
        this.oWeaponInUse = this.oDungeon.getCreatureEquippedWeapon(oPC);
        var nLevel = 1,
            iMob, oCreature, oMobile, oCreatures = this.oDungeon.getHorde();
        var nMobCount = this.oRaycaster.oHorde.getMobileCount();
        if (oCreatures === null) {
            oCreatures = {};
            for (iMob = 1; iMob < nMobCount; iMob++) {
                oCreatures[iMob] = this.oDungeon.setupMobCreature(this.oDungeon.newCreature(nLevel), this.oRaycaster.oHorde.getMobile(iMob))
            }
            this.oDungeon.setHorde(oCreatures)
        }
        for (iMob = 1; iMob < nMobCount; iMob++) {
            oMobile = this.oRaycaster.oHorde.getMobile(iMob);
            oCreature = oCreatures[iMob];
            oMobile.setData('creature', oCreature);
            oCreature.setOnAttributeChanged(oMobile.oThinker.creatureAttributeChanged.bind(oMobile.oThinker))
        }
        var aDoors = this.oDungeon.getOpenDoors();
        var nDoorCount = aDoors.length;
        var oDoor, oDoorGX;
        var nSecurityTimeOut;
        for (var iDoor = 0; iDoor < nDoorCount; iDoor++) {
            oDoor = aDoors[iDoor];
            oDoorGX = this.openDoor(oDoor.x, oDoor.y);
            nSecurityTimeOut = 256;
            while (nSecurityTimeOut > 0 && oDoorGX.nPhase != oDoor.p || oDoorGX.nTime != oDoor.t) {
                oDoorGX.process();
                nSecurityTimeOut--
            }
        }
        var nStaticCount = this.oRaycaster.oHorde.aStatics.length;
        var oStatic;
        for (var iStatic = 0; iStatic < nStaticCount; iStatic++) {
            oStatic = this.oRaycaster.oHorde.aStatics[iStatic];
            if (oStatic.getData('lootbag')) {
                Marker.markXY(this.oLootBags, oStatic.xSector, oStatic.ySector, oStatic)
            }
        }
        var oGXIconPad = new GXIconPad(this.oRaycaster);
        oGXIconPad.setCreature(oPC);
        this.oRaycaster.oEffects.addEffect(oGXIconPad);
        var w = this.oWeaponInUse;
        if (w) {
            this.wd_selectWeapon(null);
            this.wd_selectWeapon(w)
        }
        this.oHUD.printKeys(this.oDungeon.getPossessedKeys());
        this.oHUD.printGenericKeys(this.oDungeon.getGenericKeyCount());
        this.sys_flash = pNoFlash;
        this.sys_flash(0, 100, 10);
        this.sys_notify('entering_level', [STRINGS._('~w_' + this.oDungeon.getPlayerLocationArea()), this.oDungeon.getPlayerLocationFloor() + 1]);
        if (this.sAmbience) {
            this.sys_playMusic(SOUNDS[this.sAmbience])
        }
        this.oAdventure.notify(this, 'enterLevel')
    }

    buildDungeonData() {
        if (this.oRaycaster === null) {
            return
        }
        var sArea = this.oDungeon.getPlayerLocationArea();
        var nFloor = this.oDungeon.getPlayerLocationFloor();
        var aObjects = [];
        var nMobCount = this.oRaycaster.oHorde.getMobileCount();
        var oMob, iMob;
        var oObjectData;
        var oCreatures = {},
            oCreature = null;
        for (iMob = 1; iMob < nMobCount; iMob++) {
            oMob = this.oRaycaster.oHorde.getMobile(iMob);
            oCreature = oMob.getData('creature');
            if (oMob.getType() == RC.OBJECT_TYPE_MOB && oMob.bActive && oCreature !== null) {
                oObjectData = {
                    blueprint: oMob.getBlueprint().sId,
                    x: oMob.x,
                    y: oMob.y,
                    angle: oMob.fTheta
                };
                aObjects.push(oObjectData);
                oCreatures[iMob] = oCreature
            }
            if (oMob.getType() == RC.OBJECT_TYPE_PLACEABLE && oMob.bActive) {
                oObjectData = {
                    blueprint: oMob.getBlueprint().sId,
                    x: oMob.x,
                    y: oMob.y,
                    angle: oMob.fTheta
                };
                aObjects.push(oObjectData)
            }
        }
        nMobCount = this.oRaycaster.oHorde.aStatics.length;
        for (iMob = 0; iMob < nMobCount; iMob++) {
            oMob = this.oRaycaster.oHorde.aStatics[iMob];
            if (oMob.getType() == RC.OBJECT_TYPE_MOB && oMob.bActive) {
                oObjectData = {
                    blueprint: oMob.getBlueprint().sId,
                    x: oMob.x,
                    y: oMob.y,
                    angle: oMob.fTheta
                };
                aObjects.push(oObjectData);
                oCreatures[iMob] = oCreature
            }
            if (oMob.getType() == RC.OBJECT_TYPE_PLACEABLE && oMob.bActive) {
                oObjectData = {
                    blueprint: oMob.getBlueprint().sId,
                    x: oMob.x,
                    y: oMob.y,
                    angle: oMob.fTheta
                };
                aObjects.push(oObjectData)
            }
        }
        WORLD_DATA.dungeons[sArea][nFloor].data.objects = aObjects;
        this.oDungeon.setHorde(oCreatures);
        this.oDungeon.setObjects(aObjects)
    }

    onDoomLoop() {
        this.clock();
        if (this.nTime & 1) {
            this.oRaycaster.textureAnimation()
        }
        this.gameKeyboardProcess();
        this.processPopups()
    }

    onFrameRendered() {
        this.wd_render();
        this.ui_render();
        this.oHUD.render();
        this.execCommand()
    }

    statePause() {
        this.oContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.oContext.fillRect(0, 0, this.oCanvas.width, this.oCanvas.height);
        this.oContext.strokeStyle = 'rgb(0, 0, 0)';
        this.oContext.fillStyle = 'rgb(255, 255, 255)';
        this.oContext.font = 'bold 32px monospace';
        this.oContext.textAlign = 'center';
        var sPauseText = STRINGS._('~m_pause');
        this.oContext.fillText(sPauseText, this.oCanvas.width >> 1, this.oCanvas.height >> 1);
        this.oContext.strokeText(sPauseText, this.oCanvas.width >> 1, this.oCanvas.height >> 1);
        this.setDoomloop('statePauseLoop')
    }

    statePauseLoop() {
        this.pausedKeyboardProcess()
    }

    stateFade() {
        this.oContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.oContext.fillRect(0, 0, this.oCanvas.width, this.oCanvas.height);
        this.oTimedTransition.time -= this.TIME_FACTOR;
        if (this.oTimedTransition.time <= 0) {
            this.setDoomloop(this.oTimedTransition.state)
        }
    }

    stateCutscene() {
        this.oCutscene.render();
        this.cutsceneKeyboardProcess();
        if (this.oCutscene.hasEnded()) {
            this.oCutscene.finalize();
            this.oCutscene = null;
            this.nLastTimeStamp = Date.now();
            this.setDoomloop(this.sCutsceneNextState)
        }
    }

    stateStartAdventure() {
        this.newGame();
        this.oAdventure.config(WORLD_DATA.dungeons);
        this.sys_clearSave();
        this.gc_gotoLocation('forest')
    }

    stateStoryBook() {
        this.ui_render();
        if (this.nIntfMode === UI.INTFMODE_NONE) {
            this.nLastTimeStamp = Date.now();
            this.setDoomloop('stateRunning');
            this.sys_flash(0, 100, 10)
        }
    }

    clock() {
        this.nTime++;
        this.nTimeMs += this.TIME_FACTOR;
        var s = this.nTimeMs / 1000 | 0;
        this.bNewSecond = false;
        if (s != this.nSecond) {
            this.bNewSecond = true;
            this.nSecond = s;
            this.clockSecond(this.nSecond)
        }
        this.sendPluginSignal('time')
    }

    clockSecond(nSecond) {
        this.oDungeon.oEffectProcessor.setTime(nSecond);
        if (nSecond % 10 === 0) {
            this.oDungeon.actionStarve(this.oDungeon.getPlayerCreature());
            if (nSecond % 60 === 0) {
                this.clockMinute()
            }
        }
        this.sendPluginSignal('timesecond')
    }

    clockMinute() {
        this.oEventLog.process(this)
    }

    restartGame() {
        this.nDoCommand = this.COMMAND_GAME_RESTART
    }

    blur() {
        this.oSoundSystem.mute();
        this.pause()
    }

    focus() {
        this.nLastTimeStamp = Date.now();
        this.oSoundSystem.unmute();
        this.resume()
    }

    processPopups() {
        if (this.aPopupMessages.__currentMessage) {
            if (this.aPopupMessages.__currentMessage.isOver()) {
                this.aPopupMessages.__currentMessage = this.aPopupMessages.shift();
                if (this.aPopupMessages.__currentMessage) {
                    this.oRaycaster.oEffects.addEffect(this.aPopupMessages.__currentMessage)
                }
            }
        } else {
            this.aPopupMessages.__currentMessage = this.aPopupMessages.shift();
            if (this.aPopupMessages.__currentMessage) {
                this.oRaycaster.oEffects.addEffect(this.aPopupMessages.__currentMessage)
            }
        }
    }

    pausedKeyboardProcess() {
        var k = this._getKeyboardDevice();
        var nKey, sCmd, aCmd;
        while ((nKey = k.inputKey()) !== 0) {
            switch (nKey) {
                case KEYS._INT_PAUSE:
                    this.nLastTimeStamp = Date.now();
                    this.setDoomloop('stateRunning');
                    break;
                case KEYS.ALPHANUM.X:
                    sCmd = prompt(STRINGS._('~m_cheat_prompt'));
                    if (sCmd) {
                        aCmd = sCmd.split(' ');
                        switch (aCmd[0]) {
                            case 'mellon':
                                this.gc_gotoLocation('mines', 0);
                                break;
                            case 'go':
                                if (aCmd.length === 2) {
                                    this.gc_gotoLocation(aCmd[1], 0)
                                } else if (aCmd.length === 3) {
                                    this.gc_gotoLocation(aCmd[1], aCmd[2] | 0)
                                }
                                break;
                            case 'seed':
                                this.sys_popup('seed : ' + WORLD_DATA.dungeons[this.oDungeon.getPlayerLocationArea()][this.oDungeon.getPlayerLocationFloor()].seed);
                                break;
                            case 'give':
                                if (aCmd.length === 2) {
                                    this.oDungeon.pickupItem(this.oDungeon.getPlayerCreature(), new Item(aCmd[1]))
                                } else if (aCmd.length === 3) {
                                    this.oDungeon.pickupItem(this.oDungeon.getPlayerCreature(), new Item(aCmd[1]), aCmd[2] | 0)
                                }
                                break
                        }
                    }
                    break
            }
        }
    }

    menuInputProcess() {
        return this.ui_command('select') + 1
    }

    cutsceneKeyboardProcess() {
        var k = this._getKeyboardDevice();
        var nKey;
        while ((nKey = k.inputKey()) !== 0) {
            switch (nKey) {
                case KEYS.ESCAPE:
                    this.oCutscene.end();
                    break
            }
        }
    }

    gameKeyboardProcess() {
        var k = this._getKeyboardDevice();
        var nKey;
        while ((nKey = k.inputKey()) !== 0) {
            this.sendPluginSignal('key', nKey);
            if (this.nIntfMode == UI.INTFMODE_NONE) {
                switch (nKey) {
                    case KEYS._INT_SAVE:
                        this.sys_save();
                        this.restartGame();
                        break;
                    case KEYS.F11:
                        this.oBookSystem.read('~book_of_spells');
                        break;
                    case KEYS._INT_PAUSE:
                        this.setDoomloop('statePause');
                        break
                }
            } else {
                switch (nKey) {
                    case KEYS._INT_PAUSE:
                        this.setDoomloop('statePause');
                        break
                }
            }
        }
    }

    setCommand(n) {
        this.nDoCommand = n
    }

    getCommand() {
        return this.nDoCommand
    }

    execCommand() {
        switch (this.nDoCommand) {
            case this.COMMAND_GAME_RESTORE:
                this.sys_restore();
                break;
            case this.COMMAND_GAME_RESTART:
                this.sendPluginSignal('gamerestart');
                this.sys_timeTrans('stateMenuLoop');
                break
        }
        this.setCommand(this.COMMAND_NONE)
    }

    wd_selectWeapon(oWeapon) {
        if (oWeapon == this.oWeaponInUse) {
            return
        }
        var rc = this.oRaycaster;
        var wl = rc.oWeaponLayer;
        if (oWeapon === null) {
            wl.visible = false
        } else {
            this.oWeaponAnimator.selectWeapon(oWeapon);
            this.oWeaponAnimator.nDrawSpeed = this.TIME_FACTOR;
            this.oWeaponAnimator.fOscilloSpeed = this.TIME_FACTOR * 0.32;
            var t = rc.oHorde.oTiles[this.oWeaponAnimator.sTile];
            wl.width = t.nWidth;
            wl.height = t.nHeight;
            wl.canvas = t.oImage;
            wl.zoom = 3;
            wl.index = -1;
            this.oWeaponAnimator.calibrateWeapon((this.oCanvas.width - (wl.width * wl.zoom)) >> 1, this.oCanvas.height - (0.777 * wl.height * wl.zoom) | 0);
            this.oWeaponAnimator.nDraw = wl.height * wl.zoom;
            wl.visible = true
        }
        this.oWeaponInUse = oWeapon
    }

    wd_render() {
        var rc = this.oRaycaster;
        var wl = rc.oWeaponLayer;
        if (wl.visible) {
            var c = rc.oCamera;
            var bKbdFiring = c.oThinker.getCommandStatus('fire') || c.oThinker.getCommandStatus('button0');
            var sAnim = 'ready';
            if (bKbdFiring) {
                switch (this.oWeaponInUse.type) {
                    case 'dagger':
                        sAnim = 'stabbing';
                        break;
                    case 'wand':
                        sAnim = 'charging';
                        break
                }
            }
            this.oWeaponAnimator.compute(this.nTime, c.xSpeed || c.ySpeed, sAnim);
            wl.index = this.oWeaponAnimator.nIndex;
            wl.x = this.oWeaponAnimator.xWeapon;
            wl.y = this.oWeaponAnimator.yWeapon
        }
    }

    ui_render() {
        this.oUI.render()
    }

    ui_init() {
        this.oUI = new UI.System();
        this.oUI.setRenderCanvas(this.oCanvas);
        this.oHUD = new UI.HUD();
        var oHUDCanvas = document.getElementById('hud');
        var oHUDContext = oHUDCanvas.getContext('2d');
        oHUDContext.mozImageSmoothingEnabled = false;
        oHUDContext.webkitImageSmoothingEnabled = false;
        this.oHUD.setRenderCanvas(oHUDCanvas)
    }

    ui_open(sUI, oParams) {
        this.oUI.command(sUI, 'on', oParams);
        this.nIntfMode = UI['INTFMODE_' + sUI.toUpperCase()];
        this.oUI.listenToMouseEvents(this.oCanvas);
        if (this.oRaycaster) {
            this.getPlayer().oThinker.bActive = false;
            this.exitPointerLockedMode()
        }
    }

    ui_close() {
        this.oUI.oScreen.hide();
        this.oUI.clear();
        this.oUI.deafToMouseEvents(this.oCanvas);
        if (this.oRaycaster) {
            this.getPlayer().oThinker.bActive = true;
            this.enterPointerLockedMode()
        }
        this.nIntfMode = UI.INTFMODE_NONE
    }

    ui_command(sCommand, oParams) {
        return this.oUI.command('', sCommand, oParams)
    }

    rld_chooseObject(oData, nLevel, sRoster, sData) {
        if (this[sRoster] === null) {
            this[sRoster] = []
        }
        if (this[sRoster][nLevel] === undefined) {
            var h = oData[sData];
            var a = [];
            var l;
            var i;
            for (var sObj in h) {
                l = h[sObj].levels;
                for (i = 0; i < l.length; i++) {
                    if (l[i] == nLevel) {
                        a.push(sObj)
                    }
                }
            }
            this[sRoster][nLevel] = a
        }
        return MathTools.rndChoose(this[sRoster][nLevel])
    }

    rld_chooseMob(oData, nLevel) {
        return this.rld_chooseObject(oData, nLevel, 'aMobRoster', 'horde')
    }

    rld_chooseSob(oData, nLevel) {
        return this.rld_chooseObject(oData, nLevel, 'aSobRoster', 'statics')
    }

    rld_getLevelData() {
        return this.oRaycaster.aWorld
    }

    rld_loadLevel() {
        var y64, x64, xBlock, yBlock, nBlock, aRow, nCode, i;
        var oStartPoint = {
            x: 0,
            y: 0,
            angle: 0
        };
        var xStartPoint = this.oDungeon.getPlayerLocationStartPoint();
        var d = this.getWorldData();
        this.oLootData = d.loot;
        var t = GFX_DATA.textures[d.textures];
        var aMetacodes = t.metacodes;
        var aCodes = t.codes;
        var aLaby = this.oDungeon.getArea();
        if (!aLaby) {
            if ('map' in d) {
                aLaby = d.map
            } else {
                aLaby = this.invokeLabyGenerator(d.generator, d.seed, d.options)
            }
            this.oDungeon.defineArea(aLaby)
        }
        var oData = {
            map: [],
            walls: {
                src: t.src,
                codes: aCodes,
                metacodes: aMetacodes,
                animated: {}
            },
            visual: GFX_DATA.visuals[d.visual],
            tiles: {},
            startpoint: {},
            startpoints: [this.oDungeon.getPlayerSpawnPoint(), null, null],
            transit: 'transit' in d ? d.transit : {},
            blueprints: {},
            objects: this.oDungeon.getObjects()
        };
        this.sAmbience = d.music;
        var s = '';
        for (s in GFX_DATA.tiles) {
            oData.tiles[s] = GFX_DATA.tiles[s]
        }
        for (s in BLUEPRINTS_DATA) {
            oData.blueprints[s] = BLUEPRINTS_DATA[s]
        }
        var bCreateObjects = oData.objects === undefined;
        if (bCreateObjects) {
            oData.objects = []
        }
        this.aMobRoster = null;
        this.aSobRoster = null;
        var sChosenBP = null;
        MathTools.rndSeed8();
        for (yBlock = 0; yBlock < aLaby.length; yBlock++) {
            y64 = yBlock * this.oRaycaster.nPlaneSpacing + (this.oRaycaster.nPlaneSpacing >> 1);
            aRow = [];
            for (xBlock = 0; xBlock < aLaby[yBlock].length; xBlock++) {
                x64 = xBlock * this.oRaycaster.nPlaneSpacing + (this.oRaycaster.nPlaneSpacing >> 1);
                nBlock = aLaby[yBlock][xBlock];
                if (nBlock in aMetacodes) {
                    if (typeof aMetacodes[nBlock] === 'object' && aMetacodes[nBlock].length) {
                        nCode = aMetacodes[nBlock][MathTools.rnd8(0, aMetacodes[nBlock].length - 1)]
                    } else {
                        nCode = aMetacodes[nBlock]
                    }
                } else {
                    nCode = aMetacodes[LABY.BLOCK_VOID]
                }
                switch (nBlock) {
                    case LABY.BLOCK_MOB_LEVEL_0:
                    case LABY.BLOCK_MOB_LEVEL_1:
                    case LABY.BLOCK_MOB_LEVEL_2:
                    case LABY.BLOCK_MOB_LEVEL_3:
                    case LABY.BLOCK_MOB_LEVEL_4:
                    case LABY.BLOCK_MOB_LEVEL_5:
                    case LABY.BLOCK_MOB_LEVEL_6:
                    case LABY.BLOCK_MOB_LEVEL_7:
                    case LABY.BLOCK_MOB_LEVEL_8:
                    case LABY.BLOCK_MOB_LEVEL_9:
                    case LABY.BLOCK_MOB_LEVEL_X:
                        if (bCreateObjects) {
                            sChosenBP = this.rld_chooseMob(d, nBlock - LABY.BLOCK_MOB_LEVEL_0);
                            if (sChosenBP) {
                                oData.objects.push({
                                    blueprint: sChosenBP,
                                    x: x64,
                                    y: y64,
                                    angle: 0
                                })
                            }
                        }
                        nBlock = LABY.BLOCK_VOID;
                        break;
                    case LABY.BLOCK_SOB_TYPE_1:
                    case LABY.BLOCK_SOB_TYPE_2:
                    case LABY.BLOCK_SOB_TYPE_3:
                    case LABY.BLOCK_SOB_TYPE_4:
                    case LABY.BLOCK_SOB_TYPE_5:
                        if (bCreateObjects) {
                            sChosenBP = this.rld_chooseSob(d, nBlock - LABY.BLOCK_SOB_TYPE_1);
                            if (sChosenBP) {
                                oData.objects.push({
                                    blueprint: sChosenBP,
                                    x: x64,
                                    y: y64,
                                    angle: 0
                                })
                            }
                        }
                        nBlock = LABY.BLOCK_VOID;
                        break;
                    case LABY.BLOCK_ELEVATOR_ENTRANCE:
                    case LABY.BLOCK_ELEVATOR_EXIT:
                    case LABY.BLOCK_ELEVATOR_PORTAL:
                        if (aLaby[yBlock - 2][xBlock] == LABY.BLOCK_VOID) {
                            oStartPoint = {
                                y: y64 - (this.oRaycaster.nPlaneSpacing << 1),
                                x: x64,
                                angle: -PI / 2
                            }
                        }
                        if (aLaby[yBlock][xBlock - 2] == LABY.BLOCK_VOID) {
                            oStartPoint = {
                                y: y64,
                                x: x64 - (this.oRaycaster.nPlaneSpacing << 1),
                                angle: PI
                            }
                        }
                        if (aLaby[yBlock + 2][xBlock] == LABY.BLOCK_VOID) {
                            oStartPoint = {
                                y: y64 + (this.oRaycaster.nPlaneSpacing << 1),
                                x: x64,
                                angle: PI / 2
                            }
                        }
                        if (aLaby[yBlock][xBlock + 2] == LABY.BLOCK_VOID) {
                            oStartPoint = {
                                y: y64,
                                x: x64 + (this.oRaycaster.nPlaneSpacing << 1),
                                angle: 0
                            }
                        }
                        if (nBlock == LABY.BLOCK_ELEVATOR_ENTRANCE) {
                            oData.startpoints[1] = oStartPoint
                        } else if (nBlock == LABY.BLOCK_ELEVATOR_EXIT) {
                            oData.startpoints[2] = oStartPoint
                        } else {
                            oData.startpoints.push(oStartPoint)
                        }
                        break
                }
                if (oData.walls.codes[nCode & 0xFF] === undefined) {
                    throw new Error('code: 0x' + (nCode & 0xFF).toString(16) + ' is not defined')
                }
                aRow.push(nCode)
            }
            oData.map.push(aRow)
        }
        oData.startpoint = oData.startpoints[xStartPoint];
        for (nCode = 0; nCode < oData.walls.codes.length; nCode++) {
            if (oData.walls.codes[nCode].length > 2) {
                oData.walls.animated[nCode] = {
                    nIndex: 0,
                    nCount: oData.walls.codes[nCode].length >> 1
                }
            }
        }
        var sBP, sTile;
        for (i = 0; i < oData.objects.length; i++) {
            sBP = oData.objects[i].blueprint;
            if (!(sBP in oData.blueprints)) {
                oData.blueprints[sBP] = MONSTERS_BLUEPRINTS[sBP] || BLUEPRINTS_DATA[sBP];
                sTile = oData.blueprints[sBP].tile;
                if (!(sTile in oData.tiles)) {
                    oData.tiles[sTile] = MONSTERS_TILES[sTile] || GFX_DATA.tiles[sTile]
                }
            }
        }
        if ('flats' in d) {
            oData.flats = {
                src: d.flats,
                codes: []
            };
            for (nCode = 0; nCode < oData.walls.codes.length; nCode++) {
                oData.flats.codes.push([0, 1])
            }
        }
        d.data = oData;
        return oData
    }

    getPlayer() {
        return this.oRaycaster.oCamera
    }

    getWorldData() {
        return WORLD_DATA.dungeons[this.oDungeon.getPlayerLocationArea()][this.oDungeon.getPlayerLocationFloor()]
    }

    gc_dropLoot(sType, x, y) {
        var aLoot;
        aLoot = this.oLootSystem.getLoot(sType);
        var oItem, sLoot, aSplit, nCount;
        for (var i = 0; i < aLoot.length; i++) {
            sLoot = aLoot[i];
            aSplit = sLoot.split('*');
            if (aSplit.length > 1) {
                sLoot = aSplit[0];
                nCount = aSplit[1] | 0
            } else {
                nCount = 1
            }
            switch (sLoot) {
                case 'GKEY':
                    this.oDungeon.addGenericKey(nCount);
                    if (nCount > 1) {
                        this.sys_notify('gkeys_acquired', [nCount, x, y], ICONS.itm_gkey)
                    } else {
                        this.sys_notify('gkey_acquired', [nCount, x, y], ICONS.itm_gkey)
                    }
                    this.oHUD.printGenericKeys(this.oDungeon.getGenericKeyCount());
                    break;
                default:
                    if (nCount > 1) {
                        oItem = new Item(sLoot, nCount)
                    } else {
                        oItem = new Item(sLoot)
                    }
                    if (typeof x === 'object') {
                        this.gc_dropItem(x, oItem)
                    } else {
                        this.oDungeon.addDrop(x, y, oItem)
                    }
            }
        }
        return aLoot.length !== 0
    }

    gc_unlockDoor(x, y) {
        this.oRaycaster.setMapXY(x, y, this.oRaycaster.aWorld.walls.metacodes[LABY.BLOCK_UNLOCKEDDOOR]);
        this.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_DOOR)
    }

    gc_activateWall(oMobile) {
        var rc = this.oRaycaster;
        var c = this.oDungeon;
        var xy = oMobile.getFrontCellXY();
        var x = xy.x;
        var y = xy.y;
        var nBlockCode = c.getAreaBlockProperty(x, y);
        var nSound = 0;
        var xBlock = x * this.oRaycaster.nPlaneSpacing + (this.oRaycaster.nPlaneSpacing >> 1);
        var yBlock = y * this.oRaycaster.nPlaneSpacing + (this.oRaycaster.nPlaneSpacing >> 1);
        this.sendPluginSignal('block', nBlockCode, oMobile, x, y);
        switch (nBlockCode) {
            case LABY.BLOCK_ELEVATOR_DOOR_NEXT_SEALED:
                this.oAdventure.notify(this, 'activateSealedDoor', x, y);
                break;
            case LABY.BLOCK_SECRET:
                this.sys_notify('secret_found', [x, y]);
                nSound++;
                c.setAreaBlockProperty(x, y, LABY.BLOCK_VOID);
                if (c.getAreaBlockProperty(x + 1, y) == LABY.BLOCK_SECRET) {
                    c.setAreaBlockProperty(x + 1, y, LABY.BLOCK_VOID)
                }
                if (c.getAreaBlockProperty(x - 1, y) == LABY.BLOCK_SECRET) {
                    c.setAreaBlockProperty(x - 1, y, LABY.BLOCK_VOID)
                }
                if (c.getAreaBlockProperty(x, y + 1) == LABY.BLOCK_SECRET) {
                    c.setAreaBlockProperty(x, y + 1, LABY.BLOCK_VOID)
                }
                if (c.getAreaBlockProperty(x, y - 1) == LABY.BLOCK_SECRET) {
                    c.setAreaBlockProperty(x, y - 1, LABY.BLOCK_VOID)
                }
            case LABY.BLOCK_CURTAIN:
                nSound++;
            case LABY.BLOCK_DOOR:
            case LABY.BLOCK_ELEVATOR_DOOR_PREV:
            case LABY.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED:
            case LABY.BLOCK_JAIL_DOOR:
                var oGX = this.openDoor(x, y, false);
                var oGame = this;
                this.sys_playSound(SOUNDS.DOOR_OPEN[nSound], xBlock, yBlock);
                if (oGX && SOUNDS.DOOR_CLOSE[nSound] && oGX.sClass === 'Door') {
                    oGX.done = function() {
                        oGame.sys_playSound(SOUNDS.DOOR_CLOSE[nSound], xBlock, yBlock)
                    }
                }
                break;
            case LABY.BLOCK_LOCKEDDOOR_0:
            case LABY.BLOCK_LOCKEDDOOR_1:
            case LABY.BLOCK_LOCKEDDOOR_2:
            case LABY.BLOCK_LOCKEDDOOR_3:
                if (c.hasKey(nBlockCode - LABY.BLOCK_LOCKEDDOOR_0)) {
                    this.gc_unlockDoor(x, y);
                    this.sys_notify('door' + (nBlockCode - LABY.BLOCK_LOCKEDDOOR_0).toString() + '_unlocked', [x, y]);
                    this.sys_playSound(SOUNDS.DOOR_UNLOCKED, xBlock, yBlock)
                } else {
                    this.sys_notify('door' + (nBlockCode - LABY.BLOCK_LOCKEDDOOR_0).toString() + '_locked', [x, y]);
                    this.sys_playSound(SOUNDS.DOOR_LOCKED, xBlock, yBlock)
                }
                break;
            case LABY.BLOCK_WATCH_DOOR_LOCKED:
                if (c.useGenericKey()) {
                    rc.setMapXY(x, y, rc.aWorld.walls.metacodes[LABY.BLOCK_UNLOCKEDDOOR]);
                    this.sys_notify('door_unlocked', [x, y]);
                    this.sys_playSound(SOUNDS.DOOR_UNLOCKED, xBlock, yBlock);
                    c.setAreaBlockProperty(x, y, LABY.BLOCK_DOOR)
                } else {
                    this.sys_notify('door_locked', [x, y]);
                    this.sys_playSound(SOUNDS.DOOR_LOCKED, xBlock, yBlock)
                }
                this.oHUD.printGenericKeys(this.oDungeon.getGenericKeyCount());
                break;
            case LABY.BLOCK_KEY_0:
            case LABY.BLOCK_KEY_1:
            case LABY.BLOCK_KEY_2:
            case LABY.BLOCK_KEY_3:
                rc.setMapXY(x, y, rc.aWorld.walls.metacodes[LABY.BLOCK_EMPTY_KEY]);
                c.pickupAreaKey(nBlockCode - LABY.BLOCK_KEY_0);
                var nKeyCode = nBlockCode - LABY.BLOCK_KEY_0;
                var sKeyLetter = ('brgy').charAt(nKeyCode);
                this.sys_notify('key' + nKeyCode.toString() + '_acquired', [x, y], ICONS['itm_' + sKeyLetter + 'key']);
                c.setAreaBlockProperty(x, y, LABY.BLOCK_EMPTY_KEY);
                this.sys_playSound(SOUNDS.BLOCK_GETKEY, xBlock, yBlock);
                this.oHUD.printKeys(c.getPossessedKeys());
                break;
            case LABY.BLOCK_RELIC_CHEST:
                rc.setMapXY(x, y, rc.aWorld.walls.metacodes[LABY.BLOCK_EMPTY_RELIC_CHEST]);
                c.setAreaBlockProperty(x, y, LABY.BLOCK_EMPTY_RELIC_CHEST);
                this.sys_playSound(SOUNDS.BLOCK_OPENCHEST, xBlock, yBlock);
                this.oAdventure.notify(this, 'openRelicChest');
                break;
            case LABY.BLOCK_TREASURE:
            case LABY.BLOCK_WATCH_TREASURE:
                rc.setMapXY(x, y, rc.getMapXY(x, y) + 1);
                c.setAreaBlockProperty(x, y, LABY.BLOCK_EMPTY_CHEST);
                this.sys_playSound(SOUNDS.BLOCK_OPENCHEST, xBlock, yBlock);
                if (this.gc_dropLoot(nBlockCode == LABY.BLOCK_TREASURE ? this.oLootData.chest : this.oLootData.bigchest, x, y)) {
                    this.gc_pickup(oMobile)
                } else {
                    this.sys_notify('chest_empty', [x, y])
                }
                break;
            case LABY.BLOCK_LABO_CLOSET_X:
            case LABY.BLOCK_LABO_CLOSET_Y:
                rc.setMapXY(x, y, rc.getMapXY(x, y) + 2);
                c.setAreaBlockProperty(x, y, nBlockCode == LABY.BLOCK_LABO_CLOSET_X ? LABY.BLOCK_LABO_CLOSET_X_OPEN : LABY.BLOCK_LABO_CLOSET_Y_OPEN);
                this.sys_playSound(SOUNDS.BLOCK_OPENCHEST, xBlock, yBlock);
                if (this.gc_dropLoot(this.oLootData.closet, x, y)) {
                    this.gc_pickup(oMobile)
                } else {
                    this.sys_notify('closet_empty', [x, y])
                }
                break;
            case LABY.BLOCK_ELEVATOR_SWITCH_NEXT:
                if (!this.gc_activateTransit('exit')) {
                    this.gc_gotoNextFloor()
                }
                break;
            case LABY.BLOCK_ELEVATOR_SWITCH_PREV:
                if (!this.gc_activateTransit('entrance')) {
                    this.gc_gotoPrevFloor()
                }
                break;
            case LABY.BLOCK_ELEVATOR_SWITCH_PORTAL:
                this.gc_activateTransit('portal');
                break;
            default:
                break
        }
    }

    gc_respawnRequest(oMobile) {
        this.oDialogSystem.display(STRINGS._('~m_youdied', [this.oScore.getScore(oMobile)]), {
            'dlg_quit': [STRINGS._('~key_dlg_quit'), 3, function() {
                this.sys_sendScore();
                this.restartGame()
            }]
        })
    }

    gc_gotoLocation(sDungeon, nFloor, nStartPoint) {
        this.sendPluginSignal('exitlevel');
        this.sys_save();
        if (nFloor === undefined) {
            nFloor = 0
        }
        if (nStartPoint === undefined) {
            nStartPoint = 1
        }
        this.oDungeon.setPlayerLocation(sDungeon, nFloor, nStartPoint);
        if (this.oDungeon.getArea() === null) {
            this.sys_restoreLevel(sDungeon, nFloor)
        }
        this.setDoomloop('stateStartRaycaster')
    }

    gc_gotoFloor(nFloor) {
        this.gc_gotoLocation(this.oDungeon.getPlayerLocationArea(), nFloor, 2)
    }

    gc_gotoNextFloor() {
        this.gc_gotoLocation(this.oDungeon.getPlayerLocationArea(), this.oDungeon.getPlayerLocationFloor() + 1, 1)
    }

    gc_gotoPrevFloor() {
        this.gc_gotoLocation(this.oDungeon.getPlayerLocationArea(), this.oDungeon.getPlayerLocationFloor() - 1, 2)
    }

    gc_moveToSector(x, y) {
        var ps = this.oRaycaster.nPlaneSpacing;
        var ps2 = ps >> 1;
        this.getPlayer().setXY(x * ps + ps2, y * ps + ps2)
    }

    gc_activateTransit(sExit) {
        var ldt = this.rld_getLevelData().transit;
        this.oAdventure.notify(this, sExit + 'Switch');
        if (sExit in ldt) {
            var t = ldt[sExit];
            if (t === false) {
                return true
            } else if (typeof t == 'string') {
                this.gc_gotoLocation(t)
            } else {
                this.gc_gotoLocation(t[0], t[1], t[2])
            }
            return true
        }
        return false
    }

    gc_equipItem(oMobile, oItem) {
        var oCreature = oMobile.getData('creature');
        this.oDungeon.equipItem(oCreature, oItem);
        if (oMobile == this.getPlayer() && oItem.slot == 'hand') {
            this.wd_selectWeapon(oItem)
        }
    }

    gc_equipWeapon(oMobile, bNext) {
        var oCreature = oMobile.getData('creature');
        var oInventory = this.oDungeon.getCreatureInventory(oCreature);
        if (!('__iMouseWheelSelect' in oInventory)) {
            oInventory.__iMouseWheelSelect = 0
        }
        var nInvSize = oInventory.getSize();
        var nNext = bNext ? 1 : nInvSize - 1;
        var nCheck = nInvSize + 1;
        var oItem;
        do {
            oInventory.__iMouseWheelSelect = (oInventory.__iMouseWheelSelect + nNext) % nInvSize;
            oItem = oInventory.aBagSlots[oInventory.__iMouseWheelSelect];
            --nCheck;
            if (oItem !== null && oItem.slot === 'hand') {
                this.gc_equipItem(oMobile, oItem);
                return
            }
        } while (nCheck >= 0)
    }

    gc_useItem(oMobile, oItem) {
        if ('properties' in oItem) {
            var aProperties = oItem.properties;
            var nPropCount = aProperties.length;
            for (var iProp = 0; iProp < nPropCount; iProp++) {
                this.gc_affect(oMobile, aProperties[iProp], 1, 0)
            }
        }
        this.gc_consumeItem(oMobile, oItem, 1)
    }

    gc_pickup(oMobile) {
        var x = oMobile.xSector;
        var y = oMobile.ySector;
        var oCreature = oMobile.getData('creature');
        var oInv = this.oDungeon.getCreatureInventory(oCreature);
        var oItem = null,
            oDropStack;
        var rc = this.oRaycaster;
        for (var i = 0; i < 2; i++) {
            oItem = this.oDungeon.peekDrop(x, y);
            if (oItem) {
                this.sys_notify('item_pickup', [oItem.getName()], oItem.icon)
            } else if (oInv.isFull()) {
                this.sys_notify('inventory_full', [])
            }
            oItem = this.oDungeon.pickupDrop(oCreature, x, y);
            oDropStack = this.oDungeon.getDropStack(x, y);
            if (oDropStack && oDropStack.length === 0) {
                var oMobDS = Marker.getMarkXY(this.oLootBags, x, y);
                if (oMobDS) {
                    rc.oHorde.unlinkStatic(oMobDS)
                }
            }
            if (oItem) {
                return oItem
            }
            oMobile.getFrontCellXY();
            x = oMobile.oFrontCell.x;
            y = oMobile.oFrontCell.y
        }
        return oItem
    }

    gc_dropItem(oMobile, oItem) {
        var oCreature = oMobile.getData('creature');
        var xCell = oMobile.xSector;
        var yCell = oMobile.ySector;
        this.gc_spawnLootBag(0, xCell, yCell);
        this.oDungeon.dropItem(oCreature, oItem);
        this.oDungeon.addDrop(oMobile.xSector, oMobile.ySector, oItem);
        if (oMobile == this.getPlayer()) {
            this.sys_notify('item_drop', [oItem.getName()], oItem.icon)
        }
    }

    gc_spawnLootBag(nType, xCell, yCell) {
        var xDrop = xCell * this.oRaycaster.nPlaneSpacing + (this.oRaycaster.nPlaneSpacing >> 1);
        var yDrop = yCell * this.oRaycaster.nPlaneSpacing + (this.oRaycaster.nPlaneSpacing >> 1);
        var oLootBag = Marker.getMarkXY(this.oLootBags, xCell, yCell);
        if (!oLootBag) {
            oLootBag = this.spawnMobile('o_lootbag', xDrop, yDrop, 0);
            oLootBag.oSprite.playAnimationType(nType);
            oLootBag.bEthereal = true;
            oLootBag.bVisible = true;
            oLootBag.bActive = true;
            Marker.markXY(this.oLootBags, xCell, yCell, oLootBag)
        }
    }

    gc_consumeItem(oMobile, oItem, nCount) {
        var oCreature = oMobile.getData('creature');
        if (oItem.isStackable()) {
            var nDropped = oItem.stackDec(nCount);
            if (oItem.isStackEmpty()) {
                this.oDungeon.dropItem(oCreature, oItem)
            }
            return nDropped
        } else {
            this.oDungeon.dropItem(oCreature, oItem);
            return 1
        }
    }

    gc_consumeAnyItem(oMobile, sRefRef, nCount) {
        var oCreature = oMobile.getData('creature');
        return this.oDungeon.getCreatureInventory(oCreature).removeItemStack(sResRef, nCount)
    }

    gc_attack(oMobile, nChargeTime) {
        var oCreature = oMobile.getData('creature');
        var aMissiles = this.oDungeon.actionAttack(oCreature, nChargeTime, this.nTimeMs);
        if (typeof aMissiles === 'string') {
            this.sys_notify(aMissiles);
            aMissiles = this.oDungeon.getWeaponMissileDefinition(SPELLS_DATA.slash_wand)
        } else if (aMissiles === null) {
            return
        }
        var nMissiles = aMissiles.length;
        var oMissileDef, oMissile = null,
            sOptions;
        for (var iMis = 0; iMis < nMissiles; iMis++) {
            oMissileDef = aMissiles[iMis];
            oMissile = this.spawnMobile(oMissileDef.blueprint, oMobile.x, oMobile.y, oMobile.fTheta + oMissileDef.angle);
            oMissile.fSpeed = this.TIME_FACTOR * oMissile.getData('speed') / 1000;
            oMissile.oOwner = oMobile;
            sOptions = oMissileDef.options;
            if (oCreature.getAttribute('confused') > 0) {
                sOptions += 'r'
            }
            oMissile.oThinker.setOptions(sOptions);
            oMissile.oThinker.setEffects(oMissileDef.effects, oMissileDef.chances, oCreature.getAttribute('power'));
            oMissile.oThinker.nStepSpeed = oMissile.getData('steps');
            oMissile.oThinker.nLifeOut = this.nTime + oMissile.getData('range');
            oMissile.oThinker.fire(oMobile)
        }
        var aSnd = oMissile.getData('sounds');
        this.sys_playSound(aSnd[0], oMobile.x, oMobile.y)
    }

    gc_affect(oMobile, oEffects, oChances, nPower) {
        var ep = this.oDungeon.oEffectProcessor;
        if (typeof oEffects == 'object') {
            var nEffCount = oEffects.length;
            for (var iEff = 0; iEff < nEffCount; iEff++) {
                this.gc_affect(oMobile, oEffects[iEff], oChances[iEff], nPower)
            }
        } else {
            var oCreature = oMobile.getData('creature');
            if (Math.random() <= this.oDungeon.oEffectProcessor.getLuckBalance(oChances, oCreature.getAttribute('jinx'), oCreature.getAttribute('luck'))) {
                if (nPower === undefined) {
                    nPower = 0
                }
                var nLevel = ep.getEffectLevel(oEffects) + nPower;
                if (nLevel < 0) {
                    nLevel = 0
                }
                if (nLevel > 63) {
                    nLevel = 63
                }
                ep.applyEffect(oCreature, ep.setEffectLevel(oEffects, nLevel))
            }
        }
    }

    gc_selectMobilesInSector(x, y, aResult) {
        if (aResult === undefined || aResult === null) {
            aResult = []
        }
        var aSector, nSectorLen, iMob, oMob, nObjectType;
        var rc = this.oRaycaster;
        aSector = rc.oMobileSectors.get(x, y);
        if (aSector === null) {
            return aResult
        }
        nSectorLen = aSector.length;
        for (iMob = 0; iMob < nSectorLen; iMob++) {
            oMob = aSector[iMob];
            nObjectType = oMob.getType();
            if (nObjectType == RC.OBJECT_TYPE_MOB || nObjectType == RC.OBJECT_TYPE_PLAYER) {
                aResult.push(oMob)
            }
        }
        return aResult
    }

    gc_selectMobilesInCircle(x, y, nRadius, aResult) {
        if (aResult === undefined || aResult === null) {
            aResult = []
        }
        var aMobs = this.gc_selectMobilesInZone(x - nRadius, y - nRadius, x + nRadius, y + nRadius);
        var nMobs = aMobs.length;
        var nRadius2 = nRadius * nRadius;
        var oMob;
        for (var iMob = 0; iMob < nMobs; iMob++) {
            oMob = aMobs[iMob];
            if (((oMob.x - x) * (oMob.x - x) + (oMob.y - y) * (oMob.y - y)) <= nRadius2) {
                aResult.push(oMob)
            }
        }
        return aResult
    }

    gc_selectMobilesInZone(x1, y1, x2, y2, aResult) {
        if (aResult === undefined || aResult === null) {
            aResult = []
        }
        var x, y, nCellSize = this.oRaycaster.nPlaneSpacing,
            nLabySize = this.oRaycaster.nMapSize;
        var xt = Math.min(nLabySize, Math.max(0, Math.min(x1, x2) / nCellSize | 0)),
            xb = Math.min(nLabySize, Math.max(0, Math.max(x1, x2) / nCellSize | 0)),
            yt = Math.min(nLabySize, Math.max(0, Math.min(y1, y2) / nCellSize | 0)),
            yb = Math.min(nLabySize, Math.max(0, Math.max(y1, y2) / nCellSize | 0));
        for (y = yt; y <= yb; y++) {
            for (x = xt; x <= xb; x++) {
                this.gc_selectMobilesInSector(x, y, aResult)
            }
        }
        return aResult
    }

    gc_visualEffect(sBlueprint, x, y) {
        var oMob = this.spawnMobile(sBlueprint, x, y, 0);
        oMob.oSprite.playAnimationType(0, true);
        var oThinker = oMob.oThinker;
        oThinker.start(oMob.oSprite.oAnimation.nDuration * oMob.oSprite.oAnimation.nCount);
        oMob.bEthereal = true
    }

    playerAttributeChanged(oCreature, sAttribute, nNewValue, nPreviousValue) {
        var nWarning;
        this.sendPluginSignal('attr_' + sAttribute, this.getPlayer(), nNewValue, nPreviousValue);
        if (oCreature == this.oDungeon.getPlayerCreature()) {
            switch (sAttribute) {
                case 'confused':
                    if (nNewValue > 0) {
                        if (this.oConfusedEffect === null) {
                            this.oConfusedEffect = new GXConfused(this.oRaycaster);
                            this.oRaycaster.oEffects.addEffect(this.oConfusedEffect)
                        }
                    } else {
                        if (this.oConfusedEffect !== null) {
                            this.oConfusedEffect.terminate();
                            this.oConfusedEffect = null
                        }
                    }
                    break;
                case 'blind':
                    if (nNewValue > 0) {
                        if (this.oBlindEffect === null) {
                            this.oBlindEffect = new GXBlind(this.oRaycaster);
                            this.oRaycaster.oEffects.addEffect(this.oBlindEffect)
                        }
                    } else {
                        if (this.oBlindEffect !== null) {
                            this.oBlindEffect.terminate();
                            this.oBlindEffect = null
                        }
                    }
                    break;
                case 'snared':
                    this.sys_veil(GXColorVeil.prototype.SNARE, nNewValue > 0);
                    break;
                case 'rooted':
                    this.sys_veil(GXColorVeil.prototype.ROOT, nNewValue > 0);
                    break;
                case 'held':
                    this.sys_veil(GXColorVeil.prototype.HOLD, nNewValue > 0);
                    break;
                case 'invisible':
                    if (nNewValue > 0) {
                        this.oRaycaster.oWeaponLayer.alpha = 0.333
                    } else {
                        this.oRaycaster.oWeaponLayer.alpha = 1
                    }
                    break;
                case 'hp':
                    if (nNewValue > nPreviousValue) {
                        this.sys_flash(0xFF0000, Math.min(50, (nNewValue - nPreviousValue) * 10), 10);
                        nWarning = oCreature.getAttribute('vitality') * 0.85 | 0;
                        if (nNewValue >= nWarning && nPreviousValue < nWarning) {
                            this.sys_notify('hp_low')
                        }
                    } else if (nNewValue < nPreviousValue) {
                        this.sys_flash(0x00FF00, Math.min(50, (nPreviousValue - nNewValue) * 10), 10)
                    }
                case 'vitality':
                    this.oHUD.printLife(oCreature.getAttribute('vitality') - oCreature.getAttribute('hp'));
                    break;
                case 'mp':
                    if (nNewValue < nPreviousValue) {
                        this.sys_flash(0x0044FF, 50, 10)
                    }
                    nWarning = oCreature.getAttribute('energy') * 0.9 | 0;
                    if (nNewValue >= nWarning && nPreviousValue < nWarning) {
                        this.sys_notify('energy_low')
                    }
                case 'energy':
                    this.oHUD.printEnergy(oCreature.getAttribute('energy') - oCreature.getAttribute('mp'));
                    break;
                case 'foodp':
                    if (nNewValue > nPreviousValue) {
                        this.sys_flash(0x663311, 50, 10)
                    }
                    this.oHUD.printFood(nNewValue / 10 | 0, oCreature.getAttribute('foodmax') / 10 | 0);
                    break;
                case 'dead':
                    if (nNewValue > 0) {} else {}
                    break
            }
        } else {
            throw new Error('only player can trigger "playerAttributeChanged" event')
        }
    }

    sys_endGame() {
        var oSave = this.sys_save();
        this.pause();
        var sName = prompt(STRINGS._('~m_whatisyourname'));
        var nNow = Date.now();
        var oFields = {
            c: oSave.p.c,
            d: nNow,
            s: this.oDungeon.getScore(this.oDungeon.getPlayerCreature())
        };
        this.sys_storeData('ru_hof_rei_' + sName + '_' + nNow.toString(16), O876.LZW.encode(JSON.stringify(oFields)), true);
        this.resume();
        this.sys_cutscene('end', 'stateMenuLoop')
    }

    sys_storeData(sKey, xData, bRemote) {
        if (bRemote === undefined) {
            bRemote = false
        }
        if (bRemote) {
            var oPostData = {
                f: sKey,
                d: xData
            }
        } else {}
    }

    sys_loadData(sKey, bRemote) {
        if (bRemote === undefined) {
            bRemote = false
        }
        if (bRemote) {
            return XHR.getSync(CONFIG.crawlerfs.r + '?f=' + sKey)
        } else {
            return this.oBackupSystem.loadData(sKey)
        }
    }

    sys_save() {
        var oPlayer = this.oDungeon.getPlayerCreature();
        if (oPlayer.getAttribute('dead')) {
            return null
        }
        var sArea = this.oDungeon.getPlayerLocationArea();
        var nFloor = this.oDungeon.getPlayerLocationFloor();
        if (sArea === '') {
            return null
        }
        this.pause();
        var oData = this.oSerializer.save(this);
        this.sys_storeData(this.sSaveFile + '-' + sArea + '-' + nFloor.toString(), oData.w);
        this.sys_storeData(this.sSaveFile, oData.p);
        this.resume();
        return oData
    }

    sys_saveLevel() {
        var sArea = this.oDungeon.getPlayerLocationArea();
        var nFloor = this.oDungeon.getPlayerLocationFloor();
        if (sArea === '') {
            return
        }
        this.pause();
        var oData = this.oSerializer.save(this);
        this.sys_storeData(this.sSaveFile + '-' + sArea + '-' + nFloor.toString(), oData.w);
        this.resume()
    }

    sys_checkSaveGame() {
        return this.oBackupSystem.isStoredData(this.sSaveFile)
    }

    sys_restore() {
        var oData = {};
        oData.p = this.sys_loadData(this.sSaveFile);
        var sArea = oData.p.l.a;
        var nFloor = oData.p.l.f;
        oData.w = this.sys_loadData(this.sSaveFile + '-' + sArea + '-' + nFloor.toString());
        this.oDungeon.setPlayerSpawnPoint(oData.p.p.x, oData.p.p.y, oData.p.p.angle);
        this.pause();
        this.oSerializer.restore(this, oData);
        this.setDoomloop('stateStartRaycaster');
        this.resume()
    }

    sys_restoreLevel(sArea, nFloor) {
        var oData;
        var d = this.sys_loadData(this.sSaveFile + '-' + sArea + '-' + nFloor.toString());
        if (d) {
            oData = {
                w: d
            };
            this.pause();
            this.oSerializer.restore(this, oData);
            this.setDoomloop('stateStartRaycaster');
            this.resume()
        } else {
            return
        }
    }

    sys_clearSave() {
        this.oBackupSystem.clear()
    }

    sys_notify(sMessage, aParams, nIcon) {
        var sKeyMsg = '~notify_' + sMessage;
        var sDispMsg = STRINGS._(sKeyMsg, aParams);
        this.sys_popup(sDispMsg, nIcon)
    }

    sys_veil(nEffect, bSet) {
        if (this.oVeilEffect === null) {
            this.oVeilEffect = this.oRaycaster.oEffects.addEffect(new GXColorVeil(this.oRaycaster))
        }
        if (bSet) {
            this.oVeilEffect.setEffect(nEffect)
        } else {
            this.oVeilEffect.clearEffect(nEffect)
        }
        if (this.oVeilEffect.isOver()) {
            this.oVeilEffect = null
        }
    }

    sys_flash(nColor, nPower, nSpeed) {
        var oGXFlash = new O876_Raycaster.GXFlash(this.oRaycaster);
        var r = (nColor & 0xFF0000) >> 16;
        var g = (nColor & 0xFF00) >> 8;
        var b = nColor & 0xFF;
        oGXFlash.fAlpha = nPower / 100;
        oGXFlash.fAlphaFade = this.TIME_FACTOR * nSpeed / 5000;
        oGXFlash.oColor = {
            r: r,
            g: g,
            b: b,
            a: nPower / 100
        };
        this.oRaycaster.oEffects.addEffect(oGXFlash)
    }

    sys_popup(sMessage, nIcon) {
        if (this.aPopupMessages.length && (this.aPopupMessages[this.aPopupMessages.length - 1].sMessage == sMessage) && !this.aPopupMessages[this.aPopupMessages.length - 1].isOver()) {
            return
        }
        var oGX = new O876_Raycaster.GXMessage(this.oRaycaster);
        this.aPopupMessages.push(oGX);
        this.sendPluginSignal('notify', sMessage);
        oGX.setMessage(sMessage);
        oGX.nTime /= 1 + (this.aPopupMessages.length * 0.66);
        oGX.nTime |= 0;
        oGX.yPos = oGX.yTo - 16;
        oGX.buildPath();
        if (nIcon !== undefined) {
            var oIcons = this.oRaycaster.oHorde.oTiles.i_icons;
            oGX.setIcon(oIcons.oImage, nIcon * 48, 0, 48, 48)
        }
    }

    sys_playSound(sFile, x, y) {
        sFile = 'resources/snd/' + this.sAudioType + '/' + sFile + '.' + this.sAudioType;
        var nChan = this.oSoundSystem.getFreeChan(sFile);
        var fDist = 0;
        if (x !== undefined) {
            var oPlayer = this.getPlayer();
            fDist = MathTools.distance(oPlayer.x - x, oPlayer.y - y)
        }
        var fVolume = 1;
        var nMinDist = 64;
        var nMaxDist = 512;
        if (fDist > nMaxDist) {
            fVolume = 0
        } else if (fDist <= nMinDist) {
            fVolume = 1
        } else {
            fVolume = 1 - (fDist / nMaxDist)
        }
        if (fVolume > 1) {
            fVolume = 1
        }
        if (fVolume > 0.01) {
            this.oSoundSystem.play(sFile, nChan, fVolume)
        }
    }

    sys_playMusic(xFile) {
        var sFile;
        if (typeof xFile === 'object') {
            sFile = xFile[Math.random() * xFile.length | 0]
        } else {
            sFile = xFile
        }
        this.oSoundSystem.playMusic('resources/snd/' + this.sAudioType + '/' + sFile + '.' + this.sAudioType)
    }

    sys_getVersion(nFormat) {
        switch (nFormat) {
            case 1:
                return 'v' + VERSION_DATA.major + '.' + VERSION_DATA.minor + '.' + VERSION_DATA.patch + ' ' + VERSION_DATA.date;
            default:
                return 'v' + VERSION_DATA.major + '.' + VERSION_DATA.minor + '.' + VERSION_DATA.patch
        }
    }

    sys_timeTrans(sNextState) {
        this.oTimedTransition = {
            state: sNextState,
            time: 1000
        };
        this.setDoomloop('stateFade')
    }

    sys_statusbar(s) {
        document.getElementById('statusbar').innerHTML = s
    }

    sys_cutscene(s, sState) {
        var oGame = this;
        this.oUI.clear();
        switch (s) {
            case 'intro':
                this.oCutscene = new CutsceneIntro();
                this.sys_playMusic('mus_night_ambience');
                break;
            case 'end':
                this.oCutscene = new CutsceneEnd();
                this.sys_playMusic('mus_bjorn_lynne_methydias_cloudship');
                break;
            default:
                this.oCutscene = null
        }
        if (this.oCutscene) {
            this.oCutscene.onSoundEvent = function(sSound) {
                oGame.sys_playSound(sSound)
            };
            this.oCutscene.setFinalCanvas(this.oCanvas);
            this.sCutsceneNextState = sState;
            this.setDoomloop('stateCutscene')
        }
    }

    sys_sendScore() {}
});
Object.assign(Game.prototype, {
    sGeneratorUrl: '../../dynamics/laby/laby.php',
    nTime: 0,
    nTimeMs: 0,
    nSecond: 0,
    bNewSecond: false,
    oCanvas: null,
    oContext: null,
    oSoundSystem: null,
    sAudioType: 'ogg',
    oStrings: null,
    aPopupMessages: null,
    oWeaponAnimator: null,
    oWeaponInUse: '',
    oUI: null,
    oHUD: null,
    oPathFinder: null,
    oSerializer: null,
    oLootSystem: null,
    oLootData: null,
    oMenuSystem: null,
    oMainmenuSystem: null,
    oCraftSystem: null,
    oBookSystem: null,
    oInventorySystem: null,
    oBackupSystem: null,
    oAdventure: null,
    oDialogSystem: null,
    oDescriptorSystem: null,
    oPlayerSheetSystem: null,
    oShopSystem: null,
    oMagicSystem: null,
    oConsole: null,
    oUnderwater: null,
    oScore: null,
    oCutscene: null,
    sCutsceneNextState: '',
    aPlugins: null,
    sSaveFile: 'reikaster',
    aMobRoster: null,
    aSobRoster: null,
    oLootBags: null,
    nDoCommand: 0,
    COMMAND_NONE: 0,
    COMMAND_GAME_RESTORE: 1,
    COMMAND_GAME_RESTART: 2,
    sAmbience: null,
    oTimedTransition: null,
    nIntfMode: 0,
    oPluginSignalRegister: null,
    oMPL: null,
    bMPL: false,
    oControls: null,
    oEventLog: null,
    oConfusedEffect: null,
    oBlindEffect: null,
    oVeilEffect: null
});
