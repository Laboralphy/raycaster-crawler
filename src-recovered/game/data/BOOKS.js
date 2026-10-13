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
            images: ['resources/gfx/books/book_spells_info.png', 'resources/gfx/books/book_spells_vampyre.png', 'resources/gfx/books/book_spells_teleport.png', 'resources/gfx/books/book_spells_knock.png', 'resources/gfx/books/book_spells_death.png', 'resources/gfx/books/book_spells_map.png', 'resources/gfx/books/book_spells_food.png', 'resources/gfx/books/book_spells_reflect.png', 'resources/gfx/books/book_spells_light.png', 'resources/gfx/books/book_spells_timestop.png'],
            pages: ["Les sorts se lancent avec les touches de fonction du clavier (F1, F2...).\n\n" + "Sorts ciblés : ils demandent de la précision. Choisissez-les d'abord avec leur touche de fonction, " + "puis visez et cliquez avec le bouton droit de la souris (ou la touche V).", "Drain de vie\n\n" + "Utile quand votre santé baisse. " + "Ce sort vous rend vampire pour un temps : vos attaques réussies à la baguette ou à la dague dévorent " + "la santé de l'ennemi et vous la rendent.", "Téléportation\n\n" + "Vous avancez instantanément jusqu'au premier mur. " + "Vous êtes ensuite retourné de 180 degrés : le mur se retrouve dans votre dos.\n\n" + "C'est un sort ciblé (voir la première page). ", "Ouverture\n\n" + "Ce sort déverrouille n'importe quelle porte. Placez-vous juste devant la porte, " + "puis lancez le sort : elle s'ouvre aussitôt.", "Sort de mort\n\n" + "Ce sort lance un rayon invisible. Toute créature touchée meurt sur le coup.\n\n" + "C'est un sort ciblé (voir la première page). ", "Cartographie\n\n" + "Un sort utile pour se repérer dans le donjon. " + "Il dessine une carte sur un mur : trouvez un mur nu et lancez le sort.\n" + "La carte montre les portes, verrouillées ou non, les clés, les coffres et même les passages secrets. Elle est centrée sur votre position.", "Invocation de nourriture\n\n" + "À utiliser si vous mourez de faim. " + "Un sac de nourriture apparaît à vos pieds, avec du pain ou du gâteau. " + "Il ne reste qu'à ramasser le sac et à manger.", "Champ réfléchissant\n\n" + "Ce sort entoure le lanceur d'un champ qui renvoie les attaques ennemies. " + "Le lanceur ne subit qu'une partie des dégâts, et les effets néfastes des projectiles sont atténués. " + "Le champ protège des projectiles comme des attaques au corps à corps.", "Lumière\n\n" + "Ce sort éclaire les alentours du lanceur. Certains niveaux sont si sombres qu'ils sont difficiles (voire impossibles) à explorer. " + "Ce sort y est indispensable.", "Arrêt du temps\n\n" + "Le temps s'arrête : le monde entier est figé. Seul le lanceur peut bouger et attaquer. " + "Le sort dure 9 secondes (du point de vue du lanceur). " + "Les projectiles qu'il tire sont figés eux aussi, jusqu'à la fin du sort."]
        },
        craft_brew_recipe: {
            title: "Recette : $0",
            level: 1,
            images: null,
            pages: ["En fouillant les étagères, vous trouvez un livre d'alchimie qui explique comment brasser : $0. Vous pourrez la brasser à n'importe quelle table d'alchimie si vous avez les ingrédients."]
        }
    }
}
