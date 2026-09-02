const menuButton = document.querySelector('.menu-button');
const globalNav = document.querySelector('.global-nav');
const siteHeader = document.querySelector('.site-header');
const stickyCta = document.querySelector('.sticky-cta');
const heroSection = document.querySelector('.hero');
const contactSection = document.querySelector('.contact');
const siteFooter = document.querySelector('.site-footer');
let updateStickyCta = () => {};

document.documentElement.classList.add('js');

if (menuButton && globalNav) {
  const closeMenu = () => {
    menuButton.classList.remove('is-open');
    globalNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
    updateStickyCta();
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.classList.toggle('is-open', !isOpen);
    globalNav.classList.toggle('is-open', !isOpen);
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
    updateStickyCta();
  });
  globalNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 767) closeMenu(); });
}

if (stickyCta && heroSection && contactSection && siteFooter) {
  updateStickyCta = () => {
    const contactRect = contactSection.getBoundingClientRect();
    const footerRect = siteFooter.getBoundingClientRect();
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const passedHero = window.scrollY > heroSection.offsetTop + heroSection.offsetHeight * 0.55;
    const contactVisible = contactRect.top < window.innerHeight && contactRect.bottom > 0;
    const footerVisible = footerRect.top < window.innerHeight;
    const menuOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    const shouldShow = isMobile && passedHero && !contactVisible && !footerVisible && !menuOpen;

    stickyCta.classList.toggle('is-visible', shouldShow);
    stickyCta.setAttribute('aria-hidden', String(!shouldShow));
    stickyCta.tabIndex = shouldShow ? 0 : -1;
  };

  updateStickyCta();
  window.addEventListener('scroll', updateStickyCta, { passive: true });
  window.addEventListener('resize', updateStickyCta);
}

if (siteHeader) {
  const updateHeaderShadow = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 16);
  updateHeaderShadow();
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealSelector = [
  'main section:not(.hero) h2',
  'main section:not(.hero) h3',
  'main section:not(.hero) img',
  'main section:not(.hero) p',
  '.table-wrap table',
  '.compare-mobile article',
  '.flow-list li'
].join(',');
const revealElements = [...document.querySelectorAll(revealSelector)]
  .filter((element) => !element.closest('.usage-item'));
const usageItems = [...document.querySelectorAll('.usage-item')];

usageItems.forEach((item, index) => {
  item.classList.add('reveal-target', index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
  item.style.setProperty('--reveal-delay', `${(index % 2) * 70}ms`);
});

revealElements.push(...usageItems);

revealElements.forEach((element, index) => {
  element.classList.add('reveal-target');
  element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
});

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const contactButton = document.querySelector('.contact-action a');

if (contactSection && contactButton && !reduceMotion && 'IntersectionObserver' in window) {
  const contactObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    contactButton.classList.add('shine-once');
    observer.unobserve(contactSection);
  }, { threshold: 0.2 });

  contactObserver.observe(contactSection);
}
