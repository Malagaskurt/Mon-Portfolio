// ==========================================================
// Statistiques de visite, envoyées à GoatCounter (gratuit, sans cookie,
// aucune donnée personnelle). Le bilan se lit sur la page bilan.html.
// Compte : le code choisi à l'inscription sur goatcounter.com.
// ==========================================================
window.STATS_COMPTE = 'dimby';

(() => {
  const ENVOI = `https://${window.STATS_COMPTE}.goatcounter.com/count`;

  // On ne compte pas : le site ouvert sur l'ordinateur, la page bilan,
  // les robots, et les appareils où tu as coupé le comptage (page bilan).
  const local = location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.)/.test(location.hostname);
  let coupe = false;
  try { coupe = localStorage.getItem('stats-off') === '1'; } catch (e) { /* stockage indisponible */ }
  if (local || coupe || navigator.webdriver || document.body.classList.contains('bilan')) {
    window.stat = () => {};
    return;
  }

  const lire = cle => { try { return sessionStorage.getItem(cle); } catch (e) { return null; } };
  const noter = cle => { try { sessionStorage.setItem(cle, '1'); } catch (e) { /* rien */ } };

  const envoyer = donnees => {
    donnees.s = screen.width;
    donnees.rnd = Math.random().toString(36).slice(2, 7);
    const url = ENVOI + '?' + Object.entries(donnees)
      .filter(([, v]) => v !== '' && v !== false && v != null)
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
    if (!navigator.sendBeacon || !navigator.sendBeacon(url)) new Image().src = url;
  };

  // « A vraiment visité » : resté au moins 10 secondes, ouvert une 2e page ou cliqué.
  const visite = () => {
    if (lire('stats-visite')) return;
    noter('stats-visite');
    envoyer({ p: 'visite', t: 'Visite de plus de 10 s', e: true });
  };

  // Une action du visiteur. Chaque nom devient une ligne du bilan.
  window.stat = (nom, interaction = true) => {
    envoyer({ p: nom, t: nom, e: true });
    if (interaction) visite();
    if (interaction && !lire('stats-interaction')) { noter('stats-interaction'); envoyer({ p: 'interaction', t: 'A interagi', e: true }); }
  };

  // 1. La page vue (accueil = « / », sinon le nom du fichier sans .html)
  const page = '/' + (location.pathname.split('/').pop().replace(/\.html$/, '').replace(/^index$/, ''));
  const venuDe = document.referrer && new URL(document.referrer).host !== location.host ? document.referrer : '';
  envoyer({ p: page, t: document.title, r: venuDe, q: location.search });

  // 2. D'où vient le visiteur, une fois par visite.
  //    Un lien marqué (ex. …/?ref=linkedin) l'emporte sur le site d'origine.
  if (lire('stats-arrivee')) visite();
  else {
    setTimeout(visite, 10000);
    noter('stats-arrivee');
    const params = new URLSearchParams(location.search);
    const marque = (params.get('ref') || params.get('utm_source') || '').toLowerCase();
    const hote = venuDe ? new URL(venuDe).hostname.replace(/^www\./, '') : '';
    const connues = ['linkedin', 'instagram', 'cv', 'mail', 'candidature', 'github', 'facebook', 'whatsapp'];
    let source;
    if (marque) source = connues.includes(marque) ? marque : 'autre';
    else if (/linkedin\.com|lnkd\.in/.test(hote)) source = 'linkedin';
    else if (/instagram\.com/.test(hote)) source = 'instagram';
    else if (/facebook\.com|fb\.me/.test(hote)) source = 'facebook';
    else if (/github\.com/.test(hote)) source = 'github';
    else if (/mail\.|outlook\./.test(hote)) source = 'mail';
    else if (/google\.|bing\.|qwant\.|duckduckgo\.|ecosia\.|yahoo\./.test(hote)) source = 'recherche';
    else if (hote) source = 'autre';
    else source = 'direct';
    envoyer({ p: 'arrivee', t: 'Arrivée sur le site', e: true });
    envoyer({ p: 'arrivee-' + source, t: 'Arrivée : ' + source, e: true });
  }

  // 3. Les clics qui comptent
  const nomDuClic = el => {
    if (el.matches('.entree-btn')) return 'entree-son';
    if (el.matches('.entree-muet')) return 'entree-muet';
    if (el.matches('.platine')) return 'musique';
    if (el.matches('.dossier')) return 'projet-' + el.getAttribute('href').replace(/\.html.*$/, '');
    const href = el.getAttribute('href') || '';
    if (/\.pdf$/.test(href)) return 'cv';
    if (href.startsWith('mailto:')) return 'mail';
    if (href.startsWith('tel:')) return 'telephone';
    if (!/^https?:/.test(href)) return null;   // lien interne : déjà compté comme page vue
    const hote = new URL(href).hostname;
    for (const [motif, nom] of [['linkedin', 'linkedin'], ['github', 'github'], ['instagram', 'instagram'],
      ['youtube', 'youtube'], ['figma', 'figma'], ['luxor-vtc', 'site-luxor']]) {
      if (hote.includes(motif)) return 'voir-' + nom;
    }
    return 'lien-sortant';
  };
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('a, button');
    const nom = el && nomDuClic(el);
    if (nom) window.stat(nom);
  }, true);

  // 4. Le visiteur est allé jusqu'au contact
  const contact = document.getElementById('contact');
  if (contact && 'IntersectionObserver' in window) {
    const vu = new IntersectionObserver(entrees => {
      if (entrees.some(e => e.isIntersecting)) { vu.disconnect(); window.stat('contact-vu', false); }
    }, { threshold: 0.4 });
    vu.observe(contact);
  }
})();
