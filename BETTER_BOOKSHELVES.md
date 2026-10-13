# Better Bookshelves

## What is now ?

Currently bookshelves deliver random information, if we ask several time a bookshelf we have different information.
Some bookshelf give recipes, some give hints.
We want to change that.

## Knowledge table of loot

Each bookshelf can deliver one piece of knowledge that could be :
- One of the recipes in CRAFT_DATA (this will unlock the corresponding recipe)
- One of the spells in MAGIC_DATA (not SPELL_DATA) (this will unlock the corresponding spell)
- One of the book in BOOK.js
- Unreadable content or unrelated to magic.

## Bookshelves deliver seeded information

Now we want each bookshelf block to always deliver the same content deterministically.
To do so, each bookshelf block should have a special value computed out of the level number and the block coordinates.
This will give a seed, and this value will determine a random index.
We will refer to the index of the Registry of bookshelf contents to see what we get by activating the bookshelf. 

## Books that unlock recipe or spells

When a bookshelf is elligible to unlock spell or recipe, it will unlock one of the recipe or spell with the
lowest level (see .level in CRAFT_DATA or MAGIC_DATA).
Once unlocked, this block is "deactivated". I don't know how, maybe a "#level-x-y" key that is stored in a registry. Or a change of block code 