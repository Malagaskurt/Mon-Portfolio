# Portfolio de Dimby

Site du portfolio, recodé à partir de la maquette Figma. HTML, CSS et un petit fichier JavaScript, sans framework ni installation.

## Les fichiers

```
index.html          page d'accueil
luxor-vtc.html      projet Luxor VTC
inks-garden.html    projet Inks Garden
skate-aux-jo.html   projet Le skate aux JO
video.html          projet Vidéo
assets/style.css    toute la mise en forme (couleurs et polices en haut du fichier)
assets/site.js      menu mobile
assets/stats.js     comptage des visites (GoatCounter)
assets/bilan.js     affichage de la page bilan
bilan.html          bilan des visites (page cachée, non référencée)
assets/img/         images exportées de Figma (WebP)
assets/tex/         textures de fond (murs, papiers)
assets/fonts/       polices Archivo Black, Space Mono et Anton (licence OFL)
```

## Modifier le site

- **Un texte** : ouvre la page dans VS Code, fais Ctrl+F sur la phrase et change-la directement.
- **Une couleur** : en haut de `assets/style.css`, dans `:root` (`--rouge`, `--or`, `--jaguar`, `--creme`).
- **Une image** : remplace le fichier dans `assets/img/` en gardant le même nom.
- **Une position** (ordinateur) : chaque élément a `--x`, `--y` et `--w` dans son attribut `style`. Ce sont les coordonnées de la maquette Figma, sur une largeur de 1440 px. `--r` règle l'inclinaison.
- Sur tablette et téléphone (moins de 1200 px de large), les éléments s'empilent tout seuls dans l'ordre de la page.

## Bon à savoir

Tous les liens sont remplis. Pour changer de CV, remplace `assets/cv-dimby.pdf` en gardant ce nom.

Les maquettes du Skate aux JO ouvrent le prototype Figma. Pour que les visiteurs puissent le voir, il faut partager le fichier Figma en « Tout le monde avec le lien ».

## Voir le site sur ton ordinateur

Double-clique sur `index.html`, ou dans un terminal ouvert dans ce dossier :

```
python3 -m http.server
```

puis va sur http://localhost:8000.

## Mettre en ligne (GitHub Pages)

1. Pousse ce dossier dans un dépôt GitHub public.
2. Sur GitHub : Settings > Pages > Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Le site sera sur `https://malagaskurt.github.io/<nom-du-dépôt>/` après une minute.

Chaque `git push` met le site à jour automatiquement.

## Animations

Les animations utilisent **Motion** (la librairie derrière Framer Motion, dans sa version JavaScript sans React), hébergée avec le site dans `assets/vendor/motion.js` (licence MIT). Les réglages sont dans `assets/animations.js` :

- les affiches, images et stickers arrivent avec un effet ressort, en cascade, section par section ;
- au survol, ils rebondissent légèrement ;
- les stickers flottent un peu au défilement ;
- les boutons s'enfoncent au clic.

Pour un effet plus ou moins nerveux, change `stiffness` (raideur) et `damping` (amorti) en haut du fichier. Si quelqu'un a désactivé les animations sur son appareil, rien ne bouge.

## Musique de l'accueil

L'accueil joue « Agree to Disagree » (musique rock libre de droit), fichier `assets/audio/agree-to-disagree.mp3`, avec le crépitement d'un vinyle par-dessus. En arrivant, le visiteur voit un écran d'entrée (le studio dans le noir) avec le bouton « Entrer dans le studio » : au clic, la lumière s'allume et la musique démarre. Ce clic est obligatoire, les navigateurs interdisent tout son avant un geste du visiteur. Le lien « Entrer sans le son » ouvre le site en silence. L'écran ne s'affiche qu'une fois par visite (fichier `assets/entree.js`, bloc `entree` en haut de `index.html`). En défilant pour entrer dans l'écran, le volume baisse petit à petit jusqu'au silence, et remonte si on revient en haut. Le bouton « Couper le son » en bas à gauche l'arrête pour de bon. Le crédit du morceau est dans le pied de page de l'accueil.

Pour changer de morceau : dépose le fichier dans `assets/audio/` et remplace la valeur de `data-piste` sur le bouton `platine` dans `index.html`. N'utilise qu'une musique dont la licence autorise la diffusion sur un site, et mets à jour le crédit dans le pied de page. Si tu supprimes `data-piste`, un groove rock / funk généré par le code prend le relais.

## Bilan des visites

La page `bilan.html` (ex. `https://…/bilan.html`) montre, sur 7 jours, 30 jours, 1 an ou depuis le début :

1. **Ont cliqué sur le lien** : les personnes arrivées sur le site.
2. **Ont visité le site** : celles restées au moins 10 secondes (ou qui ont ouvert une 2e page, ou cliqué).
3. **Ont interagi** : celles qui ont cliqué sur quelque chose (entrée du studio, dossier projet, CV, mail, LinkedIn, Instagram, Figma…).

Plus le détail : d'où elles viennent, les pages vues, et chaque action. La page n'est pas dans le menu et n'est pas référencée par Google ; garde le lien pour toi.

Le comptage passe par **GoatCounter** : gratuit pour un site perso, sans cookie et sans donnée personnelle. À faire une seule fois :

1. Crée un compte sur https://www.goatcounter.com/signup avec le code **`dimby`** (le site sera `dimby.goatcounter.com`). Si ce code est pris, choisis-en un autre et remplace `'dimby'` tout en haut de `assets/stats.js`.
2. Dans GoatCounter : Settings > coche **« Allow adding visitor counts on your website »**, puis Save. Sans ça, la page bilan ne peut pas lire les chiffres.
3. Ouvre `bilan.html` sur ton téléphone et ton ordinateur, et clique sur « Ne plus compter mes visites sur cet appareil » pour ne pas gonfler les chiffres toi-même.

Pour savoir d'où vient chaque clic, ajoute `?ref=` au lien que tu partages : `…/?ref=linkedin` sur LinkedIn, `…/?ref=cv` dans ton CV, `…/?ref=candidature` dans un mail de candidature (aussi : `instagram`, `mail`, `github`, `facebook`, `whatsapp`). Sans `?ref=`, le site devine la source quand le navigateur la donne (LinkedIn, Google…) ; sinon il range la visite dans « Lien direct ».

Bon à savoir : les chiffres se mettent à jour toutes les quelques heures ; une personne qui revient le même jour n'est comptée qu'une fois ; les visites faites depuis ton ordinateur (`localhost` ou double-clic sur le fichier) ne sont jamais comptées ; un visiteur équipé d'un bloqueur de pub peut passer inaperçu. Le tableau de bord complet (pays, appareils, navigateurs…) est sur `https://dimby.goatcounter.com`.

## Sécurité

- Chaque page déclare une politique de sécurité (balise `Content-Security-Policy` dans le `<head>`) : le site ne charge que ses propres fichiers, aucun script ou formulaire venu d'ailleurs ne peut s'y glisser. Seule exception : l'adresse de GoatCounter (`*.goatcounter.com`), à qui le site envoie le comptage des visites. Si tu ajoutes un jour une vidéo intégrée (YouTube, Vimeo) ou une police en ligne, il faudra ajouter son adresse dans cette balise.
- Les liens vers Instagram, YouTube, LinkedIn et GitHub s'ouvrent dans un nouvel onglet sans donner la main sur ton site (`rel="noopener"`).
- La vraie protection, c'est ton compte GitHub : double authentification activée, mot de passe unique, et personne d'autre en collaborateur sur le dépôt.
