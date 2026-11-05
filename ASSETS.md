# Game assets — origins and licenses

What the game ships (images, sounds, music, fonts), where it comes from and
under which license. Everything shipped must be **redistributable in a
published game** (itch.io, Steam, free game): an asset of unknown origin or
license is forbidden until it has been checked.

What was made with AI, and the boxes to tick on the platforms, is in
`AI_DISCLOSURE.md`.

Status as of November 5, 2026.

## Third-party assets

The only assets in the game that are not the author's.

| Asset | Where in the game | Author, source | License | Obligation |
|---|---|---|---|---|
| Sound bank **GeneralUser GS v1.471** | its samples are in all the music tracks `resources/snd/ogg/mus_*.ogg` (score rendering) | S. Christian Collins, https://schristiancollins.com/generaluser.php | GeneralUser GS License v2.0 (re-read November 5, 2026, [copy of LICENSE.txt](https://github.com/TheGammaSqueeze/jelos_generaluser-gs/blob/main/LICENSE.txt)): use without restriction for music creation, private or commercial; the samples allow full use in music production, including profit from recordings | none (credit not required). The author cannot guarantee where every sample comes from (none from commercial banks or sample CDs, no complaint since 2000): accepted risk. If the bank is ever mentioned on a website, link to the author's site, not directly to the bank's download files |
| Wall portraits `resources/gfx/textures/d_pictures.png` | paintings on the walls | Dungeon Crawl Stone Soup artists, [OpenGameArt](https://opengameart.org/content/dungeon-crawl-32x32-tiles); framed by us | CC0 (checked on the page and in the package README) | none (credit optional, present in `credits.html`) |
| Monster death cries `resources/snd/ogg/creatures/x_death_*.ogg` (28 files) | monster deaths | [OpenGameArt](https://opengameart.org) | CC0 | none (credit optional) |
| Sound effect `resources/snd/ogg/pick-items/a_take.ogg` | picking up an item | [OpenGameArt](https://opengameart.org) | CC0 | none (credit optional) |
| Font **UnifrakturMaguntia** | drawn into the logo `title_128.png` (not shipped as a file) | Unifraktur project, https://fonts.google.com/specimen/UnifrakturMaguntia | SIL OFL 1.1 | none for an image made from the font |

## The author's creations

Everything else, except what is listed in "To settle":

- monster and item sprites (`resources/gfx/sprites/`), modeled and
  rendered with POV-Ray (the `p_*` projectiles with the author's sprite
  generator, project `raytracing-sprite-generator`); torch
  `o_torch_1.png` taken from the "mansion" project;
- wall and floor textures (`resources/gfx/textures/t_*`, `f_*`),
  drawn with OpenOffice Draw and assembled with GIMP, except the crypt and
  gothic themes (see below);
- game icons (`resources/gfx/icons/icons.png`: inventory items, weapons,
  spells, effects), except the prismatic ray icon, and HUD digits
  (`digits.png`), drawn by the author with OpenOffice Draw;
- book images (`resources/gfx/books/`): the author's OpenOffice Draw
  drawings, and for the bestiary (`book_m_*`, `zombie_attack_front-left.png`)
  compositions of the game's POV-Ray monster sprites; except
  `book_spells_prisma.png`, `book_of_story0.png` and `book_of_story1.png`
  (scripts, see below) and the story image listed in "To settle";
- sound effects for doors, chests, closets and keys
  (`resources/snd/ogg/open-close-doors-containers/`, `pick-items/a_key.ogg`),
  recorded by the author at home with a Zoom Essential;
- spell sound effects (`resources/snd/ogg/spells/`, including `hit_spell0.ogg`) and the chicken
  cries in the intro cutscene (`creatures/m_chicken0.ogg`, `m_chicken1.ogg`), and the black
  knight's rush (`atk_rush_rumble.ogg`, a mix of several jsfxr sounds), made by the author with
  jsfxr (https://sfxr.me, sound generator; the sound produced belongs to
  whoever sets it up);
- water (`resources/snd/ogg/nature/water/`) and weapon
  (`resources/snd/ogg/weapons/`) sound effects, made by the author with Bfxr
  (https://www.bfxr.net, sound generator, same principle);
- music (`resources/snd/ogg/mus_*.ogg`), logo, night sky, hell sky
  (`sky_hell.png`), crypt theme textures (`t_crypt*.png`,
  `f_crypt*.png`) and gothic theme textures (`t_gothic.png`, `f_gothic.png`), derived from the
  author's `t_gray` tiles, with redrawn masonry and decorations, shop sign, prismatic ray icon and
  image, story book images `book_of_story0.png` (a grimoire, POV-Ray scene
  `tools/gfx/story0/grimoire.pov`) and `book_of_story1.png` (a screenshot of the game's forest[1]
  keep, the boss warlock sprite composited behind its battlements), both in grayscale in the
  frame of `book_of_story2.png`: produced by scripts in the
  repository (`tools/music/`, `tools/gfx/`), written with AI (see
  `AI_DISCLOSURE.md`).

## Rules for a new asset

| Acceptable | Forbidden |
|---|---|
| Personal creation, including by our scripts | Asset extracted from another game |
| CC0 / public domain | "Non-commercial" license (CC BY-NC…): Steam may be considered commercial, even for a free game |
| CC BY 3.0 / 4.0: **credit** the author | Unknown origin or license |
| SIL Open Font License (fonts) | CC BY-SA: avoid (derivative works under the same license) |

Record the author, license, URL and date checked in the "Third-party
assets" table, and credit them if the license requires it: in the game
(`src/game/data/STRINGS.js`, key `cs1_credits`, in English and French) and
in `resources/doc/menu/credits.html` and `credits.fr.html`.

Sound banks for rendering the music: only a free bank will do, since its
samples end up in the OGG. MuseScore General 0.2 (MIT) is another possible
bank (then credit FluidR3 by Frank Wen and the authors listed in its
license); never "Yamaha Tyros 4" or "Timbres of Heaven" (samples of
commercial or unknown origin).

## To settle before publishing

| Asset | Problem | To do |
|---|---|---|
| Story book `resources/gfx/books/book_of_story3.png` | image found more than 8 years ago, origin untraceable | replace |

Before each release:

- [ ] Nothing left in the table above.
- [ ] Credits up to date in the game (`cs1_credits`) and in `credits.html`.
- [ ] `AI_DISCLOSURE.md` up to date, boxes ticked on the platform.
- [ ] Replaced files are deleted from the repository and the shipped package.
