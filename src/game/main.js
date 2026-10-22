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
        while (oElement) {
            x += oElement.offsetLeft;
            y += oElement.offsetTop;
            oElement = oElement.offsetParent;
        }
    }
    return [x, y]
}

/**
 * Met le cadre du jeu à l'échelle de la fenêtre, proportions conservées.
 * Une transformation CSS ne change pas les coordonnées offsetX / offsetY des
 * événements souris : l'interface (UI.System) continue de fonctionner.
 */
function fitToWindow() {
    const oFrame = document.getElementById('game');
    const fScale = Math.min(window.innerWidth / oFrame.offsetWidth, window.innerHeight / oFrame.offsetHeight);
    oFrame.style.transform = 'translate(-50%, -50%) scale(' + fScale + ')'
}

function windowResizeEvent(oEvent) {
    fitToWindow();
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
