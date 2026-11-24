// "Otimizar página" (contexto MAIN, document_start). Só age quando a flag `optimize` está ligada.
//  1. Player Kaltura (750 KB, síncrono no <head>) passa a carregar só nas rotas /aula/.
//     A regra DNR optimizer/rules_kaltura.json bloqueia a tag original; aqui o script é reinjetado com ?dopt=1.
//  2. Voltar/Avançar do navegador andam entre as etapas da aula (pushState com state, mesma URL).
//  3. Atalhos "[" e "]" para etapa anterior/próxima.
(() => {
  if (window.__descoOptimizer) return; window.__descoOptimizer = true;
  let cfg = { optimize: false };
  let started = false;
  const K = 'https://cdnapisec.kaltura.com/p/1612851/embedPlaykitJs/uiconf_id/47228233?dopt=1';
  const isAula = () => /\/aula\//.test(location.pathname);
  let kText = null, kFetching = false, kDone = false;

  const prefetchK = () => { if (kText || kFetching) return; kFetching = true; fetch(K).then((r) => r.text()).then((t) => { kText = t; }).catch(() => { kFetching = false; }); };
  const addTag = () => { if (kDone || window.KalturaPlayer) { kDone = true; return; } const s = document.createElement('script'); s.src = K; s.async = false; (document.head || document.documentElement).appendChild(s); kDone = true; };
  // Navegação SPA para uma aula: o player precisa existir de forma síncrona antes de a rota montar.
  const loadK = () => {
    if (!cfg.optimize || kDone || window.KalturaPlayer) return;
    let t = kText;
    if (t == null) { try { const x = new XMLHttpRequest(); x.open('GET', K, false); x.send(); t = x.responseText; kText = t; } catch { return; } }
    const s = document.createElement('script'); s.textContent = t; (document.head || document.documentElement).appendChild(s); s.remove(); kDone = true;
  };
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
  const maybePrefetch = () => { if (cfg.optimize && /\/turma\//.test(location.pathname)) idle(prefetchK); };

  const origPush = history.pushState, origReplace = history.replaceState;
  const wrap = (orig) => function (state, title, url) {
    if (cfg.optimize && url != null) {
      try {
        const p = new URL(url, location.href).pathname;
        if (/\/aula\//.test(p)) loadK(); else if (/\/turma\//.test(p)) setTimeout(maybePrefetch, 0);
      } catch {}
    }
    return orig.apply(this, arguments);
  };
  history.pushState = wrap(origPush); history.replaceState = wrap(origReplace);
  addEventListener('popstate', () => { if (cfg.optimize && isAula()) loadK(); }, true);

  // ---- etapas da aula no histórico ----
  const steps = () => [...document.querySelectorAll('.video-menu__item')];
  const activeIdx = () => steps().findIndex((e) => /--actived/.test(e.className));
  let last = -1, lastPath = '', programmatic = false;
  const observe = () => {
    if (!cfg.optimize || !isAula()) { last = -1; return; }
    if (lastPath !== location.pathname) { lastPath = location.pathname; last = -1; }
    const i = activeIdx(); if (i < 0 || i === last) return;
    const first = last === -1; last = i;
    const st = { ...(history.state || {}), __desco_step: i };
    if (first || programmatic) origReplace.call(history, st, '', location.href); else origPush.call(history, st, '', location.href);
    programmatic = false;
  };
  new MutationObserver(observe).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  addEventListener('popstate', (e) => {
    const n = e.state && e.state.__desco_step;
    if (!cfg.optimize || !isAula() || n == null) return;
    const s = steps(); if (!s.length || activeIdx() === n || !s[n]) return;
    programmatic = true; last = n; s[n].click();
  });
  addEventListener('keydown', (e) => {
    if (!cfg.optimize || !isAula() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key !== '[' && e.key !== ']') return;
    const s = steps(), n = activeIdx() + (e.key === ']' ? 1 : -1);
    if (s[n]) s[n].click();
  }, true);

  addEventListener('desco-opt-cfg', (e) => {
    try { cfg = { ...cfg, ...JSON.parse(e.detail) }; } catch { return; }
    if (started || !cfg.optimize) return;
    started = true;
    // Carga direta: aula injeta o player já; outras rotas só pré-carregam em /turma/.
    if (isAula()) addTag(); else if (document.readyState === 'loading') addEventListener('DOMContentLoaded', maybePrefetch, { once: true }); else maybePrefetch();
  });
  window.dispatchEvent(new Event('desco-opt-hello'));
})();
