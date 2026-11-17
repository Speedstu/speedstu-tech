// Optional Marin feature: scroll-linked color reveal and a safe image fallback.
(() => {
  'use strict';
  const section=document.getElementById('marin');
  if(!section)return;
  const art=section.querySelector('.marin-art');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const images=Array.from(section.querySelectorAll('.marin-portrait'));
  const fallback='https://static.zerochan.net/Kitagawa.Marin.full.4535512.jpg';
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{const x=clamp(n);return x*x*(3-2*x);};
  let frame=0;
  function update(){
    frame=0;
    if(reduce.matches){
      section.style.setProperty('--marin-progress','1');
      section.style.setProperty('--marin-inset','0%');
      section.style.setProperty('--marin-shift','0px');
      return;
    }
    const rect=section.getBoundingClientRect();
    if(rect.top>innerHeight*1.2||rect.bottom<-.3*innerHeight)return;
    const progress=clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight));
    const revealed=ease((progress-.16)/.66);
    section.style.setProperty('--marin-progress',revealed.toFixed(3));
    section.style.setProperty('--marin-inset',((1-revealed)*100).toFixed(2)+'%');
    section.style.setProperty('--marin-shift',((.5-progress)*38).toFixed(1)+'px');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  images.forEach(img=>{
    function failed(){
      if(img.dataset.fallbackTried)return;
      img.dataset.fallbackTried='true';
      img.src=fallback;
    }
    img.addEventListener('error',failed);
    img.addEventListener('load',()=>{section.classList.remove('marin-image-unavailable');});
    if(img.complete&&img.naturalWidth===0)failed();
  });
  // Keep a legible typographic fallback if both remote image hosts fail.
  images.forEach(img=>img.addEventListener('error',()=>{
    if(img.dataset.fallbackTried)section.classList.add('marin-image-unavailable');
  }));
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  reduce.addEventListener?.('change',schedule);
  schedule();
})();
