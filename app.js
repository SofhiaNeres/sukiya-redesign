const chapters=[...document.querySelectorAll('.chapter')];
const links=[...document.querySelectorAll('.ingredient-progress a')];
const counter=document.querySelector('#counter');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const bowl=document.querySelector('.scroll-bowl');
const hero=document.querySelector('.hero-bowl');
const finale=document.querySelector('.final-dish>img');
let anchors=[],frame=0,current=null;
const lerp=(a,b,t)=>a+(b-a)*t;
function measure(){
 const mobile=innerWidth<=600;
 const rect=el=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+scrollY+r.height/2,w:r.width}};
 const first=rect(hero),last=rect(finale);
 const width=mobile?Math.min(110,innerWidth*.26):Math.min(390,innerWidth*.33);
 anchors=[{at:first.y-innerHeight*.5,x:first.x,y:innerHeight*.5,w:first.w,angle:-8,tilt:0}];
 const intro=document.querySelector('.journey-title').getBoundingClientRect();anchors.push({at:intro.top+scrollY+intro.height/2-innerHeight*.5,x:innerWidth*.85,y:innerHeight*(mobile?.76:.5),w:mobile?Math.min(110,innerWidth*.26):220,angle:4,tilt:-5});
 chapters.forEach((el,i)=>{const r=el.getBoundingClientRect();anchors.push({at:r.top+scrollY+r.height*.46-innerHeight*.5,x:mobile?innerWidth*.85:innerWidth*(i%2?.73:.27),y:innerHeight*(mobile?.76:.5),w:width,angle:[-12,10,-8,8][i],tilt:[-8,8,-6,6][i]})});
 anchors.push({at:last.y-innerHeight*.5,x:last.x,y:innerHeight*.5,w:last.w,angle:0,tilt:0});
 current=null;requestDraw();
}
function target(){
 let i=0;while(i<anchors.length-2&&scrollY>anchors[i+1].at)i++;
 const a=anchors[i],b=anchors[i+1];let t=Math.max(0,Math.min(1,(scrollY-a.at)/(b.at-a.at)));t=t*t*(3-2*t);
 const v={};for(const key of ['x','y','w','angle','tilt'])v[key]=lerp(a[key],b[key],t);
 // Follow the natural image position before the journey and after the final arrival.
 if(scrollY<anchors[0].at)v.y=anchors[0].y+anchors[0].at-scrollY;
 const end=anchors.at(-1);if(scrollY>end.at)v.y=end.y+end.at-scrollY;
 return v;
}
function draw(){
 frame=0;if(reduced.matches||innerWidth<=600||!anchors.length)return;
 const wanted=target();if(!current)current={...wanted};let delta=0;
 for(const key of Object.keys(wanted)){delta=Math.max(delta,Math.abs(wanted[key]-current[key]));current[key]=lerp(current[key],wanted[key],.22)}
 bowl.style.width='360px';bowl.style.transform=`translate3d(${current.x-180}px,${current.y-142}px,0) rotateX(${current.tilt}deg) rotateZ(${current.angle}deg) scale(${current.w/360})`;
 let best=0,distance=Infinity;chapters.forEach((el,i)=>{const r=el.getBoundingClientRect(),d=Math.abs(r.top+r.height*.46-innerHeight*.5);if(d<distance){distance=d;best=i}});
 links.forEach((a,i)=>{a.classList.toggle('active',i===best);if(i===best)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});counter.textContent=`0${best+1} / ${String(chapters.length).padStart(2,'0')}`;
 if(delta>.15)frame=requestAnimationFrame(draw);
}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw)}
function configure(){document.body.classList.toggle('scroll-enabled',!reduced.matches&&innerWidth>600);if(reduced.matches||innerWidth<=600){cancelAnimationFrame(frame);frame=0;current=null}else measure()}
addEventListener('scroll',requestDraw,{passive:true});addEventListener('resize',configure);addEventListener('load',measure);reduced.addEventListener('change',configure);
if('IntersectionObserver'in window){document.body.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.15});chapters.forEach(c=>observer.observe(c))}
configure();
