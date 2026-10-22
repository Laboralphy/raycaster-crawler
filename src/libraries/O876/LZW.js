export const LZW = {
    DICT_SIZE: 4096,
    PACKET_SEPARATOR: ':',
    FILE_SIGN: 'O876' + String.fromCharCode(122) + ':',
    nLastRatio: 0,
    nMystificator: 0,
    encode: function(sData) {
        const aPackets = LZW._createEncodedPackets(sData);
        const sBin = LZW._bundlePackets(aPackets);
        LZW.nLastRatio = sBin.length * 100 / sData.length | 0;
        return LZW.FILE_SIGN + sBin
    },
    decode: function(sZData) {
        if (sZData.substr(0, LZW.FILE_SIGN.length) !== LZW.FILE_SIGN) {
            throw new Error('bad format')
        }
        const aPacketCount = LZW._getPacketInt(sZData, LZW.FILE_SIGN.length);
        const nCount = aPacketCount[0];
        const iOffset = aPacketCount[1];
        const aPackets = LZW._parsePackets(sZData, nCount, iOffset);
        return LZW._decodePackets(aPackets)
    },
    _bundlePackets: function(aPackets) {
        const aOutput = [];
        const sSep = LZW.PACKET_SEPARATOR;
        aOutput.push(aPackets.length.toString(16));
        aOutput.push(sSep);
        for (let i = 0; i < aPackets.length; i++) {
            aOutput.push(aPackets[i].length.toString(16));
            aOutput.push(sSep);
            aOutput.push(aPackets[i])
        }
        return aOutput.join('')
    },
    _getPacketInt: function(sPacket, iFrom) {
        let i = iFrom;
        let sNumber = '0x';
        const sSep = LZW.PACKET_SEPARATOR;
        while (sPacket.substr(i, 1) != sSep) {
            sNumber += sPacket.substr(i, 1);
            i++
        }
        const nNumber = parseInt(sNumber);
        if (isNaN(nNumber)) {
            throw new Error('corrupted data ' + sNumber)
        }
        return [parseInt(sNumber), i + 1]
    },
    _parsePackets: function(sPackets, nCount, iFrom) {
        let aGPI, nLength;
        const aOutput = [];
        for (let i = 0; i < nCount; i++) {
            aGPI = LZW._getPacketInt(sPackets, iFrom);
            nLength = aGPI[0];
            iFrom = aGPI[1];
            aOutput.push(sPackets.substr(iFrom, nLength));
            iFrom += nLength
        }
        return aOutput
    },
    _createEncodedPackets: function(s) {
        let i = 0;
        let o = [];
        const aOutput = [];
        do {
            o = LZW._encodeFragment(s, i);
            i = o[1];
            aOutput.push(o[2])
        } while (!o[0]);
        return aOutput
    },
    _decodePackets: function(a) {
        const o = [];
        for (let i = 0; i < a.length; i++) {
            o.push(LZW._decodeFragment(a[i]))
        }
        return o.join('')
    },
    _encodeFragment: function(s, iFrom) {
        const d = {};
        let i, iCode = 256;
        for (i = 0; i < 256; i++) {
            d[String.fromCharCode(i)] = i
        }
        let w = '';
        let c;
        let wc;
        const o = [];
        let iIndex;
        const nLen = s.length;
        let bEnd = true;
        for (iIndex = iFrom; iIndex < nLen; iIndex++) {
            c = s.charAt(iIndex);
            wc = w + c;
            if (wc in d) {
                w = wc
            } else {
                d[wc] = iCode++;
                o.push(d[w]);
                w = c
            }
            if (d.length >= LZW.DICT_SIZE) {
                bEnd = false;
                iIndex++;
                break
            }
        }
        o.push(d[w]);
        for (i = 0; i < o.length; i++) {
            o[i] = String.fromCharCode(o[i] ^ LZW.nMystificator)
        }
        return [bEnd, iIndex, o.join('')]
    },
    _decodeFragment: function(s) {
        let i;
        let a;
        if (typeof s === 'string') {
            a = s.split('')
        } else {
            a = s
        }
        for (i = 0; i < a.length; i++) {
            a[i] = a[i].charCodeAt(0) ^ LZW.nMystificator
        }
        let c, w, e = '';
        const o = [], d = [];
        for (i = 0; i < 256; i++) {
            d.push(String.fromCharCode(i))
        }
        c = a[0];
        o.push(w = String.fromCharCode(c));
        for (i = 1; i < a.length; i++) {
            c = a[i];
            if (c > 255 && d[c] !== undefined) {
                e = d[c]
            } else if (c > 255 && d[c] === undefined) {
                e = w + e.charAt(0)
            } else {
                e = String.fromCharCode(c)
            }
            o.push(e);
            d.push(w + e.charAt(0));
            w = e
        }
        return o.join('')
    }
};
