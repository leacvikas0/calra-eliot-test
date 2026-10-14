/* ─── PREAMBLE — shared flags ─── */
window.CE = (() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (hasGsap) gsap.registerPlugin(ScrollTrigger);
    return { reduceMotion, finePointer, hasGsap };
})();
/* ─── PRELOADER — lifts when the hero is ready, hard-capped ─── */
(() => {
    const pre = document.getElementById('preloader');
    if (!pre) return;

    document.body.classList.add('is-loading');

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        pre.classList.add('is-done');
        document.body.classList.remove('is-loading');
    };

    if (CE.reduceMotion) { finish(); return; }

    window.addEventListener('load', () => setTimeout(finish, 1000));
    setTimeout(finish, 3400); // never trap anyone
})();
/* ─── SPINE — scroll progress, active chapter, dark-section inversion ─── */
(() => {
    const spine = document.querySelector('.spine');
    if (!spine) return;

    const links = [...spine.querySelectorAll('[data-spine]')];
    const byId = new Map(links.map(a => [a.dataset.spine, a]));

    const setActive = (id) => {
        links.forEach(l => l.classList.toggle('is-active', l === byId.get(id)));
    };

    const syncInvert = () => {
        spine.classList.toggle('is-invert', !!document.querySelector('[data-theme="dark"].st-dark'));
    };

    if (!CE.hasGsap) {
        // graceful fallback: first link active, no tracking
        setActive('cover');
        return;
    }

    // progress hairline
    const fill = spine.querySelector('.spine-fill');
    if (CE.reduceMotion) {
        fill.style.transform = 'scaleY(1)';
    } else {
        gsap.to(fill, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 }
        });
    }

    // active chapter
    ['cover', 'ch-prep', 'ch-details', 'ch-ceremony', 'ch-portraits', 'ch-dinner', 'ch-party', 'finale']
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .forEach(sec => {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top 55%',
                end: 'bottom 55%',
                onToggle: self => { if (self.isActive) setActive(sec.id); }
            });
        });

    // invert spine colours while a dark section passes beneath it
    document.querySelectorAll('[data-theme="dark"]').forEach(sec => {
        ScrollTrigger.create({
            trigger: sec,
            start: 'top 60%',
            end: 'bottom 40%',
            onToggle: self => {
                sec.classList.toggle('st-dark', self.isActive);
                syncInvert();
            }
        });
    });
})();
/* ─── MOTION — reveals, parallax, ghost-numeral drift ─── */
(() => {
    if (!CE.hasGsap || CE.reduceMotion) return;

    // generic rise-in reveals, fired once
    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.fromTo(el,
            { y: 34, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1,
                duration: 1.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true }
            });
    });

    // parallax: data-parallax="<amount>" on .frame-media / .bleed-media / .hero-media
    gsap.utils.toArray('[data-parallax]').forEach(el => {
        const amt = parseFloat(el.dataset.parallax) || 8;
        // for in-flow frames, drift the (oversized) img inside the clipped box
        const target = el.classList.contains('frame-media') ? el.querySelector('img') : el;
        if (!target) return;
        const trigger = el.closest('.frame, .bleed, .hero, figure') || el;
        gsap.fromTo(target,
            { yPercent: -amt / 2 },
            {
                yPercent: amt / 2,
                ease: 'none',
                scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true }
            });
    });

    // hero interface gently lifts away as the story begins
    gsap.to('.hero-ui', {
        yPercent: -14,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true }
    });

    // ghost numerals drift against the scroll
    gsap.utils.toArray('.chead-ghost').forEach(el => {
        gsap.fromTo(el,
            { yPercent: 22 },
            {
                yPercent: -18,
                ease: 'none',
                scrollTrigger: { trigger: el.closest('.chead'), start: 'top bottom', end: 'bottom top', scrub: true }
            });
    });

    // keep triggers honest once every image has settled
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
/* ─── LIGHTBOX — click any photograph; arrows, keys, counter ─── */
(() => {
    const frames = [...document.querySelectorAll('[data-lb]')];
    if (!frames.length) return;

    const photos = frames.map(f => {
        const img = f.querySelector('img');
        return { src: img.currentSrc || img.src, alt: img.alt || '' };
    });

    const overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
        <img class="lb-img" alt="">
        <p class="lb-cap"></p>
        <p class="lb-count"></p>
        <button class="lb-close" type="button">Close</button>
        <button class="lb-prev" type="button" aria-label="Previous image">&larr;</button>
        <button class="lb-next" type="button" aria-label="Next image">&rarr;</button>`;
    document.body.appendChild(overlay);

    const lbImg = overlay.querySelector('.lb-img');
    const lbCap = overlay.querySelector('.lb-cap');
    const lbCount = overlay.querySelector('.lb-count');
    const btnClose = overlay.querySelector('.lb-close');
    const btnPrev = overlay.querySelector('.lb-prev');
    const btnNext = overlay.querySelector('.lb-next');

    let idx = 0;
    let lastFocus = null;

    const show = (i) => {
        idx = (i + photos.length) % photos.length;
        const p = photos[idx];
        lbImg.src = p.src;
        lbImg.alt = p.alt;
        lbCap.textContent = p.alt;
        lbCount.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    };

    const open = (i) => {
        lastFocus = document.activeElement;
        show(i);
        overlay.classList.add('is-open');
        document.body.classList.add('lb-open');
        btnClose.focus();
    };

    const close = () => {
        overlay.classList.remove('is-open');
        document.body.classList.remove('lb-open');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    frames.forEach((f, i) => {
        f.setAttribute('tabindex', '0');
        f.setAttribute('role', 'button');
        f.setAttribute('aria-label', `View photo: ${photos[i].alt}`);
        f.addEventListener('click', () => open(i));
        f.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
        });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => show(idx - 1));
    btnNext.addEventListener('click', () => show(idx + 1));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(idx - 1);
        if (e.key === 'ArrowRight') show(idx + 1);
    });
})();
/* ─── CURSOR — brass dot + trailing ring; "View" over photographs ─── */
(() => {
    if (!CE.finePointer || CE.reduceMotion || !CE.hasGsap) return;

    document.body.classList.add('has-cursor');

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span class="cursor-label">View</span>';
    document.body.append(dot, ring);

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dotX = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power2' });
    const dotY = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power2' });
    const ringX = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });

    window.addEventListener('mousemove', (e) => {
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('[data-lb]')) ring.classList.add('is-view');
        if (e.target.closest('a, button')) ring.classList.add('is-link');
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('[data-lb]')) ring.classList.remove('is-view');
        if (e.target.closest('a, button')) ring.classList.remove('is-link');
    });
})();
/* ─── BOOT ─── */
(() => {
    document.documentElement.classList.add('js');
})();
