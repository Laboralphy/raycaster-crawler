export class Plugin {
    _oMediator = null;

    getName() {
        return ''
    }

    register(sType) {
        this._oMediator.registerPluginSignal(sType, this)
    }

    unregister(sType) {
        this._oMediator.unregisterPluginSignal(sType, this)
    }

    setMediator(m) {
        this._oMediator = m
    }

    getPlugin(s) {
        return this._oMediator.getPlugin(s)
    }
}
