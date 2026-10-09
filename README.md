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
