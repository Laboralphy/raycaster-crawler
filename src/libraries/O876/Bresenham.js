export const Bresenham = {
    line: function(x0, y0, x1, y1, pPlotFunction) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        let e2;
        while (true) {
            if (pPlotFunction(x0, y0)) {
                return true
            }
            if (x0 == x1 && y0 == y1) {
                break
            }
            e2 = err << 1;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy
            }
        }
        return false
    }
};
