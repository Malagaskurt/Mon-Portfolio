// ==========================================================
// Animations Motion (la librairie de Framer Motion, version sans React).
// Fichier de la librairie : assets/vendor/motion.js (Motion 11.11.17, licence MIT).
//
// 1. Les affiches, images et stickers arrivent avec un ressort, section par section.
// 2. Au survol, ils réagissent avec un petit rebond.
// 3. Les stickers flottent légèrement au défilement (parallaxe).
// 4. Les boutons s'enfoncent quand on clique.
// ==========================================================
(() => {
  const M = window.Motion;
  if (!M || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { animate, inView, scroll } = M;

  const ressort = { type: 'spring', stiffness: 170, damping: 15, mass: 1 };
  const ressortDoux = { type: 'spring', stiffness: 260, damping: 18 };
  const ordi = window.matchMedia('(min-width: 1200px)').matches;
  const horsHero = el => !el.closest('.cine-colle, .entree, .footer, .nav');

  // éléments animés : on retire l'ancienne apparition CSS pour laisser la main à Motion
  const BLOCS = '.poster, .el.img:not(.bgimg), .paper, .el.stk, .lab.sh';
  const blocs = [...document.querySelectorAll(BLOCS)].filter(horsHero);
  blocs.forEach(el => {
    el.classList.remove('anim-bloc');
    el.style.opacity = '0';
    el.__py = 0;            // décalage de parallaxe
    el.__entree = 1;        // 1 = pas encore arrivé, 0 = en place
  });

  const appliquer = (el, v) => {
    // v va de 0 (départ) à 1 (en place) ; le ressort le fait dépasser 1, d'où le rebond
    const decale = (1 - v) * 70;
    el.style.translate = `0 ${(decale + el.__py).toFixed(1)}px`;
    el.style.scale = (0.88 + 0.12 * v).toFixed(4);
    el.style.rotate = `${((1 - v) * (el.__sens || 4)).toFixed(2)}deg`;
    el.style.opacity = Math.min(1, v * 1.6).toFixed(3);
  };

  // 1. Apparitions en cascade, section par section
  document.querySelectorAll('.sec').forEach(section => {
    const enfants = blocs.filter(el => section.contains(el));
    if (!enfants.length) return;
    enfants.forEach((el, i) => { el.__sens = (i % 2 ? -1 : 1) * (el.matches('.img.sm, .el.stk') ? 10 : 3); });
    inView(section, () => {
      enfants.forEach((el, i) => {
        animate(0, 1, {
          ...ressort,
          delay: Math.min(i * 0.09, 0.6),
          onUpdate: v => { el.__entree = 1 - v; appliquer(el, v); },
          onComplete: () => { el.__entree = 0; el.dataset.arrive = '1'; appliquer(el, 1); },
        });
      });
    }, { amount: 0.12 });
  });

  // 2. Rebonds au survol (souris uniquement)
  if (window.matchMedia('(hover: hover)').matches) {
    const survol = (selecteur, dedans, dehors) => {
      document.querySelectorAll(selecteur).forEach(el => {
        if (!horsHero(el)) return;
        el.addEventListener('pointerenter', () => el.dataset.arrive && animate(el, dedans, ressortDoux));
        el.addEventListener('pointerleave', () => el.dataset.arrive && animate(el, dehors, ressortDoux));
      });
    };
    survol('.poster', { scale: 1.025, rotate: '-0.8deg' }, { scale: 1, rotate: '0deg' });
    survol('.el.img.sm, .el.stk, .lab.sh', { scale: 1.12, rotate: '-6deg' }, { scale: 1, rotate: '0deg' });
    survol('.el.img.dossier', { scale: 1.06 }, { scale: 1 });
    survol('.paper', { scale: 1.02 }, { scale: 1 });
  }

  // 3. Parallaxe : les stickers flottent un peu plus vite que la page
  const flottants = blocs.filter(el => el.matches('.el.img.sm, .el.stk, .lab.sh'));
  flottants.forEach((el, i) => {
    const amplitude = (ordi ? 60 : 25) * (i % 2 ? 1 : -1);
    scroll(p => {
      el.__py = (0.5 - p) * amplitude;
      if (el.dataset.arrive) el.style.translate = `0 ${el.__py.toFixed(1)}px`;
    }, { target: el, offset: ['start end', 'end start'] });
  });

  // 4. Boutons qui s'enfoncent au clic
  document.querySelectorAll('.btn, .nav-cta, .cine-btn, .entree-btn, .platine, .cta-big').forEach(el => {
    el.addEventListener('pointerdown', () => animate(el, { scale: 0.94 }, { type: 'spring', stiffness: 500, damping: 20 }));
    const relache = () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 12 });
    el.addEventListener('pointerup', relache);
    el.addEventListener('pointerleave', relache);
  });

  // sécurité : si un élément n'a jamais été vu (impression, capture), on l'affiche quand même
  window.addEventListener('beforeprint', () => blocs.forEach(el => appliquer(el, 1)));
})();
