// ==========================================================
// Page bilan (privée) : lit les statistiques GoatCounter avec ta clé
// d'accès et les affiche. La clé n'est jamais dans le code du site :
// elle est tapée sur la page et gardée seulement sur cet appareil.
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
  const formulaire = document.querySelector('.bilan-cle');
  const champ = document.getElementById('bilan-cle');
  const donnees = document.querySelector('.bilan-donnees');
  const periodes = document.querySelector('.bilan-periodes');
  const fmt = new Intl.NumberFormat('fr-FR');

  const CLE = 'bilan-cle';
  const lireCle = () => { try { return localStorage.getItem(CLE) || ''; } catch (e) { return ''; } };
  const garderCle = v => { try { v ? localStorage.setItem(CLE, v) : localStorage.removeItem(CLE); } catch (e) { /* rien */ } };

  const debut = periode => {
    const jours = { week: 7, month: 30, year: 365 }[periode];
    const d = jours ? new Date(Date.now() - jours * 864e5) : new Date('2024-01-01T00:00:00Z');
    return d.toISOString().slice(0, 13) + ':00:00Z';   // arrondi à l'heure, comme l'attend GoatCounter
  };

  // Toutes les pages et actions de la période, en une seule demande
  const lireStats = async (cle, periode) => {
    const r = await fetch(`${BASE}/api/v0/stats/hits?limit=100&start=${encodeURIComponent(debut(periode))}`, {
      headers: { Authorization: 'Bearer ' + cle },
    });
    if (r.status === 401 || r.status === 403) throw new Error('cle');
    if (!r.ok) throw new Error('statut ' + r.status);
    const j = await r.json();
    const valeurs = {};
    (j.hits || []).forEach(h => { valeurs[h.path] = (valeurs[h.path] || 0) + h.count; });
    return valeurs;
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

  const afficher = ouvert => {
    formulaire.hidden = ouvert;
    donnees.hidden = !ouvert;
    periodes.hidden = !ouvert;
  };

  let demande = 0;
  let periodeChoisie = 'month';
  const charger = async () => {
    const cle = lireCle();
    if (!cle) { afficher(false); return; }
    const ceTour = ++demande;
    document.body.classList.add('bilan-charge');
    alerte.hidden = true;
    let valeurs;
    try {
      valeurs = await lireStats(cle, periodeChoisie);
    } catch (e) {
      if (ceTour !== demande) return;
      document.body.classList.remove('bilan-charge');
      alerte.hidden = false;
      if (e.message === 'cle') {
        garderCle('');
        afficher(false);
        alerte.textContent = 'Clé refusée. Vérifie-la dans GoatCounter (Settings > API) : elle doit avoir le droit « Read statistics ».';
      } else {
        alerte.textContent = `Impossible de lire les statistiques. Vérifie que le compte GoatCounter « ${COMPTE} » existe, puis réessaie dans un moment.`;
      }
      return;
    }
    if (ceTour !== demande) return;   // une autre période a été choisie entre-temps
    document.body.classList.remove('bilan-charge');
    afficher(true);

    document.querySelectorAll('[data-chiffre]').forEach(el => { el.textContent = fmt.format(valeurs[el.dataset.chiffre] || 0); });
    const base = valeurs.arrivee || 0;
    document.querySelectorAll('[data-part]').forEach(el => {
      const texte = el.dataset.part === 'visite' ? 'restées au moins 10 secondes' : 'ont cliqué sur quelque chose';
      const part = base ? Math.round(100 * (valeurs[el.dataset.part] || 0) / base) : null;
      el.textContent = part === null ? texte : `${Math.min(part, 100)} % des arrivées · ${texte}`;
    });
    Object.entries(LISTES).forEach(([nom, lignes]) => remplirListe(document.querySelector(`[data-liste="${nom}"]`), lignes, valeurs));
  };

  // Ouvrir avec la clé, ou verrouiller
  formulaire.addEventListener('submit', e => {
    e.preventDefault();
    garderCle(champ.value.trim());
    champ.value = '';
    charger();
  });
  document.querySelector('.bilan-fermer').addEventListener('click', () => {
    garderCle('');
    afficher(false);
    champ.focus();
  });

  // Choix de la période
  const boutons = document.querySelectorAll('[data-periode]');
  boutons.forEach(b => b.addEventListener('click', () => {
    boutons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    periodeChoisie = b.dataset.periode;
    charger();
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
  charger();
})();
