/* Speedstu / Index 12.
   Progressive enhancement only: native scroll, no scroll hijacking.
   The single horizontal gallery is driven by the same vertical document scroll.
   Pointer interactions are intentionally restrained; no continuous GPU loop. */
(() => {
  'use strict';
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
  const clamp = (x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const ease=x=>{const t=clamp(x);return t*t*(3-2*t);};
  document.documentElement.classList.add('enhanced');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 850px)');
  const header=$('#nav'),progressBar=$('.read-progress span');
  const work=$('#work'),stage=$('.gallery-stage'),track=$('#gallery-track');
  const current=$('#gallery-current'),rail=$('#gallery-rail');
  const slideImages=$$('.slide-image');
  const hero=$('.hero'),heroGallery=$('.hero-gallery');
  const tiles=$$('.hero-photo');
  const marin=$('#marin'),marinImage=$('.marin-image');
  const menuButton=$('#menu-button'),menu=$('#mobile-menu');
  let scrollScheduled=false, pointerScheduled=false;
  let cursorX=.5,cursorY=.5;

  // Simple mobile menu with Escape handling and no fake controls.
  function closeMenu(){
    menu.hidden=true;
    menuButton.setAttribute('aria-expanded','false');
    menuButton.setAttribute('aria-label','Open menu');
  }
  menuButton.addEventListener('click',()=>{
    const open=menu.hidden;
    menu.hidden=!open;
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  mobile.addEventListener?.('change',e=>{if(!e.matches)closeMenu();});

  function updateTheme(y){
    const workTop=work.getBoundingClientRect().top+y;
    const otherTop=$('#other').getBoundingClientRect().top+y;
    const contactTop=$('#contact').getBoundingClientRect().top+y;
    const dark=(y>=workTop-innerHeight*.30 && y<otherTop-innerHeight*.32) || y>=contactTop-innerHeight*.30;
    header.classList.toggle('dark',dark);
    header.classList.toggle('scrolled',y>24);
    $$('.nav-links a').forEach(link=>{
      const dest=link.getAttribute('href');
      const active=(dest==='#work' && y>=workTop-innerHeight*.45 && y<otherTop) ||
        (dest==='#about' && y>=marin.offsetTop && y<contactTop);
      link.classList.toggle('active',active);
    });
  }
  function onScroll(){
    scrollScheduled=false;
    const y=scrollY||0;
    const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progressBar.style.transform='scaleX('+clamp(y/total).toFixed(5)+')';
    updateTheme(y);

    if(!mobile.matches && !reduce.matches){
      const rect=work.getBoundingClientRect();
      const distance=Math.max(1,work.offsetHeight-innerHeight);
      const p=clamp(-rect.top/distance);
      const maxX=2*innerWidth;
      track.style.transform='translate3d('+(-p*maxX).toFixed(2)+'px,0,0)';
      current.textContent=String(clamp(Math.round(p*2)+1,1,3)).padStart(2,'0');
      rail.style.transform='scaleX('+(p).toFixed(5)+')';
      slideImages.forEach((image,i)=>{
        const delta=i-2*p;
        image.style.transform='translate3d('+(-delta*22).toFixed(1)+'px,0,0) scale(1.08)';
      });
    } else {
      track.style.transform='none';
      slideImages.forEach(el=>el.style.transform='none');
    }

    if(!reduce.matches){
      const rect=marin.getBoundingClientRect();
      if(rect.bottom>0&&rect.top<innerHeight){
        const t=clamp((innerHeight-rect.top)/(rect.height+innerHeight));
        marinImage.style.setProperty('--marin-y',((t-.5)*48).toFixed(2)+'px');
      }
    }
  }
  function scheduleScroll(){
    if(scrollScheduled)return;
    scrollScheduled=true;
    requestAnimationFrame(onScroll);
  }
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',scheduleScroll,{passive:true});
  addEventListener('pageshow',scheduleScroll);
  mobile.addEventListener?.('change',scheduleScroll);
  reduce.addEventListener?.('change',scheduleScroll);

  // Very light parallax on the collage, never on text.
  function pointerTick(){
    pointerScheduled=false;
    const dx=(cursorX-.5)*2,dy=(cursorY-.5)*2;
    tiles.forEach(tile=>{
      const depth=Number(tile.dataset.depth)||0;
      tile.style.setProperty('--dx',(dx*depth*15).toFixed(2)+'px');
      tile.style.setProperty('--dy',(dy*depth*12).toFixed(2)+'px');
    });
  }
  hero.addEventListener('pointermove',e=>{
    if(reduce.matches||mobile.matches)return;
    cursorX=clamp(e.clientX/innerWidth);
    cursorY=clamp(e.clientY/innerHeight);
    if(pointerScheduled)return;
    pointerScheduled=true;
    requestAnimationFrame(pointerTick);
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{
    tiles.forEach(tile=>{
      tile.style.setProperty('--dx','0px');
      tile.style.setProperty('--dy','0px');
    });
  });
  scheduleScroll();
})();
