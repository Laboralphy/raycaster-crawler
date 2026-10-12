export const BOOKS = {
    en: {
        book_of_the_keys: {
            title: 'The book of the keys',
            level: 1,
            images: ['resources/gfx/books/book_of_the_keys.png'],
            pages: ["Dungeon doors are sometimes locked. You'll need keys to open such doors. " + "There are 5 types of keys. The red, blue, green and yellow keys open the " + "color matching doors, but they can only be used inside the level you found them." + "The fifth type, the gray key, works much like a picklock device and can be used " + "on any gray locked door.You can stack gray keys and save them for a later use."]
        },
        book_of_cooking: {
            title: "The book of cooking",
            level: 1,
            images: ['resources/gfx/books/book_of_cooking.png'],
            pages: ["Good adventurers never neglect having a good meal before going deep into dungeons. Learn to cook meals and " + "You'll never fear of dying of starvation.\n" + "For a good meal, you'll need these ingredients :\n" + "Raw meat - Vegetables - Cooking herbs - Water.\n" + "If you have all of them, activate any fireplace or other hot places to cook your meal. Bon appétit."]
        },
        book_of_the_keyboard: {
            title: "The book of the keyboard",
            level: 1,
            images: null,
            pages: ["Remember the most important keys on your keyboard. Press E to open an inventory window. " + "Press F12 to save your game and exit to the main menu. " + "Press SPACE to activate things in game, like doors, bookshelves, chest. "]
        },
        book_of_magical_energy: {
            title: "The book of magical energy",
            level: 1,
            images: ['resources/gfx/books/book_of_magical_energy.png'],
            pages: ["Your magical abilities to cast missiles with a wand are limited by a pool of magic points. You consume points each time you cast a missile. " + "Should you ever run out of magic points, you'll won't be able to cast missile anymore.	To restore your magic points, drink a potion of mana."]
        },
        book_of_the_dagger: {
            title: 'The book of the dagger',
            level: 1,
            images: ['resources/gfx/books/book_of_the_dagger.png'],
            pages: ["A dagger is a very short sword. Everyone can use a dagger.	You'll need no special ability to attack foes with such a weapon. " + "It's very useful when you want to spare your magical energy. Some rare daggers are very sharp and deal a lot of damage. " + "However keep in mind that the limited range of the blade is risky when facing to ranged or heavy armored attackers."]
        },
        book_of_the_wand: {
            title: 'The book of the wand',
            level: 1,
            images: ['resources/gfx/books/book_of_the_wand.png'],
            pages: ["Your wand is your primary offensive weapon. It fires missiles and consumes magic points. " + "Some wands have special attacks like triple fireball, or bumping missiles. Keep the attack button pressed to charge your weapon a few seconds " + "and then release the attack button to cast powerful missiles."]
        },
        book_of_alchemy: {
            title: 'The book of alchemy',
            level: 1,
            images: ['resources/gfx/books/book_of_alchemy.png'],
            pages: ["Veteran adventurers learn to brew potions. Potions are magical beverages you drink in order to gain strength or ability enhancements for a short period of time. " + "It's useful in combat. With the adequate potion you can deal or sustain more damage, you can move faster or you can regain health points. ", "If you find medicinal or magical herbs you may brew your own potions using an alchemy desk. But before that, you must find recipes. " + "Recipes can ben found in alchemy book, on alchemy labs bookshelves."]
        },
        book_of_the_spacebar: {
            title: 'The book of the space bar',
            level: 1,
            images: null,
            pages: ["The space bar is a key on your keyboard, the biggest one. This key is used in the game to activate things like alchemy desks (and open a crafting interface) or bookshelves (and open a book). " + "Space bar is also used to pick up dropped items, open chest, doors, and secret passages..."]
        },
        book_of_the_inventory: {
            title: 'The book of the inventory',
            level: 1,
            images: null,
            pages: ["Adventurers have bag to store items in. To open your bag and see what is inside, press the E key on your keyboard. " + "The inventory window will popup. Use the mouse to select an item. Double click on an item to use/equip/consume " + "the selected item (provided that it is usable, equipable or consumable). "]
        },
        book_of_the_story: {
            title: 'The story so far...',
            level: 1,
            images: ['resources/gfx/books/book_of_story0.png', 'resources/gfx/books/book_of_story3.png'],
            pages: ["Welcome adventurer ! You are an adventurer versed in the arts of magic.\n" + "You were given the quest of carrying the Ancient Grimoire of Power and delivering it at the Arcane Sanctuary.\n\n" + "Unfortunatly, you were ambushed in a dark forest and a Weird Warlock stole the Grimoire from you.", "You follow your aggressor\'s footprints that lead to a dark ruined keep deep into the forest. " + "That's the Warlock's lair for sure !\n\n" + "You shall have revenge ! You decide to enter the dungeon and take the Grimoire back from the Warlock !\n"]
        },
        book_of_spells: {
            title: 'The book of spells',
            level: 1,
            images: ['resources/gfx/books/book_spells_info.png', 'resources/gfx/books/book_spells_vampyre.png', 'resources/gfx/books/book_spells_teleport.png', 'resources/gfx/books/book_spells_knock.png', 'resources/gfx/books/book_spells_death.png', 'resources/gfx/books/book_spells_map.png', 'resources/gfx/books/book_spells_food.png', 'resources/gfx/books/book_spells_reflect.png', 'resources/gfx/books/book_spells_light.png', 'resources/gfx/books/book_spells_timestop.png'],
            pages: ["Spells are instantly cast using the Function keys (F1, F2...) on the keyboard.\n\n" + "Targetted spells : Such spells need accuracy and must be selected first by hitting their corresponding Function key. " + "Then, just aim and click ont the Right mouse button (or hit the V Key) to cast the spell.", "Life Drain\n\n" + "You may want to use this spell if your health becomes low. " + "Casting this spell will grant you a temporary Vampyre effect, your following succesful attacks with your wand or your dagger will devour " + "your enemy's health points and restore your own health points.", "Teleport\n\n" + "Teleportation allows you to instantly move foward until you reach any wall. " + "You are rotated by 180 degrees so the wall you are bumping into will be behind you.\n\n" + "This is a targetted spell (see on the first page). ", "Knock\n\n" + "This spell can unlock any locked door. Just place yourself in front of the door and close to it." + "Then cast the spell, the door should be instantly unlock.", "Death Spell\n\n" + "This spell cast an single invisible beam. Any creature hit by the beam is instantly killed.\n\n" + "This is a targetted spell (see on the first page). ", "Magic Mapping\n\n" + "A useful spell to locate yourself in the dungeon. " + "This spell draws maps on the wall. Find a good plain wall and cast the spell to print the map on the wall.\n" + "The map will show doors, locked doors, keys, chests, and even secret passage. The map will also be centered on your current position.", "Summon food\n\n" + "You should use this spell if you are diying of starvation. " + "This spell is used to summon food. After casting the spell, a bag of food will appear at your feet and will contain break or cake. " + "All you have to do is picking up the bag and consume the food.", "Reflection Field\n\n" + "This spell raises a reflection field around the caster. This field causes the incomming hostile attacks to be reflected back. " + "Only a fraction of the damage is dealt to the caster. The negative effects convoyed by the missile are also diminished. " + "This reflection field works against missiles and melee attacks.", "Light\n\n" + "When cast, this spell augments light around the caster. Some levels are dark, and could be very difficult (if not impossible) to explore. " + "This spell is essential in such case.", "Time Stop\n\n" + "Time is temporary halted when this spell is cast. The entire world is frozen. Only the caster may move and attack. " + "The spell lasts 9 seconds (according to the caster\'s point of view). " + "If the caster shoots missiles, they will be frozen as well, until the spell ends."]
        },
        craft_brew_recipe: {
            title: 'Recipe : $0',
            level: 1,
            images: null,
            pages: ["Browsing the shelves, you found a book of alchemy, explaining how to brew a $0. You may brew this potion at any alchemy desk providing you have the required components."]
        }
    },
    fr: {

    }
}
