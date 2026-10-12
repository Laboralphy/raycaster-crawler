# Better Bookshelves

## Bookshelves deliver seeded information

Currently bookshelves deliver random information, if we ask several time a bookshelf we have different information. We want to change that.
Now we want the bookshelf block to have a special value computed out of the level number and the block coordinates.
This will give a seed, and this value will determine a random index.

## Registry of bookshelf contents

This is a file with items in an array.

```
z.array(z.object({
    type: z.enum(['hint', 'recipe', 'spell', 'lore']),
    spell: Spell.optional().describe('If type is spell')
}))
```

"Spell" is an enum of valid spells :

DrainLife
Teleport
Knock
DeathSpell
MagicMapping
SummonFood
Reflect
Light
TimeStop

FYI here are the spell description :
"Life Drain\n\n" + "You may want to use this spell if your health becomes low. " + "Casting this spell will grant you a temporary Vampyre effect, your following succesful attacks with your wand or your dagger will devour " + "your enemy's health points and restore your own health points.", "Teleport\n\n" + "Teleportation allows you to instantly move foward until you reach any wall. " + "You are rotated by 180 degrees so the wall you are bumping into will be behind you.\n\n" + "This is a targetted spell (see on the first page). ", "Knock\n\n" + "This spell can unlock any locked door. Just place yourself in front of the door and close to it." + "Then cast the spell, the door should be instantly unlock.", "Death Spell\n\n" + "This spell cast an single invisible beam. Any creature hit by the beam is instantly killed.\n\n" + "This is a targetted spell (see on the first page). ", "Magic Mapping\n\n" + "A useful spell to locate yourself in the dungeon. " + "This spell draws maps on the wall. Find a good plain wall and cast the spell to print the map on the wall.\n" + "The map will show doors, locked doors, keys, chests, and even secret passage. The map will also be centered on your current position.", "Summon food\n\n" + "You should use this spell if you are diying of starvation. " + "This spell is used to summon food. After casting the spell, a bag of food will appear at your feet and will contain break or cake. " + "All you have to do is picking up the bag and consume the food.", "Reflection Field\n\n" + "This spell raises a reflection field around the caster. This field causes the incomming hostile attacks to be reflected back. " + "Only a fraction of the damage is dealt to the caster. The negative effects convoyed by the missile are also diminished. " + "This reflection field works against missiles and melee attacks.", "Light\n\n" + "When cast, this spell augments light around the caster. Some levels are dark, and could be very difficult (if not impossible) to explore. " + "This spell is essential in such case.", "Time Stop\n\n" + "Time is temporary halted when this spell is cast. The entire world is frozen. Only the caster may move and attack. " + "The spell lasts 9 seconds (according to the caster\'s point of view). " + "If the caster shoots missiles, they will be frozen as well, until the spell ends."

each of these spell description would be reminded when the spell is learned.