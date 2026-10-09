O2.createObject('UI', {
    clWINDOW: '#999',
    clWINDOW_BORDER: '#000',
    clDARK_WINDOW: '#666',
    clFONT: '#000',
    clBAR: '#06F',
    clSELECT_BORDER: '#00D',
    clSELECT_WINDOW: '#88F',
    INTFMODE_NONE: 0,
    INTFMODE_MAINMENU: 1,
    INTFMODE_LAST: 10,
    INV_ICON_SIZE: 48,
    ALT_ICON_SIZE: 48,
    oPlugins: {},
    addUIPlugin: function(sController, oPlugin) {
        UI['INTFMODE_' + sController.toUpperCase()] = ++UI.INTFMODE_LAST;
        UI.System.prototype['cmd' + sController] = oPlugin.uiController;
        UI.oPlugins[sController] = oPlugin
    }
});
