/* SPEEDSTU / CONTINUUM — scroll-coordinated background and lightweight 3D */
(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{let x=clamp(v);return x*x*(3-2*x);};
const lerp=(a,b,t)=>a+(b-a)*t;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const narrow=matchMedia('(max-width: 790px)');
const aircraft=$('#scene-aircraft'), manga=$('#scene-manga'), mangaImage=$('#scene-manga img'),glCanvas=$('#scene-gl'),shade=$('.scene-shade'),meter=$('#scroll-fill'),header=$('#site-header'),marin=$('#marin');
let paused=false,mouse={x:0,y:0},pointer={x:0,y:0},timeElapsed=0,lastTime=0,lastPaint=0,scrollDirty=true,marinAmount=0,documentProgress=0;
const isPaused=()=>paused||reduced.matches||document.hidden;
const motion=$('#motion-toggle');
function updateMotion(){
 const off=paused||reduced.matches;motion.setAttribute('aria-pressed',String(off));
 motion.setAttribute('aria-label',off?'Resume background motion':'Pause background motion');
 $('#motion-label').textContent=off?'Motion off':'Motion on';
 $('svg',motion).innerHTML=off?'<path d="M5 3.5v9l7-4.5z" fill="currentColor"/>':'<path d="M4.5 4v8m7-8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
}
motion.addEventListener('click',()=>{paused=!paused;updateMotion();scrollDirty=true;});
reduced.addEventListener?.('change',()=>{updateMotion();scrollDirty=true;});
updateMotion();
const menu=$('#mobile-menu'),menuButton=$('#menu-toggle');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');}
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');});
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
narrow.addEventListener?.('change',e=>{if(!e.matches)closeMenu();});
addEventListener('pointermove',e=>{if(!isPaused()){mouse.x=clamp(e.clientX/innerWidth*2-1,-1,1);mouse.y=clamp(e.clientY/innerHeight*2-1,-1,1);}},{passive:true});
if('IntersectionObserver' in window&&!reduced.matches){
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -7% 0px'});
 $$('.reveal').forEach(x=>io.observe(x));
 document.documentElement.classList.add('motion-ready');
}
reduced.addEventListener?.('change',e=>{if(e.matches){document.documentElement.classList.remove('motion-ready');$$('.reveal').forEach(x=>x.classList.add('visible'));}});
if('IntersectionObserver' in window){
 const navObs=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const id=entry.target.id, href=id==='more'?'#projects':'#'+id;
  $$('.desktop-navigation a').forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')===href));
 }),{rootMargin:'-24% 0px -61% 0px'});
 ['home','about','projects','more','marin','contact'].forEach(id=>{const x=document.getElementById(id);if(x)navObs.observe(x);});
}
const arena=$('.arena-art');
arena?.addEventListener('pointermove',e=>{
 if(isPaused())return;
 const r=arena.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width),y=clamp((e.clientY-r.top)/r.height);
 arena.style.setProperty('--tilt-x',String((x-.5)*2));arena.style.setProperty('--tilt-y',String((y-.5)*2));
 arena.style.setProperty('--ball-x',Math.round((x-.5)*100)+'px');arena.style.setProperty('--ball-y',Math.round((y-.5)*65)+'px');
},{passive:true});
arena?.addEventListener('pointerleave',()=>['--tilt-x','--tilt-y','--ball-x','--ball-y'].forEach(k=>arena.style.removeProperty(k)));
const trackPath=$('#track-path'),runner=$('.track-runner'),runnerGlow=$('.track-runner-glow');
let trackLength=0;try{trackLength=trackPath?.getTotalLength()||0;}catch{}
const pixels=[],matrix=$('#compute-matrix');
if(matrix){
 const fragment=document.createDocumentFragment();
 for(let i=0;i<135;i++){const p=document.createElement('span');p.className='compute-pixel';pixels.push(p);fragment.appendChild(p);}
 matrix.appendChild(fragment);
}
const visible=new Set();
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target)),{threshold:0});
 $$('.feature-art').forEach(x=>io.observe(x));
}else $$('.feature-art').forEach(x=>visible.add(x));
// Native WebGL airflow geometry: actual perspective and vertex transforms, not a prerendered video.
const vertices=[],TAU=Math.PI*2;
function flow(t,a){
 const radius=(.83-.28*Math.pow(Math.abs(t-.5)*2,1.4))*(.9+.09*Math.sin(7*t+a*.6)),angle=a+1.36*t;
 return [-3.1+6.2*t,Math.sin(angle)*radius+.26*Math.sin(5.7*t),Math.cos(angle)*radius+.25*Math.cos(6*t)];
}
function segment(a,b,alpha){vertices.push(a[0],a[1],a[2],alpha,b[0],b[1],b[2],alpha);}
for(let i=0;i<29;i++)for(let j=0;j<105;j++){let t=j/105,a=TAU*i/29;segment(flow(t,a),flow((j+1)/105,a),.16+.12*Math.sin(a*2+.3)+.08*t);}
for(let j=5;j<=95;j+=5)for(let i=0;i<29;i++){let t=j/105;segment(flow(t,TAU*i/29),flow(t,TAU*(i+1)/29),.075+.065*t);}
let gl,program,uniforms,buf,count=vertices.length/4,lastW=0,lastH=0;
function shader(type,src){let sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
function resizeGL(){
 if(!gl)return;const ratio=Math.min(1.4,devicePixelRatio||1),w=Math.max(1,Math.round(innerWidth*ratio)),h=Math.max(1,Math.round(innerHeight*ratio));
 if(w===lastW&&h===lastH)return;lastW=w;lastH=h;glCanvas.width=w;glCanvas.height=h;gl.viewport(0,0,w,h);
}
function initGL(){
 if(narrow.matches||reduced.matches)return false;
 try{
 gl=glCanvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true,powerPreference:'low-power'});
 if(!gl)return false;
 let v=shader(gl.VERTEX_SHADER,'attribute vec3 a_position; attribute float a_opacity; uniform float u_time; uniform float u_aspect; uniform float u_scroll; uniform vec2 u_pointer; varying float v_alpha; void main(){vec3 p=a_position; float rx=.16+sin(u_time*.19)*.09+u_pointer.y*.18; float ry=.16+u_scroll*.58+u_pointer.x*.20; float cy=cos(ry),sy=sin(ry),cx=cos(rx),sx=sin(rx); vec3 r=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy); p=vec3(r.x,r.y*cx-r.z*sx,r.y*sx+r.z*cx); p.x+=2.45; float depth=7.4-p.z; gl_Position=vec4(p.x*2.10/u_aspect,p.y*2.10,0.,depth); v_alpha=a_opacity*(.65+.35*max(0.,p.z+1.)); }');
 let f=shader(gl.FRAGMENT_SHADER,'precision mediump float; varying float v_alpha; uniform float u_strength; void main(){gl_FragColor=vec4(.75,.82,.85,v_alpha*u_strength);}');
 program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.deleteShader(v);gl.deleteShader(f);gl.useProgram(program);
 buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
 let pos=gl.getAttribLocation(program,'a_position'),alpha=gl.getAttribLocation(program,'a_opacity');
 gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,16,0);
 gl.enableVertexAttribArray(alpha);gl.vertexAttribPointer(alpha,1,gl.FLOAT,false,16,12);
 uniforms={time:gl.getUniformLocation(program,'u_time'),aspect:gl.getUniformLocation(program,'u_aspect'),scroll:gl.getUniformLocation(program,'u_scroll'),pointer:gl.getUniformLocation(program,'u_pointer'),strength:gl.getUniformLocation(program,'u_strength')};
 gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 resizeGL();glCanvas.dataset.state='ready';return true;
 }catch(e){console.warn('3D fallback:',e?.message||e);glCanvas.dataset.state='fallback';gl=null;return false;}
}
if(!initGL())glCanvas.style.display='none';
function sceneUpdate(){
 const vh=Math.max(1,innerHeight),y=scrollY||0,doc=Math.max(1,document.documentElement.scrollHeight-vh);
 documentProgress=clamp(y/doc);meter.style.transform='scaleX('+documentProgress.toFixed(4)+')';header.classList.toggle('is-scrolled',y>30);
 const t=clamp(y/(vh*1.85)),u=ease(t),mobile=narrow.matches;
 const x=lerp(mobile?42:44,102,u),yy=lerp(mobile?12:0,-18,u),sc=lerp(mobile?.60:.77,mobile?1.12:1.34,u),rot=lerp(-10,-21,u);
 aircraft.style.transform='translate(-50%,-50%) translate3d('+x.toFixed(2)+'vw,'+yy.toFixed(2)+'vh,0) rotate('+rot.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
 aircraft.style.opacity=(.77*(1-ease((t-.62)/.35))).toFixed(3);
 const r=marin.getBoundingClientRect(),fadeIn=ease((vh*.94-r.top)/(vh*.76)),fadeOut=ease((r.bottom-vh*.22)/(vh*.70));
 marinAmount=clamp(fadeIn*fadeOut);manga.style.opacity=marinAmount.toFixed(3);manga.style.visibility=marinAmount>.005?'visible':'hidden';
 const mProgress=clamp(-r.top/Math.max(1,r.height-vh)),zoom=1.075-(reduced.matches?0:.045*ease(mProgress)),iy=reduced.matches?0:(mProgress-.5)*22;
 mangaImage.style.transform='translate3d(0,'+iy.toFixed(1)+'px,0) scale('+zoom.toFixed(3)+')';
 shade.style.opacity=(.62*(1-marinAmount)).toFixed(3);
 glCanvas.style.opacity=(.82*(1-marinAmount)).toFixed(3);
 marin.style.setProperty('--marin-copy-y',(reduced.matches?0:(.5-marinAmount)*12).toFixed(1)+'px');
}
function drawGL(){
 if(!gl||gl.isContextLost())return;resizeGL();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
 gl.uniform1f(uniforms.time,timeElapsed);gl.uniform1f(uniforms.aspect,Math.max(.55,innerWidth/Math.max(1,innerHeight)));
 gl.uniform1f(uniforms.scroll,documentProgress);gl.uniform2f(uniforms.pointer,pointer.x,pointer.y);
 gl.uniform1f(uniforms.strength,clamp(1.35-marinAmount*1.35,0,1.4));gl.drawArrays(gl.LINES,0,count);
}
let paintAt=0,trackAt=0,gridAt=0;
function animate(now){
 requestAnimationFrame(animate);if(document.hidden)return;
 const elapsed=lastTime?Math.min((now-lastTime)/1000,.13):.033;
 if(now-paintAt<32&&!scrollDirty)return;paintAt=now;lastTime=now;
 if(!isPaused()){timeElapsed+=elapsed;pointer.x=lerp(pointer.x,mouse.x,.075);pointer.y=lerp(pointer.y,mouse.y,.075);}
 const changed=scrollDirty;
 if(changed||!isPaused()){sceneUpdate();scrollDirty=false;}
 if(gl && scrollY<innerHeight*2.1 && (changed||!isPaused()))drawGL();
 if(isPaused())return;
 if(trackPath&&trackLength&&visible.has($('.track-art'))&&now-trackAt>33){
  trackAt=now;const pos=trackPath.getPointAtLength((timeElapsed*.14%1)*trackLength);
  runner?.setAttribute('cx',pos.x.toFixed(1));runner?.setAttribute('cy',pos.y.toFixed(1));
  runnerGlow?.setAttribute('cx',pos.x.toFixed(1));runnerGlow?.setAttribute('cy',pos.y.toFixed(1));
 }
 if(pixels.length&&visible.has($('.compute-art'))&&now-gridAt>130){
  gridAt=now;const c0=Math.floor(timeElapsed*5)%15;
  pixels.forEach((p,i)=>{let c=i%15,row=Math.floor(i/15);p.classList.toggle('is-lit',(c===c0||(c===(c0+14)%15&&row%2===0))&&i%9<6);});
 }
}
addEventListener('scroll',()=>{scrollDirty=true;},{passive:true});
addEventListener('resize',()=>{scrollDirty=true;resizeGL();},{passive:true});
addEventListener('pageshow',()=>{scrollDirty=true;});
sceneUpdate();requestAnimationFrame(animate);
})();