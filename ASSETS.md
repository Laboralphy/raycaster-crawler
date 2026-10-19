# Ressources du jeu — origines et licences

Ce que le jeu livre (images, sons, musiques, polices), d'où ça vient et sous
quelle licence. Tout ce qui est livré doit pouvoir être **redistribué dans un
jeu publié** (itch.io, Steam, jeu gratuit) : une ressource d'origine ou de
licence inconnue est interdite tant qu'elle n'est pas vérifiée.

Ce qui a été fait avec l'IA, et les cases à cocher sur les plateformes, est
dans `AI_DISCLOSURE.md`.

État au 19 octobre 2026.

## Ressources de tiers

Les seules ressources du jeu qui ne sont pas de l'auteur.

| Ressource | Où dans le jeu | Auteur, source | Licence | Obligation |
|---|---|---|---|---|
| Banque de sons **GeneralUser GS v1.471** | ses échantillons sont dans toutes les musiques `resources/snd/ogg/mus_*.ogg` (rendu des partitions) | S. Christian Collins, https://schristiancollins.com/generaluser.php | libre, y compris pour un usage commercial de la musique produite | aucune ; licence à relire (voir plus bas) |
| Portraits muraux `resources/gfx/textures/d_pictures.png` | tableaux sur les murs | artistes de Dungeon Crawl Stone Soup, [OpenGameArt](https://opengameart.org/content/dungeon-crawl-32x32-tiles) ; mis en cadre par nous | CC0 (vérifié sur la page et dans le README du paquet) | aucune (crédit facultatif, présent dans `credits.html`) |
| Police **UnifrakturMaguntia** | dessinée dans le logo `title_128.png` (pas livrée en fichier) | projet Unifraktur, https://fonts.google.com/specimen/UnifrakturMaguntia | SIL OFL 1.1 | aucune pour une image tirée de la police |

## Créations de l'auteur

Tout le reste, sauf ce qui est listé dans « À régler » :

- sprites des monstres et des objets (`resources/gfx/sprites/`), modélisés et
  rendus avec POV-Ray ; torche `o_torch_1.png` reprise du projet « mansion » ;
- textures des murs et des sols (`resources/gfx/textures/t_*`, `f_*`),
  dessinées avec OpenOffice Draw et assemblées avec GIMP ;
- icônes des objets et des sorts (`resources/gfx/icons/icons.png`) et
  chiffres du HUD (`digits.png`), dessinés avec OpenOffice Draw ;
- musiques (`resources/snd/ogg/mus_*.ogg`), logo, ciel de nuit, panneau de
  magasin, icône et image du rayon prismatique : produits par des scripts du
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
| Bruitages `resources/snd/ogg/` : `a_*` (portes, coffres, clés…), `atk_*`, `hit_*`, `hit_spell0`, `fx_teleport`, `amb_gloom`, `amb_bubbles*`, `m_*`, `x_death` | origine inconnue | retrouver l'origine, sinon remplacer (sons CC0 : freesound.org filtré CC0, Kenney.nl, OpenGameArt ; ou sons générés) |
| Livre de l'histoire `resources/gfx/books/book_of_story0.png`, `book_of_story1.png`, `book_of_story3.png` | images trouvées il y a plus de 8 ans, origine introuvable | remplacer |
| Livre de l'histoire `book_of_story2.png` (monstres dans une salle) | ressemble aux monstres POV-Ray du jeu | confirmer que c'est une création de l'auteur |
| Autres pages de livres `resources/gfx/books/book_*` (sorts, alchimie, clés…) | même style que les icônes | confirmer que ce sont des créations de l'auteur |
| Panneau de magasin (panneau 79 des textures `t_*`) | sac d'or provisoire, dessiné par script | remplacer par le dessin définitif |
| GeneralUser GS v1.471 | licence pas encore relue | relire le fichier de licence fourni avec la banque |

Avant chaque publication :

- [ ] Plus rien dans le tableau ci-dessus.
- [ ] Crédits à jour dans le jeu (`cs1_credits`) et dans `credits.html`.
- [ ] `AI_DISCLOSURE.md` à jour, cases cochées sur la plateforme.
- [ ] Les fichiers remplacés sont supprimés du dépôt et du paquet livré.
