(() => {
  'use strict';
  const $=(sel)=>document.querySelector(sel);
  const $$=(sel)=>Array.from(document.querySelectorAll(sel));
  const clamp=(x)=>Math.min(1,Math.max(0,x));
  const smooth=(x)=>{x=clamp(x);return x*x*(3-2*x)};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const flight=$('#flight'),jet=$('#flight-jet'),stage=$('#flight-stage'),heroBg=$('.hero-bg');
  const lerp=(a,b,t)=>a+(b-a)*t;
  // Exact V1 keyframe trajectory: entering from the LEFT, passing center,
  // approaching camera and exiting to the RIGHT. Scroll position only.
  const flightPath=[
    {t:0.00,x:-113,y:35,a:-23,s:.48},
    {t:0.17,x:-70,y:25,a:-16,s:.61},
    {t:0.34,x:-17,y:8,a:-10,s:.86},
    {t:0.47,x:0,y:0,a:-7,s:1.05},
    {t:0.63,x:28,y:-9,a:-13,s:1.26},
    {t:0.78,x:65,y:-21,a:-21,s:1.45},
    {t:1.00,x:155,y:-36,a:-30,s:1.8}
  ];
  function poseAt(t){
    let k=0;
    while(k<flightPath.length-2 && t>flightPath[k+1].t) k++;
    const a=flightPath[k],b=flightPath[k+1];
    const f=smooth((t-a.t)/(b.t-a.t));
    return {x:lerp(a.x,b.x,f),y:lerp(a.y,b.y,f),a:lerp(a.a,b.a,f),s:lerp(a.s,b.s,f)};
  }
  let scheduled=false;
  function render(){
    scheduled=false;
    const totalScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    document.documentElement.style.setProperty('--progress',clamp(scrollY/totalScroll).toFixed(4));
    const header=$('#header');
    if(header)header.classList.toggle('is-scrolled',scrollY>38);
    if(reduce.matches)return;
    if(heroBg){const shift=clamp(window.scrollY/(window.innerHeight||1));heroBg.style.transform=`scale(${(1.03+shift*.055).toFixed(3)}) translateY(${(-shift*1.4).toFixed(2)}%)`;}
    if(!flight||!jet||!stage)return;
    const r=flight.getBoundingClientRect();
    if(r.top>innerHeight*1.5||r.bottom<-innerHeight*.5)return;
    const p=clamp(-r.top/Math.max(1,flight.offsetHeight-innerHeight));
    const k=poseAt(p);
    jet.style.transform=`translate(calc(-50% + ${k.x.toFixed(2)}vw),calc(-50% + ${k.y.toFixed(2)}vh)) rotate(${k.a.toFixed(2)}deg) scale(${k.s.toFixed(3)})`;
    const textOpacity=smooth((p-.04)/.12)*(1-smooth((p-.72)/.13));
    const trailOpacity=smooth((p-.12)/.24)*(1-smooth((p-.71)/.22));
    stage.style.setProperty('--fp',p.toFixed(3));
    stage.style.setProperty('--heading-opacity',textOpacity.toFixed(3));
    stage.style.setProperty('--heading-shift',((.5-p)*110).toFixed(2));
    stage.style.setProperty('--contrail-opacity',trailOpacity.toFixed(3));
    stage.style.setProperty('--trail',smooth((p-.15)/.49).toFixed(3));
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(render)}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduce.addEventListener?.('change',schedule);schedule();
  const menu=$('#menu'),menuButton=$('#menu-button');
  function closeMenu(){if(!menu)return;menu.classList.remove('is-open');menu.setAttribute('aria-hidden','true');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');document.body.style.overflow=''}
  function toggleMenu(){const opened=menu.classList.toggle('is-open');menu.setAttribute('aria-hidden',String(!opened));menuButton.setAttribute('aria-expanded',String(opened));menuButton.setAttribute('aria-label',opened?'Close menu':'Open menu');document.body.style.overflow=opened?'hidden':''}
  menuButton.addEventListener('click',toggleMenu);menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  // Image sources are editorial references to the games/hardware, not project screenshots.
  $$('.external-photo').forEach(img=>{img.addEventListener('error',()=>img.classList.add('is-unavailable'));if(img.complete&&!img.naturalWidth)img.classList.add('is-unavailable')});
  // In-view motion: subtle once-only reveals; no effect if JS or motion support is missing.
  if('IntersectionObserver' in window){
    const revealItems=$$('.section-kicker, .intro-layout > *, .expertise-stripe > div, .work-heading-grid > *, .project-visual, .project-meta, .project-inner > *, .project-bottom, .more-heading > *, .project-list a, .expertise-grid > h2, .expertise-details > div, .contact-grid > *');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(({target,isIntersecting})=>{
        if(!isIntersecting)return;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    },{threshold:.08,rootMargin:'0px 0px -8% 0px'});
    revealItems.forEach((el,i)=>{
      el.dataset.reveal=el.classList.contains('project-visual')?'photo':'content';
      el.style.setProperty('--reveal-delay',`${(i%3)*75}ms`);
      observer.observe(el);
    });
    document.documentElement.classList.add('has-js-motion');
  }
  // The active link follows the reader without changing scrolling behaviour.
  if('IntersectionObserver' in window){
    const navObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        $$('.desktop-nav a').forEach(link=>{
          link.classList.toggle('is-active',link.getAttribute('href')==='#'+entry.target.id);
        });
      }
    },{rootMargin:'-22% 0px -60% 0px'});
    ['intro','work','expertise','contact'].forEach(id=>{
      const el=document.getElementById(id);if(el)navObserver.observe(el);
    });
  }
  // Very restrained pointer movement on project photography (desktop only).
  if(matchMedia('(pointer:fine)').matches){
    $$('.project-visual').forEach(box=>{
      let raf=0,dx=0,dy=0;
      box.addEventListener('pointermove',e=>{
        if(reduce.matches)return;
        const r=box.getBoundingClientRect();
        dx=(((e.clientX-r.left)/r.width)-.5)*-14;
        dy=(((e.clientY-r.top)/r.height)-.5)*-12;
        if(raf)return;
        raf=requestAnimationFrame(()=>{
          box.style.setProperty('--px',dx.toFixed(1)+'px');
          box.style.setProperty('--py',dy.toFixed(1)+'px');
          raf=0;
        });
      },{passive:true});
      box.addEventListener('pointerleave',()=>{
        if(raf){cancelAnimationFrame(raf);raf=0;}
        box.style.setProperty('--px','0px');box.style.setProperty('--py','0px');
      });
    });
  }
  if($('#year')) $('#year').textContent=new Date().getFullYear();
})();
