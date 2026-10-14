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
