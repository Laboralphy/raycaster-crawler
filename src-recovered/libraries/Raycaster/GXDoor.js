import { Marker } from '../O876/Marker.js';
import { GXEffect } from './GXEffect.js';

export class GXDoor extends GXEffect {
    __construct(r) {
        super.__construct(r);
        this.setAutoClose(true)
    }

    isOver() {
        return this.nPhase > 3
    }

    process() {
        const r = this.oRaycaster;
        switch (this.nPhase) {
            case 0:
                Marker.markXY(r.oDoors, this.x, this.y, this);
                this.nCode = r.getMapXYPhysical(this.x, this.y);
                switch (this.nCode) {
                    case r.PHYS_DOOR_SLIDING_DOUBLE:
                        this.fSpeed = r.TIME_FACTOR * 60 / 1000;
                        this.nLimit = 32;
                        break;
                    case r.PHYS_DOOR_SLIDING_LEFT:
                    case r.PHYS_DOOR_SLIDING_RIGHT:
                        this.fSpeed = r.TIME_FACTOR * 120 / 1000;
                        this.nLimit = r.nPlaneSpacing;
                        break;
                    default:
                        this.fSpeed = r.TIME_FACTOR * 120 / 1000;
                        this.nLimit = 96;
                        break
                }
                this.nPhase++;
            case 1:
                this.fOffset += this.fSpeed;
                if (this.fOffset >= this.nLimit) {
                    this.fOffset = this.nLimit - 1;
                    r.setMapXYPhysical(this.x, this.y, 0);
                    this.nPhase++
                }
                break;
            case 2:
                this.nTime -= this.nAutoclose;
                if (this.nTime <= 0) {
                    if (r.oMobileSectors.get(this.x, this.y).length) {
                        this.nTime = this.nMaxTime >> 1
                    } else {
                        r.setMapXYPhysical(this.x, this.y, this.nCode);
                        this.nPhase++
                    }
                }
                break;
            case 3:
                this.fOffset -= this.fSpeed;
                if (this.fOffset < 0) {
                    this.terminate()
                }
                break
        }
        r.setMapXYOffset(this.x, this.y, this.fOffset | 0)
    }

    close(bForce) {
        this.nTime = 0;
        if (bForce && this.nPhase == 2) {
            this.nPhase++
        }
    }

    setAutoClose(n) {
        this.nAutoclose = n ? this.oRaycaster.TIME_FACTOR : 0
    }

    terminate() {
        if (this.nPhase === 0) {
            this.nPhase = 4;
            Marker.clearXY(this.oRaycaster.oDoors, this.x, this.y);
            return
        }
        this.fOffset = 0;
        Marker.clearXY(this.oRaycaster.oDoors, this.x, this.y);
        this.nPhase = 4;
        this.oRaycaster.setMapXYOffset(this.x, this.y, 0);
        this.oRaycaster.setMapXYPhysical(this.x, this.y, this.nCode)
    }
}
Object.assign(GXDoor.prototype, {
    sClass: 'Door',
    nPhase: 0,
    oRaycaster: null,
    x: 0,
    y: 0,
    fOffset: 0,
    nMaxTime: 3000,
    nTime: 3000,
    nAutoClose: 0,
    fSpeed: 0,
    nLimit: 0,
    nCode: 0
});
