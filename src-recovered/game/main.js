function benchmark(o, f, iMax) {
    var d1 = Date.now();
    for (var i = 0; i < iMax; i++) {
        f.apply(o, [])
    }
    return Date.now() - d1
}

function displayVersion(sVersion) {
    var oVer = document.getElementById('ver');
    oVer.innerHTML = sVersion
}

function getElementPos(oElement) {
    var x = 0;
    var y = 0;
    if (oElement.offsetParent) {
        do {
            x += oElement.offsetLeft;
            y += oElement.offsetTop
        } while (oElement = oElement.offsetParent)
    }
    return [x, y]
}

function windowResizeEvent(oEvent) {
    var oCanvas = document.getElementById('screen');
    if (oCanvas) {
        var xy = getElementPos(oCanvas);
        oCanvas.__x = xy[0];
        oCanvas.__y = xy[1]
    }
}

function resizeScreen(x, y) {
    var oCanvas = document.getElementById('screen');
    oCanvas.style.width = x.toString() + 'px';
    oCanvas.style.height = y.toString() + 'px';
    oCanvas.__ratio = x / 800
}

function main() {
    window.G = new Game();
    window.addEventListener('blur', function(oEvent) {
        G.blur()
    }, false);
    window.addEventListener('focus', function(oEvent) {
        G.focus()
    }, false);
    window.addEventListener('resize', windowResizeEvent, false);
    var oCanvas = document.getElementById('screen');
    oCanvas.addEventListener('mousedown', function(oEvent) {
        if (!O876_Raycaster.PointerLock.locked()) {
            G.enterPointerLockedMode()
        }
    });
    windowResizeEvent(null);
    displayVersion(G.sys_getVersion())
}
window.addEventListener('load', main);
