O2.createObject('XHR', {
    oInstance: null,
    aQueue: [],
    bAjaxing: false,
    oCurrentTarget: null,
    sCurrentURL: '',
    getQueue: function() {
        return XHR.aQueue
    },
    getInstance: function() {
        if (XHR.oInstance === null) {
            XHR.oInstance = new XMLHttpRequest()
        }
        return XHR.oInstance
    },
    dataReceived: function(oEvent) {
        var xhr = oEvent.target;
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                switch (typeof XHR.oCurrentTarget) {
                    case 'function':
                        XHR.oCurrentTarget(xhr.responseText);
                        break;
                    case 'object':
                        XHR.oCurrentTarget.innerHTML = xhr.responseText;
                        break;
                    case 'string':
                        document.getElementById(XHR.oCurrentTarget).innerHTML = xhr.responseText;
                        break
                }
                XHR.bAjaxing = false;
                XHR.nextRequest()
            } else {
                throw new Error('xhr error while getting data from ' + XHR.sCurrentURL)
            }
        }
    },
    nextRequest: function() {
        if (XHR.bAjaxing) {
            return
        }
        if (XHR.aQueue.length) {
            var a = XHR.aQueue.shift();
            XHR.bAjaxing = true;
            XHR.sCurrentURL = a.url;
            XHR.oCurrentTarget = a.target;
            var xhr = XHR.getInstance();
            xhr.open('GET', XHR.sCurrentURL, true);
            xhr.onreadystatechange = XHR.dataReceived;
            xhr.send(null)
        }
    },
    loadFragment: function(sUrl, oTarget) {
        XHR.aQueue.push({
            url: sUrl,
            target: oTarget
        });
        XHR.nextRequest()
    },
    storeString: function(sUrl, sString) {
        if (typeof sString === 'object') {
            sString = JSON.stringify(sString)
        }
        var xhr = XHR.getInstance();
        if (xhr) {
            xhr.open('POST', sUrl, true);
            xhr.send(sString)
        } else {
            throw new Error('xhr not initialized')
        }
    },
    get: function(sURL, oTarget) {
        return XHR.loadFragment(sURL, oTarget)
    },
    post: function(sURL, sData) {
        XHR.storeString(sURL, sData)
    },
    getSync: function(sURL) {
        console.warn('Synchronous Ajax Query (url : ' + sURL + ') ! It is known that querying synchronously is bad for health and makes animals suffer.');
        var xhr = XHR.getInstance();
        xhr.open('GET', sURL, false);
        xhr.send(null);
        if (xhr.status == 200) {
            return xhr.responseText
        } else {
            throw new Error('XHR failed to load: ' + sURL + ' (' + xhr.status.toString() + ')')
        }
    }
});
