document.addEventListener('DOMContentLoaded',()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  if(window.lucide) lucide.createIcons();

  // Mobile navigation
  const mobileToggle=$('#mobileToggle'), navLinks=$('#navLinks');
  mobileToggle?.addEventListener('click',()=>{navLinks.classList.toggle('active');mobileToggle.innerHTML=`<i data-lucide="${navLinks.classList.contains('active')?'x':'menu'}"></i>`;lucide.createIcons()});
  $$('.nav-link').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('active');mobileToggle.innerHTML='<i data-lucide="menu"></i>';lucide.createIcons()}));

  // Theme
  const themeBtn=$('#themeToggleBtn');
  const saved=localStorage.getItem('portfolio-theme');
  if(saved==='light') document.documentElement.dataset.theme='light';
  const refreshThemeIcon=()=>{themeBtn.innerHTML=`<i data-lucide="${document.documentElement.dataset.theme==='light'?'sun':'moon'}"></i>`;lucide.createIcons()};
  refreshThemeIcon();
  themeBtn?.addEventListener('click',()=>{if(document.documentElement.dataset.theme==='light'){delete document.documentElement.dataset.theme;localStorage.setItem('portfolio-theme','dark')}else{document.documentElement.dataset.theme='light';localStorage.setItem('portfolio-theme','light')}refreshThemeIcon()});

  // Scroll UI + active navigation
  const navbar=$('#navbar'), progress=$('#scrollProgress'), backTop=$('#backTop');
  const sections=$$('main section[id]'); const links=$$('.nav-link');
  const onScroll=()=>{
    const y=window.scrollY, max=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(max>0?y/max*100:0)+'%'; navbar.classList.toggle('scrolled',y>30); backTop.classList.toggle('show',y>700);
    let current='home'; sections.forEach(sec=>{if(y>=sec.offsetTop-180) current=sec.id}); links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
  }; window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  backTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Cursor glow
  const cursor=$('#cursorGlow');
  if(matchMedia('(pointer:fine)').matches){window.addEventListener('pointermove',e=>{cursor.style.opacity='1';cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});window.addEventListener('pointerleave',()=>cursor.style.opacity='0')}

  // Reveal on scroll
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('active');revealObserver.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>revealObserver.observe(el));

  // Vanilla tilt
  if(window.VanillaTilt && matchMedia('(pointer:fine)').matches){VanillaTilt.init($$('[data-tilt]'),{max:6,speed:450,glare:true,'max-glare':.08,perspective:1100});}

  // Project cards direct GitHub repository navigation
  let isDraggingMoved = false;
  let dragStartX = 0, dragStartY = 0;

  document.addEventListener('click', e => {
    const card = e.target.closest('[data-repo]');
    if (!card) return;

    // If pointer was dragged across carousel, ignore click
    if (isDraggingMoved) {
      e.preventDefault();
      return;
    }

    const repo = card.dataset.repo;
    if (repo) {
      const aTag = e.target.closest('a');
      if (aTag && aTag.href) return;
      window.open(repo, '_blank', 'noopener,noreferrer');
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-repo]')) {
      const card = e.target.closest('[data-repo]');
      if (card && card === document.activeElement && card.dataset.repo) {
        e.preventDefault();
        window.open(card.dataset.repo, '_blank', 'noopener,noreferrer');
      }
    }
  });

  // Contact form: prepare an email and confirm the action.
  const contactForm = $('#contactForm');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#contactName').value.trim();
    const email = $('#contactEmail').value.trim();
    const message = $('#contactMessage').value.trim();
    if(!name || !email || !message){ contactForm.reportValidity(); return; }
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:thilinikavindya678@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      alert('Message ready to send! Your email app has been opened with the details.');
      contactForm.reset();
    }, 350);
  });

  // Auto moving infinite project showcase
  const viewport=$('#projectViewport'), track=$('#projectTrack'), prev=$('#projectPrev'), next=$('#projectNext'), dots=$('#carouselDots');
  let position=0, paused=false, speed=.38, dragging=false, startX=0, startPos=0, lastTime=performance.now();
  const cards=$$('.project-card'); const originalCount=6;
  for(let i=0;i<6;i++){const clone=cards[i].cloneNode(true);track.appendChild(clone)}
  function loopWidth(){return (track.children[0].getBoundingClientRect().width+18)*originalCount}
  function render(){track.style.transform=`translate3d(${-position}px,0,0)`;const w=loopWidth();if(position>=w)position-=w;if(position<0)position+=w}
  function animate(now){const dt=Math.min(32,now-lastTime);lastTime=now;if(!paused&&!dragging&&!matchMedia('(prefers-reduced-motion: reduce)').matches){position+=speed*dt;render()}requestAnimationFrame(animate)}requestAnimationFrame(animate);
  viewport.addEventListener('mouseenter',()=>paused=true);viewport.addEventListener('mouseleave',()=>paused=false);
  function moveBy(dir){paused=true;position+=dir*(cards[0].getBoundingClientRect().width+18);render();setTimeout(()=>paused=false,700)}
  prev?.addEventListener('click',()=>moveBy(-1));next?.addEventListener('click',()=>moveBy(1));
  viewport.addEventListener('pointerdown',e=>{
    dragging=true;
    isDraggingMoved=false;
    startX=e.clientX;
    dragStartX=e.clientX;
    dragStartY=e.clientY;
    startPos=position;
    viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=Math.abs(e.clientX-dragStartX);
    const dy=Math.abs(e.clientY-dragStartY);
    if(dx>6||dy>6) isDraggingMoved=true;
    position=startPos-(e.clientX-startX);
    render();
  });
  const stopDrag=()=>{dragging=false;viewport.classList.remove('dragging')};
  viewport.addEventListener('pointerup',stopDrag);
  viewport.addEventListener('pointercancel',stopDrag);
  for(let i=0;i<6;i++){const s=document.createElement('span');if(i===0)s.classList.add('active');dots.appendChild(s)}
  setInterval(()=>{const w=cards[0].getBoundingClientRect().width+18;const index=Math.round(position/w)%6;dots.querySelectorAll('span').forEach((d,i)=>d.classList.toggle('active',i===index))},400);

  // Magnetic button micro interaction
  if(matchMedia('(pointer:fine)').matches){$$('.magnetic').forEach(btn=>{btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08-4}px)`});btn.addEventListener('pointerleave',()=>btn.style.transform='')})}

  // Certificate Modal Lightbox Logic
  const certModal = $('#certModal');
  const certModalClose = $('#certModalClose');
  const certModalImg = $('#certModalImg');
  const certModalTitle = $('#certModalTitle');
  const certModalDownload = $('#certModalDownload');
  const certModalOpen = $('#certModalOpen');

  function openCertModal(imgSrc, titleText) {
    if (!certModal) return;
    certModalImg.src = imgSrc;
    certModalImg.alt = titleText;
    certModalTitle.textContent = titleText;
    certModalDownload.href = imgSrc;
    certModalDownload.download = titleText.replace(/\s+/g, '_') + '.jpg';
    certModalOpen.href = imgSrc;
    certModal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeCertModal() {
    if (!certModal) return;
    certModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('click', e => {
    const certCard = e.target.closest('[data-cert-img]');
    if (certCard) {
      const imgSrc = certCard.dataset.certImg;
      const titleText = certCard.dataset.certTitle || 'Certificate';
      openCertModal(imgSrc, titleText);
      return;
    }

    if (e.target === certModalClose || e.target.closest('#certModalClose') || e.target === certModal) {
      closeCertModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && certModal?.classList.contains('active')) {
      closeCertModal();
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-cert-img]')) {
      const certCard = e.target.closest('[data-cert-img]');
      if (certCard && certCard === document.activeElement) {
        e.preventDefault();
        openCertModal(certCard.dataset.certImg, certCard.dataset.certTitle || 'Certificate');
      }
    }
  });
});

