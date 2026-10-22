export const Marker = {
    iterate: function(o, f) {
        o.forEach(function(aRow, x) {
            if (aRow) {
                if (!aRow.forEach) {
                    throw new Error('not a marker !')
                }
                aRow.forEach(function(v, y) {
                    if (v) {
                        f(x, y, v)
                    }
                })
            }
        })
    },
    serialize: function(o) {
        const a = [];
        Marker.iterate(o, function(x, y, v) {
            a.push({
                x: x,
                y: y,
                v: v
            })
        });
        return a
    },
    unserialize: function(d) {
        const o = Marker.create();
        d.forEach(function(dx) {
            if (dx) {
                Marker.markXY(o, dx.x, dx.y, dx.v)
            }
        });
        return o
    },
    create: function() {
        return []
    },
    getMarkXY: function(o, x, y) {
        if (o[x]) {
            return o[x][y]
        } else {
            return false
        }
    },
    markXY: function(o, x, y, v) {
        if (!o[x]) {
            o[x] = Marker.create()
        }
        if (v === undefined) {
            v = true
        }
        o[x][y] = v
    },
    clearXY: function(o, x, y) {
        if (!o[x]) {
            return
        }
        o[x][y] = false
    },
    markBlock: function(o, x1, y1, x2, y2, v) {
        const xFrom = Math.min(x1, x2);
        const yFrom = Math.min(y1, y2);
        const xTo = Math.max(x1, x2);
        const yTo = Math.max(y1, y2);
        let x, y;
        for (x = xFrom; x <= xTo; x++) {
            for (y = yFrom; y <= yTo; y++) {
                Marker.markXY(o, x, y, v)
            }
        }
    },
    clearBlock: function(o, x1, y1, x2, y2) {
        const xFrom = Math.min(x1, x2);
        const yFrom = Math.min(y1, y2);
        const xTo = Math.max(x1, x2);
        const yTo = Math.max(y1, y2);
        let x, y;
        for (x = xFrom; x <= xTo; x++) {
            for (y = yFrom; y <= yTo; y++) {
                Marker.clearXY(o, x, y)
            }
        }
    }
};
