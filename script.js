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
    const textOpacity=smooth((p-.05)/.11)*(1-smooth((p-.22)/.13));
    const trailOpacity=smooth((p-.12)/.24)*(1-smooth((p-.71)/.22));
    const wipe=smooth((p-.77)/.22);
    stage.style.setProperty('--fp',p.toFixed(3));
    stage.style.setProperty('--heading-opacity',textOpacity.toFixed(3));
    stage.style.setProperty('--heading-shift',((.5-p)*110).toFixed(2));
    stage.style.setProperty('--contrail-opacity',trailOpacity.toFixed(3));
    stage.style.setProperty('--trail',smooth((p-.15)/.49).toFixed(3));
    stage.style.setProperty('--wipe-top',`${(100-wipe*100).toFixed(2)}%`);
    const pct=$('#flight-pct');if(pct)pct.textContent=String(Math.floor(p*100)).padStart(2,'0')+'%';
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(render)}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduce.addEventListener?.('change',schedule);schedule();
  const menu=$('#menu'),menuButton=$('#menu-button');
  function closeMenu(){if(!menu)return;menu.classList.remove('is-open');menu.setAttribute('aria-hidden','true');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',lang==='fr'?'Ouvrir le menu':'Open menu');document.body.style.overflow=''}
  function toggleMenu(){const opened=menu.classList.toggle('is-open');menu.setAttribute('aria-hidden',String(!opened));menuButton.setAttribute('aria-expanded',String(opened));menuButton.setAttribute('aria-label',opened?(lang==='fr'?'Fermer le menu':'Close menu'):(lang==='fr'?'Ouvrir le menu':'Open menu'));document.body.style.overflow=opened?'hidden':''}
  menuButton.addEventListener('click',toggleMenu);menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  const fr={flightReveal:'Les projets.',skip:'Aller aux projets',navAbout:'À propos',navWork:'Projets',navExpertise:'Outils',navContact:'Contact',heroTop:'Portfolio personnel',heroEyeline:'Salut, bienvenue.',heroLine1:'Moi, c’est',heroLine2:'Speedstu.',heroLine3:'Des essais.',heroDescription:'Je code des bots pour Rocket League, je fais des essais autour de Trackmania et je travaille sur des outils pour GPU AMD. Voilà ce que je construis pendant mon temps libre.',discover:'Faire un tour',heroBottom:'Projets perso · speedstu.tech',scroll:'Scroller',introLabel:'À propos',introTitle:'Je passe beaucoup de temps à faire apprendre des bots à jouer.',introText:'Rocket League prend une grosse place dans mes projets : j’entraîne des bots, je regarde leurs erreurs et j’essaie d’améliorer leur façon de jouer. À côté, je m’amuse avec la simulation Trackmania et des outils pour mes cartes AMD.',introText2:'Je publie ce que je peux partager sur GitHub. Le reste est encore en cours dans des dépôts privés.',seeGithub:'Voir mes dépôts GitHub',field1:'Bots Rocket League',field2:'Trackmania & simulation',field3:'GPU AMD & outils',flightCopy:'Une transition, puis retour au concret.',flightBottom:'DÉFILER POUR CONTINUER',workLabel:'Projets',workTitle:'Mes projets.',workCopy:'Trois projets en détail, puis quelques autres dépôts à explorer sur GitHub.',private:'Code privé',public:'Dépôt public',rocketCredit:'Visuel du jeu Rocket League, non du bot',trackCredit:'Capture du jeu Trackmania, non du simulateur',gpuCredit:'Photo : Padgriffin · CC BY 4.0',velocityKind:'Entraînement de bots',velocityText:'VelocityRL est mon espace de travail pour entraîner des bots Rocket League, les faire jouer entre eux et comparer leurs résultats. J’y essaie notamment PPO et V-trace.',velocityBottom:'Code privé pour l’instant.',tmKind:'Simulation de course',tmText:'Avec TM2020-Sim, je peux tester des contrôleurs Trackmania sans ouvrir le jeu à chaque essai. Je travaille sur la physique, les trajectoires et un SDK C++/Rust.',openRepo:'Voir le dépôt GitHub',tmBottom:'Une version de travail est disponible sur GitHub.',cudaKind:'Mes essais CUDA sur AMD',cudaText:'J’essaie de faire tourner des programmes conçus pour CUDA sur des GPU AMD sous Windows. Le dépôt rassemble mes essais avec ZLUDA, HIP et des tests de compatibilité.',cudaBottom:'Tous les programmes CUDA ne sont pas compatibles.',moreLabel:'Autres projets',moreTitle:'Autres projets.',allRepos:'Tous les dépôts',native:'Entraînement Rocket League en C++ / Rust',evil:'Lanceur de matchs et bots RLBot v4/v5',airdribble:'Bot spécialisé dans le contrôle aérien',expertiseLabel:'Ce que j’utilise',expertiseTitle:'Mes outils.',ex1:'Simulation',ex1Text:'Moteurs physiques, exécution sans rendu et comparaison de trajectoires.',ex2:'Apprentissage par renforcement',ex2Text:'Entraînement de politiques, auto-jeu et évaluation reproductible.',ex3:'Systèmes & GPU',ex3Text:'C++, Rust, Python, compatibilité logicielle et tests de justesse.',contactTitle:'my github',contactText:'Je suis étudiant en cybersécurité et je code ces projets en dehors des cours. Tu peux suivre les mises à jour et explorer les dépôts publics sur mon GitHub.',independent:'Un portfolio perso. Les jeux et marques restent à leurs propriétaires.',back:'Retour en haut ↑'};
  const en={flightReveal:'The projects.',skip:'Skip to projects',navAbout:'About',navWork:'Projects',navExpertise:'Tools',navContact:'Contact',heroTop:'Personal portfolio',heroEyeline:'Hey, welcome.',heroLine1:'Hey, I’m',heroLine2:'Speedstu.',heroLine3:'Testing.',heroDescription:'I code Rocket League bots, experiment with Trackmania simulations and build tools for AMD GPUs. This is what I work on in my free time.',discover:'Explore the site',heroBottom:'Personal projects · speedstu.tech',scroll:'Scroll',introLabel:'About',introTitle:'I spend a lot of time teaching bots how to play.',introText:'Rocket League is a big part of what I build: I train bots, look at their mistakes and try to improve their play. I also experiment with Trackmania simulation and tools for my AMD GPUs.',introText2:'I share what I can on GitHub. The rest is still in progress in private repositories.',seeGithub:'Explore my GitHub repositories',field1:'Rocket League bots',field2:'Trackmania & simulation',field3:'AMD GPU & tooling',flightCopy:'A brief interlude, then back to the work.',flightBottom:'SCROLL TO CONTINUE',workLabel:'Projects',workTitle:'My projects.',workCopy:'Three projects in more detail, plus a few other GitHub repositories worth checking out.',private:'Private code',public:'Public repository',rocketCredit:'Rocket League game image; not a bot screenshot',trackCredit:'Trackmania game image; not a simulator screenshot',gpuCredit:'Photo: Padgriffin · CC BY 4.0',velocityKind:'Bot training',velocityText:'VelocityRL is where I train Rocket League bots, have them play each other and compare results. I experiment with PPO and V-trace among other methods.',velocityBottom:'Code is private for now.',tmKind:'Racing simulation',tmText:'TM2020-Sim lets me test Trackmania controllers without opening the game for every run. I work on the physics, trajectories and a C++/Rust SDK.',openRepo:'Explore on GitHub',tmBottom:'A work-in-progress version is on GitHub.',cudaKind:'My CUDA-on-AMD experiments',cudaText:'I’m trying to run programs built for CUDA on AMD GPUs under Windows. This repo collects my ZLUDA, HIP and compatibility-testing work.',cudaBottom:'Not every CUDA workload is compatible.',moreLabel:'More projects',moreTitle:'Other projects.',allRepos:'All repositories',native:'Rocket League training in C++ / Rust',evil:'RLBot v4/v5 match and bot launcher',airdribble:'Aerial-control Rocket League bot',expertiseLabel:'What I use',expertiseTitle:'My tools.',ex1:'Simulation',ex1Text:'Physics engines, headless execution and trajectory evaluation.',ex2:'Reinforcement learning',ex2Text:'Policy training, self-play and reproducible evaluation.',ex3:'Systems & GPU',ex3Text:'C++, Rust, Python, software compatibility and correctness testing.',contactTitle:'my github',contactText:'I study cybersecurity and build these projects outside class. You can follow updates and explore the public code on my GitHub profile.',independent:'A personal portfolio. All games and trademarks belong to their owners.',back:'Back to top ↑'};
  let lang='fr';
  function setLang(next){lang=next;document.documentElement.lang=next;const dict=next==='fr'?fr:en;$$('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(dict[key])el.textContent=dict[key]});const button=$('#language');button.innerHTML=next==='fr'?'<span class="active-lang">FR</span><span class="language-sep">/</span><span class="other-lang">EN</span>':'<span class="other-lang">FR</span><span class="language-sep">/</span><span class="active-lang">EN</span>';button.setAttribute('aria-label',next==='fr'?'Switch to English':'Passer en français');closeMenu()}
  $('#language').addEventListener('click',()=>setLang(lang==='fr'?'en':'fr'));
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
