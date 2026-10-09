#!/usr/bin/env node
// Usage : node laby/cli.js <générateur> [graine] [options]
// Équivalent de l'ancien "php laby.php <générateur> <graine> <options>"
const { generateLaby, GENERATORS } = require('./index');

const [sGenerator, sSeed = '0', sOptions = ''] = process.argv.slice(2);
if (!sGenerator) {
    console.error('usage: cli.js <generator> [seed] [options]');
    console.error('generators: ' + GENERATORS.join(', '));
    process.exit(1);
}
process.stdout.write(generateLaby(sGenerator, sSeed, sOptions).renderJSON());
