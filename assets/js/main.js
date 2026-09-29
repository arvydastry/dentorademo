/* ============================================================
   DENTORA demo — interakcijos
   Header, parallax, reveal, filtrai, krepšelis, PDP, slapukai
   ============================================================ */
(function () {
  'use strict';

  var d = document;
  d.documentElement.classList.add('js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function eur(n) { return n.toFixed(2).replace('.', ',') + ' €'; }

  /* ---------- Toast ---------- */
  var toastStack = $('[data-toasts]');
  function toast(msg) {
    if (!toastStack) return;
    var t = d.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<svg width="18" height="18"><use href="#i-check"/></svg><span></span>';
    t.lastChild.textContent = msg;
    toastStack.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); }, 3200);
    setTimeout(function () { t.remove(); }, 3600);
  }

  /* ---------- Antraštė (scroll) ---------- */
  var header = $('#siteHeader');
  function onHeaderScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* ---------- Paneliai (paieška / krepšelis / meniu / filtrai) ---------- */
  var backdrop = $('[data-backdrop]');
  var openPanel = null;
  function closePanels() {
    $$('[data-panel]').forEach(function (p) { p.classList.remove('is-open'); });
    if (backdrop) backdrop.classList.remove('is-open');
    openPanel = null;
  }
  function open(name) {
    closePanels();
    var p = $('[data-panel="' + name + '"]');
    if (!p) return;
    p.classList.add('is-open');
    openPanel = name;
    if (name !== 'search' && backdrop) backdrop.classList.add('is-open');
    if (name === 'search') {
      var inp = $('#search-input');
      if (inp) setTimeout(function () { inp.focus(); }, 120);
    }
  }
  d.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); open(o.getAttribute('data-open')); return; }
    if (e.target.closest('[data-close]')) { closePanels(); return; }
    if (backdrop && e.target === backdrop) closePanels();
    var so = e.target.closest('.search-overlay');
    if (so && e.target === so) closePanels();
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanels();
  });

  /* ---------- Kalbų meniu ---------- */
  var lang = $('[data-lang]');
  if (lang) {
    $('.lang__btn', lang).addEventListener('click', function (e) {
      e.stopPropagation();
      lang.classList.toggle('is-open');
    });
    d.addEventListener('click', function (e) {
      if (!e.target.closest('[data-lang]')) lang.classList.remove('is-open');
    });
  }
  $$('[data-lang-demo]').forEach(function (b) {
    b.addEventListener('click', function () {
      lang && lang.classList.remove('is-open');
      toast('Demo: EN ir PL versijos bus įdiegtos su daugiakalbiškumo moduliu.');
    });
  });

  /* ---------- Demo nuorodos ---------- */
  d.addEventListener('click', function (e) {
    var el = e.target.closest('[data-demo]');
    if (!el) return;
    e.preventDefault();
    toast('Demo versijoje šis puslapis dar nekuriamas — numatyta kitame etape.');
  });

  /* ---------- Reveal animacijos ---------- */
  var reveals = $$('.reveal');
  if (reveals.length) {
    if (REDUCED || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Skaitliukai ---------- */
  var counters = $$('[data-count]').filter(function (el) { return el.tagName !== 'BUTTON'; });
  var fmt = new Intl.NumberFormat('lt-LT');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (REDUCED) { el.textContent = fmt.format(target); return; }
    var t0 = null, dur = 1300;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = fmt.format(parseInt(el.getAttribute('data-count'), 10) || 0); });
  }

  /* ---------- Parallax ---------- */
  var pxEls = $$('[data-parallax]');
  if (pxEls.length && !REDUCED) {
    var ticking = false;
    function parallax() {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var speed = parseFloat(el.getAttribute('data-speed')) || 0.15;
        var offset = (r.top + r.height / 2) - vh / 2;
        var y = Math.max(-130, Math.min(130, -offset * speed));
        el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  /* ---------- Hero pelės gylis ---------- */
  var scene = $('[data-tilt-scene]');
  if (scene && !REDUCED && window.matchMedia('(pointer:fine)').matches) {
    var depths = $$('[data-depth]', scene);
    scene.addEventListener('mousemove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      depths.forEach(function (el) {
        var k = parseFloat(el.getAttribute('data-depth')) || 10;
        el.style.transform = 'translate(' + (-nx * k).toFixed(1) + 'px,' + (-ny * k).toFixed(1) + 'px)';
      });
    });
  }
  if (REDUCED) {
    var v = $('.hero__media');
    if (v && v.pause) { try { v.pause(); } catch (err) {} }
  }

  /* ---------- Mėgstamos ---------- */
  var wishTotal = 3;
  function setWishCount() {
    $$('[data-wish-count]').forEach(function (b) { b.setAttribute('data-count', wishTotal); });
  }
  d.addEventListener('click', function (e) {
    var w = e.target.closest('[data-wish]');
    if (!w) return;
    e.preventDefault();
    var on = w.classList.toggle('is-on');
    wishTotal += on ? 1 : -1;
    setWishCount();
    var hb = $('[data-wish-count]');
    if (hb) { hb.classList.remove('bump'); void hb.offsetWidth; hb.classList.add('bump'); }
    toast(on ? 'Prekė pridėta prie mėgstamų ♥' : 'Prekė pašalinta iš mėgstamų');
  });

  /* ---------- Krepšelis ---------- */
  var FREE_SHIP = 39;
  function cartItems() { return $$('[data-cart-items] .cart-item'); }
  function recalcCart() {
    var subtotal = 0, qty = 0;
    cartItems().forEach(function (it) {
      var price = parseFloat(it.getAttribute('data-price')) || 0;
      var q = parseInt(($('.qty input', it) || {}).value, 10) || 1;
      qty += q;
      var line = price * q;
      subtotal += line;
      var lp = $('.cart-item__price', it);
      if (lp) lp.textContent = eur(line);
    });
    var tot = $('[data-cart-total]');
    if (tot) tot.textContent = eur(subtotal);
    var cq = $('[data-cart-qty]');
    if (cq) cq.textContent = '(' + qty + ')';
    $$('[data-cart-count]').forEach(function (b) { b.setAttribute('data-count', qty); });
    var left = Math.max(0, FREE_SHIP - subtotal);
    var lbl = $('[data-freeship-label]');
    if (lbl) {
      lbl.innerHTML = left > 0
        ? 'Iki <strong>nemokamo pristatymo</strong> liko <strong>' + eur(left) + '</strong>'
        : '🎉 Sveikiname — jums <strong>pristatymas nemokamas!</strong>';
    }
    var fill = $('[data-freeship-fill]');
    if (fill) fill.style.width = Math.min(100, subtotal / FREE_SHIP * 100) + '%';
    var box = $('[data-cart-items]');
    var emptyMsg = $('[data-cart-empty]');
    if (box && !cartItems().length && !emptyMsg) {
      var p = d.createElement('p');
      p.setAttribute('data-cart-empty', '');
      p.className = 'muted';
      p.style.cssText = 'text-align:center;padding:40px 10px';
      p.textContent = 'Jūsų krepšelis tuščias.';
      box.appendChild(p);
    }
  }
  function addToCart(title, price, img, q) {
    var box = $('[data-cart-items]');
    if (!box) return;
    var emptyMsg = $('[data-cart-empty]');
    if (emptyMsg) emptyMsg.remove();
    var existing = cartItems().filter(function (it) {
      return ($('.cart-item__title', it) || {}).textContent === title;
    })[0];
    if (existing) {
      var inp = $('.qty input', existing);
      inp.value = (parseInt(inp.value, 10) || 1) + q;
    } else {
      var el = d.createElement('div');
      el.className = 'cart-item';
      el.setAttribute('data-price', price);
      el.innerHTML =
        '<img src="' + img + '" alt="">' +
        '<div class="cart-item__body">' +
        '<p class="cart-item__title"></p>' +
        '<p class="cart-item__meta">Standartinė komplektacija</p>' +
        '<div class="cart-item__row">' +
        '<span class="qty"><button type="button" data-qty="-1" aria-label="Mažiau">−</button><input type="text" value="' + q + '" inputmode="numeric" aria-label="Kiekis"><button type="button" data-qty="1" aria-label="Daugiau">+</button></span>' +
        '<span class="cart-item__price"></span>' +
        '<button class="cart-item__remove" type="button" aria-label="Pašalinti"><svg width="15" height="15"><use href="#i-x"/></svg></button>' +
        '</div></div>';
      $('.cart-item__title', el).textContent = title;
      box.appendChild(el);
    }
    recalcCart();
  }
  function parsePrice(txt) {
    return parseFloat((txt || '0').replace(/[^\d,\.]/g, '').replace(',', '.')) || 0;
  }
  d.addEventListener('click', function (e) {
    /* kiekio mygtukai */
    var qb = e.target.closest('[data-qty]');
    if (qb) {
      var input = $('input', qb.parentElement);
      if (input) {
        var val = (parseInt(input.value, 10) || 1) + parseInt(qb.getAttribute('data-qty'), 10);
        input.value = Math.max(1, Math.min(99, val));
        if (qb.closest('.cart-item')) recalcCart();
      }
      return;
    }
    /* pašalinti iš krepšelio */
    var rm = e.target.closest('.cart-item__remove');
    if (rm) {
      rm.closest('.cart-item').remove();
      recalcCart();
      toast('Prekė pašalinta iš krepšelio');
      return;
    }
    /* į krepšelį */
    var add = e.target.closest('[data-add]');
    if (add) {
      var card = add.closest('.prod-card');
      var title, price, img, q = 1;
      if (card) {
        title = ($('.prod-card__title', card) || {}).textContent || 'Prekė';
        price = parsePrice(($('.price__new', card) || {}).textContent);
        img = ($('.prod-card__media .main', card) || {}).src || '';
      } else {
        title = ($('.pdp h1') || {}).textContent || 'Prekė';
        price = parsePrice(($('.pdp__price .price__new') || {}).textContent);
        img = ($('[data-pdp-main]') || {}).src || '';
        var qi = $('.pdp__buy .qty input');
        if (qi) q = parseInt(qi.value, 10) || 1;
      }
      addToCart(title.trim(), price, img, q);
      var cb = $('[data-cart-count]');
      if (cb) { cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
      toast('Prekė įdėta į krepšelį ✓');
      return;
    }
    /* pranešti apie grįžusią prekę (kortelėje) */
    var nt = e.target.closest('[data-notify]');
    if (nt) {
      toast('Demo: paliktumėte el. paštą — pranešime, kai prekė grįš į sandėlį.');
      return;
    }
    /* bundle į krepšelį */
    var ba = e.target.closest('[data-bundle-add]');
    if (ba) {
      $$('[data-bundle-item]:checked').forEach(function (ch) {
        var item = ch.closest('.bundle__item');
        addToCart($('.t', item).textContent.replace('Ši prekė: ', ''), parseFloat(ch.getAttribute('data-price')) || 0, ($('img', item) || {}).src || '', 1);
      });
      open('cart');
      toast('Rinkinys įdėtas į krepšelį ✓');
      return;
    }
  });
  recalcCart();

  /* ---------- Populiarių prekių tabai (pradžia) ---------- */
  var ftabs = $('[data-featured-tabs]');
  if (ftabs) {
    var fgrid = $('[data-featured-grid]');
    ftabs.addEventListener('click', function (e) {
      var b = e.target.closest('.pill');
      if (!b) return;
      $$('.pill', ftabs).forEach(function (p) { p.classList.remove('is-active'); });
      b.classList.add('is-active');
      var f = b.getAttribute('data-filter');
      $$('.prod-card', fgrid).forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(' ');
        card.hidden = (f !== 'all' && tags.indexOf(f) === -1);
      });
    });
  }

  /* ---------- Parduotuvės filtrai ---------- */
  var shopGrid = $('[data-shop-grid]');
  if (shopGrid) {
    var cards = $$('.prod-card', shopGrid);
    var chipsBox = $('[data-chips]');
    var emptyEl = $('[data-shop-empty]');
    var rMin = $('[data-range-min]'), rMax = $('[data-range-max]');
    var rFill = $('[data-range-fill]'), rLMin = $('[data-range-lmin]'), rLMax = $('[data-range-lmax]');
    var MAXP = rMax ? parseInt(rMax.max, 10) : 130;

    function rangeVals() {
      var a = parseInt(rMin.value, 10), b = parseInt(rMax.value, 10);
      return [Math.min(a, b), Math.max(a, b)];
    }
    function updateRangeUI() {
      var v = rangeVals();
      if (rFill) {
        rFill.style.left = (v[0] / MAXP * 100) + '%';
        rFill.style.right = (100 - v[1] / MAXP * 100) + '%';
      }
      if (rLMin) rLMin.textContent = v[0] + ' €';
      if (rLMax) rLMax.textContent = v[1] + ' €';
    }

    function checked(f) {
      return $$('input[data-f="' + f + '"]:checked');
    }
    function labelFor(input) {
      var n = $('.n', input.closest('.check'));
      return n ? n.textContent : input.value;
    }

    function applyFilters() {
      var cats = checked('cat').map(function (i) { return i.value; });
      var brands = checked('brand').map(function (i) { return i.value; });
      var tags = checked('tag').map(function (i) { return i.value; });
      var stockOnly = checked('stock').length > 0;
      var pv = rangeVals();
      var visible = 0;

      cards.forEach(function (card) {
        var ccats = (card.getAttribute('data-cat') || '').split(' ');
        var ctags = (card.getAttribute('data-tags') || '').split(' ');
        var price = parseFloat(card.getAttribute('data-price')) || 0;
        var ok =
          (!cats.length || cats.some(function (c) { return ccats.indexOf(c) !== -1; })) &&
          (!brands.length || brands.indexOf(card.getAttribute('data-brand')) !== -1) &&
          (!tags.length || tags.some(function (t) { return ctags.indexOf(t) !== -1; })) &&
          (!stockOnly || card.getAttribute('data-stock') === '1') &&
          price >= pv[0] && price <= pv[1];
        card.hidden = !ok;
        if (ok) visible++;
      });

      var rc = $('[data-result-count]');
      if (rc) rc.textContent = visible;
      var ri = $('[data-result-inline]');
      if (ri) ri.textContent = visible;
      if (emptyEl) emptyEl.hidden = visible > 0;

      /* žymos (chips) */
      var chips = [];
      checked('cat').concat(checked('brand')).concat(checked('tag')).concat(checked('stock')).forEach(function (i) {
        chips.push({ label: labelFor(i), input: i });
      });
      var priceActive = pv[0] > 0 || pv[1] < MAXP;
      var total = chips.length + (priceActive ? 1 : 0);
      var fc = $('[data-filter-count]');
      if (fc) fc.textContent = total ? '(' + total + ')' : '';

      if (chipsBox) {
        chipsBox.innerHTML = '';
        chipsBox.hidden = total === 0;
        chips.forEach(function (c) {
          var el = d.createElement('span');
          el.className = 'chip';
          el.innerHTML = '<span></span><button type="button" aria-label="Pašalinti filtrą"><svg><use href="#i-x"/></svg></button>';
          el.firstChild.textContent = c.label;
          $('button', el).addEventListener('click', function () {
            c.input.checked = false;
            applyFilters();
          });
          chipsBox.appendChild(el);
        });
        if (priceActive) {
          var pc = d.createElement('span');
          pc.className = 'chip';
          pc.innerHTML = '<span>Kaina: ' + pv[0] + '–' + pv[1] + ' €</span><button type="button" aria-label="Pašalinti filtrą"><svg><use href="#i-x"/></svg></button>';
          $('button', pc).addEventListener('click', function () {
            rMin.value = 0; rMax.value = MAXP;
            updateRangeUI(); applyFilters();
          });
          chipsBox.appendChild(pc);
        }
        if (total) {
          var clr = d.createElement('button');
          clr.className = 'chip chip--clear';
          clr.type = 'button';
          clr.textContent = 'Išvalyti viską';
          clr.addEventListener('click', clearFilters);
          chipsBox.appendChild(clr);
        }
      }
    }

    function clearFilters() {
      $$('input[data-f]').forEach(function (i) { i.checked = false; });
      if (rMin && rMax) { rMin.value = 0; rMax.value = MAXP; updateRangeUI(); }
      applyFilters();
    }
    $$('[data-filters-clear]').forEach(function (b) { b.addEventListener('click', clearFilters); });

    d.addEventListener('change', function (e) {
      if (e.target.matches('input[data-f]')) applyFilters();
    });
    if (rMin && rMax) {
      [rMin, rMax].forEach(function (r) {
        r.addEventListener('input', function () { updateRangeUI(); applyFilters(); });
      });
      updateRangeUI();
    }

    /* ženklų paieška filtre */
    var bs = $('[data-brand-search]');
    if (bs) {
      bs.addEventListener('input', function () {
        var q = bs.value.toLowerCase();
        $$('input[data-f="brand"]').forEach(function (i) {
          var row = i.closest('.check');
          row.style.display = labelFor(i).toLowerCase().indexOf(q) === -1 ? 'none' : '';
        });
      });
    }

    /* rikiavimas */
    var sort = $('[data-sort]');
    if (sort) {
      sort.addEventListener('change', function () {
        var v = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          var pa = parseFloat(a.getAttribute('data-price')), pb = parseFloat(b.getAttribute('data-price'));
          var ra = parseFloat(a.getAttribute('data-rating')), rb = parseFloat(b.getAttribute('data-rating'));
          if (v === 'price-asc') return pa - pb;
          if (v === 'price-desc') return pb - pa;
          if (v === 'rating') return rb - ra;
          return parseInt(a.getAttribute('data-pop'), 10) - parseInt(b.getAttribute('data-pop'), 10);
        });
        sorted.forEach(function (c) { shopGrid.insertBefore(c, emptyEl); });
      });
    }

    /* URL parametrai (pvz., ?cat=vaikams, ?f=akcija) */
    try {
      var params = new URLSearchParams(window.location.search);
      var pcat = params.get('cat');
      if (pcat) {
        var ci = $('input[data-f="cat"][value="' + pcat + '"]');
        if (ci) ci.checked = true;
      }
      var pf = params.get('f');
      if (pf) {
        var ti = $('input[data-f="tag"][value="' + pf + '"]');
        if (ti) ti.checked = true;
      }
      var pbrand = params.get('brand');
      if (pbrand) {
        var bi = $('input[data-f="brand"][value="' + pbrand + '"]');
        if (bi) bi.checked = true;
      }
    } catch (err) {}
    applyFilters();
  }

  /* ---------- Prekės puslapis ---------- */
  var pdpMain = $('[data-pdp-main]');
  if (pdpMain) {
    var thumbs = $('[data-pdp-thumbs]');
    if (thumbs) {
      thumbs.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-img]');
        if (!b) return;
        $$('button', thumbs).forEach(function (t) { t.classList.remove('is-active'); });
        b.classList.add('is-active');
        pdpMain.src = b.getAttribute('data-img');
      });
    }
    var swatches = $('[data-swatches]');
    var notifyBox = $('[data-notify-box]');
    var stockLine = $('[data-stock-line]');
    var addBtn = $('.pdp__buy [data-add]');
    if (swatches) {
      swatches.addEventListener('click', function (e) {
        var s = e.target.closest('.swatch');
        if (!s) return;
        $$('.swatch', swatches).forEach(function (x) { x.classList.remove('is-active'); });
        s.classList.add('is-active');
        var nameEl = $('[data-swatch-name]');
        if (nameEl) nameEl.textContent = s.getAttribute('data-name');
        var out = s.hasAttribute('data-out');
        if (notifyBox) notifyBox.hidden = !out;
        if (stockLine) {
          stockLine.className = out ? 'stock stock--out' : 'stock stock--in';
          stockLine.textContent = out ? 'Šios spalvos šiuo metu neturime' : 'Yra sandėlyje — išsiųsime per 24 val.';
        }
        if (addBtn) {
          addBtn.disabled = out;
          addBtn.style.opacity = out ? '.5' : '';
          addBtn.style.pointerEvents = out ? 'none' : '';
        }
      });
    }
    var seg = $('[data-segmented]');
    if (seg) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        $$('button', seg).forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
      });
    }
    /* bundle suma */
    function recalcBundle() {
      var sum = 0, cnt = 0;
      $$('[data-bundle-item]').forEach(function (ch) {
        ch.closest('.bundle__item').classList.toggle('is-checked', ch.checked);
        if (ch.checked) { sum += parseFloat(ch.getAttribute('data-price')) || 0; cnt++; }
      });
      var t = $('[data-bundle-total]');
      if (t) t.textContent = eur(sum);
      var c = $('[data-bundle-count]');
      if (c) c.textContent = cnt;
    }
    $$('[data-bundle-item]').forEach(function (ch) { ch.addEventListener('change', recalcBundle); });
    recalcBundle();
  }

  /* ---------- Tabai ---------- */
  var tabBtns = $('[data-tabs]');
  function activateTab(name) {
    if (!tabBtns) return;
    $$('button', tabBtns).forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === name);
    });
    $$('[data-tab-panel]').forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-tab-panel') === name);
    });
  }
  if (tabBtns) {
    tabBtns.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]');
      if (b) activateTab(b.getAttribute('data-tab'));
    });
    $$('[data-tab-link]').forEach(function (a) {
      a.addEventListener('click', function () { activateTab(a.getAttribute('data-tab-link')); });
    });
  }

  /* ---------- Formos ---------- */
  $$('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var kind = f.getAttribute('data-form');
      if (kind === 'search') {
        var q = ($('input', f) || {}).value || '';
        toast(q ? 'Demo paieška: „' + q + '“ — gyvoje versijoje rezultatai kraunami realiu laiku.' : 'Įveskite paieškos frazę.');
        return;
      }
      if (kind === 'notify') {
        var box = f.closest('[data-notify-box]');
        if (box) box.hidden = true;
        toast('Gavome! Pranešime el. paštu, kai prekė grįš į sandėlį.');
        return;
      }
      var req = $$('input[required]', f).filter(function (i) { return !i.value.trim(); });
      if (req.length) { req[0].focus(); toast('Užpildykite privalomus laukus.'); return; }
      f.hidden = true;
      var ok = f.parentElement.querySelector('.form-success');
      if (ok) ok.hidden = false;
      var note = f.parentElement.querySelector('.form-note');
      if (note) note.remove && note.remove();
    });
  });
  $$('[data-search-tag]').forEach(function (b) {
    b.addEventListener('click', function () {
      var inp = $('#search-input');
      if (inp) { inp.value = b.textContent; inp.focus(); }
    });
  });

  /* ---------- Slapukų sutikimas ---------- */
  var cookiebar = $('[data-cookiebar]');
  if (cookiebar) {
    var stored = null;
    try { stored = localStorage.getItem('dentora_consent'); } catch (err) {}
    if (!stored) {
      setTimeout(function () { cookiebar.classList.add('is-open'); }, 900);
    }
    function saveConsent(val) {
      try { localStorage.setItem('dentora_consent', JSON.stringify(val)); } catch (err) {}
      cookiebar.classList.remove('is-open');
      toast('Slapukų pasirinkimas išsaugotas.');
    }
    cookiebar.addEventListener('click', function (e) {
      if (e.target.closest('[data-cookie-settings]')) {
        $('[data-cookie-view="main"]', cookiebar).hidden = true;
        $('[data-cookie-view="settings"]', cookiebar).hidden = false;
        return;
      }
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      var mode = b.getAttribute('data-cookie');
      if (mode === 'all') saveConsent({ analytics: true, marketing: true });
      else if (mode === 'necessary') saveConsent({ analytics: false, marketing: false });
      else saveConsent({
        analytics: ($('#ck-analytics') || {}).checked || false,
        marketing: ($('#ck-marketing') || {}).checked || false
      });
    });
  }

})();
