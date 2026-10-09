// ==========================================================
// Écran d'entrée de l'accueil : le studio est dans le noir,
// un clic sur « Entrer dans le studio » allume la lumière et la musique.
// Il ne s'affiche qu'une fois par visite, et jamais quand on arrive
// directement sur une section (ex. retour depuis une page projet).
// ==========================================================
(() => {
  const entree = document.querySelector('.entree');
  if (!entree) return;

  let dejaVu = false;
  try { dejaVu = sessionStorage.getItem('studio-entre') === '1'; } catch (e) { /* stockage indisponible */ }
  if (dejaVu || location.hash) { entree.hidden = true; return; }

  document.documentElement.classList.add('entree-ouverte');   // bloque le défilement
  entree.querySelector('.entree-btn').focus({ preventScroll: true });

  const ouvrir = avecSon => {
    try { sessionStorage.setItem('studio-entre', '1'); } catch (e) { /* rien */ }
    document.dispatchEvent(new Event(avecSon ? 'studio:entrer' : 'studio:silence'));
    entree.classList.add('allume');
    document.documentElement.classList.remove('entree-ouverte');
    setTimeout(() => { entree.hidden = true; }, 1300);
  };
  entree.querySelector('.entree-btn').addEventListener('click', () => ouvrir(true));
  entree.querySelector('.entree-muet').addEventListener('click', () => ouvrir(false));
})();
