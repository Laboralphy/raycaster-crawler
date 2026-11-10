// Archive du jeu, prête à déposer (itch.io...) : dist/give-back-my-grimoire-<version>.zip
// Contient ce que charge le navigateur : index.html à la racine, crawler.js
// (à construire avant : npm run dist le fait), styles.css et resources/.
// Usage : npm run dist
// Avec --site [dossier] : copie ces fichiers dans un dossier (dist/site par
// défaut) au lieu de faire l'archive ; npm run site, utilisé par GitHub Pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createZip } from './zip.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT_FILES = ['index.html', 'crawler.js', 'styles.css'];
const RESOURCES = 'resources';
// fichiers de travail rangés dans resources/ mais que le jeu ne charge pas
const EXCLUDED = [/^resources\/snd\/flac\//];

/** fichiers à mettre dans l'archive, chemins relatifs avec des « / », triés */
export function listFiles(sRoot = ROOT) {
    const aFiles = [];
    for (const f of ROOT_FILES) {
        if (!fs.existsSync(path.join(sRoot, f))) {
            throw new Error(`fichier manquant : ${f}` + (f === 'crawler.js' ? ' (npm run build)' : ''));
        }
        aFiles.push(f);
    }
    const walk = (sDir) => {
        for (const d of fs.readdirSync(path.join(sRoot, sDir), { withFileTypes: true })) {
            const sRel = sDir + '/' + d.name;
            if (d.isDirectory()) {
                walk(sRel);
            } else if (d.isFile() && !EXCLUDED.some((r) => r.test(sRel))) {
                aFiles.push(sRel);
            }
        }
    };
    walk(RESOURCES);
    return aFiles.sort();
}

/**
 * Copie les mêmes fichiers que l'archive dans un dossier (vidé avant),
 * prêt à être servi tel quel (GitHub Pages)
 * @return {string[]} les fichiers copiés
 */
export function copySite(sOut, sRoot = ROOT) {
    const aFiles = listFiles(sRoot);
    fs.rmSync(sOut, { recursive: true, force: true });
    for (const f of aFiles) {
        const sDest = path.join(sOut, f);
        fs.mkdirSync(path.dirname(sDest), { recursive: true });
        fs.copyFileSync(path.join(sRoot, f), sDest);
    }
    return aFiles;
}

function main() {
    const nSite = process.argv.indexOf('--site');
    if (nSite >= 0) {
        const sOut = path.resolve(process.argv[nSite + 1] || path.join(ROOT, 'dist', 'site'));
        const aFiles = copySite(sOut);
        console.log(`${path.relative(ROOT, sOut)} : ${aFiles.length} fichiers`);
        return;
    }
    const { version }= JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const aFiles = listFiles();
    const zip = createZip(aFiles.map((name) => {
        const sPath = path.join(ROOT, name);
        return { name, data: fs.readFileSync(sPath), date: fs.statSync(sPath).mtime };
    }));
    const sOut = path.join(ROOT, 'dist', `give-back-my-grimoire-${version}.zip`);
    fs.mkdirSync(path.dirname(sOut), { recursive: true });
    fs.writeFileSync(sOut, zip);
    const nSize = aFiles.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
    const mb = (n) => (n / 1048576).toFixed(1) + ' Mo';
    console.log(`${path.relative(ROOT, sOut)} : ${aFiles.length} fichiers, ${mb(nSize)} -> ${mb(zip.length)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
