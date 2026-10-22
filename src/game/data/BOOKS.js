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
            images: ['resources/gfx/books/book_spells_info.png', 'resources/gfx/books/book_spells_vampyre.png', 'resources/gfx/books/book_spells_teleport.png', 'resources/gfx/books/book_spells_knock.png', 'resources/gfx/books/book_spells_prisma.png', 'resources/gfx/books/book_spells_map.png', 'resources/gfx/books/book_spells_food.png', 'resources/gfx/books/book_spells_reflect.png', 'resources/gfx/books/book_spells_light.png', 'resources/gfx/books/book_spells_timestop.png'],
            pages: ["Spells are instantly cast using the Function keys (F1, F2...) on the keyboard.\n\n" + "Targetted spells : Such spells need accuracy and must be selected first by hitting their corresponding Function key. " + "Then, just aim and click ont the Right mouse button (or hit the V Key) to cast the spell.", "Life Drain\n\n" + "You may want to use this spell if your health becomes low. " + "Casting this spell will grant you a temporary Vampyre effect, your following succesful attacks with your wand or your dagger will devour " + "your enemy's health points and restore your own health points.", "Teleport\n\n" + "Teleportation allows you to instantly move foward until you reach any wall. " + "You are rotated by 180 degrees so the wall you are bumping into will be behind you.\n\n" + "This is a targetted spell (see on the first page). ", "Knock\n\n" + "This spell can unlock any locked door. Just place yourself in front of the door and close to it." + "Then cast the spell, the door should be instantly unlock.", "Prismatic Ray\n\n" + "Seven bolts of seven colours fan out in front of you. Red confuses, orange burns and blinds, yellow strikes with two random curses, green freezes and slows, blue shocks and paralyses, purple poisons, and magenta deals pure magic damage.\n\n" + "This is a targetted spell (see on the first page). ", "Magic Mapping\n\n" + "A useful spell to locate yourself in the dungeon. " + "This spell draws maps on the wall. Find a good plain wall and cast the spell to print the map on the wall.\n" + "The map will show doors, locked doors, keys, chests, and even secret passage. The map will also be centered on your current position.", "Summon food\n\n" + "You should use this spell if you are diying of starvation. " + "This spell is used to summon food. After casting the spell, a bag of food will appear at your feet and will contain break or cake. " + "All you have to do is picking up the bag and consume the food.", "Reflection Field\n\n" + "This spell raises a reflection field around the caster. This field causes the incomming hostile attacks to be reflected back. " + "Only a fraction of the damage is dealt to the caster. The negative effects convoyed by the missile are also diminished. " + "This reflection field works against missiles and melee attacks.", "Light\n\n" + "When cast, this spell augments light around the caster. Some levels are dark, and could be very difficult (if not impossible) to explore. " + "This spell is essential in such case.", "Time Stop\n\n" + "Time is temporary halted when this spell is cast. The entire world is frozen. Only the caster may move and attack. " + "The spell lasts 9 seconds (according to the caster\'s point of view). " + "If the caster shoots missiles, they will be frozen as well, until the spell ends."]
        },
        craft_brew_recipe: {
            title: 'Recipe : $0',
            level: 1,
            images: null,
            pages: ["Browsing the shelves, you found a book of alchemy, explaining how to brew a $0. You may brew this potion at any alchemy desk providing you have the required components."]
        },
        spell_learned: {
            title: 'Spell : $0',
            level: 1,
            images: null,
            pages: ["Browsing the shelves, you found an old grimoire and learned a new spell : $0.\n\n$1\n\nCast it with the $2 key."]
        },
        shelf_junk_1: {
            title: 'Rotten pages',
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["The damp has eaten these books. The pages crumble between your fingers before you can read a single line."]
        },
        shelf_junk_2: {
            title: 'A tax ledger',
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["Column after column of numbers : grain, salt, candles, and a very long list of unpaid debts. Nothing magical here, except maybe the size of the debts."]
        },
        shelf_junk_3: {
            title: 'An unknown script',
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["The book is written in strange, twisted letters. You stare at them for a long while, but they make no sense to you."]
        },
        shelf_junk_4: {
            title: 'A love letter',
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["\"My dearest, I count the days until the Warlock lets me go home. The food is awful and the skeletons never laugh at my jokes...\" The rest is too personal to read."]
        },
        shelf_junk_5: {
            title: 'Poems',
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["A collection of very bad poems about the moon, the rain and a cat named Mortimer. You put the book back quickly."]
        },
        shelf_junk_6: {
            title: 'Blank pages',
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["All the pages are blank. Maybe the ink faded long ago, or maybe the author never found anything to say."]
        },
        // bestiaire, écrit par le Sorcier : une page et une image par créature
        book_of_goblinoids: {
            title: 'Bestiary : the goblinoids',
            level: 1,
            images: ['resources/gfx/books/book_m_goblin.png', 'resources/gfx/books/book_m_goblin_warrior.png'],
            pages: ["The Goblin\n\n" + "My doorkeepers. Small, greedy, and quick on their feet : they rush at any intruder with a cheap brass dagger. " + "Five honest blows are enough to break one. I keep them for their numbers, not for their brains. " + "If you are reading this, adventurer, they have already failed me. I expected nothing less.", "The Goblin Warrior\n\n" + "A goblin who survived long enough to steal some armour. Twelve wounds before it falls, " + "but the same brass dagger and the same lack of imagination. " + "They guard the upper halls of my keep. Do not flatter yourself if you beat a few of them : I breed them by the hundred."]
        },
        book_of_creepers: {
            title: 'Bestiary : the creepers',
            level: 1,
            images: ['resources/gfx/books/book_m_wasp.png', 'resources/gfx/books/book_m_spider.png', 'resources/gfx/books/book_m_raven.png', 'resources/gfx/books/book_m_bat.png'],
            pages: ["The Giant Wasp\n\n" + "I fed the common wasp on alchemical honey. The result darts in, stings, and darts away before you can strike back. " + "Its body is fragile, three wounds at most, but one sting in four leaves a poison in the blood. " + "A fitting welcome for uninvited guests.", "The Giant Spider\n\n" + "The fastest thing that crawls in my crypts and my mines, far faster than you. " + "Its venomous bite is the same as the wasp's, and it never lets go. " + "Six wounds will kill it, if you can hit it. Most visitors die trying to run away from it.", "The Raven\n\n" + "My favourite pet, and the only creature here with a sense of humour. It does not fight to kill : " + "it pecks, then flies off with something from your bag. A trinket, a ring, an amulet... " + "Everything it steals comes back to me. Thank you for your gifts.", "The Bat\n\n" + "A tiny thing, as frail as the raven, that the witches keep in their coven. " + "It never flies straight : it flutters left and right in a mad zigzag and bites when you finally lose track of it. " + "Swing at it as much as you like. You will mostly hit the air."]
        },
        book_of_undead: {
            title: 'Bestiary : the undead',
            level: 1,
            images: ['resources/gfx/books/zombie_attack_front-left.png', 'resources/gfx/books/book_m_skeleton.png', 'resources/gfx/books/book_m_zombie_monarch.png'],
            pages: ["The Zombie\n\n" + "Death is no excuse to stop working in my service. The corpses of my crypts walk again, " + "slow and stupid, and claw at the living with whatever is left of their hands. " + "Six wounds put one back to rest. Until I wake it up again, of course.", "The Skeleton\n\n" + "Once the flesh has rotted away, what remains is lighter, harder and far more obedient. " + "My skeletons take fifteen wounds before they crumble, and you will find them everywhere : crypts, mines, deep halls. " + "Bones are cheap. Your bones will do, too.", "The Zombie Monarch\n\n" + "He was a king, once, and he ruled these lands before I came. Now he rules only my crypts, as my slave. " + "Two hundred wounds, a steel blade, and a grudge against every living thing. " + "While he stands, the gate of his throne room stays sealed. It will stay sealed forever, I suspect."]
        },
        book_of_coven: {
            title: 'Bestiary : the coven',
            level: 1,
            images: ['resources/gfx/books/book_m_witch.png', 'resources/gfx/books/book_m_dark_witch.png', 'resources/gfx/books/book_m_witch_queen.png'],
            pages: ["The Witch\n\n" + "The coven believes it is my ally. I let it believe so. " + "A witch keeps her distance and hurls bolts of lightning, fifteen wounds deep. " + "Their spells are shaped to spare their queen : in a crowded corridor they burst against her without a scratch. " + "Clever, for a witch.", "The Dark Witch\n\n" + "The same frail body as her sisters, but she has dabbled in shadow : her dark bolts burn the mind, not the flesh. " + "Worse, she mends her sisters' wounds with a healing spell. Kill her first, if you have the wit. " + "And like her sisters, she would never harm her queen.", "The Witch Queen\n\n" + "The queen of the coven calls herself my equal. Amusing. " + "Sixty wounds, a skin that shrugs off magic and lightning, and three toxic bolts at once from her throne. " + "While she lives, the way out of her throne room stays sealed. I would almost wish you luck. Almost."]
        },
        book_of_infernal_creatures: {
            title: 'Bestiary : the infernal creatures',
            level: 1,
            images: ['resources/gfx/books/book_m_cube.png', 'resources/gfx/books/book_m_knight.png', 'resources/gfx/books/book_m_succubus.png'],
            pages: ["The Cube\n\n" + "I opened a door to the Pit, and this came through first. A floating block of infernal stone " + "that spits three fireballs at a time, and the fireballs bounce off the walls. " + "Ten wounds will crack it. Corners will not save you.", "The Knight\n\n" + "A suit of black armour bound to a burning soul. It is slow, but its steel blade cuts deep, " + "and daggers and fists barely dent its plates : twenty-five wounds, and most of them wasted. " + "Its one weakness is lightning, which runs through the metal. Not that you will think of it in time.", "The Succubus\n\n" + "The most charming guest of my infernal keep. Quick on her feet, she keeps her distance and hurls fireballs, twenty-five wounds deep. " + "Fire is her element : she shrugs off half the damage of any flame you throw at her. " + "Bring something colder. Or do not come at all."]
        },
        book_of_failed_experiments: {
            title: 'Bestiary : the failed experiments',
            level: 1,
            images: ['resources/gfx/books/book_m_myco.png', 'resources/gfx/books/book_m_myco2.png', 'resources/gfx/books/book_m_acid_blob.png', 'resources/gfx/books/book_m_fire_blob.png'],
            pages: ["The Myco\n\n" + "My first attempt at breeding guards from mushrooms. A failure : it crawls so slowly that a snail would overtake it, " + "and four wounds are enough to squash it. I threw the lot of them out into the forest. " + "Let them be the first thing you meet, and the first thing you underestimate.", "The Spitting Myco\n\n" + "My second attempt. It still crawls, but now it spits toxic spores from afar. " + "Six wounds to kill, and one spit in five leaves the victim confused, stumbling about like a drunkard. " + "Still a failure. A useful one.", "The Acid Blob\n\n" + "I wanted a living potion. I got a bag of acid with a mind of its own, ten wounds deep, immune to most poisons. " + "It rushes at you and bursts, splashing acid all around, on you and on anything else near it. " + "Kill it from afar, if you can. I keep mine well away from my laboratory.", "The Fire Blob\n\n" + "The acid blob's brother, filled with liquid fire instead. Same ten wounds, same charge, same burst : " + "but this one sets everything around it ablaze, and fire does not trouble it much. " + "I find them delightful. From a distance."]
        }
    },
    fr: {
        book_of_the_keys: {
            title: "Le livre des clés",
            level: 1,
            images: ['resources/gfx/books/book_of_the_keys.png'],
            pages: ["Les portes des donjons sont parfois verrouillées : il faut des clés pour les ouvrir. " + "Il existe 5 sortes de clés. Les clés rouge, bleue, verte et jaune ouvrent les portes " + "de la même couleur, mais seulement dans le niveau où elles ont été trouvées. " + "La cinquième, la clé grise, fonctionne comme un crochet et ouvre " + "n'importe quelle porte grise verrouillée. Elles se cumulent et se gardent."]
        },
        book_of_cooking: {
            title: "Le livre de cuisine",
            level: 1,
            images: ['resources/gfx/books/book_of_cooking.png'],
            pages: ["Un bon aventurier ne descend jamais dans un donjon le ventre vide. Apprenez à cuisiner et " + "vous ne craindrez plus de mourir de faim.\n" + "Pour un bon repas, il vous faut :\n" + "Viande crue - Légumes - Herbes aromatiques - Eau.\n" + "Avec tout cela, activez une cheminée ou un autre foyer pour cuire votre repas. Bon appétit."]
        },
        book_of_the_keyboard: {
            title: "Le livre du clavier",
            level: 1,
            images: null,
            pages: ["Retenez les touches les plus importantes du clavier. E ouvre l'inventaire. " + "F12 sauvegarde la partie et revient au menu principal. " + "ESPACE active les objets du jeu : portes, bibliothèques, coffres. "]
        },
        book_of_magical_energy: {
            title: "Le livre de l'énergie magique",
            level: 1,
            images: ['resources/gfx/books/book_of_magical_energy.png'],
            pages: ["Les projectiles lancés avec une baguette puisent dans une réserve de points de magie. Chaque tir en consomme. " + "Sans points de magie, vous ne pouvez plus tirer. Pour en récupérer, buvez une potion de mana."]
        },
        book_of_the_dagger: {
            title: "Le livre de la dague",
            level: 1,
            images: ['resources/gfx/books/book_of_the_dagger.png'],
            pages: ["La dague est une épée très courte, à la portée de tous : nul besoin de talent particulier pour s'en servir. " + "Elle permet d'économiser votre énergie magique. Certaines dagues rares sont très tranchantes et font de gros dégâts. " + "Mais attention : sa faible allonge est risquée face aux tireurs ou aux ennemis lourdement cuirassés."]
        },
        book_of_the_wand: {
            title: "Le livre de la baguette",
            level: 1,
            images: ['resources/gfx/books/book_of_the_wand.png'],
            pages: ["La baguette est votre arme principale. Elle tire des projectiles et consomme des points de magie. " + "Certaines ont des attaques spéciales : triple boule de feu, projectiles rebondissants... Maintenez le bouton d'attaque quelques secondes pour charger " + "votre arme, puis relâchez-le pour lancer de puissants projectiles."]
        },
        book_of_alchemy: {
            title: "Le livre de l'alchimie",
            level: 1,
            images: ['resources/gfx/books/book_of_alchemy.png'],
            pages: ["Les aventuriers chevronnés savent brasser des potions : des breuvages magiques qui renforcent force ou talents pendant un court moment. " + "Utile au combat ! La bonne potion vous fait infliger ou encaisser plus de dégâts, courir plus vite ou regagner de la santé. ", "Avec des herbes médicinales ou magiques, vous pouvez brasser vos potions à une table d'alchimie. Mais il vous faut d'abord des recettes. " + "Elles se trouvent dans les livres d'alchimie, sur les étagères des laboratoires."]
        },
        book_of_the_spacebar: {
            title: "Le livre de la barre d'espace",
            level: 1,
            images: null,
            pages: ["La barre d'espace est la plus grande touche du clavier. Elle sert à activer les tables d'alchimie (pour fabriquer) et les bibliothèques (pour lire). " + "Elle sert aussi à ramasser les objets, ouvrir les coffres, les portes et les passages secrets..."]
        },
        book_of_the_inventory: {
            title: "Le livre de l'inventaire",
            level: 1,
            images: null,
            pages: ["Les aventuriers rangent leurs objets dans un sac. Pour l'ouvrir, appuyez sur la touche E. " + "La fenêtre d'inventaire s'affiche. Choisissez un objet à la souris, et double-cliquez pour l'utiliser, " + "l'équiper ou le consommer (s'il s'y prête). "]
        },
        book_of_the_story: {
            title: "L'histoire commence...",
            level: 1,
            images: ['resources/gfx/books/book_of_story0.png', 'resources/gfx/books/book_of_story3.png'],
            pages: ["Bienvenue, aventurier ! Vous êtes versé dans les arts magiques.\n" + "Vous avez reçu pour quête de rapporter l'Ancien Grimoire du Pouvoir au Sanctuaire des arcanes.\n\n" + "Hélas, vous êtes tombé dans une embuscade au cœur d'une sombre forêt, et un Étrange Sorcier vous a volé le Grimoire.", "Vous suivez les traces de votre agresseur jusqu'à un fortin en ruine, au plus profond de la forêt. " + "C'est à coup sûr le repaire du Sorcier !\n\n" + "L'heure de la vengeance a sonné ! Vous entrez dans le donjon pour reprendre le Grimoire au Sorcier !\n"]
        },
        book_of_spells: {
            title: "Le livre des sorts",
            level: 1,
            images: ['resources/gfx/books/book_spells_info.png', 'resources/gfx/books/book_spells_vampyre.png', 'resources/gfx/books/book_spells_teleport.png', 'resources/gfx/books/book_spells_knock.png', 'resources/gfx/books/book_spells_prisma.png', 'resources/gfx/books/book_spells_map.png', 'resources/gfx/books/book_spells_food.png', 'resources/gfx/books/book_spells_reflect.png', 'resources/gfx/books/book_spells_light.png', 'resources/gfx/books/book_spells_timestop.png'],
            pages: ["Les sorts se lancent avec les touches de fonction du clavier (F1, F2...).\n\n" + "Sorts ciblés : ils demandent de la précision. Choisissez-les d'abord avec leur touche de fonction, " + "puis visez et cliquez avec le bouton droit de la souris (ou la touche V).", "Drain de vie\n\n" + "Utile quand votre santé baisse. " + "Ce sort vous rend vampire pour un temps : vos attaques réussies à la baguette ou à la dague dévorent " + "la santé de l'ennemi et vous la rendent.", "Téléportation\n\n" + "Vous avancez instantanément jusqu'au premier mur. " + "Vous êtes ensuite retourné de 180 degrés : le mur se retrouve dans votre dos.\n\n" + "C'est un sort ciblé (voir la première page). ", "Ouverture\n\n" + "Ce sort déverrouille n'importe quelle porte. Placez-vous juste devant la porte, " + "puis lancez le sort : elle s'ouvre aussitôt.", "Rayon prismatique\n\n" + "Sept éclairs de sept couleurs partent en éventail devant vous. Le rouge rend confus, l'orange brûle et aveugle, le jaune frappe de deux maléfices au hasard, le vert glace et ralentit, le bleu foudroie et paralyse, le violet empoisonne, et le magenta frappe de pure magie.\n\n" + "C'est un sort ciblé (voir la première page). ", "Cartographie\n\n" + "Un sort utile pour se repérer dans le donjon. " + "Il dessine une carte sur un mur : trouvez un mur nu et lancez le sort.\n" + "La carte montre les portes, verrouillées ou non, les clés, les coffres et même les passages secrets. Elle est centrée sur votre position.", "Invocation de nourriture\n\n" + "À utiliser si vous mourez de faim. " + "Un sac de nourriture apparaît à vos pieds, avec du pain ou du gâteau. " + "Il ne reste qu'à ramasser le sac et à manger.", "Champ réfléchissant\n\n" + "Ce sort entoure le lanceur d'un champ qui renvoie les attaques ennemies. " + "Le lanceur ne subit qu'une partie des dégâts, et les effets néfastes des projectiles sont atténués. " + "Le champ protège des projectiles comme des attaques au corps à corps.", "Lumière\n\n" + "Ce sort éclaire les alentours du lanceur. Certains niveaux sont si sombres qu'ils sont difficiles (voire impossibles) à explorer. " + "Ce sort y est indispensable.", "Arrêt du temps\n\n" + "Le temps s'arrête : le monde entier est figé. Seul le lanceur peut bouger et attaquer. " + "Le sort dure 9 secondes (du point de vue du lanceur). " + "Les projectiles qu'il tire sont figés eux aussi, jusqu'à la fin du sort."]
        },
        craft_brew_recipe: {
            title: "Recette : $0",
            level: 1,
            images: null,
            pages: ["En fouillant les étagères, vous trouvez un livre d'alchimie qui explique comment brasser : $0. Vous pourrez la brasser à n'importe quelle table d'alchimie si vous avez les ingrédients."]
        },
        spell_learned: {
            title: "Sort : $0",
            level: 1,
            images: null,
            pages: ["En fouillant les étagères, vous trouvez un vieux grimoire et apprenez un nouveau sort : $0.\n\n$1\n\nLancez-le avec la touche $2."]
        },
        shelf_junk_1: {
            title: "Pages pourries",
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["L'humidité a rongé ces livres. Les pages s'effritent entre vos doigts avant que vous puissiez lire une seule ligne."]
        },
        shelf_junk_2: {
            title: "Un registre d'impôts",
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["Des colonnes de chiffres à n'en plus finir : grain, sel, chandelles, et une très longue liste de dettes impayées. Rien de magique, sauf peut-être le montant des dettes."]
        },
        shelf_junk_3: {
            title: "Une écriture inconnue",
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["Le livre est écrit en lettres étranges et tordues. Vous les fixez longtemps, sans rien y comprendre."]
        },
        shelf_junk_4: {
            title: "Une lettre d'amour",
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["« Ma chérie, je compte les jours jusqu'à ce que le Sorcier me laisse rentrer. La nourriture est infâme et les squelettes ne rient jamais à mes blagues... » La suite est trop intime pour être lue."]
        },
        shelf_junk_5: {
            title: "Poèmes",
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["Un recueil de très mauvais poèmes sur la lune, la pluie et un chat nommé Mortimer. Vous reposez vite le livre."]
        },
        shelf_junk_6: {
            title: "Pages blanches",
            level: 1,
            images: ['resources/gfx/books/book_of_junk.png'],
            pages: ["Toutes les pages sont blanches. L'encre s'est peut-être effacée il y a longtemps, ou l'auteur n'a jamais rien trouvé à dire."]
        },
        book_of_goblinoids: {
            title: "Bestiaire : les gobelinoïdes",
            level: 1,
            images: ['resources/gfx/books/book_m_goblin.png', 'resources/gfx/books/book_m_goblin_warrior.png'],
            pages: ["Le Gobelin\n\n" + "Mes portiers. Petits, avides et vifs : ils se ruent sur tout intrus, une méchante dague de laiton à la main. " + "Cinq bons coups suffisent à en briser un. Je les garde pour leur nombre, pas pour leur cervelle. " + "Si vous lisez ceci, aventurier, c'est qu'ils ont déjà échoué. Je n'en attendais pas moins.", "Le Gobelin guerrier\n\n" + "Un gobelin qui a vécu assez longtemps pour voler une armure. Il encaisse douze blessures avant de tomber, " + "mais garde la même dague de laiton et le même manque d'imagination. " + "Ils gardent les salles hautes de mon fort. Ne vous flattez pas d'en abattre quelques-uns : j'en élève des centaines."]
        },
        book_of_creepers: {
            title: "Bestiaire : les rampants et les volants",
            level: 1,
            images: ['resources/gfx/books/book_m_wasp.png', 'resources/gfx/books/book_m_spider.png', 'resources/gfx/books/book_m_raven.png', 'resources/gfx/books/book_m_bat.png'],
            pages: ["La Guêpe géante\n\n" + "J'ai nourri la guêpe commune de miel alchimique. Le résultat fond sur vous, pique, et repart avant que vous puissiez riposter. " + "Son corps est fragile, trois blessures tout au plus, mais une piqûre sur quatre laisse un poison dans le sang. " + "Un accueil digne des invités qu'on n'attendait pas.", "L'Araignée géante\n\n" + "Ce qui rampe le plus vite dans mes cryptes et mes mines, bien plus vite que vous. " + "Sa morsure est aussi venimeuse que la piqûre de la guêpe, et elle ne lâche jamais prise. " + "Six blessures la tuent, si vous arrivez à la toucher. La plupart de mes visiteurs meurent en essayant de la fuir.", "Le Corbeau\n\n" + "Mon animal préféré, et la seule créature d'ici qui ait de l'humour. Il ne se bat pas pour tuer : " + "il donne un coup de bec, puis s'envole avec un objet pris dans votre sac. Une babiole, un anneau, une amulette... " + "Tout ce qu'il vole finit chez moi. Merci pour vos cadeaux.", "La Chauve-souris\n\n" + "Une petite chose, aussi frêle que le corbeau, que les sorcières élèvent dans leur cercle. " + "Elle ne vole jamais droit : elle zigzague follement à gauche, à droite, et mord quand vous l'avez enfin perdue de vue. " + "Frappez-la tant que vous voudrez. Vous toucherez surtout l'air."]
        },
        book_of_undead: {
            title: "Bestiaire : les morts-vivants",
            level: 1,
            images: ['resources/gfx/books/zombie_attack_front-left.png', 'resources/gfx/books/book_m_skeleton.png', 'resources/gfx/books/book_m_zombie_monarch.png'],
            pages: ["Le Zombie\n\n" + "La mort n'est pas une excuse pour quitter mon service. Les cadavres de mes cryptes marchent de nouveau, " + "lents et stupides, et griffent les vivants avec ce qui leur reste de mains. " + "Six blessures en renvoient un au repos. Jusqu'à ce que je le réveille, bien sûr.", "Le Squelette\n\n" + "Une fois la chair pourrie, ce qui reste est plus léger, plus dur et bien plus obéissant. " + "Mes squelettes encaissent quinze blessures avant de s'effondrer, et vous en trouverez partout : cryptes, mines, salles profondes. " + "Les os ne coûtent rien. Les vôtres feront l'affaire, eux aussi.", "Le Monarque zombie\n\n" + "Il fut roi, autrefois, et régnait sur ces terres avant mon arrivée. Il ne règne plus que sur mes cryptes, en esclave. " + "Deux cents blessures, une lame d'acier et une rancune envers tout ce qui vit. " + "Tant qu'il tient debout, la porte de sa salle du trône reste scellée. Pour toujours, je le crains."]
        },
        book_of_coven: {
            title: "Bestiaire : le cercle des sorcières",
            level: 1,
            images: ['resources/gfx/books/book_m_witch.png', 'resources/gfx/books/book_m_dark_witch.png', 'resources/gfx/books/book_m_witch_queen.png'],
            pages: ["La Sorcière\n\n" + "Le cercle se croit mon allié. Je le laisse le croire. " + "Une sorcière garde ses distances et lance des éclairs ; il faut quinze blessures pour l'abattre. " + "Ses sorts épargnent sa reine : dans un couloir encombré, ils éclatent contre elle sans l'égratigner. " + "Habile, pour une sorcière.", "La Sorcière noire\n\n" + "Le même corps frêle que ses sœurs, mais elle s'est essayée aux ténèbres : ses traits d'ombre brûlent l'esprit, pas la chair. " + "Pire, elle referme les blessures de ses sœurs d'un sort de soin. Tuez-la d'abord, si vous en avez l'esprit. " + "Comme ses sœurs, jamais elle ne blesserait sa reine.", "La Reine des sorcières\n\n" + "La reine du cercle se dit mon égale. Amusant. " + "Soixante blessures, une peau sur laquelle glissent la magie et la foudre, et trois traits toxiques à la fois depuis son trône. " + "Tant qu'elle vit, la sortie de sa salle du trône reste scellée. Je vous souhaiterais presque bonne chance. Presque."]
        },
        book_of_infernal_creatures: {
            title: "Bestiaire : les créatures infernales",
            level: 1,
            images: ['resources/gfx/books/book_m_cube.png', 'resources/gfx/books/book_m_knight.png', 'resources/gfx/books/book_m_succubus.png'],
            pages: ["Le Cube\n\n" + "J'ai ouvert une porte sur l'Abîme, et ceci l'a franchie en premier. Un bloc de pierre infernale flottant, " + "qui crache trois boules de feu à la fois, et ces boules rebondissent sur les murs. " + "Dix blessures le fendent. Les recoins ne vous sauveront pas.", "Le Chevalier\n\n" + "Une armure noire liée à une âme qui brûle. Il est lent, mais sa lame d'acier taille profond, " + "et dagues et poings entament à peine ses plaques : vingt-cinq blessures, presque toutes perdues. " + "Sa seule faiblesse est la foudre, qui court dans le métal. Encore faudrait-il y penser à temps.", "La Succube\n\n" + "L'invitée la plus charmante de mon fort infernal. Vive, elle garde ses distances et lance des boules de feu ; il faut vingt-cinq blessures pour l'abattre. " + "Le feu est son élément : elle ignore la moitié des dégâts de toute flamme que vous lui lancez. " + "Apportez quelque chose de plus froid. Ou ne venez pas."]
        },
        book_of_failed_experiments: {
            title: "Bestiaire : les expériences ratées",
            level: 1,
            images: ['resources/gfx/books/book_m_myco.png', 'resources/gfx/books/book_m_myco2.png', 'resources/gfx/books/book_m_acid_blob.png', 'resources/gfx/books/book_m_fire_blob.png'],
            pages: ["Le Myco\n\n" + "Mon premier essai pour élever des gardes à partir de champignons. Un échec : il rampe si lentement qu'un escargot le doublerait, " + "et quatre blessures suffisent à l'écraser. J'ai jeté toute la portée dans la forêt. " + "Qu'il soit la première chose que vous croisez, et la première que vous sous-estimez.", "Le Myco cracheur\n\n" + "Mon deuxième essai. Il rampe toujours, mais il crache désormais des spores toxiques de loin. " + "Six blessures pour le tuer, et un crachat sur cinq laisse la victime confuse, titubant comme un ivrogne. " + "Encore un échec. Un échec utile.", "Le Blob acide\n\n" + "Je voulais une potion vivante. J'ai obtenu un sac d'acide doué de volonté, dix blessures, insensible à la plupart des poisons. " + "Il se rue sur vous et éclate, éclaboussant d'acide tout ce qui l'entoure, vous compris. " + "Tuez-le de loin, si vous le pouvez. Je garde les miens loin de mon laboratoire.", "Le Blob de feu\n\n" + "Le frère du blob acide, rempli de feu liquide. Mêmes dix blessures, même charge, même explosion : " + "mais celui-ci embrase tout autour de lui, et le feu ne le gêne guère. " + "Je les trouve délicieux. De loin."]
        }
    }
}
