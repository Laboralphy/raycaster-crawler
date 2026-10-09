O2.createObject('O876.Browser', class Browser {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        var isFirefox = typeof InstallTrigger !== 'undefined';
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        var isChrome = !!window.chrome && !isOpera;
        var isIE = false || !!document.documentMode
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
});
