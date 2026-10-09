import { Game } from './Game.js';
import { PointerLock } from '../libraries/Raycaster/PointerLock.js';
import { ThinkerManager } from '../libraries/Raycaster/ThinkerManager.js';
import { THINKERS } from './thinkers/THINKERS.js';

function benchmark(o, f, iMax) {
    const d1 = Date.now();
    for (let i = 0; i < iMax; i++) {
        f.apply(o, [])
    }
    return Date.now() - d1
}

function displayVersion(sVersion) {
    const oVer = document.getElementById('ver');
    oVer.innerHTML = sVersion
}

function getElementPos(oElement) {
    let x = 0;
    let y = 0;
    if (oElement.offsetParent) {
        do {
            x += oElement.offsetLeft;
            y += oElement.offsetTop
        } while (oElement = oElement.offsetParent)
    }
    return [x, y]
}

function windowResizeEvent(oEvent) {
    const oCanvas = document.getElementById('screen');
    if (oCanvas) {
        const xy = getElementPos(oCanvas);
        oCanvas.__x = xy[0];
        oCanvas.__y = xy[1]
    }
}

function resizeScreen(x, y) {
    const oCanvas = document.getElementById('screen');
    oCanvas.style.width = x.toString() + 'px';
    oCanvas.style.height = y.toString() + 'px';
    oCanvas.__ratio = x / 800
}

function main() {
    ThinkerManager.registerThinkers(THINKERS);
    window.G = new Game();
    window.addEventListener('blur', function(oEvent) {
        G.blur()
    }, false);
    window.addEventListener('focus', function(oEvent) {
        G.focus()
    }, false);
    window.addEventListener('resize', windowResizeEvent, false);
    const oCanvas = document.getElementById('screen');
    oCanvas.addEventListener('mousedown', function(oEvent) {
        if (!PointerLock.locked()) {
            G.enterPointerLockedMode()
        }
    });
    windowResizeEvent(null);
    displayVersion(G.sys_getVersion())
}
window.addEventListener('load', main);
