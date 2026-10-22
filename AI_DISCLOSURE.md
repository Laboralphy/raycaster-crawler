# Use of AI in "Give Back My Grimoire!"

The original game (2010-2013) is the author's own work, made without AI:
the raycasting engine, the game code, the sprites and textures, the levels,
the story. In 2026 the project was revived with the help of an AI assistant,
Claude (Anthropic), used as a tool under the author's direction. Every
change was reviewed, tested in game and approved by the author.

## Code

- Revival of a 14-year-old code base: recovery of the sources, conversion to
  modern JavaScript (ES modules and classes), removal of the old
  prototype-based class system.
- Port of the level generator: the author's original generator, written in
  PHP without AI, was translated to JavaScript so that the whole game uses a
  single technology. The generation algorithms and level designs are the
  author's; the AI did the translation.
- Bug hunting and fixing, for example: monsters that could not die while
  paralysed, ring bonuses that stacked, a potion that crashed the game.
- Unit tests written by the AI (about 470, with Vitest), plus data-checking
  tools.
- New features written with the AI and designed by the author: a new spell
  (Prismatic Ray), a boss teleport, unequipping items, wall torches and
  lighting, debug commands.

## Graphics

No image-generation model was used. A few images were drawn by Python
scripts written by the AI, from simple shapes: the title logo (with the free
UnifrakturMaguntia font), the night sky, the hell sky, the crypt and gothic wall
and floor textures (built on the author's own grey tiles, with new masonry
and decorations), a temporary shop panel, and the Prismatic Ray spell icon and
book picture. All other graphics are the author's.

## Music

All the music was composed with the AI, as programs: the AI wrote the
scores (notes, harmonies, structure, orchestration) as Python scripts that
produce MIDI files, rendered with a free sound bank (GeneralUser GS). The
author set the direction for each piece (mood, style references, length,
where it plays) and chose and approved the results.

## Text

- Rewriting of the intro dialogue to make it family-friendly.
- French translation: about a quarter by the author, the rest completed by
  the AI, which also keeps the translation of new texts up to date.

## Rough proportions

Estimates, counted from the files and the project history (October 2026).

| Area | Made with AI | How it was counted |
|---|---|---|
| Music | about 100 % | all 20 tracks |
| Graphics | about 6 % | 10 of the 161 image files (logo, night sky, hell sky, the four crypt textures, the two gothic textures, Prismatic Ray book picture), plus one icon and one shop panel inside larger sheets; no image-generation model |
| Sound effects | 0 % | the author's recordings, sounds made by the author with jsfxr and Bfxr, and CC0 sounds |
| Code: design and game logic | about 5 to 10 % | the 2013 game had about 25,000 lines; about 850 net new lines since (new features, fixes); the rest of the logic is the author's |
| Code: lines rewritten | most of it | the AI converted the whole code base to modern JavaScript and ported the level generator from PHP: the author's logic, rewritten line by line |
| Code: tests and tools | about 100 % | unit tests, data checks, music and image scripts |
| Text, English | about 15 to 20 % | 68 of about 400 lines of game text changed or added (intro dialogue, credits, new spells) |
| Text, French | about 75 % | the 2013 game only had the intro in French; about a quarter of the translation is the author's, the AI completed the rest and keeps new texts translated |

## Disclosure on the platforms

- **itch.io**, "Generative AI Disclosure": yes. Areas: **Code**, **Sound**
  (the music only: the sound effects are the author's recordings and
  jsfxr/Bfxr sounds, or CC0 sounds), **Graphics** (the scripted images above) and **Text** (dialogue rewrite,
  translations).
- **Steam** (rules of January 2026): development help (code) no longer needs
  to be disclosed; disclose the generated **music** and, to be safe, the
  scripted **graphics**.

Keep this file up to date: anything new made with the AI is added here.
