O2.createObject('O876_Raycaster.GXSecret', class GXSecret extends O876_Raycaster.GXEffect {
    __construct(r) {
        super.__construct(r);
        this.nLimit = r.nPlaneSpacing
    }

    isOver() {
        return this.nPhase >= 3
    }

    seekBlockSecret(dx, dy) {
        if (this.oRaycaster.getMapXYPhysical(this.x + dx, this.y + dy) == this.oRaycaster.PHYS_SECRET_BLOCK) {
            this.oRaycaster.setMapXYPhysical(this.x, this.y, 0);
            Marker.clearXY(this.oRaycaster.oDoors, this.x, this.y);
            this.x += dx;
            this.y += dy;
            Marker.markXY(this.oRaycaster.oDoors, this.x, this.y, this);
            return true
        }
        return false
    }

    seekBlockSecret4Corners() {
        if (this.seekBlockSecret(-1, 0)) {
            return
        }
        if (this.seekBlockSecret(0, 1)) {
            return
        }
        if (this.seekBlockSecret(1, 0)) {
            return
        }
        if (this.seekBlockSecret(0, -1)) {
            return
        }
    }

    process() {
        switch (this.nPhase) {
            case 0:
                Marker.markXY(this.oRaycaster.oDoors, this.x, this.y, this);
                this.fSpeed = this.oRaycaster.TIME_FACTOR * 40 / 1000;
                this.nPhase++;
            case 1:
                this.fOffset += this.fSpeed;
                if (this.fOffset >= this.nLimit) {
                    this.fOffset = this.nLimit - 1;
                    this.seekBlockSecret4Corners();
                    this.nPhase++;
                    this.fOffset = 0
                }
                break;
            case 2:
                this.fOffset += this.fSpeed;
                if (this.fOffset >= this.nLimit) {
                    this.fOffset = this.nLimit - 1;
                    this.oRaycaster.setMapXYPhysical(this.x, this.y, 0);
                    Marker.clearXY(this.oRaycaster.oDoors, this.x, this.y);
                    this.nPhase++;
                    this.fOffset = 0
                }
                break
        }
        this.oRaycaster.setMapXYOffset(this.x, this.y, this.fOffset | 0)
    }

    terminate() {
        switch (this.nPhase) {
            case 0:
                this.nPhase = 3;
                Marker.clearXY(this.oRaycaster.oDoors, this.x, this.y);
                break;
            case 1:
            case 2:
                this.fOffset = 0;
                Marker.clearXY(this.oRaycaster.oDoors, this.x, this.y);
                this.oRaycaster.setMapXYPhysical(this.x, this.y, 0);
                break
        }
    }
});
Object.assign(O876_Raycaster.GXSecret.prototype, {
    sClass: 'Secret',
    nPhase: 0,
    oRaycaster: null,
    x: 0,
    y: 0,
    fOffset: 0,
    fSpeed: 0,
    nLimit: 0
});
