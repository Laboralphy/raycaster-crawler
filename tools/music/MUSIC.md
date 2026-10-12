# Music

Here are the music that should be generated to replace copyrighted musics.

Compose these music as XM modules and Frequency Modulation samples.

- [x] Dungeon musics - A dungeon ambiance music with ancien instruments. Creepy ambiance. If you need a reference try to inspire yourself with Dungeon Synth Archive youtube channel. Please make 4 of them. Creepy distant choir. → `make_dungeon.py` : `dungeon_crypt.xm`, `dungeon_catacombs.xm`, `dungeon_halls.xm`, `dungeon_ossuary.xm` ; more dynamic, Heretic-style → `make_dungeon2.py` : `dungeon_siege.xm`, `dungeon_torment.xm`, `dungeon_serpent.xm`, `dungeon_cursed.xm`
- [x] Mine ambiance - The dark mines are full of creatures like spiders and imps... the music should have some echoed sounds of pickaxe hitting minerals. And a mysterious cave ambiance. Try to make two musics of this ambiance. → `make_mines.py` : `mines_deep.xm`, `mines_nest.xm`
- [x] Underwater ambiance - This special level is flooded, full of jellyfish and carnivorous fish. Ambiance is oppressing. → `make_underwater.py` : `underwater.xm` (drowned halls, air running out), `underwater_sewer.xm` (damp sewers, no bubbles), `underwater_escape.xm` (escape against the clock: shark attacks, jellyfish field)
- [x] The main menu music. Heavy ambiance of typical dark medieval fantasy theme. The musivc is player as the main menu screen is displayed showing a sampl of the labyrinth. → `make_menu.py` : `main_menu.xm`
- [x] The boss music : A fast paced title, this is the last fight with the warlock. 1 title only. → `make_boss.py` : `boss_warlock.xm`
- [x] Secret level music : A mysterious glimmering ambiance, the music should be crystaline as walking inside a giant amethyst geode. 1 title only. → `make_secret.py` : `secret_geode.xm`
- [x] Long way back home : When defeating the boss this music is played. The player should know by this hopeful music that is mission is complete. → `make_homecoming.py` : `long_way_home.xm`

Shared synthesis and XM writer for these tracks: `xm_kit.py` (built on `make_forest.py`).
Regenerate everything: `for f in make_*.py; do python3 $f; done`
