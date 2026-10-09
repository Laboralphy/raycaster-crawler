O2.createObject('O876_Raycaster.Mobile', class Mobile {
    getBlueprint(sXData) {
        if (this.oSprite) {
            if (sXData === undefined) {
                return this.oSprite.oBlueprint
            } else {
                return this.oSprite.oBlueprint.getData(sXData)
            }
        } else {
            return null
        }
    }

    getType() {
        if (this.nBlueprintType === null) {
            if (this.oSprite) {
                this.nBlueprintType = this.oSprite.oBlueprint.nType
            } else if (this == this.oRaycaster.oCamera) {
                this.nBlueprintType = RC.OBJECT_TYPE_PLAYER
            } else {
                this.nBlueprintType = RC.OBJECT_TYPE_NONE
            }
        }
        return this.nBlueprintType
    }

    setData(sData, xValue) {
        if (this.oData === null) {
            this.oData = {}
        }
        if (xValue === undefined || xValue === null) {
            delete this.oData[sData]
        } else {
            this.oData[sData] = xValue
        }
    }

    getData(sData) {
        if (this.oData === null) {
            this.oData = {}
        }
        if (sData in this.oData) {
            return this.oData[sData]
        } else {
            return this.getBlueprint(sData)
        }
    }

    setThinker(oThinker) {
        this.oThinker = oThinker;
        if (oThinker) {
            this.oThinker.oMobile = this
        }
        this.oWallCollision = {
            x: 0,
            y: 0
        };
        this.gotoLimbo()
    }

    getThinker() {
        return this.oThinker
    }

    think() {
        this.xSave = this.x;
        this.ySave = this.y;
        if (this.oThinker) {
            this.xSpeed = 0;
            this.ySpeed = 0;
            this.oThinker.think()
        }
    }

    rotate(f) {
        this.setAngle(this.fTheta + f)
    }

    setAngle(f) {
        this.fTheta = f;
        var f2Pi = 2 * PI;
        if (f > 0) {
            while (this.fTheta >= PI) {
                this.fTheta -= f2Pi
            }
        } else {
            while (this.fTheta < -PI) {
                this.fTheta += f2Pi
            }
        }
    }

    getAngle(f) {
        return this.fTheta
    }

    getFrontCellXY() {
        if (this.oFrontCell === null) {
            this.oFrontCell = {}
        }
        var rc = this.oRaycaster;
        var nActionRadius = rc.nPlaneSpacing * 0.75;
        this.oFrontCell.x = (this.x + Math.cos(this.fTheta) * nActionRadius) / rc.nPlaneSpacing | 0;
        this.oFrontCell.y = (this.y + Math.sin(this.fTheta) * nActionRadius) / rc.nPlaneSpacing | 0;
        return this.oFrontCell
    }

    gotoLimbo() {
        this.oRaycaster.oMobileSectors.unregister(this);
        this.xSector = -1;
        this.ySector = -1
    }

    setXY(x, y) {
        var rc = this.oRaycaster;
        var ps = rc.nPlaneSpacing;
        this.x = x;
        this.y = y;
        var xs = x / ps | 0;
        var ys = y / ps | 0;
        if (xs != this.xSector || ys != this.ySector) {
            rc.oMobileSectors.unregister(this);
            this.xSector = xs;
            this.ySector = ys;
            rc.oMobileSectors.register(this)
        }
        this.oRaycaster.oHorde.computeCollision(this)
    }

    rollbackXY() {
        var ps = this.oRaycaster.nPlaneSpacing;
        this.x = this.xSave;
        this.y = this.ySave;
        this.xSpeed = 0;
        this.ySpeed = 0;
        var xs = this.x / ps | 0;
        var ys = this.y / ps | 0;
        if (xs != this.xSector || ys != this.ySector) {
            this.oRaycaster.oMobileSectors.unregister(this);
            this.xSector = xs;
            this.ySector = ys;
            this.oRaycaster.oMobileSectors.register(this)
        }
    }

    slide(dx, dy) {
        var xc = this.xCollisions;
        var yc = this.yCollisions;
        var x = this.x;
        var y = this.y;
        var ix, iy;
        var ps = this.oRaycaster.nPlaneSpacing;
        var nSize = this.nSize;
        var wc = this.oWallCollision;
        wc.x = 0;
        wc.y = 0;
        var nXYFormula = (Math.abs(dx) > Math.abs(dy) ? 1 : 0) | ((dx > dy) || (dx == dy && dx < 0) ? 2 : 0);
        var bCorrection = false;
        var xClip, yClip;
        var bCrashWall = !this.bSlideWall;
        this.bWallCollision = false;
        for (var i = 0; i < 4; ++i) {
            if (nXYFormula == i) {
                continue
            }
            ix = nSize * xc[i] + x;
            iy = nSize * yc[i] + y;
            xClip = this.oRaycaster.clip(ix + dx, iy, 1);
            yClip = this.oRaycaster.clip(ix, iy + dy, 1);
            if (xClip) {
                dx = 0;
                if (bCrashWall) {
                    dy = 0
                }
                wc.x = xc[i];
                bCorrection = true
            }
            if (yClip) {
                dy = 0;
                if (bCrashWall) {
                    dx = 0
                }
                wc.y = yc[i];
                bCorrection = true
            }
        }
        this.bWallCollision = bCorrection;
        if (bCorrection) {
            if (wc.x > 0) {
                x = (x / ps | 0) * ps + ps - 1 - nSize
            } else if (wc.x < 0) {
                x = (x / ps | 0) * ps + nSize
            }
            if (wc.y > 0) {
                y = (y / ps | 0) * ps + ps - 1 - nSize
            } else if (wc.y < 0) {
                y = (y / ps | 0) * ps + nSize
            }
            bCorrection = false
        }
        this.setXY(x + dx, y + dy);
        this.xSpeed = dx;
        this.ySpeed = dy
    }

    move(fAngle, fDist) {
        if (this.fMovingAngle != fAngle || this.fMovingSpeed != fDist) {
            this.fMovingAngle = fAngle;
            this.fMovingSpeed = fDist;
            this.xInertie = Math.cos(fAngle) * fDist;
            this.yInertie = Math.sin(fAngle) * fDist
        }
        this.slide(this.xInertie, this.yInertie)
    }

    hits(oMobile) {
        if (this.bEthereal || oMobile.bEthereal) {
            return false
        }
        var dx = oMobile.x - this.x;
        var dy = oMobile.y - this.y;
        var d2 = dx * dx + dy * dy;
        var dMin = this.nSize + oMobile.nSize;
        dMin *= dMin;
        return d2 < dMin
    }

    rotateLeft() {
        this.rotate(-this.fRotSpeed)
    }

    rotateRight() {
        this.rotate(this.fRotSpeed)
    }

    moveForward() {
        this.move(this.fTheta, this.fSpeed)
    }

    moveBackward() {
        this.move(this.fTheta, -this.fSpeed)
    }

    strafeLeft() {
        this.move(this.fTheta - PI / 2, this.fSpeed)
    }

    strafeRight() {
        this.move(this.fTheta + PI / 2, this.fSpeed)
    }
});
Object.assign(O876_Raycaster.Mobile.prototype, {
    oRaycaster: null,
    x: 0,
    y: 0,
    xSave: 0,
    ySave: 0,
    bActive: false,
    bEthereal: false,
    fTheta: 0,
    fMovingAngle: 0,
    fSpeed: 0,
    fMovingSpeed: 0,
    fRotSpeed: 0,
    xInertie: 0,
    yInertie: 0,
    xSpeed: 0,
    ySpeed: 0,
    xSector: -1,
    ySector: -1,
    nSectorRank: -1,
    nSize: 16,
    oSprite: null,
    xCollisions: [0, 1, 0, -1],
    yCollisions: [-1, 0, 1, 0],
    oThinker: null,
    oWallCollision: null,
    oMobileCollision: null,
    oFrontCell: null,
    nBlueprintType: null,
    bSlideWall: true,
    bVisible: true,
    bWallCollision: false,
    oData: null
});
