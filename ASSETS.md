# Ressources du jeu — origines et licences

Ce que le jeu livre (images, sons, musiques, polices), d'où ça vient et sous
quelle licence. Tout ce qui est livré doit pouvoir être **redistribué dans un
jeu publié** (itch.io, Steam, jeu gratuit) : une ressource d'origine ou de
licence inconnue est interdite tant qu'elle n'est pas vérifiée.

Ce qui a été fait avec l'IA, et les cases à cocher sur les plateformes, est
dans `AI_DISCLOSURE.md`.

État au 22 octobre 2026.

## Ressources de tiers

Les seules ressources du jeu qui ne sont pas de l'auteur.

| Ressource | Où dans le jeu | Auteur, source | Licence | Obligation |
|---|---|---|---|---|
| Banque de sons **GeneralUser GS v1.471** | ses échantillons sont dans toutes les musiques `resources/snd/ogg/mus_*.ogg` (rendu des partitions) | S. Christian Collins, https://schristiancollins.com/generaluser.php | libre, y compris pour un usage commercial de la musique produite | aucune ; licence à relire (voir plus bas) |
| Portraits muraux `resources/gfx/textures/d_pictures.png` | tableaux sur les murs | artistes de Dungeon Crawl Stone Soup, [OpenGameArt](https://opengameart.org/content/dungeon-crawl-32x32-tiles) ; mis en cadre par nous | CC0 (vérifié sur la page et dans le README du paquet) | aucune (crédit facultatif, présent dans `credits.html`) |
| Cris de mort des monstres `resources/snd/ogg/creatures/x_death_*.ogg` (28 fichiers) | mort des monstres | [OpenGameArt](https://opengameart.org) | CC0 | aucune (crédit facultatif) |
| Police **UnifrakturMaguntia** | dessinée dans le logo `title_128.png` (pas livrée en fichier) | projet Unifraktur, https://fonts.google.com/specimen/UnifrakturMaguntia | SIL OFL 1.1 | aucune pour une image tirée de la police |

## Créations de l'auteur

Tout le reste, sauf ce qui est listé dans « À régler » :

- sprites des monstres et des objets (`resources/gfx/sprites/`), modélisés et
  rendus avec POV-Ray (les projectiles `p_*` avec le générateur de sprites
  de l'auteur, projet `raytracing-sprite-generator`) ; torche
  `o_torch_1.png` reprise du projet « mansion » ;
- textures des murs et des sols (`resources/gfx/textures/t_*`, `f_*`),
  dessinées avec OpenOffice Draw et assemblées avec GIMP, sauf les thèmes
  crypte et gothique (voir plus bas) ;
- icônes du jeu (`resources/gfx/icons/icons.png` : objets de l'inventaire,
  armes, sorts, effets), sauf celle du rayon prismatique, et chiffres du HUD
  (`digits.png`), dessinés par l'auteur avec OpenOffice Draw ;
- images des livres (`resources/gfx/books/`) : dessins OpenOffice Draw de
  l'auteur, et pour le bestiaire (`book_m_*`, `zombie_attack_front-left.png`)
  des compositions d'images des sprites POV-Ray des monstres du jeu ; sauf
  `book_spells_prisma.png` (script, voir plus bas) et les images de
  l'histoire listées dans « À régler » ;
- bruitages des portes, coffres, armoires et clés
  (`resources/snd/ogg/open-close-doors-containers/`, `pick-items/a_key.ogg`),
  enregistrés par l'auteur chez lui avec un Zoom Essential ;
- bruitages des sorts (`resources/snd/ogg/spells/`, dont `hit_spell0.ogg`) et cris de la poule de
  la cinématique d'intro (`creatures/m_chicken0.ogg`, `m_chicken1.ogg`), créés par l'auteur avec
  jsfxr (https://sfxr.me, générateur de sons ; le son produit appartient à
  celui qui le règle) ;
- bruitages de l'eau (`resources/snd/ogg/nature/water/`), des armes
  (`resources/snd/ogg/weapons/`) et du ramassage d'un objet
  (`pick-items/a_take.ogg`), créés par l'auteur avec Bfxr
  (https://www.bfxr.net, générateur de sons, même principe) ;
- musiques (`resources/snd/ogg/mus_*.ogg`), logo, ciel de nuit, ciel
  infernal (`sky_hell.png`), textures des thèmes crypte (`t_crypt*.png`,
  `f_crypt*.png`) et gothique (`t_gothic.png`, `f_gothic.png`), tirées des
  tuiles `t_gray` de l'auteur, maçonnerie et décors redessinés, panneau de magasin, icône et image du rayon
  prismatique : produits par des scripts du
  dépôt (`tools/music/`, `tools/gfx/`), écrits avec l'IA (voir
  `AI_DISCLOSURE.md`).

## Règles pour une nouvelle ressource

| Acceptable | Interdit |
|---|---|
| Création personnelle, y compris par nos scripts | Ressource extraite d'un autre jeu |
| CC0 / domaine public | Licence « non commerciale » (CC BY-NC…) : Steam peut être vu comme commercial, même pour un jeu gratuit |
| CC BY 3.0 / 4.0 : **créditer** l'auteur | Origine ou licence inconnue |
| SIL Open Font License (polices) | CC BY-SA : à éviter (œuvres dérivées sous la même licence) |

Noter l'auteur, la licence, l'URL et la date de vérification dans le
tableau « Ressources de tiers », et créditer si la licence l'exige : dans le
jeu (`src-recovered/game/data/STRINGS.js`, clé `cs1_credits`, en anglais et
en français) et dans `resources/doc/menu/credits.html` et `credits.fr.html`.

Banques de sons pour le rendu des musiques : seule une banque libre convient,
car ses échantillons finissent dans l'OGG. MuseScore General 0.2 (MIT) est
une autre banque possible (créditer alors FluidR3 de Frank Wen et les auteurs
cités dans sa licence) ; jamais « Yamaha Tyros 4 » ni « Timbres of Heaven »
(échantillons d'origine commerciale ou inconnue).

## À régler avant la publication

| Ressource | Problème | À faire |
|---|---|---|
| Anciens bruitages encore utilisés : `x_death.ogg` (cri commun, sert aux monstres sans espèce) | origine inconnue | remplacer (enregistrement, jsfxr, CC0 : freesound.org filtré CC0, Kenney.nl) |
| Sons sources `resources/snd/flac/` | dans `resources/`, donc livrés avec le jeu s'ils y restent | les sortir du paquet livré (ou du dépôt) |
| Livre de l'histoire `resources/gfx/books/book_of_story0.png`, `book_of_story1.png`, `book_of_story3.png` | images trouvées il y a plus de 8 ans, origine introuvable | remplacer |
| Panneau de magasin (panneau 79 des textures `t_*`) | sac d'or provisoire, dessiné par script | remplacer par le dessin définitif |
| GeneralUser GS v1.471 | licence pas encore relue | relire le fichier de licence fourni avec la banque |

Avant chaque publication :

- [ ] Plus rien dans le tableau ci-dessus.
- [ ] Crédits à jour dans le jeu (`cs1_credits`) et dans `credits.html`.
- [ ] `AI_DISCLOSURE.md` à jour, cases cochées sur la plateforme.
- [ ] Les fichiers remplacés sont supprimés du dépôt et du paquet livré.
