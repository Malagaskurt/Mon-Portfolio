// ==========================================================
// Page bilan : lit les compteurs GoatCounter et les affiche.
// Le compte se règle en haut de assets/stats.js (STATS_COMPTE).
// ==========================================================
(() => {
  const COMPTE = window.STATS_COMPTE;
  const BASE = `https://${COMPTE}.goatcounter.com`;

  const LISTES = {
    sources: [
      ['arrivee-linkedin', 'LinkedIn'],
      ['arrivee-cv', 'Le lien de ton CV'],
      ['arrivee-candidature', 'Un mail de candidature'],
      ['arrivee-mail', 'Un mail'],
      ['arrivee-instagram', 'Instagram'],
      ['arrivee-github', 'GitHub'],
      ['arrivee-facebook', 'Facebook'],
      ['arrivee-whatsapp', 'WhatsApp'],
      ['arrivee-recherche', 'Google et moteurs de recherche'],
      ['arrivee-autre', 'Un autre site ou lien'],
      ['arrivee-direct', 'Lien direct (message, appli, favori)'],
    ],
    pages: [
      ['/', 'Accueil'],
      ['/luxor-vtc', 'Luxor VTC'],
      ['/inks-garden', 'Inks Garden'],
      ['/skate-aux-jo', 'Le skate aux JO'],
      ['/video', 'Vidéo'],
    ],
    actions: [
      ['entree-son', 'Entrés dans le studio avec le son'],
      ['entree-muet', 'Entrés sans le son'],
      ['musique', 'Lancé ou coupé la musique'],
      ['projet-luxor-vtc', 'Ouvert le dossier Luxor VTC'],
      ['projet-inks-garden', 'Ouvert le dossier Inks Garden'],
      ['projet-skate-aux-jo', 'Ouvert le dossier Skate aux JO'],
      ['projet-video', 'Ouvert le dossier Vidéo'],
      ['contact-vu', 'Descendus jusqu’au contact'],
      ['cv', 'Téléchargé ton CV'],
      ['mail', 'Cliqué sur ton mail'],
      ['telephone', 'Cliqué sur ton numéro'],
      ['voir-linkedin', 'Ouvert ton LinkedIn'],
      ['voir-github', 'Ouvert ton GitHub'],
      ['voir-instagram', 'Regardé un reel Instagram'],
      ['voir-youtube', 'Regardé la vidéo YouTube'],
      ['voir-figma', 'Ouvert le prototype Figma'],
      ['voir-site-luxor', 'Visité le site Luxor VTC'],
      ['lien-sortant', 'Ouvert un autre lien externe'],
    ],
  };

  const alerte = document.querySelector('.bilan-alerte');
  const fmt = new Intl.NumberFormat('fr-FR');

  // Un compteur : nombre de personnes pour une page ou une action (0 si jamais vue)
  const compter = async (chemin, periode) => {
    const r = await fetch(`${BASE}/counter/${encodeURIComponent(chemin)}.json${periode ? '?start=' + periode : ''}`);
    if (r.status === 404) return 0;
    if (!r.ok) throw new Error('statut ' + r.status);
    const j = await r.json();
    return parseInt(String(j.count).replace(/\D/g, ''), 10) || 0;
  };

  const remplirListe = (ol, lignes, valeurs) => {
    const vues = lignes.map(([cle, nom]) => [nom, valeurs[cle] || 0]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    ol.replaceChildren();
    if (!vues.length) {
      const li = document.createElement('li');
      li.className = 'bilan-vide';
      li.textContent = 'Rien pour l’instant sur cette période.';
      ol.append(li);
      return;
    }
    const max = vues[0][1];
    vues.forEach(([nom, n]) => {
      const li = document.createElement('li');
      li.style.setProperty('--part', (n / max).toFixed(4));
      const etiquette = document.createElement('span'); etiquette.className = 'bilan-etiquette'; etiquette.textContent = nom;
      const valeur = document.createElement('span'); valeur.className = 'bilan-valeur'; valeur.textContent = fmt.format(n);
      const barre = document.createElement('span'); barre.className = 'bilan-barre'; barre.setAttribute('aria-hidden', 'true');
      li.append(etiquette, valeur, barre);
      ol.append(li);
    });
  };

  let demande = 0;
  const charger = async periode => {
    const ceTour = ++demande;
    document.body.classList.add('bilan-charge');
    alerte.hidden = true;
    const cles = ['arrivee', 'visite', 'interaction', ...Object.values(LISTES).flat().map(([cle]) => cle)];
    const resultats = await Promise.allSettled(cles.map(c => compter(c, periode)));
    if (ceTour !== demande) return;   // une autre période a été choisie entre-temps
    document.body.classList.remove('bilan-charge');

    if (resultats.every(r => r.status === 'rejected')) {
      alerte.hidden = false;
      alerte.textContent = `Impossible de lire les statistiques. Vérifie que le compte GoatCounter « ${COMPTE} » existe et que l’option « Allow adding visitor counts on your website » est cochée dans ses réglages.`;
      document.querySelectorAll('[data-chiffre]').forEach(el => { el.textContent = '–'; });
      document.querySelectorAll('[data-liste]').forEach(ol => ol.replaceChildren());
      return;
    }
    const valeurs = {};
    cles.forEach((c, i) => { valeurs[c] = resultats[i].status === 'fulfilled' ? resultats[i].value : 0; });

    document.querySelectorAll('[data-chiffre]').forEach(el => { el.textContent = fmt.format(valeurs[el.dataset.chiffre]); });
    const base = valeurs.arrivee;
    document.querySelectorAll('[data-part]').forEach(el => {
      const texte = el.dataset.part === 'visite' ? 'restées au moins 10 secondes' : 'ont cliqué sur quelque chose';
      const part = base ? Math.round(100 * valeurs[el.dataset.part] / base) : null;
      el.textContent = part === null ? texte : `${Math.min(part, 100)} % des arrivées · ${texte}`;
    });
    Object.entries(LISTES).forEach(([nom, lignes]) => remplirListe(document.querySelector(`[data-liste="${nom}"]`), lignes, valeurs));
  };

  // Choix de la période
  const boutons = document.querySelectorAll('[data-periode]');
  boutons.forEach(b => b.addEventListener('click', () => {
    boutons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    charger(b.dataset.periode);
  }));

  // Ne pas compter ses propres visites sur cet appareil
  const moi = document.querySelector('.bilan-moi');
  const estCoupe = () => { try { return localStorage.getItem('stats-off') === '1'; } catch (e) { return false; } };
  const majMoi = () => {
    moi.textContent = estCoupe() ? 'Mes visites ne sont pas comptées sur cet appareil · Les compter à nouveau' : 'Ne plus compter mes visites sur cet appareil';
  };
  moi.addEventListener('click', () => {
    try { estCoupe() ? localStorage.removeItem('stats-off') : localStorage.setItem('stats-off', '1'); } catch (e) { /* rien */ }
    majMoi();
  });
  majMoi();

  document.querySelector('[data-tableau]').href = BASE;
  charger('month');
})();
