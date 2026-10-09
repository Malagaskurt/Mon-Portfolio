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

## Musique de l'accueil

La platine en bas à gauche joue un groove funk / soul années 70 (composition originale, générée par le code, sans droits à payer) avec le crépitement d'un vinyle. Elle démarre dès l'arrivée sur l'accueil. Si le navigateur bloque le son (c'est le cas par défaut pour un nouveau visiteur), elle démarre au premier clic ou tap sur la page. En défilant pour entrer dans l'écran, le volume baisse petit à petit jusqu'au silence, et remonte si on revient en haut. Un curseur de volume apparaît à côté de la platine ; un clic sur la platine coupe le son pour de bon.

Le morceau vient de YouTube : son identifiant est dans `data-youtube="1shxNpQCuvs"` sur le bouton `platine` de `index.html`. Pour changer de morceau, remplace cet identifiant (les lettres après `youtu.be/` ou `v=` dans le lien). Le lecteur officiel s'affiche en petit au-dessus de la platine pendant la lecture, le site n'héberge pas la musique. Si YouTube ne charge pas, le groove funk original prend le relais. Pour revenir au groove, supprime `data-youtube`.

Pour mettre ta propre musique à la place, dépose le fichier dans `assets/audio/` puis ajoute `data-piste="assets/audio/ton-fichier.mp3"` sur le bouton `platine` dans `index.html`. Utilise une musique dont tu as les droits.

## Sécurité

- Chaque page déclare une politique de sécurité (balise `Content-Security-Policy` dans le `<head>`) : le site ne charge que ses propres fichiers, aucun script ou formulaire venu d'ailleurs ne peut s'y glisser. Si tu ajoutes un jour une vidéo intégrée (YouTube, Vimeo) ou une police en ligne, il faudra ajouter son adresse dans cette balise.
- Les liens vers Instagram, YouTube, LinkedIn et GitHub s'ouvrent dans un nouvel onglet sans donner la main sur ton site (`rel="noopener"`).
- La vraie protection, c'est ton compte GitHub : double authentification activée, mot de passe unique, et personne d'autre en collaborateur sur le dépôt.
