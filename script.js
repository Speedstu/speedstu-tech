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
    if(reduce.matches)return;
    if(heroBg){const shift=clamp(window.scrollY/(window.innerHeight||1));heroBg.style.transform=`scale(${(1.03+shift*.055).toFixed(3)}) translateY(${(-shift*1.4).toFixed(2)}%)`;}
    if(!flight||!jet||!stage)return;
    const r=flight.getBoundingClientRect();
    if(r.top>innerHeight*1.5||r.bottom<-innerHeight*.5)return;
    const p=clamp(-r.top/Math.max(1,flight.offsetHeight-innerHeight));
    const k=poseAt(p);
    jet.style.transform=`translate(calc(-50% + ${k.x.toFixed(2)}vw),calc(-50% + ${k.y.toFixed(2)}vh)) rotate(${k.a.toFixed(2)}deg) scale(${k.s.toFixed(3)})`;
    const textOpacity=smooth((p-.12)/.17)*(1-smooth((p-.61)/.19));
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
  const fr={flightReveal:'MES PROJETS.',skip:'Aller aux projets',navAbout:'À propos',navWork:'Projets',navExpertise:'Technos',navContact:'Contact',heroTop:'PORTFOLIO PERSONNEL / 2026',heroEyeline:'MES PROJETS / 2026',heroLine1:'SPEEDSTU.',heroLine2:'MES PROJETS.',heroLine3:'Des essais.',heroDescription:'Je développe des bots Rocket League, des simulateurs Trackmania et des outils pour GPU AMD. J’ai rassemblé ici les projets sur lesquels je travaille.',discover:'Voir mes projets',heroBottom:'PROJETS PERSONNELS / SPEEDSTU.TECH',scroll:'DÉFILER',introLabel:'À PROPOS',introTitle:'Bots Rocket League, simulations et outils système.',introText:'Je passe pas mal de temps sur Rocket League, Trackmania et les GPU AMD. J’aime comprendre la physique, entraîner des agents et construire les outils qui vont avec.',introText2:'Certains projets sont publics sur GitHub, d’autres sont encore en cours et restent privés.',seeGithub:'Voir mes dépôts GitHub',field1:'Simulation physique',field2:'Agents autonomes',field3:'GPU & logiciel bas niveau',flightCopy:'Une transition, puis retour au concret.',flightBottom:'DÉFILER POUR CONTINUER',workLabel:'PROJETS',workTitle:'Mes projets.',workCopy:'Une sélection de mes projets. Les dépôts publics sont directement accessibles sur GitHub.',private:'DÉPÔT PRIVÉ',public:'OPEN SOURCE',rocketCredit:'Visuel du jeu Rocket League, non du bot',trackCredit:'Capture du jeu Trackmania, non du simulateur',gpuCredit:'Visuel produit AMD — RX 9060 XT',velocityKind:'ENTRAÎNEMENT D’AGENTS',velocityText:'Un environnement de travail pour entraîner et évaluer des agents Rocket League, avec PPO, V-trace, self-play et différents backends de simulation.',velocityBottom:'Développement privé · présentation du projet',tmKind:'SIMULATION & CONTRÔLE',tmText:'Une simulation Trackmania sans interface graphique, avec un SDK C++/Rust, un moteur physique Gearbox et des contrôleurs capables de suivre des trajectoires.',openRepo:'Voir le dépôt GitHub',tmBottom:'Les contrôleurs publiés ne sont pas des politiques PPO.',cudaKind:'COMPATIBILITÉ GPU / WINDOWS',cudaText:'Une pile de compatibilité basée sur ZLUDA et HIP pour exécuter certaines charges CUDA sur des GPU AMD sous Windows. Avec des tests pour distinguer une vraie exécution GPU d’un résultat incorrect.',cudaBottom:'Compatibilité partielle et dépendante des charges testées.',moreLabel:'AUTRES PROJETS',moreTitle:'Autres projets.',allRepos:'Tous les dépôts',native:'Entraînement Rocket League en C++ / Rust',evil:'Lanceur de matchs et bots RLBot v4/v5',airdribble:'Bot spécialisé dans le contrôle aérien',expertiseLabel:'TECHNOS',expertiseTitle:'Ce que j’utilise.',ex1:'Simulation',ex1Text:'Moteurs physiques, exécution sans rendu et comparaison de trajectoires.',ex2:'Apprentissage par renforcement',ex2Text:'Entraînement de politiques, auto-jeu et évaluation reproductible.',ex3:'Systèmes & GPU',ex3Text:'C++, Rust, Python, compatibilité logicielle et tests de justesse.',contactTitle:'À propos.',contactText:'Je suis étudiant en cybersécurité. Je développe ces projets sur mon temps libre, et je publie le code de ceux que je peux partager sur GitHub.',independent:'Portfolio indépendant. Marques et jeux cités appartenant à leurs titulaires.',back:'Retour en haut ↑'};
  const en={flightReveal:'MY PROJECTS.',skip:'Skip to projects',navAbout:'About',navWork:'Projects',navExpertise:'Tech',navContact:'Contact',heroTop:'PERSONAL PORTFOLIO / 2026',heroEyeline:'MY PROJECTS / 2026',heroLine1:'SPEEDSTU.',heroLine2:'MY PROJECTS.',heroLine3:'Testing.',heroDescription:'I build Rocket League bots, Trackmania simulators and tools for AMD GPUs. This is where I keep the projects I work on.',discover:'See my projects',heroBottom:'PERSONAL PROJECTS / SPEEDSTU.TECH',scroll:'SCROLL',introLabel:'ABOUT',introTitle:'Rocket League bots, simulations and systems tools.',introText:'I spend a lot of time working with Rocket League, Trackmania and AMD GPUs. I like understanding the physics, training agents and building the tooling around them.',introText2:'Some projects are public on GitHub. Others are still in progress and remain private.',seeGithub:'Explore my GitHub repositories',field1:'Physics simulation',field2:'Autonomous agents',field3:'GPU & low-level software',flightCopy:'A brief interlude, then back to the work.',flightBottom:'SCROLL TO CONTINUE',workLabel:'PROJECTS',workTitle:'My projects.',workCopy:'A selection of my projects. The public repositories are linked directly on GitHub.',private:'PRIVATE REPOSITORY',public:'OPEN SOURCE',rocketCredit:'Rocket League game image; not a bot screenshot',trackCredit:'Trackmania game image; not a simulator screenshot',gpuCredit:'AMD product image — RX 9060 XT',velocityKind:'AGENT TRAINING',velocityText:'A working environment for training and evaluating Rocket League agents, with PPO, V-trace, self-play and multiple simulation backends.',velocityBottom:'Private development · project overview',tmKind:'SIMULATION & CONTROL',tmText:'Headless Trackmania simulation with a C++/Rust SDK, Gearbox physics and trajectory-tracking controllers.',openRepo:'Explore on GitHub',tmBottom:'Published controllers are not PPO policies.',cudaKind:'GPU COMPATIBILITY / WINDOWS',cudaText:'A ZLUDA/HIP compatibility stack for running supported CUDA workloads on AMD GPUs under Windows, with tests to distinguish real GPU execution from incorrect outputs.',cudaBottom:'Workload-specific and incomplete compatibility.',moreLabel:'OTHER PROJECTS',moreTitle:'Other projects.',allRepos:'All repositories',native:'Rocket League training in C++ / Rust',evil:'RLBot v4/v5 match and bot launcher',airdribble:'Aerial-control Rocket League bot',expertiseLabel:'TECH',expertiseTitle:'What I use.',ex1:'Simulation',ex1Text:'Physics engines, headless execution and trajectory evaluation.',ex2:'Reinforcement learning',ex2Text:'Policy training, self-play and reproducible evaluation.',ex3:'Systems & GPU',ex3Text:'C++, Rust, Python, software compatibility and correctness testing.',contactTitle:'About me.',contactText:'I study cybersecurity and build these projects in my free time. I publish the code I can share on GitHub.',independent:'Independent portfolio. Trademarks and games remain the property of their owners.',back:'Back to top ↑'};
  let lang='fr';
  function setLang(next){lang=next;document.documentElement.lang=next;const dict=next==='fr'?fr:en;$$('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(dict[key])el.textContent=dict[key]});const button=$('#language');button.innerHTML=next==='fr'?'<span class="active-lang">FR</span><span class="language-sep">/</span><span class="other-lang">EN</span>':'<span class="other-lang">FR</span><span class="language-sep">/</span><span class="active-lang">EN</span>';button.setAttribute('aria-label',next==='fr'?'Switch to English':'Passer en français');closeMenu()}
  $('#language').addEventListener('click',()=>setLang(lang==='fr'?'en':'fr'));
  // Image sources are editorial references to the games/hardware, not project screenshots.
  $$('.external-photo').forEach(img=>{img.addEventListener('error',()=>img.classList.add('is-unavailable'));if(img.complete&&!img.naturalWidth)img.classList.add('is-unavailable')});
  $('#year').textContent=new Date().getFullYear();
})();
