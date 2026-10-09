O2.createObject('ArrayTools', {
    removeItem: function(aArray, nItem) {
        var aItem = Array.prototype.splice.call(aArray, nItem, 1);
        return aItem[0]
    },
    isArray: function(o) {
        return Array.isArray(o)
    },
    shuffle: function(o) {
        for (var j, x, i = o.length; i; j = (Math.random() * i | 0), x = o[--i], o[i] = o[j], o[j] = x);
        return o
    },
    theGreatest: function(a) {
        if (!a) {
            return null
        }
        var nGreater = a[0],
            iGreater = 0;
        for (var i = 1; i < a.length; ++i) {
            if (a[i] > nGreater) {
                nGreater = a[iGreater = i]
            }
        }
        return iGreater
    }
});
