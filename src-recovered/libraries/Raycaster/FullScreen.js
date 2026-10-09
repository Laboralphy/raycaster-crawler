export const FullScreen = {
    enter: function(oElement) {
        oElement.requestFullScreen = oElement.requestFullScreen || oElement.webkitRequestFullScreen || oElement.mozRequestFullScreen;
        document.onfullscreenchange = FullScreen.changeEvent;
        document.onwebkitfullscreenchange = FullScreen.changeEvent;
        document.onmozfullscreenchange = FullScreen.changeEvent;
        oElement.requestFullScreen(oElement.ALLOW_KEYBOARD_INPUT)
    },
    isFullScreen: function() {
        return document.webkitIsFullScreen || document.mozFullScreen
    },
    changeEvent: function(oEvent) {}
};
