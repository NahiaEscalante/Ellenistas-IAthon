/* Navegación entre escenas de la demo. */
(function () {
  'use strict';
  const { $$ } = UI;
  const scenes = {
    rpa: () => RPA.render(),
    web: () => window.WEB && WEB.render(),
    arm: () => window.ARM && ARM.render(),
    arch: () => window.ARM && ARM.renderArch()
  };
  const built = {};
  function go(name, force) {
    if (!scenes[name]) name = 'rpa';
    $$('.stage').forEach(s => s.classList.toggle('on', s.id === 'stage-' + name));
    const tab = name === 'arm' ? 'web' : name;
    $$('.ptab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.go === tab)));
    if (!built[name] || force) { scenes[name](); built[name] = true; }
    window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + name); } catch (e) { /* sin historial */ }
  }
  $$('.ptab').forEach(t => t.addEventListener('click', () => go(t.dataset.go, t.dataset.go === 'web')));
  const setBar = () => document.documentElement.style.setProperty('--pbar', document.querySelector('.pbar').offsetHeight + 'px');
  setBar(); addEventListener('resize', setBar);
  UI.initTips();
  window.APP = { go };
  const h = (location.hash || '').replace('#', '');
  go(scenes[h] ? h : 'rpa');
})();
