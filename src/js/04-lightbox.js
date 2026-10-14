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
