// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('ouvert', !open);
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('ouvert');
  }));
}

// Liens pas encore renseignés : on prévient au lieu de remonter en haut de page
document.querySelectorAll('a[href="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    a.classList.add('bientot');
    a.setAttribute('title', 'Lien bientôt disponible');
  });
});

// ==========================================================
// Apparition des textes : chaque mot monte depuis un masque,
// mot après mot, quand le bloc arrive à l'écran.
// ==========================================================
(() => {
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calme || !('IntersectionObserver' in window)) return;

  const textes = document.querySelectorAll('.t, .titre, .poster .pi, .lab, .info, .steps li, .footer span, .nav > *');
  const blocs = document.querySelectorAll('.poster, .img, .paper, .stk, .flow');

  // Découpe les mots d'un élément en <span class="m"><span class="mi">mot</span></span>
  const decouper = el => {
    let i = 0;
    const marcher = noeud => {
      [...noeud.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const morceaux = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          morceaux.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const m = document.createElement('span'); m.className = 'm';
            const mi = document.createElement('span'); mi.className = 'mi';
            mi.style.transitionDelay = Math.min(i++ * 28, 900) + 'ms';
            mi.textContent = p; m.appendChild(mi); frag.appendChild(m);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('dot')) {
          marcher(n);
        }
      });
    };
    marcher(el);
  };

  textes.forEach(el => {
    if (el.closest('.stk') || el.closest('.marquee')) return;
    decouper(el);
    el.classList.add('anim-texte');
  });
  blocs.forEach(el => el.classList.add('anim-bloc'));

  const voir = new IntersectionObserver(entrees => {
    entrees.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); voir.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -30px 0px', threshold: 0.01 });

  document.querySelectorAll('.anim-texte, .anim-bloc').forEach(el => voir.observe(el));
  document.documentElement.classList.add('anim-pret');
})();

// ==========================================================
// Entrées immersives (accueil : fenêtre du train, page Vidéo : écran
// de cinéma). En défilant on avance jusqu'à entrer dans l'image.
// --e va de 0 (assis) à 1 (dedans).
// ==========================================================
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const adoucir = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  document.querySelectorAll('.hero-cine').forEach(salle => {
    const scene = salle.querySelector('.cine-scene');
    const css = getComputedStyle(scene);
    let attente = false;
    const maj = () => {
      attente = false;
      const vw = window.innerWidth, vh = window.innerHeight;
      const course = salle.offsetHeight - vh;
      const p = Math.min(1, Math.max(0, -salle.getBoundingClientRect().top / (course * .85)));
      const e = adoucir(p);
      const ecran = scene.querySelector('.cine-ecran');
      const L = scene.offsetLeft, T = scene.offsetTop, W = scene.offsetWidth, H = scene.offsetHeight;
      const ox = parseFloat(css.getPropertyValue('--ox')), oy = parseFloat(css.getPropertyValue('--oy'));
      const cx = L + W * ox, cy = T + H * oy;
      const S = 1.12 * Math.max(vw / ecran.offsetWidth, vh / ecran.offsetHeight);
      const s = 1 + e * (S - 1);
      scene.style.transform = `translate(${(vw / 2 - cx) * e}px, ${(vh / 2 - cy) * e}px) scale(${s})`;
      salle.style.setProperty('--e', e.toFixed(4));
      salle.classList.toggle('cine-entre', e > .75);
    };
    const demander = () => { if (!attente) { attente = true; requestAnimationFrame(maj); } };
    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander);
    maj();
  });
})();
