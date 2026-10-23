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

## Disclosure on the platforms

- **itch.io**, "Generative AI Disclosure": yes. Areas: **Code**, **Sound**
  (the music only: the sound effects are the author's recordings and
  jsfxr/Bfxr sounds, or CC0 sounds), **Graphics** (the scripted images above) and **Text** (dialogue rewrite,
  translations).

Keep this file up to date: anything new made with the AI is added here.
