export const SOUNDS = {
    DOOR_OPEN: ['open-close-doors-containers/a_drawstrt', 'open-close-doors-containers/a_drawchain', 'open-close-doors-containers/a_pushston'],
    DOOR_CLOSE: ['open-close-doors-containers/a_doorstop', '', ''],
    DOOR_LOCKED: 'open-close-doors-containers/a_locked',
    DOOR_UNLOCKED: 'open-close-doors-containers/a_unlock',
    BLOCK_GETKEY: 'pick-items/a_key',
    BLOCK_OPENCHEST: 'open-close-doors-containers/a_chest',
    BLOCK_OPENCLOSET: 'open-close-doors-containers/a_closet',
    ITEM_TAKE: 'pick-items/a_take',
    WATER_SPLASH: 'nature/water/a_splash',
    FOE_SLAIN: 'x_death',
    // FOE_SLAIN à chaque mort de monstre, avec un cri de son espèce
    // (data.death des monstres) tiré au hasard, s'il en a une
    DEATH: {
        bones: ['creatures/x_death_bones0'],
        bug: ['creatures/x_death_bug0', 'creatures/x_death_bug1', 'creatures/x_death_bug2'],
        fish: ['creatures/x_death_fish0', 'creatures/x_death_fish1'],
        girl: ['creatures/x_death_girl0', 'creatures/x_death_girl1', 'creatures/x_death_girl2'],
        goblin: ['creatures/x_death_goblin0', 'creatures/x_death_goblin1', 'creatures/x_death_goblin2'],
        horror: ['creatures/x_death_horror0', 'creatures/x_death_horror1', 'creatures/x_death_horror2'],
        knight: ['creatures/x_death_knight0', 'creatures/x_death_knight1', 'creatures/x_death_knight2'],
        machine: ['creatures/x_death_machine0'],
        raven: ['creatures/x_death_raven1', 'creatures/x_death_raven2'],
        shade: ['creatures/x_death_shade0', 'creatures/x_death_shade1', 'creatures/x_death_shade2'],
        slime: ['creatures/x_death_slime0'],
        zombie: ['creatures/x_death_zombie0', 'creatures/x_death_zombie1', 'creatures/x_death_zombie2']
    },
    // musiques MIDI de tools/music/midi, rendues avec GeneralUser GS (render.sh)
    MUSIC_MENU: ['mus_main_menu'],
    MUSIC_FOREST: ['mus_forest_night'],
    MUSIC_DUNGEON: ['mus_dungeon_gate', 'mus_dungeon_vaults', 'mus_dungeon_chains', 'mus_dungeon_crypt',
        'mus_dungeon_ritual', 'mus_dungeon_requiem', 'mus_dungeon_gauntlet'],
    MUSIC_MINES: ['mus_mines_depths', 'mus_mines_echoes', 'mus_mines_pit'],
    MUSIC_BOSS: ['mus_boss_warlock'],
    MUSIC_BOSS_MEDUSA: ['mus_boss_medusa'],
    MUSIC_TREASURE: ['mus_treasure_guardian'],
    MUSIC_UNDERWATER: ['mus_underwater_hunt'],
    // cinématique d'intro en trois parties : la promenade, puis l'embuscade et
    // la vengeance, lancées par la cinématique (CutsceneIntro.onMusicEvent)
    MUSIC_CUTSCENE: 'mus_intro_wander',
    MUSIC_INTRO_AMBUSH: 'mus_intro_ambush',
    MUSIC_INTRO_REVENGE: 'mus_intro_revenge',
    MUSIC_END: 'mus_ending_triumph',
    AMB_BUBBLES: ['nature/water/amb_bubbles0', 'nature/water/amb_bubbles1', 'nature/water/amb_bubbles2', 'nature/water/amb_bubbles3'],
    SPELL_0: 'spells/hit_spell0',
    SPELL_1: 'spells/hit_spell0',
    FX_TELEPORT: 'spells/fx_teleport',
    // charge du chevalier noir (ChargerThinker)
    BOSS_RUSH: 'atk_rush_rumble'
};

/**
 * Les fichiers d'une entrée de SOUNDS : un nom, une liste de variantes ou une
 * table de listes (DEATH) ; les noms vides (pas de son) sont écartés.
 */
export function soundNames(xSound) {
    const aNames = typeof xSound === 'object' && !Array.isArray(xSound) ? Object.values(xSound).flat() : [].concat(xSound);
    return aNames.filter((s) => s !== '');
}
