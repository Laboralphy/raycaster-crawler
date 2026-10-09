export class Browser {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        const isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        const isFirefox = typeof InstallTrigger !== 'undefined';
        const isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        const isChrome = !!window.chrome && !isOpera;
        const isIE = false || !!document.documentMode
    }

    isOpera() {
        return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
    }

    isFirefox() {
        return typeof InstallTrigger !== 'undefined'
    }

    isSafari() {
        return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0
    }

    isChrome() {
        return !!window.chrome && !isOpera
    }

    isIE() {
        return false || !!document.documentMode
    }
}
