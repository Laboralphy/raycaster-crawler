import { ArrayTools } from '../ArrayTools.js';

export class Mediator {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this._oPlugins = {};
        this._oRegister = {}
    }

    setApplication(a) {
        return this._oApplication = a
    }

    getApplication() {
        return this._oApplication
    }

    addPlugin(oPlugin) {
        if (!('getName' in oPlugin)) {
            throw new Error('O876.Mediator : anonymous plugin')
        }
        const sName = oPlugin.getName();
        if (sName === '') {
            throw new Error('O876.Mediator : undefined plugin name')
        }
        if (!('setMediator' in oPlugin)) {
            throw new Error('O876.Mediator : no Mediator setter in plugin ' + sName)
        }
        if (sName in this._oPlugins) {
            throw new Error('O876.Mediator : duplicate plugin entry ' + sName)
        }
        this._oPlugins[sName] = oPlugin;
        oPlugin.setMediator(this);
        if ('init' in oPlugin) {
            oPlugin.init()
        }
        return oPlugin
    }

    removePlugin(x) {
        if (typeof x != 'string') {
            x = x.getName()
        }
        this._oPlugins[x] = null
    }

    getPlugin(sName) {
        return this._oPlugins[sName]
    }

    registerPluginSignal(sSignal, oPlugin) {
        if (this._oRegister === null) {
            this._oRegister = {}
        }
        if (sSignal in oPlugin) {
            if (!(sSignal in this._oRegister)) {
                this._oRegister[sSignal] = []
            }
            if (this._oRegister[sSignal].indexOf(oPlugin) < 0) {
                this._oRegister[sSignal].push(oPlugin)
            }
        } else {
            throw new Error('O876.Mediator : no ' + sSignal + ' function in plugin ' + oPlugin.getName())
        }
    }

    unregisterPluginSignal(sSignal, oPlugin) {
        if (this._oRegister === null) {
            return
        }
        if (!(sSignal in this._oRegister)) {
            return
        }
        const n = this._oRegister[sSignal].indexOf(oPlugin);
        if (n >= 0) {
            ArrayTools.removeItem(this._oRegister[sSignal], n)
        }
    }

    sendPluginSignal(s) {
        let i, p, pi, n;
        if (this._oRegister && (s in this._oRegister)) {
            p = this._oRegister[s];
            n = p.length;
            if (n) {
                let aArgs;
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
}
Object.assign(Mediator.prototype, {
    _oPlugins: null,
    _oRegister: null,
    _oApplication: null
});
