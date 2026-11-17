/* speedstu / AETHER v11
   An original responsive WebGL particle installation:
   3D flower sprites, dust, interconnected nodes and scroll-directed motion.
   No third-party runtime or borrowed website code. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{let x=clamp(t);return x*x*(3-2*x);};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const small=matchMedia('(max-width: 650px)');
  const lowPower=!!(navigator.deviceMemory&&navigator.deviceMemory<4);
  const hero=$('#home'), heroCopy=$('.hero-copy'), projects=$('#projects'),
        mangaSection=$('#marin'), manga=$('#scene-manga'), mangaImg=$('.scene-manga img'),
        air=$('#scene-aircraft'), canvas=$('#scene-gl'), meter=$('#scroll-fill'),
        header=$('#site-header'), orb=$('#cursor-light');
  const toggle=$('#motion-toggle'),toggleLabel=$('#motion-label');
  let manualPause=false,mouse={x:0,y:0},pointer={x:0,y:0},hasPointer=false;
  let scrollChanged=true,animationTime=0,lastTime=0,lastDraw=0;
  let stage=0,heroProgress=0,mangaOpacity=0,drawCount=0;
  let pulse={x:0,y:0,birth:-10000};
  const pause=()=>manualPause||reduced.matches||document.hidden;
  function updateToggle(){
    const off=manualPause||reduced.matches;
    toggle.setAttribute('aria-pressed',String(off));
    toggle.setAttribute('aria-label',off?'Resume background motion':'Pause background motion');
    toggleLabel.textContent=off?'Motion off':'Motion on';
    $('svg',toggle).innerHTML=off?'<path d="M5 3.5v9l7-4.5z" fill="currentColor"/>'
      :'<path d="M4.5 4v8m7-8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
  }
  toggle.addEventListener('click',()=>{
    manualPause=!manualPause;updateToggle();scrollChanged=true;
  });
  reduced.addEventListener?.('change',()=>{updateToggle();scrollChanged=true;});
  document.addEventListener('visibilitychange',()=>{scrollChanged=true;lastTime=0;});
  updateToggle();

  const menu=$('#mobile-menu'), menuToggle=$('#menu-toggle');
  function closeMenu(){
    menu.hidden=true;
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Open menu');
  }
  menuToggle.addEventListener('click',()=>{
    const open=menu.hidden; menu.hidden=!open;
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  small.addEventListener?.('change',e=>{if(!e.matches)closeMenu();});

  // A quiet gallery reveal; content stays present without JavaScript.
  const revealItems=$$('.reveal');
  if('IntersectionObserver' in window&&!reduced.matches){
    const reveal=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target);}});
    },{threshold:.05,rootMargin:'0px 0px -5% 0px'});
    revealItems.forEach(e=>reveal.observe(e));
    document.documentElement.classList.add('motion-ready');
  }
  reduced.addEventListener?.('change',e=>{if(e.matches){
    document.documentElement.classList.remove('motion-ready');
    revealItems.forEach(el=>el.classList.add('visible'));
  }});
  if('IntersectionObserver' in window){
    const nav=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(!e.isIntersecting)return;
        const id=e.target.id;
        const target=id==='more'?'projects':id;
        $$('.desktop-navigation a').forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+target));
      });
    },{rootMargin:'-25% 0px -62% 0px'});
    ['projects','more','about','contact'].forEach(id=>{
      const el=document.getElementById(id);if(el)nav.observe(el);
    });
  }

  addEventListener('pointermove',e=>{
    if(pause())return;
    mouse.x=clamp(e.clientX/Math.max(1,innerWidth)*2-1,-1,1);
    mouse.y=clamp(1-e.clientY/Math.max(1,innerHeight)*2,-1,1);
    hasPointer=true;
  },{passive:true});
  hero.addEventListener('pointerdown',e=>{
    if(pause()||e.target.closest('a,button'))return;
    pulse.x=clamp(e.clientX/Math.max(1,innerWidth)*2-1,-1,1);
    pulse.y=clamp(1-e.clientY/Math.max(1,innerHeight)*2,-1,1);
    pulse.birth=performance.now();
  },{passive:true});

  // Subtle, real 3D card interaction; no fake dashboards or inflated metrics.
  $$('.feature').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(pause()||small.matches)return;
      const r=card.getBoundingClientRect();
      const x=clamp((e.clientX-r.left)/r.width,0,1);
      const y=clamp((e.clientY-r.top)/r.height,0,1);
      card.style.setProperty('--card-x',((x-.5)*2).toFixed(3));
      card.style.setProperty('--card-y',((y-.5)*2).toFixed(3));
      card.style.setProperty('--light-x',(x*100).toFixed(1)+'%');
      card.style.setProperty('--light-y',(y*100).toFixed(1)+'%');
    },{passive:true});
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--card-x','0');card.style.setProperty('--card-y','0');
    });
  });
  const arena=$('.arena-art');
  arena?.addEventListener('pointermove',e=>{
    if(pause())return;
    const r=arena.getBoundingClientRect();
    const x=clamp((e.clientX-r.left)/r.width,0,1),y=clamp((e.clientY-r.top)/r.height,0,1);
    arena.style.setProperty('--tilt-x',((x-.5)*2).toFixed(3));
    arena.style.setProperty('--tilt-y',((y-.5)*2).toFixed(3));
    arena.style.setProperty('--ball-x',Math.round((x-.5)*60)+'px');
    arena.style.setProperty('--ball-y',Math.round((y-.5)*45)+'px');
  },{passive:true});
  arena?.addEventListener('pointerleave',()=>{
    for(const k of ['--tilt-x','--tilt-y','--ball-x','--ball-y'])arena.style.removeProperty(k);
  });

  const trackPath=$('#track-path'),runner=$('.track-runner'),runnerGlow=$('.track-runner-glow');
  let trackLength=0;
  try{trackLength=trackPath?.getTotalLength()||0;}catch{}
  const matrix=$('#compute-matrix'),pixels=[];
  if(matrix){
    const fragment=document.createDocumentFragment();
    for(let i=0;i<135;i++){
      const item=document.createElement('span');item.className='compute-pixel';
      pixels.push(item);fragment.appendChild(item);
    }
    matrix.appendChild(fragment);
  }
  const visibleArts=new Set();
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting)visibleArts.add(e.target);else visibleArts.delete(e.target);});
    },{threshold:0});
    $$('.feature-art').forEach(el=>io.observe(el));
  }else $$('.feature-art').forEach(el=>visibleArts.add(el));

  // Deterministic pseudo-random positions are generated once; the GPU owns the motion.
  let seed=918437;
  function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
  function normal(){return (rand()+rand()+rand()+rand()-2)*1.73;}
  const particles=[],nodes=[];
  const dustCount=small.matches?900:(lowPower?2500:6900);
  const bloomCount=small.matches?420:(lowPower?950:3400);
  const nodeCount=small.matches?50:(lowPower?85:180);
  // 9 float attributes: initial xyz, target xyz, seed, point size, type.
  function particle(a,b,s,z,type){particles.push(...a,...b,s,z,type);}
  for(let i=0;i<dustCount;i++){
    const t=rand(),depth=rand()*8-2;
    const init=[(rand()-.5)*20,(rand()-.5)*13,depth];
    const aim=[(t-.5)*18,Math.sin(t*8.8)*2.1+normal()*1.9-.5,(rand()-.5)*9];
    particle(init,aim,rand(),.6+rand()*2.8,0);
  }
  for(let i=0;i<bloomCount;i++){
    const t=rand(),x=(t-.5)*15;
    const init=[x,Math.sin(t*7.2)*1.8+normal()*1.9-.65,(rand()-.5)*8];
    const aim=[x*1.3,Math.sin(t*12.2+1.2)*2.8+normal()*2.,(rand()-.5)*9];
    particle(init,aim,rand(),13+rand()*27,1);
  }
  for(let i=0;i<nodeCount;i++){
    const a=rand()*Math.PI*2,u=rand()*2-1,r=Math.cbrt(rand())*2.8;
    const p=[2.2+Math.cos(a)*Math.sqrt(1-u*u)*r,Math.sin(a)*Math.sqrt(1-u*u)*r,u*r];
    nodes.push(p);
    const t=rand();
    particle(p,[(t-.5)*12,normal()*4,(rand()-.5)*8],rand(),2+rand()*3.2,2);
  }
  const edges=[];
  for(let i=0;i<nodes.length;i++){
    const others=nodes.map((v,j)=>({j,d:(v[0]-nodes[i][0])**2+(v[1]-nodes[i][1])**2+(v[2]-nodes[i][2])**2}));
    others.sort((a,b)=>a.d-b.d);
    for(const o of others.slice(1,4)){
      if(o.j>i&&o.d<2.5)edges.push(...nodes[i],...nodes[o.j]);
    }
  }
  const pointArray=new Float32Array(particles);
  const lineArray=new Float32Array(edges);

  let gl=null,program=null,lineProgram=null,pointBuffer=null,lineBuffer=null,pointUniforms={},lineUniforms={};
  let ctx2d=null,flowerSprites=[],fallbackPoints=[],lastWidth=0,lastHeight=0,pixelRatio=1;
  const vertexShader=String.raw`
    attribute vec3 a_initial;
    attribute vec3 a_target;
    attribute float a_seed;
    attribute float a_size;
    attribute float a_type;
    uniform float u_time;
    uniform float u_stage;
    uniform float u_aspect;
    uniform vec2 u_pointer;
    uniform vec2 u_pulse;
    uniform float u_pulse_age;
    uniform float u_pixel_ratio;
    uniform float u_motion;
    varying float v_alpha;
    varying float v_type;
    varying float v_seed;
    varying float v_chroma;
    void main(){
      vec3 pos=mix(a_initial,a_target,u_stage);
      float move=u_time*u_motion;
      pos.y+=sin(pos.x*.38 + a_seed*5. + move*.39)*.36*u_motion;
      pos.x+=sin(pos.y*.46 + a_seed*12. + move*.28)*.23*u_motion;
      pos.z+=sin(move*.30 + a_seed*17.)*.16*u_motion;
      // The neural cloud follows the pointer; flower petals bend around it.
      float yaw=.13 + sin(move*.09)*.04*u_motion + u_pointer.x*.17*u_motion;
      float pitch=-.07 + u_pointer.y*.12*u_motion;
      float cy=cos(yaw),sy=sin(yaw),cx=cos(pitch),sx=sin(pitch);
      vec3 q=vec3(pos.x*cy-pos.z*sy,pos.y,pos.x*sy+pos.z*cy);
      pos=vec3(q.x,q.y*cx-q.z*sx,q.y*sx+q.z*cx);
      vec2 worldPointer=u_pointer*vec2(u_aspect,1.)*4.;
      vec2 delta=pos.xy-worldPointer;
      float dist=length(delta);
      pos.xy += normalize(delta+vec2(.0001))*exp(-dist*dist*.21)*.65*u_motion;
      float ring=length(pos.xy-u_pulse*vec2(u_aspect,1.)*4.);
      float wave=exp(-pow((ring-u_pulse_age*7.)*1.45,2.))*(1.-clamp(u_pulse_age*.95,0.,1.));
      pos.xy+=normalize(pos.xy+vec2(.00001))*wave*.43*u_motion;
      float depth=10.5-pos.z;
      vec2 clip=pos.xy*2.4/depth;
      clip.x/=u_aspect;
      gl_Position=vec4(clip,0.,1.);
      gl_PointSize=clamp(a_size*9.0/max(3.,depth)*u_pixel_ratio,1.,46.);
      v_type=a_type;
      v_seed=a_seed;
      v_chroma=u_stage;
      if(a_type<.5) v_alpha=(.22+.30*a_seed)*(.9+.1*u_stage);
      else if(a_type<1.5) v_alpha=(.36+.49*a_seed)*(.80+.35*u_stage);
      else v_alpha=(.39+.32*a_seed)*(1.-u_stage*.66);
    }
  `;
  const fragmentShader=String.raw`
    precision mediump float;
    varying float v_alpha;
    varying float v_type;
    varying float v_seed;
    varying float v_chroma;
    void main(){
      vec2 uv=gl_PointCoord*2.-1.;
      float angle=atan(uv.y,uv.x);
      float radius=length(uv);
      float alpha=0.;
      if(v_type<.5){
        alpha=1.-smoothstep(.08,.86,radius);
        alpha*=alpha;
      }else if(v_type<1.5){
        // Five rounded petals cut into a point sprite, never a texture.
        float petal=.53+.22*cos(5.*angle);
        float edge=1.-smoothstep(petal-.10,petal+.035,radius);
        float centre=1.-smoothstep(.08,.22,radius);
        alpha=max(edge*.78,centre*.65);
      }else{
        alpha=1.-smoothstep(.45,.86,radius);
      }
      vec3 gray=vec3(.90,.92,.94);
      vec3 lilac=mix(vec3(.82,.81,.92),vec3(1.,.94,1.),v_seed);
      vec3 color=mix(gray,lilac,clamp(v_chroma*.65 + (v_type>1.5?.13:.08),0.,.8));
      gl_FragColor=vec4(color,alpha*v_alpha);
    }
  `;
  const linesVertex=String.raw`
    attribute vec3 a_position;
    uniform float u_time;
    uniform float u_aspect;
    uniform vec2 u_pointer;
    uniform float u_motion;
    void main(){
      float theta=.13+sin(u_time*.09)*.04*u_motion+u_pointer.x*.17*u_motion;
      float cy=cos(theta),sy=sin(theta);
      vec3 p=vec3(a_position.x*cy-a_position.z*sy,a_position.y,a_position.x*sy+a_position.z*cy);
      float depth=10.5-p.z;
      vec2 clip=p.xy*2.4/depth;
      clip.x/=u_aspect;
      gl_Position=vec4(clip,0.,1.);
    }
  `;
  const linesFragment=String.raw`
    precision mediump float;
    uniform float u_alpha;
    void main(){gl_FragColor=vec4(.82,.79,.92,u_alpha);}
  `;

  function createShader(type,src){
    const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  function createProgram(vert,frag){
    const vs=createShader(gl.VERTEX_SHADER,vert),fs=createShader(gl.FRAGMENT_SHADER,frag);
    const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    gl.deleteShader(vs);gl.deleteShader(fs);return p;
  }
  function initGL(){
    if(small.matches || lowPower || reduced.matches)return false;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power',preserveDrawingBuffer:false});
      if(!gl)return false;
      program=createProgram(vertexShader,fragmentShader);
      lineProgram=createProgram(linesVertex,linesFragment);
      pointBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,pointArray,gl.STATIC_DRAW);
      lineBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,lineArray,gl.STATIC_DRAW);
      const uniformNames=['u_time','u_stage','u_aspect','u_pointer','u_pulse','u_pulse_age','u_pixel_ratio','u_motion'];
      for(const n of uniformNames)pointUniforms[n]=gl.getUniformLocation(program,n);
      for(const n of ['u_time','u_aspect','u_pointer','u_motion','u_alpha'])lineUniforms[n]=gl.getUniformLocation(lineProgram,n);
      gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      resize();
      canvas.dataset.state='webgl';
      return true;
    }catch(e){
      console.warn('WebGL unavailable; using lightweight canvas fallback.',e?.message||e);
      canvas.dataset.state='fallback';
      gl=null;return false;
    }
  }
  function makeFlower(color){
    const c=document.createElement('canvas');c.width=c.height=64;
    const g=c.getContext('2d');g.translate(32,32);
    for(let j=0;j<5;j++){
      const a=j*Math.PI*2/5;
      g.beginPath();g.ellipse(Math.cos(a)*13,Math.sin(a)*13,13,8,a,0,Math.PI*2);
      g.fillStyle=color;g.fill();
    }
    g.beginPath();g.arc(0,0,5.4,0,Math.PI*2);g.fillStyle='rgba(246,241,255,.9)';g.fill();
    return c;
  }
  function init2d(){
    try{
      ctx2d=canvas.getContext('2d',{alpha:true});
      if(!ctx2d)return;
      canvas.dataset.state='canvas2d';
      flowerSprites=[makeFlower('rgba(227,219,241,.82)'),makeFlower('rgba(244,242,249,.92)')];
      for(let i=0;i<360;i++){
        fallbackPoints.push({x:rand(),y:rand(),z:.4+rand()*1.2,r:5+rand()*11,seed:rand(),type:rand()});
      }
      resize();
    }catch(e){canvas.dataset.state='static';}
  }
  function resize(){
    pixelRatio=Math.min(small.matches?1:1.5,devicePixelRatio||1);
    const w=Math.max(1,Math.round(innerWidth*pixelRatio)),h=Math.max(1,Math.round(innerHeight*pixelRatio));
    if(w===lastWidth&&h===lastHeight)return;
    lastWidth=w;lastHeight=h;
    canvas.width=w;canvas.height=h;
    if(gl)gl.viewport(0,0,w,h);
    if(ctx2d)ctx2d.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  }
  if(!initGL())init2d();

  function sceneUpdate(){
    const vh=Math.max(1,innerHeight),y=Math.max(0,scrollY);
    const pageHeight=Math.max(1,document.documentElement.scrollHeight-vh);
    const denom=Math.max(1,hero.offsetHeight-vh);
    heroProgress=clamp(y/denom);
    const r=projects.getBoundingClientRect();
    stage=smooth((vh*.96-r.top)/(vh*1.25));
    meter.style.transform='scaleX('+clamp(y/pageHeight).toFixed(5)+')';
    header.classList.toggle('is-scrolled',y>30);
    // Content fades without preventing click/keyboard navigation at scroll start.
    const fade=1-smooth((heroProgress-.42)/.49);
    heroCopy.style.opacity=fade.toFixed(3);
    heroCopy.style.transform='translate3d(0,'+(-55*heroProgress).toFixed(1)+'px,0) scale('+(1-.12*heroProgress).toFixed(3)+')';
    const x=mix(small.matches?42:51,small.matches?122:135,smooth(heroProgress));
    const yy=mix(small.matches?13:8,-16,smooth(heroProgress));
    const sc=mix(small.matches?.58:.76,small.matches?1.18:1.40,smooth(heroProgress));
    const rotation=mix(-11,-21,smooth(heroProgress));
    air.style.transform='translate(-50%,-50%) translate3d('+x.toFixed(2)+'vw,'+yy.toFixed(2)+'vh,0) rotate('+rotation.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
    air.style.opacity=(.69*(1-smooth((heroProgress-.58)/.38))).toFixed(3);
    // Marin takes over this same fixed background, edge to edge.
    const m=mangaSection.getBoundingClientRect();
    const entering=smooth((vh*.85-m.top)/(vh*.70));
    const leaving=smooth((m.bottom-vh*.20)/(vh*.68));
    mangaOpacity=clamp(entering*leaving);
    manga.style.visibility=mangaOpacity>.001?'visible':'hidden';
    manga.style.opacity=mangaOpacity.toFixed(3);
    const mProgress=clamp(-m.top/Math.max(1,m.height-vh));
    const motionAmount=pause()?0:1;
    mangaImg.style.transform='translate3d(0,'+((mProgress-.5)*18*motionAmount).toFixed(1)+'px,0) scale('+(1.07-.045*mProgress*motionAmount).toFixed(3)+')';
    canvas.style.opacity=(.95*(1-mangaOpacity)).toFixed(3);
  }

  function renderGL(){
    if(!gl||gl.isContextLost())return;
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    const time=animationTime,aspect=innerWidth/Math.max(1,innerHeight);
    const enabled=pause()?0:1;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);
    const stride=9*4,attributes=[['a_initial',3,0],['a_target',3,12],['a_seed',1,24],['a_size',1,28],['a_type',1,32]];
    for(const [name,size,offset] of attributes){
      const loc=gl.getAttribLocation(program,name);
      if(loc<0)continue;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,offset);
    }
    gl.uniform1f(pointUniforms.u_time,time);
    gl.uniform1f(pointUniforms.u_stage,stage);
    gl.uniform1f(pointUniforms.u_aspect,aspect);
    gl.uniform2f(pointUniforms.u_pointer,pointer.x,pointer.y);
    gl.uniform2f(pointUniforms.u_pulse,pulse.x,pulse.y);
    gl.uniform1f(pointUniforms.u_pulse_age,clamp((performance.now()-pulse.birth)/1100,0,10));
    gl.uniform1f(pointUniforms.u_pixel_ratio,pixelRatio);
    gl.uniform1f(pointUniforms.u_motion,enabled);
    gl.drawArrays(gl.POINTS,0,pointArray.length/9);
    for(const [name] of attributes){
      const loc=gl.getAttribLocation(program,name);if(loc>=0)gl.disableVertexAttribArray(loc);
    }
    if(lineArray.length && stage<.98){
      gl.useProgram(lineProgram);gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffer);
      const loc=gl.getAttribLocation(lineProgram,'a_position');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,3,gl.FLOAT,false,12,0);
      gl.uniform1f(lineUniforms.u_time,time);
      gl.uniform1f(lineUniforms.u_aspect,aspect);
      gl.uniform2f(lineUniforms.u_pointer,pointer.x,pointer.y);
      gl.uniform1f(lineUniforms.u_motion,enabled);
      gl.uniform1f(lineUniforms.u_alpha,.31*(1-stage));
      gl.drawArrays(gl.LINES,0,lineArray.length/3);
      gl.disableVertexAttribArray(loc);
    }
    drawCount++;
  }
  function render2d(){
    if(!ctx2d)return;
    const w=innerWidth,h=innerHeight;
    ctx2d.clearRect(0,0,w,h);
    for(let i=0;i<fallbackPoints.length;i++){
      const p=fallbackPoints[i];
      const x=(p.x*w+Math.sin(animationTime*.12+p.seed*9)*9)%w;
      const y=(p.y*h+Math.cos(animationTime*.13+p.seed*7)*6)%h;
      if(p.type<.60){
        ctx2d.fillStyle='rgba(235,232,247,'+(.16+.22*p.seed).toFixed(2)+')';
        ctx2d.fillRect(x,y,1.3+p.z*.5,1.3+p.z*.5);
      }else{
        ctx2d.globalAlpha=.18+stage*.27;
        const size=(p.r+stage*5)*p.z;
        ctx2d.drawImage(flowerSprites[i%2],x-size/2,y-size/2,size,size);
        ctx2d.globalAlpha=1;
      }
    }
    drawCount++;
  }
  let lastTrack=0,lastGrid=0;
  function animate(now){
    requestAnimationFrame(animate);
    if(document.hidden)return;
    if(now-lastDraw<33&&!scrollChanged)return;
    const delta=lastTime?Math.min((now-lastTime)/1000,.08):.033;
    lastTime=now;lastDraw=now;
    if(!pause()){
      animationTime+=delta;
      pointer.x=mix(pointer.x,mouse.x,.075);
      pointer.y=mix(pointer.y,mouse.y,.075);
      if(hasPointer&&orb&&!(small.matches)){
        orb.style.transform='translate3d('+(pointer.x*innerWidth/2+innerWidth/2-190).toFixed(1)+'px,'+((1-pointer.y)*innerHeight/2-190).toFixed(1)+'px,0)';
      }
    }
    const changed=scrollChanged;
    if(changed || !pause()){sceneUpdate();scrollChanged=false;}
    const m=mangaOpacity;
    if(m<.995 && (!pause()||changed)){
      if(gl)renderGL();
      else render2d();
    }
    if(pause())return;
    if(trackPath&&trackLength&&visibleArts.has($('.track-art'))&&now-lastTrack>44){
      lastTrack=now;
      const point=trackPath.getPointAtLength((animationTime*.12%1)*trackLength);
      runner?.setAttribute('cx',point.x.toFixed(1));runner?.setAttribute('cy',point.y.toFixed(1));
      runnerGlow?.setAttribute('cx',point.x.toFixed(1));runnerGlow?.setAttribute('cy',point.y.toFixed(1));
    }
    if(pixels.length&&visibleArts.has($('.compute-art'))&&now-lastGrid>150){
      lastGrid=now;
      const col=Math.floor(animationTime*4)%15;
      pixels.forEach((p,i)=>{
        const c=i%15,row=Math.floor(i/15);
        p.classList.toggle('is-lit',(c===col || (c===(col+14)%15 && row%2===0)) && (i*19)%11<8);
      });
    }
  }
  addEventListener('scroll',()=>{scrollChanged=true;},{passive:true});
  addEventListener('resize',()=>{lastWidth=0;lastHeight=0;resize();scrollChanged=true;},{passive:true});
  addEventListener('pageshow',()=>{scrollChanged=true;});
  sceneUpdate();
  requestAnimationFrame(animate);
})();
