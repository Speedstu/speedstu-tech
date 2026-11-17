/* speedstu V13 / Flight Study.
   A lightweight perspective wake-field, rendered ONLY during the Rafale shot.
   The original V1 aircraft keyframes live untouched in script.js. */
(() => {
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const smooth=t=>{const a=clamp(t);return a*a*(3-2*a);};
  const fine=matchMedia('(pointer:fine)');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const flight=$('#flight');
  const stage=$('#flight-stage');
  const canvas=$('#flight-depth');
  const hero=$('#home');
  if(!flight||!stage||!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
  if(!ctx)return;
  const TAU=2*Math.PI;
  const mobile=matchMedia('(max-width:700px)');
  const count=mobile.matches?16:36;
  const rays=mobile.matches?22:36;
  const zStep=mobile.matches?.75:.49;
  let dpr=1,w=0,h=0,frame=0,visible=false;
  let pointerX=0,pointerY=0,elapsed=0,last=0,lastDraw=0;
  let scrollProgress=0;
  const highFps=matchMedia('(min-width: 1100px)');
  function resize(){
    dpr=Math.min(mobile.matches?1:1.45,devicePixelRatio||1);
    w=Math.max(1,innerWidth);h=Math.max(1,innerHeight);
    canvas.width=Math.round(w*dpr);
    canvas.height=Math.round(h*dpr);
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function progress(){
    const r=flight.getBoundingClientRect();
    return clamp(-r.top/Math.max(1,flight.offsetHeight-innerHeight));
  }
  // Every wake line is a real 3D curve projected onto this 2D view.
  // No fake particle stock image and no expensive always-on WebGL scene.
  function project(angle,z,seed,phase){
    const curve=Math.sin(z*.28+phase*.35+seed*3.)*.13 + Math.sin(z*.14+seed)*.12;
    const radius=1.45+Math.sin(z*.19+angle*3+seed)*.15;
    const yaw=pointerX*.13, pitch=pointerY*.1;
    const x=radius*Math.cos(angle)+curve+Math.sin(seed*6.)*.13;
    const y=radius*Math.sin(angle)*.72+Math.cos(z*.27+seed)*.1;
    const qx=x*Math.cos(yaw)-z*Math.sin(yaw)*.11;
    const qy=y*Math.cos(pitch)+z*Math.sin(pitch)*.04;
    const denom=z+2.6;
    const focal=Math.min(w,h*1.4)*3.2;
    return {
      x:w*.55+(qx*focal/denom),
      y:h*.53+(qy*focal/denom),
      z
    };
  }
  function render(now){
    frame=0;
    if(!visible || document.hidden)return;
    const reduceMotion=reduce.matches;
    // On fast displays, this scene still draws at max 30fps.
    if(reduceMotion && lastDraw)return;
    if(now-lastDraw<(mobile.matches?55:33))return;
    const p=progress();
    scrollProgress=p;
    if(!reduceMotion)elapsed+=Math.min(.05,(now-last||33)/1000);
    last=now;lastDraw=now;
    ctx.clearRect(0,0,w,h);
    const phase=p*6.6+(reduceMotion?0:elapsed*.13);
    const alpha=smooth((p+.08)/.28)*(1-smooth((p-.77)/.25));
    if(alpha<.015)return;
    ctx.save();
    ctx.globalAlpha=alpha;
    // Perspective threads — projected from x/y/z into viewport coordinates.
    // The camera shifts subtly as the pointer moves.
    for(let i=0;i<count;i++){
      const a=(i/count)*TAU;
      const seed=i*1.618;
      const hue= i%9===0?226:208;
      const lineAlpha=.045+((i*37)%11)/500;
      ctx.beginPath();
      for(let k=0;k<=rays;k++){
        const z=.8+k*zStep+((phase*.65+i*.017)%zStep);
        const q=project(a,z,seed,phase);
        if(k===0)ctx.moveTo(q.x,q.y);
        else ctx.lineTo(q.x,q.y);
      }
      ctx.lineWidth=i%9===0?1.1:.62;
      ctx.strokeStyle='hsla('+hue+',30%,91%,'+lineAlpha.toFixed(3)+')';
      ctx.stroke();
    }
    // Transverse rings increase the sense of motion toward the centre.
    for(let k=0;k<(mobile.matches?9:18);k++){
      const z=2.3+k*1.08-((phase*.8)%1.08);
      if(z<1.25)continue;
      const opacity=Math.max(0,.19-z*.0065);
      ctx.beginPath();
      for(let j=0;j<=(mobile.matches?48:96);j++){
        const a=j/(mobile.matches?48:96)*TAU;
        const q=project(a,z,k*.2,phase);
        if(j===0)ctx.moveTo(q.x,q.y);
        else ctx.lineTo(q.x,q.y);
      }
      ctx.lineWidth=.65;
      ctx.strokeStyle='rgba(220,239,245,'+opacity.toFixed(3)+')';
      ctx.stroke();
    }
    // One low-cost atmospheric highlight aligned with the vanishing point.
    const grad=ctx.createRadialGradient(w*.55,h*.53,0,w*.55,h*.53,Math.min(w,h)*.45);
    grad.addColorStop(0,'rgba(240,251,255,.12)');
    grad.addColorStop(.5,'rgba(219,237,244,.025)');
    grad.addColorStop(1,'rgba(219,237,244,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }
  function tick(t){
    if(!visible || document.hidden){frame=0;return;}
    render(t);
    frame=requestAnimationFrame(tick);
  }
  function start(){
    if(reduce.matches){render(performance.now());return;}
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function stop(){
    if(frame){cancelAnimationFrame(frame);frame=0;}
  }
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      const entry=entries[0];
      visible=entry.isIntersecting;
      if(visible){start();}
      else{stop();}
    },{threshold:0,rootMargin:'70px 0px 70px 0px'});
    io.observe(flight);
  }else{
    visible=true;start();
  }
  stage.addEventListener('pointermove',e=>{
    if(reduce.matches || !fine.matches)return;
    pointerX=clamp((e.clientX/w-.5)*2,-1,1);
    pointerY=clamp((e.clientY/h-.5)*2,-1,1);
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  addEventListener('resize',()=>{resize();if(visible)start();},{passive:true});
  reduce.addEventListener?.('change',()=>{elapsed=0;lastDraw=0;stop();if(visible)start();});
  resize();

  // A subtle light follows the pointer in the original hero photo.
  if(hero && fine.matches && !reduce.matches){
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      hero.style.setProperty('--hero-light-x',((e.clientX-r.left)/r.width*100).toFixed(2)+'%');
      hero.style.setProperty('--hero-light-y',((e.clientY-r.top)/r.height*100).toFixed(2)+'%');
      hero.style.setProperty('--hero-light-opacity','1');
    },{passive:true});
    hero.addEventListener('pointerleave',()=>hero.style.setProperty('--hero-light-opacity','0'));
  }

  // Each photograph has an optical aperture revealing the original image.
  // Mobile/reduced-motion users get a fully readable static photo.
  const enableLens=fine.matches&&!reduce.matches;
  if(enableLens){
    $$('.project-visual').forEach(panel=>{
      const image=$('.external-photo',panel);
      if(!image)return;
      const lens=image.cloneNode(false);
      lens.removeAttribute('alt');
      lens.removeAttribute('loading');
      lens.setAttribute('aria-hidden','true');
      lens.className='focus-photo';
      panel.appendChild(lens);
      const coords=e=>{
        const r=panel.getBoundingClientRect();
        panel.style.setProperty('--focus-x',(e.clientX-r.left).toFixed(2)+'px');
        panel.style.setProperty('--focus-y',(e.clientY-r.top).toFixed(2)+'px');
      };
      panel.addEventListener('pointerenter',e=>{
        coords(e);
        panel.classList.add('lens-active');
        panel.style.setProperty('--spot-opacity','1');
      });
      panel.addEventListener('pointermove',coords,{passive:true});
      panel.addEventListener('pointerleave',()=>{
        panel.classList.remove('lens-active');
        panel.style.setProperty('--spot-opacity','0');
      });
    });
  }
})();
