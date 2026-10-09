// ==========================================================
// Platine de l'accueil : un groove funk / soul 70s et le crépitement d'un vinyle.
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

  // ---------- groove rock / funk, composition originale ----------
  // Riff de guitare saturée, guitare funk en grattés étouffés, basse qui claque,
  // cuivres, batterie qui pousse à 112 BPM. 4 mesures qui tournent en boucle.
  const BPM = 112, temps = 60 / BPM, dbl = temps / 4;      // dbl = une double croche
  const SWING = 0.06;                                      // léger shuffle sur les doubles croches
  const pos = (t, i) => t + i * dbl + (i % 2 ? dbl * SWING : 0);
  const freq = n => 440 * Math.pow(2, (n - 69) / 12);

  const note = (t, f, duree, vol, type = 'triangle', attaque = 0.01, filtre = 0) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 6;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attaque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    let fin = g;
    if (filtre) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = filtre; f2.Q.value = 1.5; g.connect(f2); fin = f2; }
    o.connect(g); fin.connect(musique);
    o.start(t); o.stop(t + duree + 0.05);
  };
  const bruit = (t, duree, vol, freqFiltre, type = 'highpass', q = 1) => {
    const n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duree), ctx.sampleRate);
    const d = b.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
    n.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freqFiltre; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    n.connect(f).connect(g).connect(musique); n.start(t);
  };
  const grosseCaisse = (t, v = 0.6) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(musique); o.start(t); o.stop(t + 0.35);
  };
  const caisseClaire = (t, v = 0.16) => { bruit(t, 0.16, v, 2200, 'bandpass', 0.8); note(t, 190, 0.08, v * 0.6, 'triangle', 0.002); };
  const cowbell = (t, v = 0.05) => { note(t, 540, 0.25, v, 'square', 0.002, 2400); note(t, 800, 0.2, v * 0.8, 'square', 0.002, 2400); };
  const conga = (t, f, v = 0.14) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.04);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(musique); o.start(t); o.stop(t + 0.25);
  };
  // Rhodes : deux sinus légèrement désaccordés + petite attaque métallique
  const rhodes = (t, notes, duree, v = 0.03) => notes.forEach((n, k) => {
    note(t + k * 0.012, freq(n), duree, v, 'sine', 0.006);
    note(t + k * 0.012, freq(n) * 2.001, duree * 0.4, v * 0.25, 'sine', 0.003);
  });
  // cuivres : dents de scie filtrées, attaque un peu molle
  const cuivres = (t, notes, duree, v = 0.022) => notes.forEach(n => {
    note(t, freq(n), duree, v, 'sawtooth', 0.03, 1700);
    note(t, freq(n) * 1.003, duree, v * 0.7, 'sawtooth', 0.03, 1700);
  });

  // Guitare saturée : dents de scie dans une distorsion, puis un filtre « baffle »
  let ampli = null;
  const preparerAmpli = () => {
    const dist = ctx.createWaveShaper(), k = 28, n = 2048, courbe = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; courbe[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
    dist.curve = courbe; dist.oversample = '2x';
    const baffle = ctx.createBiquadFilter(); baffle.type = 'lowpass'; baffle.frequency.value = 2600; baffle.Q.value = 0.8;
    const creux = ctx.createBiquadFilter(); creux.type = 'peaking'; creux.frequency.value = 900; creux.gain.value = -4;
    const vol = ctx.createGain(); vol.gain.value = 0.11;
    dist.connect(baffle).connect(creux).connect(vol).connect(musique);
    ampli = dist;
  };
  const guitare = (t, notes, duree, v = 0.5) => notes.forEach((n, k) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = freq(n); o.detune.value = (Math.random() - 0.5) * 10;
    const debut = t + k * 0.006;
    g.gain.setValueAtTime(0, debut); g.gain.linearRampToValueAtTime(v, debut + 0.004);
    g.gain.setTargetAtTime(v * 0.6, debut + 0.02, 0.08);
    g.gain.setTargetAtTime(0.0001, debut + duree, 0.02);
    o.connect(g).connect(ampli); o.start(debut); o.stop(debut + duree + 0.15);
  });
  // gratté étouffé de guitare funk (son clair, très court)
  const chick = (t, notes, v = 0.018) => { notes.forEach(n => note(t, freq(n), 0.07, v, 'square', 0.002, 3200)); bruit(t, 0.03, 0.02, 3000, 'bandpass'); };
  // basse qui claque : attaque nette + harmonique
  const basseSlap = (t, n, duree, v = 0.26) => { note(t, freq(n), duree, v, 'triangle', 0.004, 1400); note(t, freq(n) * 2, 0.06, v * 0.35, 'square', 0.002, 2500); };

  // Riff original en mi : E5, G5, A5, avec une montée à la fin du cycle
  const RIFF = [
    [[0, 40, 2], [3, 40, 1], [6, 43, 2], [8, 45, 3], [12, 43, 1], [14, 40, 2]],
    [[0, 40, 2], [3, 40, 1], [6, 43, 2], [8, 45, 2], [11, 47, 1], [12, 45, 2], [14, 43, 1]],
    [[0, 40, 2], [3, 40, 1], [6, 43, 2], [8, 45, 3], [12, 43, 1], [14, 40, 2]],
    [[0, 45, 2], [3, 45, 1], [4, 47, 2], [7, 48, 2], [10, 47, 2], [12, 50, 4]],
  ];
  const quinte = n => [n, n + 7, n + 12];
  const E9 = [64, 68, 74, 78], A9 = [57, 61, 67, 71];

  let musique = null, prochaineMesure = 0, mesure = 0;
  const programmerMesure = t => {
    if (!ampli) preparerAmpli();
    const m = mesure % 4, riff = RIFF[m];

    // riff de guitare saturée (accords de puissance) et basse à l'unisson
    riff.forEach(([i, n, d]) => {
      guitare(pos(t, i), quinte(n + 12), d * dbl * 0.92);
      basseSlap(pos(t, i), n, d * dbl * 0.95);
    });
    // fantômes de basse entre les notes du riff
    [5, 13].forEach(i => note(pos(t, i), freq(riff[0][1] + 12), 0.05, 0.1, 'square', 0.002, 900));

    // guitare funk claire en grattés étouffés sur les contretemps
    const acc = m === 3 ? A9 : E9;
    [2, 5, 10, 13].forEach(i => chick(pos(t, i), acc));
    // cuivres en réponse
    if (m === 1) cuivres(pos(t, 14), [71, 74, 79], dbl * 1.8, 0.03);
    if (m === 3) { cuivres(pos(t, 2), [69, 73, 76], dbl * 1.2, 0.03); cuivres(pos(t, 14), [71, 75, 78, 83], dbl * 3, 0.035); }

    // batterie rock : grosse caisse qui pousse, caisse claire sur 2 et 4, charleston en doubles
    [0, 3, 8, 10].forEach(i => grosseCaisse(pos(t, i), 0.7));
    [4, 12].forEach(i => caisseClaire(pos(t, i), 0.24));
    [7, 15].forEach(i => caisseClaire(pos(t, i), 0.05));          // notes fantômes
    if (m === 3) [13, 14, 15].forEach(i => caisseClaire(pos(t, i), 0.14)); // petit roulement
    for (let i = 0; i < 16; i++) bruit(pos(t, i), i % 4 === 0 ? 0.09 : 0.035, i % 2 ? 0.02 : 0.034, 8500);
    if (m === 0) bruit(t, 1.2, 0.07, 5000);                     // cymbale crash en début de cycle
    // cowbell pour garder le côté funk
    [0, 6, 8, 14].forEach(i => cowbell(pos(t, i), 0.03));
    mesure++;
  };
  const planifier = () => {
    while (prochaineMesure < ctx.currentTime + 1.5) {
      programmerMesure(prochaineMesure);
      prochaineMesure += temps * 4;
    }
  };

  // ---------- morceau YouTube (data-youtube="ID" sur le bouton) ----------
  // Le morceau est lu par le lecteur officiel YouTube, affiché en petit à côté
  // de la platine pendant la lecture. Le site ne copie ni n'héberge la musique.
  const idYoutube = bouton.dataset.youtube || '';
  let yt = null, ytPret = false, ytEchec = false;
  const zoneVideo = bouton.parentElement.querySelector('.platine-video');
  const chargerYoutube = () => new Promise(resolve => {
    if (!idYoutube || !zoneVideo) return resolve(false);
    const fin = ok => { if (!ok) ytEchec = true; resolve(ok); };
    const creer = () => {
      yt = new YT.Player(zoneVideo.querySelector('div'), {
        host: 'https://www.youtube-nocookie.com',
        videoId: idYoutube,
        width: 224, height: 126,
        playerVars: { loop: 1, playlist: idYoutube, controls: 0, modestbranding: 1, rel: 0, playsinline: 1, disablekb: 1 },
        events: {
          onReady: () => { ytPret = true; fin(true); },
          onError: () => fin(false),
          onStateChange: e => { if (e.data === 0) yt.playVideo(); },
        },
      });
    };
    if (window.YT && YT.Player) return creer();
    window.onYouTubeIframeAPIReady = creer;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => fin(false);
    document.head.appendChild(script);
    setTimeout(() => { if (!ytPret) fin(false); }, 8000);
  });
  const promesseYoutube = idYoutube ? chargerYoutube() : Promise.resolve(false);
  const avecYoutube = () => ytPret && !ytEchec;

  const demarrerMusique = async () => {
    musique = ctx.createGain(); musique.gain.value = 0.85;
    // son "vinyle" : aigus adoucis + léger pleurage
    const chaud = ctx.createBiquadFilter(); chaud.type = 'lowpass'; chaud.frequency.value = 6500;
    musique.connect(chaud).connect(sortie);

    // morceau YouTube : la platine ne garde que le crépitement du vinyle
    if (await promesseYoutube) return;

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
  const VOLUME_MAX = 0.5;
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
    niveau.gain.setTargetAtTime(avecYoutube() ? cible * 0.45 : cible, ctx.currentTime, lissage); // crépitement plus discret sous un vrai morceau
    if (avecYoutube()) yt.setVolume(Math.round(100 * reglage * facteurDefilement()));
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
    if (avecYoutube()) { yt.unMute(); yt.playVideo(); }
    sortie.gain.cancelScheduledValues(ctx.currentTime);
    sortie.gain.setTargetAtTime(1, ctx.currentTime, 0.6);   // montée douce
    majVolume(0.05);
    enMarche = true; majBouton();
    return true;
  };
  const couper = () => {
    if (!ctx) return;
    sortie.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    if (avecYoutube()) yt.pauseVideo();
    setTimeout(() => { if (!enMarche) { ctx.suspend(); if (piste) piste.pause(); } }, 900);
    enMarche = false; majBouton();
  };
  const majBouton = () => {
    bouton.classList.toggle('joue', enMarche);
    if (zoneVideo) zoneVideo.classList.toggle('visible', enMarche && avecYoutube());
    bouton.classList.remove('attend');
    bouton.setAttribute('aria-pressed', String(enMarche));
    bouton.querySelector('.platine-txt').textContent = enMarche ? 'Couper le son' : 'Lancer le son';
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
    if (document.hidden) { ctx.suspend(); if (avecYoutube()) yt.pauseVideo(); }
    else if (enMarche) { ctx.resume(); if (avecYoutube()) yt.playVideo(); }
  });
})();
