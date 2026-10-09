const LevelGenerator = require('../../core/LevelGenerator');

/** Labyrinthe brut de 5x5 pièces vides */
class TrivialLevelGenerator extends LevelGenerator {
    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);
        this.setSize(5, 5, 7, 7);
        this.setMap(this.buildLaby(0));
        this.processRooms();
        this.postProcessRooms();
        this.processLevel();
    }

    processRoom(x, y, oRoom) {}
}

TrivialLevelGenerator.blocks = require('./blocks');
TrivialLevelGenerator.helpers = {};

module.exports = TrivialLevelGenerator;
