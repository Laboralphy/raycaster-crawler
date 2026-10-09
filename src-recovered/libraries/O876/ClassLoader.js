O2.createObject('O876.ClassLoader', class ClassLoader {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oClasses = {}
    }

    loadClass(s) {
        if (s in this.oClasses) {
            return this.oClasses[s]
        }
        var aClass = s.split('.');
        var pBase = window;
        while (aClass.length > 1) {
            pBase = pBase[aClass.shift()]
        }
        var sClass = aClass[0];
        if (sClass in pBase) {
            this.oClasses[s] = pBase[sClass];
            return this.oClasses[s]
        } else {
            return null
        }
    }
});
Object.assign(O876.ClassLoader.prototype, {
    oClasses: null
});
