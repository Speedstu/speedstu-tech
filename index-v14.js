/* speedstu / V14. Exact V1 aircraft choreography with native scroll.
   No autoplay loops, virtual scrolling, or third-party code. */
(()=>{
 'use strict';
 document.documentElement.classList.add('js');
 const $=(s,r=document)=>r.querySelector(s);
 const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
 const mix=(a,b,t)=>a+(b-a)*t;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const narrow=matchMedia('(max-width: 760px)');
 const flight=$('#flight'),frame=$('#flight-frame'),plane=$('#plane');
 const coverPicture=$('.cover-picture'),work=$('#work'),nav=$('#nav');
 const entries=$$('.work-entry'),pictures=$$('.work-image');
 const flightPath=[
   {t:0.00,x:-113,y:35,a:-23,s:.48},
   {t:0.17,x:-70,y:25,a:-16,s:.61},
   {t:0.34,x:-17,y:8,a:-10,s:.86},
   {t:0.47,x:0,y:0,a:-7,s:1.05},
   {t:0.63,x:28,y:-9,a:-13,s:1.26},
   {t:0.78,x:65,y:-21,a:-21,s:1.45},
   {t:1.00,x:155,y:-36,a:-30,s:1.8}
 ];
 function poseAt(p){
   let i=0;
   while(i<flightPath.length-2&&p>flightPath[i+1].t)i++;
   const a=flightPath[i],b=flightPath[i+1],n=smooth((p-a.t)/(b.t-a.t));
   return {x:mix(a.x,b.x,n),y:mix(a.y,b.y,n),a:mix(a.a,b.a,n),s:mix(a.s,b.s,n)};
 }
 let scheduled=false,pointerProject=null,activeProject='rl',scrollProject='rl';
 function setActiveProject(id){
   if(!id||id===activeProject)return;
   activeProject=id;
   entries.forEach(e=>e.classList.toggle('is-active',e.dataset.project===id));
   pictures.forEach(e=>e.classList.toggle('is-active',e.dataset.image===id));
 }
 entries.forEach(entry=>{
   entry.addEventListener('pointerenter',()=>{
     if(narrow.matches)return;
     pointerProject=entry.dataset.project;setActiveProject(pointerProject);
   });
   entry.addEventListener('pointerleave',()=>{
     pointerProject=null;setActiveProject(scrollProject);
   });
   entry.addEventListener('focusin',()=>setActiveProject(entry.dataset.project));
   entry.addEventListener('focusout',()=>requestAnimationFrame(()=>{
     if(!entry.contains(document.activeElement))setActiveProject(pointerProject||scrollProject);
   }));
 });
 function update(){
   scheduled=false;
   const vh=Math.max(1,innerHeight),y=scrollY||0;
   const flightBox=flight.getBoundingClientRect();
   const workBox=work.getBoundingClientRect();
   const p=clamp(-flightBox.top/Math.max(1,flight.offsetHeight-vh));
   const light=y>=work.offsetTop-vh*.24 && y<$('#contact').offsetTop-vh*.35;
   nav.classList.toggle('is-light',light);
   if(!reduce.matches){
     const c=clamp(y/(vh*1.15));
     coverPicture.style.setProperty('--cover-scale',(1.015+c*.09).toFixed(4));
     coverPicture.style.setProperty('--cover-y',(-c*.7).toFixed(3)+'%');
     const k=poseAt(p);
     plane.style.transform='translate(calc(-50% + '+k.x.toFixed(2)+'vw),calc(-50% + '+k.y.toFixed(2)+'vh)) rotate('+k.a.toFixed(2)+'deg) scale('+k.s.toFixed(3)+')';
     const word=smooth((p-.05)/.15)*(1-smooth((p-.73)/.14));
     const trail=smooth((p-.12)/.25)*(1-smooth((p-.69)/.23));
     frame.style.setProperty('--word-opacity',word.toFixed(4));
     frame.style.setProperty('--flight-p',p.toFixed(4));
     frame.style.setProperty('--trail-size',smooth((p-.10)/.5).toFixed(4));
     frame.style.setProperty('--trail-opacity',trail.toFixed(4));
     frame.style.setProperty('--whiteout',(100-100*smooth((p-.86)/.14)).toFixed(3)+'%');
   }
   if(!narrow.matches&&workBox.top<vh*.95&&workBox.bottom>0){
     const aim=vh*.43;let dist=Infinity,id='rl';
     for(const entry of entries){
       const b=entry.getBoundingClientRect();
       const d=Math.abs((b.top+b.bottom)*.5-aim);
       if(d<dist){dist=d;id=entry.dataset.project;}
     }
     scrollProject=id;
     if(!pointerProject)setActiveProject(id);
   }
 }
 function requestUpdate(){if(scheduled)return;scheduled=true;requestAnimationFrame(update);}
 addEventListener('scroll',requestUpdate,{passive:true});
 addEventListener('resize',requestUpdate,{passive:true});
 addEventListener('pageshow',requestUpdate);
 reduce.addEventListener?.('change',requestUpdate);
 narrow.addEventListener?.('change',requestUpdate);
 requestUpdate();
})();
