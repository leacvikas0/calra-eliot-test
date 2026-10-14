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
