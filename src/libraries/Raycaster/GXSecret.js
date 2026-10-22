import { Marker } from '../O876/Marker.js';
import { GXEffect } from './GXEffect.js';

export class GXSecret extends GXEffect {
    constructor(r) {
        super(r);
        this.sClass = 'Secret';
        this.nPhase = 0;
        this.x = 0;
        this.y = 0;
        this.fOffset = 0;
        this.fSpeed = 0;
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
}
