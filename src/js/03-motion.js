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
