export const ArrayTools = {
    removeItem: function(aArray, nItem) {
        const aItem = Array.prototype.splice.call(aArray, nItem, 1);
        return aItem[0]
    },
    isArray: function(o) {
        return Array.isArray(o)
    },
    shuffle: function(o) {
        for (let j, x, i = o.length; i; j = (Math.random() * i | 0), x = o[--i], o[i] = o[j], o[j] = x);
        return o
    },
    theGreatest: function(a) {
        if (!a) {
            return null
        }
        let nGreater = a[0],
            iGreater = 0;
        for (let i = 1; i < a.length; ++i) {
            if (a[i] > nGreater) {
                nGreater = a[iGreater = i]
            }
        }
        return iGreater
    }
};
