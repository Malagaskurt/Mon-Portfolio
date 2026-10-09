// ==========================================================
// Platine de l'accueil : une boucle lo-fi et le crépitement d'un vinyle.
// La musique se lance dès l'arrivée sur l'accueil (ou au premier geste si
// le navigateur bloque le son), puis baisse au fil du défilement.
//
// Pour mettre ta propre musique : dépose ton fichier dans assets/audio/
// puis ajoute data-piste="assets/audio/ton-fichier.mp3" sur le bouton .platine
// dans index.html. Il remplace la boucle générée (le crépitement reste).
// ==========================================================
(() => {
  const bouton = document.querySelector('.platine');
  if (!bouton) return;

  let ctx = null, sortie = null, enMarche = false, minuterie = null, piste = null;

  // ---------- crépitement : souffle + petits craquements ----------
  const creerCrepitement = () => {
    const duree = 6, sr = ctx.sampleRate;
    const buf = ctx.createBuffer(2, duree * sr, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * 0.012;                 // souffle
        if (Math.random() < 0.00055) {                           // craquement
          const amp = 0.18 + Math.random() * 0.5, long = 8 + (Math.random() * 40 | 0);
          for (let k = 0; k < long && i + k < d.length; k++) d[i + k] += (Math.random() * 2 - 1) * amp * (1 - k / long);
        }
      }
      // le petit "pop" du sillon à chaque tour (33 tours ≈ 1,8 s)
      for (let t = 0.4; t < duree; t += 1.8) {
        const i = (t * sr) | 0;
        for (let k = 0; k < 60; k++) d[i + k] += Math.sin(k / 3) * 0.12 * (1 - k / 60);
      }
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const filtre = ctx.createBiquadFilter(); filtre.type = 'bandpass'; filtre.frequency.value = 2500; filtre.Q.value = 0.6;
    const g = ctx.createGain(); g.gain.value = 0.9;
    src.connect(filtre).connect(g).connect(sortie);
    src.start();
    return src;
  };

  // ---------- boucle lo-fi générée (accords, basse, batterie douce) ----------
  const BPM = 76, temps = 60 / BPM;
  const ACCORDS = [ // Fmaj9, Em7, Dm9, Cmaj7
    [53, 57, 60, 64, 67], [52, 55, 59, 62, 67], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62],
  ];
  const freq = n => 440 * Math.pow(2, (n - 69) / 12);

  const note = (t, f, duree, vol, type = 'triangle', attaque = 0.04) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 8;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attaque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g).connect(musique);
    o.start(t); o.stop(t + duree + 0.05);
  };
  const bruit = (t, duree, vol, freqFiltre, type = 'highpass') => {
    const n = ctx.createBufferSource(), b = ctx.createBuffer(1, ctx.sampleRate * duree, ctx.sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freqFiltre;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    n.connect(f).connect(g).connect(musique); n.start(t);
  };
  const grosseCaisse = t => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.25);
    g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(musique); o.start(t); o.stop(t + 0.4);
  };

  let musique = null, prochaineMesure = 0, mesure = 0;
  const programmerMesure = t => {
    const acc = ACCORDS[mesure % ACCORDS.length];
    // nappe d'accord, jouée un peu en retard comme un piano paresseux
    acc.forEach((n, i) => note(t + i * 0.025, freq(n), temps * 3.6, 0.045, 'triangle', 0.08));
    acc.slice(1, 4).forEach((n, i) => note(t + temps * 2.5 + i * 0.03, freq(n + 12), temps * 1.2, 0.02, 'sine'));
    // basse
    note(t, freq(acc[0] - 12), temps * 1.8, 0.16, 'sine', 0.02);
    note(t + temps * 2.5, freq(acc[0] - 12), temps * 1.2, 0.12, 'sine', 0.02);
    // batterie : boum . tchak . / boum boum tchak .
    grosseCaisse(t); grosseCaisse(t + temps * 2.25);
    bruit(t + temps, 0.18, 0.12, 1800, 'bandpass'); bruit(t + temps * 3, 0.18, 0.12, 1800, 'bandpass');
    for (let i = 0; i < 8; i++) bruit(t + i * temps / 2 + (i % 2 ? 0.03 : 0), 0.05, i % 2 ? 0.025 : 0.04, 7000);
    mesure++;
  };
  const planifier = () => {
    while (prochaineMesure < ctx.currentTime + 1.5) {
      programmerMesure(prochaineMesure);
      prochaineMesure += temps * 4;
    }
  };

  const demarrerMusique = async () => {
    musique = ctx.createGain(); musique.gain.value = 0.85;
    // son "vinyle" : aigus adoucis + léger pleurage
    const chaud = ctx.createBiquadFilter(); chaud.type = 'lowpass'; chaud.frequency.value = 3800;
    musique.connect(chaud).connect(sortie);

    // ta propre musique si elle existe
    if (bouton.dataset.piste) {
      try {
        piste = new Audio(bouton.dataset.piste); piste.loop = true;
        ctx.createMediaElementSource(piste).connect(musique);
        await piste.play();
        return;
      } catch (e) { piste = null; /* fichier introuvable : boucle générée */ }
    }

    prochaineMesure = ctx.currentTime + 0.1; mesure = 0;
    planifier();
    minuterie = setInterval(planifier, 400);
  };

  // ---------- volume : réglage de l'utilisateur × position dans la page ----------
  // Sur l'accueil le son est plein ; en défilant pour entrer dans l'écran il baisse
  // petit à petit, jusqu'au silence une fois dans la page. Il remonte si on revient.
  const VOLUME_MAX = 0.35;
  const curseur = bouton.parentElement.querySelector('.platine-volume input');
  let reglage = 0.8;            // curseur de volume (0 → 1)
  let niveau = null;            // nœud de volume piloté par le défilement
  const salle = document.querySelector('.hero-cine');
  const facteurDefilement = () => {
    if (!salle) return 1;
    const course = Math.max(1, salle.offsetHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, -salle.getBoundingClientRect().top / (course * 0.85)));
    return Math.pow(1 - p, 1.6); // baisse douce au début, plus nette en approchant de l'écran
  };
  const majVolume = (lissage = 0.12) => {
    if (!niveau) return;
    const cible = VOLUME_MAX * reglage * facteurDefilement();
    niveau.gain.setTargetAtTime(cible, ctx.currentTime, lissage);
    bouton.classList.toggle('discret', facteurDefilement() < 0.02);
  };

  const lancer = async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      niveau = ctx.createGain(); niveau.gain.value = 0;
      niveau.connect(ctx.destination);
      sortie = ctx.createGain(); sortie.gain.value = 0;
      sortie.connect(niveau);
      creerCrepitement();
      await demarrerMusique();
    }
    // resume() reste en attente tant que le navigateur bloque le son : on n'attend pas plus de 300 ms
    await Promise.race([ctx.resume(), new Promise(r => setTimeout(r, 300))]);
    if (ctx.state !== 'running') return false;   // le navigateur refuse encore le son
    if (piste) piste.play();
    sortie.gain.cancelScheduledValues(ctx.currentTime);
    sortie.gain.setTargetAtTime(1, ctx.currentTime, 0.6);   // montée douce
    majVolume(0.05);
    enMarche = true; majBouton();
    return true;
  };
  const couper = () => {
    if (!ctx) return;
    sortie.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    setTimeout(() => { if (!enMarche) { ctx.suspend(); if (piste) piste.pause(); } }, 900);
    enMarche = false; majBouton();
  };
  const majBouton = () => {
    bouton.classList.toggle('joue', enMarche);
    bouton.classList.remove('attend');
    bouton.setAttribute('aria-pressed', String(enMarche));
    bouton.querySelector('.platine-txt').textContent = enMarche ? 'Couper le son' : 'Lancer le vinyle';
  };

  // ---------- démarrage automatique ----------
  // On essaie dès l'arrivée sur l'accueil. Les navigateurs bloquent le son tant que
  // le visiteur n'a pas touché la page : dans ce cas, il démarre au premier clic,
  // tap ou touche du clavier, où que ce soit.
  let coupeParLeVisiteur = false;
  const evenements = ['pointerdown', 'keydown', 'touchend'];
  const auPremierGeste = e => {
    if (coupeParLeVisiteur || enMarche) return retirer();
    if (e.target.closest && e.target.closest('.platine')) return; // le bouton gère lui-même
    lancer().then(ok => { if (ok) retirer(); });
  };
  const retirer = () => evenements.forEach(n => document.removeEventListener(n, auPremierGeste, true));
  evenements.forEach(n => document.addEventListener(n, auPremierGeste, true));

  const essaiAuChargement = async () => {
    const ok = await lancer();
    if (!ok) {
      bouton.classList.add('attend');
      bouton.querySelector('.platine-txt').textContent = matchMedia('(hover: none)').matches ? 'Touchez la page pour le son' : 'Cliquez pour le son';
    } else retirer();
  };
  if (document.readyState === 'complete') essaiAuChargement();
  else window.addEventListener('load', essaiAuChargement);

  bouton.addEventListener('click', () => {
    if (enMarche) { coupeParLeVisiteur = true; couper(); }
    else { coupeParLeVisiteur = false; lancer(); }
  });

  if (curseur) {
    reglage = Number(curseur.value) / 100;
    curseur.addEventListener('input', () => {
      reglage = Number(curseur.value) / 100;
      if (!enMarche && reglage > 0 && !coupeParLeVisiteur) lancer();
      majVolume(0.03);
    });
  }

  let attente = false;
  window.addEventListener('scroll', () => {
    if (attente) return; attente = true;
    requestAnimationFrame(() => { attente = false; majVolume(); });
  }, { passive: true });

  // on coupe quand l'onglet n'est plus visible, sans perdre l'état
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (enMarche) ctx.resume();
  });
})();
