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
