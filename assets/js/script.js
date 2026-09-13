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
  .filter((element) => !element.closest('.usage-item, .case-slider'));
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

const caseSlider = document.querySelector('.case-slider');

if (caseSlider) {
  const viewport = caseSlider.querySelector('.case-slider-viewport');
  const track = caseSlider.querySelector('.case-slider-track');
  const slides = [...caseSlider.querySelectorAll('.case-slide')];
  const dots = [...caseSlider.querySelectorAll('.case-dot')];
  const previousButton = caseSlider.querySelector('.case-prev');
  const nextButton = caseSlider.querySelector('.case-next');
  let currentSlide = 0;
  let swipeStartX = null;

  const showSlide = (requestedIndex) => {
    currentSlide = (requestedIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    slides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== currentSlide)));
    dots.forEach((dot, index) => {
      const isCurrent = index === currentSlide;
      dot.classList.toggle('is-active', isCurrent);
      if (isCurrent) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  previousButton?.addEventListener('click', () => showSlide(currentSlide - 1));
  nextButton?.addEventListener('click', () => showSlide(currentSlide + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  viewport?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
  });
  const finishSwipe = (endX) => {
    if (swipeStartX === null) return;
    const distance = endX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) < 45) return;
    showSlide(currentSlide + (distance < 0 ? 1 : -1));
  };

  if ('PointerEvent' in window) {
    viewport?.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return;
      swipeStartX = event.clientX;
    });
    viewport?.addEventListener('pointerup', (event) => {
      if (event.pointerType === 'mouse') return;
      finishSwipe(event.clientX);
    });
    viewport?.addEventListener('pointercancel', () => { swipeStartX = null; });
  } else {
    viewport?.addEventListener('touchstart', (event) => {
      swipeStartX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    viewport?.addEventListener('touchend', (event) => {
      const endX = event.changedTouches[0]?.clientX;
      if (typeof endX === 'number') finishSwipe(endX);
    }, { passive: true });
    viewport?.addEventListener('touchcancel', () => { swipeStartX = null; }, { passive: true });
  }

  showSlide(0);
}

// Reveal only the comp's separate strokes, without connecting curves.
(() => {
 const svg=document.querySelector('.usage-track');if(!svg)return;
 const paths=[...svg.querySelectorAll('.guide-segment')];
 const strokes=paths.map(p=>{const length=p.getTotalLength(),a=p.getPointAtLength(0),b=p.getPointAtLength(length);p.style.strokeDasharray=length;return {p,length,a,b};});
 let current=0,target=0,frame=0,last=0;
 const paint=()=>strokes.forEach(({p,length,a,b})=>{const t=Math.max(0,Math.min(1,(current-a.y)/(b.y-a.y)));p.style.strokeDashoffset=length*(1-t);});
 const measure=()=>{const r=svg.getBoundingClientRect();target=reduceMotion?2300:Math.max(0,Math.min(2300,(innerHeight*.65-r.top)*2300/(r.height||2300)));};
 const tick=now=>{const dt=last?Math.min(64,now-last):16;last=now;current+=(target-current)*(1-Math.exp(-dt/100));if(Math.abs(target-current)<.1)current=target;paint();if(current!==target)frame=requestAnimationFrame(tick);else{frame=0;last=0;}};
 const update=()=>{measure();if(!frame)frame=requestAnimationFrame(tick);};
 measure();current=target;paint();addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
})();
