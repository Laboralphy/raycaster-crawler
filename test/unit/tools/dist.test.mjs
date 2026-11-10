// npm run dist : l'archive zip du jeu (tools/zip.mjs, tools/dist.mjs)
import { describe, it, expect } from 'vitest';
import zlib from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createZip } from '../../../tools/zip.mjs';
import { listFiles, copySite } from '../../../tools/dist.mjs';

// lecteur minimal : le répertoire central, puis chaque fichier par son en-tête local
function readZip(zip) {
    const nEnd = zip.length - 22;
    expect(zip.readUInt32LE(nEnd)).toBe(0x06054b50);
    const nCount = zip.readUInt16LE(nEnd + 10);
    let p = zip.readUInt32LE(nEnd + 16);
    const files = {};
    for (let i = 0; i < nCount; ++i) {
        expect(zip.readUInt32LE(p)).toBe(0x02014b50);
        const nMethod = zip.readUInt16LE(p + 10);
        const nCrc = zip.readUInt32LE(p + 16);
        const nCSize = zip.readUInt32LE(p + 20);
        const nNameLen = zip.readUInt16LE(p + 28);
        const nLocal = zip.readUInt32LE(p + 42);
        const name = zip.toString('utf8', p + 46, p + 46 + nNameLen);
        expect(zip.readUInt32LE(nLocal)).toBe(0x04034b50);
        const nStart = nLocal + 30 + zip.readUInt16LE(nLocal + 26) + zip.readUInt16LE(nLocal + 28);
        const body = zip.subarray(nStart, nStart + nCSize);
        const data = nMethod === 8 ? zlib.inflateRawSync(body) : Buffer.from(body);
        expect(zlib.crc32(data), name).toBe(nCrc);
        files[name] = { data, method: nMethod };
        p += 46 + nNameLen;
    }
    return files;
}

describe('createZip', () => {
    it('relit chaque fichier à l\'identique, compressé ou stocké selon le gain', () => {
        const text = Buffer.from('donjon '.repeat(500));
        const noise = Buffer.from(Array.from({ length: 2000 }, (_, i) => (i * 7919 + (i >> 3) * 104729) & 0xff));
        const zip = createZip([
            { name: 'index.html', data: text },
            { name: 'resources/gfx/bruit.png', data: noise },
            { name: 'resources/é à.txt', data: Buffer.from('accents') },
            { name: 'vide.txt', data: Buffer.alloc(0) }
        ]);
        const files = readZip(zip);
        expect(Object.keys(files)).toEqual(['index.html', 'resources/gfx/bruit.png', 'resources/é à.txt', 'vide.txt']);
        expect(files['index.html'].data.equals(text)).toBe(true);
        expect(files['index.html'].method).toBe(8);
        expect(files['resources/gfx/bruit.png'].data.equals(noise)).toBe(true);
        expect(files['resources/é à.txt'].data.toString()).toBe('accents');
        expect(files['vide.txt'].data.length).toBe(0);
    });
});

describe('copySite', () => {
    it('copie les fichiers du jeu, à l\'identique, dans un dossier vidé au préalable', () => {
        const sRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-src-'));
        const sOut = fs.mkdtempSync(path.join(os.tmpdir(), 'site-out-'));
        try {
            for (const [f, s] of Object.entries({
                'index.html': '<html>', 'crawler.js': 'js', 'styles.css': 'css',
                'resources/gfx/a.png': 'png', 'resources/snd/flac/b.flac': 'flac', 'src/main.js': 'src'
            })) {
                fs.mkdirSync(path.dirname(path.join(sRoot, f)), { recursive: true });
                fs.writeFileSync(path.join(sRoot, f), s);
            }
            fs.writeFileSync(path.join(sOut, 'ancien.txt'), 'old');
            const aFiles = copySite(sOut, sRoot);
            expect(aFiles).toEqual(['crawler.js', 'index.html', 'resources/gfx/a.png', 'styles.css']);
            const aCopied = fs.readdirSync(sOut, { recursive: true, withFileTypes: true })
                .filter((d) => d.isFile())
                .map((d) => path.relative(sOut, path.join(d.parentPath, d.name)).split(path.sep).join('/'))
                .sort();
            expect(aCopied).toEqual(aFiles);
            expect(fs.readFileSync(path.join(sOut, 'resources/gfx/a.png'), 'utf8')).toBe('png');
        } finally {
            fs.rmSync(sRoot, { recursive: true, force: true });
            fs.rmSync(sOut, { recursive: true, force: true });
        }
    });
});

describe('listFiles', () => {
    it('le jeu à la racine, resources/ sans les sons de travail (flac)', () => {
        const aFiles = listFiles();
        expect(aFiles).toEqual(expect.arrayContaining(['index.html', 'crawler.js', 'styles.css']));
        expect(aFiles.filter((f) => !f.includes('/')).sort()).toEqual(['crawler.js', 'index.html', 'styles.css']);
        expect(aFiles.every((f) => !f.includes('/') || f.startsWith('resources/'))).toBe(true);
        expect(aFiles.some((f) => f.startsWith('resources/snd/ogg/'))).toBe(true);
        expect(aFiles.some((f) => f.endsWith('.flac'))).toBe(false);
        expect(aFiles).toEqual([...aFiles].sort());
    });
});
