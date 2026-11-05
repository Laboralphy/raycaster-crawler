// Écriture d'une archive zip, sans dépendance (zlib de Node >= 22).
// Chaque fichier est compressé (deflate) ou stocké tel quel si la
// compression ne fait rien gagner (png, ogg...). Pas de zip64 : moins de
// 65535 fichiers et de 4 Go.
import zlib from 'node:zlib';

const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
const FLAG_UTF8 = 0x0800;
const VERSION = 20;

function dosDateTime(date) {
    const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    const day = ((Math.max(date.getFullYear(), 1980) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time, day };
}

/**
 * @param {{name: string, data: Buffer, date?: Date}[]} aEntries chemins avec des « / »
 * @return {Buffer} l'archive
 */
export function createZip(aEntries) {
    const aLocal = [];
    const aCentral = [];
    let nOffset = 0;
    for (const { name, data, date = new Date() } of aEntries) {
        const bName = Buffer.from(name, 'utf8');
        const bDeflated = zlib.deflateRawSync(data, { level: 9 });
        const bDeflate = bDeflated.length < data.length;
        const bBody = bDeflate ? bDeflated : data;
        const nCrc = zlib.crc32(data);
        const { time, day } = dosDateTime(date);

        const h = Buffer.alloc(30);
        h.writeUInt32LE(0x04034b50, 0);
        h.writeUInt16LE(VERSION, 4);
        h.writeUInt16LE(FLAG_UTF8, 6);
        h.writeUInt16LE(bDeflate ? METHOD_DEFLATE : METHOD_STORE, 8);
        h.writeUInt16LE(time, 10);
        h.writeUInt16LE(day, 12);
        h.writeUInt32LE(nCrc, 14);
        h.writeUInt32LE(bBody.length, 18);
        h.writeUInt32LE(data.length, 22);
        h.writeUInt16LE(bName.length, 26);
        h.writeUInt16LE(0, 28);
        aLocal.push(h, bName, bBody);

        const c = Buffer.alloc(46);
        c.writeUInt32LE(0x02014b50, 0);
        c.writeUInt16LE(VERSION, 4);
        c.writeUInt16LE(VERSION, 6);
        h.copy(c, 8, 6, 30); // flags ... longueur du nom : comme l'en-tête local
        c.writeUInt16LE(0, 30); // extra
        c.writeUInt16LE(0, 32); // commentaire
        c.writeUInt16LE(0, 34); // disque
        c.writeUInt16LE(0, 36); // attributs internes
        c.writeUInt32LE(0, 38); // attributs externes
        c.writeUInt32LE(nOffset, 42);
        aCentral.push(c, bName);

        nOffset += h.length + bName.length + bBody.length;
    }
    const nCentralSize = aCentral.reduce((n, b) => n + b.length, 0);
    const e = Buffer.alloc(22);
    e.writeUInt32LE(0x06054b50, 0);
    e.writeUInt16LE(aEntries.length, 8);
    e.writeUInt16LE(aEntries.length, 10);
    e.writeUInt32LE(nCentralSize, 12);
    e.writeUInt32LE(nOffset, 16);
    return Buffer.concat([...aLocal, ...aCentral, e]);
}
