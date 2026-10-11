import * as THREE from 'three';
const $=id=>document.getElementById(id);
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<800;
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:!MOB,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,MOB?1.5:2));R.setSize(innerWidth,innerHeight);
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;
const S=new THREE.Scene();S.background=new THREE.Color(0x03040c);S.fog=new THREE.FogExp2(0x050824,.0085);
const C=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,400);C.position.set(0,1.6,9);
const fitFov=()=>{const a=innerWidth/innerHeight;C.fov=a<1?Math.min(95,70/Math.max(a,.55)**.65):70;C.aspect=a;C.updateProjectionMatrix()};fitFov();
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);fitFov()});
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};const rr=(a,b)=>a+(b-a)*rnd();

// ---------- światła ----------
S.add(new THREE.HemisphereLight(0x8fb4ff,0x2a1a40,1.1));
const sun=new THREE.DirectionalLight(0xfff0d0,3);sun.position.set(-6,8,6);S.add(sun);
const rim=new THREE.DirectionalLight(0x4a7bff,1.6);rim.position.set(6,-3,-8);S.add(rim);

// ---------- tło: mgławice, planeta, gwiazdy ----------
function glowTex(c0,c1){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const neb=[['rgba(120,60,255,.55)','rgba(120,60,255,0)',-70,25,-190,170],['rgba(0,170,255,.45)','rgba(0,170,255,0)',80,-20,-210,200],['rgba(255,80,160,.35)','rgba(255,80,160,0)',10,60,-230,170],['rgba(40,255,200,.22)','rgba(40,255,200,0)',-40,-50,-180,130]];
for(const [a,b,x,y,z,s] of neb){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(a,b),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));m.position.set(x,y,z);m.scale.set(s,s,1);S.add(m)}
function planetTex(){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
 const gr=g.createLinearGradient(0,0,0,256);['#f4c27a','#d9803e','#f2d7a0','#b9572b','#e8b46c','#8e3d22'].forEach((k,i,a)=>gr.addColorStop(i/(a.length-1),k));g.fillStyle=gr;g.fillRect(0,0,512,256);
 for(let i=0;i<260;i++){g.fillStyle=`rgba(${rnd()<.5?'255,235,200':'120,50,20'},${.05+rnd()*.12})`;g.fillRect(0,rnd()*256,512,1+rnd()*5)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const planet=new THREE.Mesh(new THREE.SphereGeometry(40,48,32),new THREE.MeshStandardMaterial({map:planetTex(),roughness:.9}));planet.position.set(-70,22,-260);S.add(planet);
const ring=new THREE.Mesh(new THREE.RingGeometry(56,80,80),new THREE.MeshBasicMaterial({color:0xe8c58f,transparent:true,opacity:.45,side:THREE.DoubleSide,fog:false}));ring.position.copy(planet.position);ring.rotation.x=1.25;ring.rotation.y=.3;S.add(ring);
const moon=new THREE.Mesh(new THREE.SphereGeometry(9,32,24),new THREE.MeshStandardMaterial({color:0x9fb0c8,roughness:1}));moon.position.set(75,-18,-230);S.add(moon);
const NS=MOB?900:1800;const sp=new Float32Array(NS*3),sc=new Float32Array(NS*3);
const star=i=>{sp[i*3]=rr(-90,90);sp[i*3+1]=rr(-60,60);sp[i*3+2]=rr(-300,10);const k=rnd();sc[i*3]=.7+k*.3;sc[i*3+1]=.8+rnd()*.2;sc[i*3+2]=1-k*.3};
for(let i=0;i<NS;i++)star(i);
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('color',new THREE.BufferAttribute(sc,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:.55,vertexColors:true,sizeAttenuation:true,transparent:true,depthWrite:false,fog:false}));S.add(stars);

// ---------- statek ----------
const ship=new THREE.Group();S.add(ship);const body=new THREE.Group();ship.add(body);
const M=(c,r=.35,m=.6,e=0,ec=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:ec,emissiveIntensity:e});
{const hull=new THREE.Mesh(new THREE.ConeGeometry(.55,2.6,24),M(0xe8eef8,.3,.7));hull.rotation.x=-Math.PI/2;body.add(hull);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.2,16,12),M(0xff4d4d,.3,.2,.5,0xff2200));nose.position.z=-1.35;body.add(nose);
 const cock=new THREE.Mesh(new THREE.SphereGeometry(.38,20,14),new THREE.MeshPhysicalMaterial({color:0x66e0ff,roughness:.05,metalness:.1,transmission:.4,emissive:0x0077aa,emissiveIntensity:.6}));cock.scale.set(.9,.8,1.5);cock.position.set(0,.3,-.25);body.add(cock);
 for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(1.5,.07,1.1),M(0x3a7bff,.3,.6));w.position.set(s*.95,-.05,.45);w.rotation.z=-s*.12;w.rotation.y=s*.35;body.add(w);
  const tip=new THREE.Mesh(new THREE.BoxGeometry(.08,.45,.5),M(0xff4d4d,.4,.4,.3,0xff2200));tip.position.set(s*1.6,.12,.75);body.add(tip);
  const en=new THREE.Mesh(new THREE.CylinderGeometry(.2,.26,.7,14),M(0x2c3340,.4,.9));en.rotation.x=Math.PI/2;en.position.set(s*.45,-.05,1.1);body.add(en)}
 const fin=new THREE.Mesh(new THREE.BoxGeometry(.06,.7,.8),M(0x3a7bff,.3,.6));fin.position.set(0,.4,1);body.add(fin)}
const flameMat=new THREE.SpriteMaterial({map:glowTex('rgba(255,255,255,1)','rgba(0,160,255,0)'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
const flames=[-.45,.45].map(x=>{const f=new THREE.Sprite(flameMat.clone());f.position.set(x,-.05,1.7);f.scale.set(1.2,1.2,1);body.add(f);return f});
const shipLight=new THREE.PointLight(0x4aa8ff,6,7);shipLight.position.set(0,0,1.8);body.add(shipLight);
const shield=new THREE.Mesh(new THREE.SphereGeometry(1.7,24,16),new THREE.MeshBasicMaterial({color:0x7fe7ff,transparent:true,opacity:0,wireframe:true,fog:false}));ship.add(shield);

// ---------- obiekty ----------
const rockGeo=[0,1,2].map(k=>{const g=new THREE.IcosahedronGeometry(1,MOB?1:2);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=1+.28*Math.sin(x*3.1+k)*Math.cos(y*2.7+k*2)+.14*Math.sin(z*5.3+k*3)+rr(-.04,.04);p.setXYZ(i,x*n,y*n*(.8+k*.12),z*n)}g.computeVertexNormals();return g});
const rockMat=[0x6b5d52,0x5a5560,0x7a6a5a].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.95,metalness:.05,flatShading:true}));
const pkgGeo=new THREE.BoxGeometry(.9,.9,.9);const pkgMat=new THREE.MeshStandardMaterial({color:0xffc21a,roughness:.25,metalness:.8,emissive:0xff9a00,emissiveIntensity:.35});
const ribGeo=new THREE.BoxGeometry(.95,.18,.95);const ribMat=new THREE.MeshStandardMaterial({color:0xff3d3d,roughness:.4,metalness:.2});
const haloTex=glowTex('rgba(255,200,70,.35)','rgba(255,170,0,0)');
const ringGeo=new THREE.TorusGeometry(2.2,.2,14,40);const ringMat=new THREE.MeshStandardMaterial({color:0x3ad0ff,emissive:0x00a8ff,emissiveIntensity:1.6,roughness:.3,metalness:.4});
const objs=[];  // {m,type,r,spin}
function addRock(x,y,z,s){const k=Math.floor(rnd()*3);const m=new THREE.Mesh(rockGeo[k],rockMat[k]);m.position.set(x,y,z);m.scale.setScalar(s);m.rotation.set(rr(0,6),rr(0,6),rr(0,6));S.add(m);objs.push({m,type:'rock',r:s*.92,spin:new THREE.Vector3(rr(-.8,.8),rr(-.8,.8),rr(-.8,.8))})}
function addPkg(x,y,z){const g=new THREE.Group();g.add(new THREE.Mesh(pkgGeo,pkgMat),new THREE.Mesh(ribGeo,ribMat));const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));h.scale.set(2.2,2.2,1);g.add(h);g.position.set(x,y,z);S.add(g);objs.push({m:g,type:'pkg',r:1.0,spin:new THREE.Vector3(.6,1.4,.3)})}
function addRing(x,y,z){const m=new THREE.Mesh(ringGeo,ringMat);m.position.set(x,y,z);S.add(m);objs.push({m,type:'ring',r:2.0,spin:new THREE.Vector3(0,0,.8)})}
function kill(o){S.remove(o.m);o.dead=true}

// ---------- cząsteczki ----------
const NP=300;const pp=new Float32Array(NP*3),pc=new Float32Array(NP*3),pv=new Float32Array(NP*3),pl=new Float32Array(NP);let pi=0;
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));pg.setAttribute('color',new THREE.BufferAttribute(pc,3));
const parts=new THREE.Points(pg,new THREE.PointsMaterial({size:.28,vertexColors:true,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));parts.frustumCulled=false;S.add(parts);
for(let i=0;i<NP;i++)pp[i*3+1]=-999;
function burst(x,y,z,col,n=26,sp=9){const c=new THREE.Color(col);for(let k=0;k<n;k++){const i=pi++%NP;pp[i*3]=x;pp[i*3+1]=y;pp[i*3+2]=z;const a=rnd()*6.28,b=rnd()*3.14-1.57,v=rr(.3,1)*sp;pv[i*3]=Math.cos(a)*Math.cos(b)*v;pv[i*3+1]=Math.sin(b)*v;pv[i*3+2]=Math.sin(a)*Math.cos(b)*v;pc[i*3]=c.r;pc[i*3+1]=c.g;pc[i*3+2]=c.b;pl[i]=rr(.4,.9)}}

// ---------- dźwięk ----------
let AC,eng,engG,master;
function audioInit(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);
 eng=AC.createOscillator();eng.type='sawtooth';engG=AC.createGain();engG.gain.value=.025;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=420;eng.connect(f);f.connect(engG);engG.connect(master);eng.frequency.value=55;eng.start()}catch(e){}}
function tone(f,d,type='sine',v=.25,f2){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,AC.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,AC.currentTime+d);g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(master);o.start();o.stop(AC.currentTime+d)}
function noise(d,v=.4){if(!AC)return;const b=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(master);s.start()}
const sfx={pkg:n=>tone(520+n*70,.18,'triangle',.3,1040+n*90),ring:()=>{tone(300,.5,'sawtooth',.2,900);tone(600,.5,'sine',.2,1500)},hit:()=>{noise(.5,.6);tone(120,.4,'square',.3,40)},over:()=>tone(400,1.2,'sawtooth',.3,50)};

// ---------- stan gry ----------
const BX=7,BY=4;const G={mode:'menu',t:0,dist:0,speed:30,score:0,pkgs:0,lives:3,charge:0,boost:0,inv:0,combo:0,comboT:0,x:0,y:0,tx:0,ty:0,vx:0,vy:0,spawnAt:0,best:+localStorage.kkBest||0,shake:0,hits:0,rocksPassed:0};
window.__G=G;window.__objs=objs;
const BASE=30,MAXS=70;
function reset(){for(const o of objs)S.remove(o.m);objs.length=0;Object.assign(G,{t:0,dist:0,speed:BASE,score:0,pkgs:0,lives:3,charge:0,boost:0,inv:0,combo:0,comboT:0,x:0,y:0,tx:0,ty:0,vx:0,vy:0,spawnAt:0,shake:0,hits:0,rocksPassed:0});hud(true)}
function spawnRow(zz){
 const lvl=Math.min(1,G.t/90);const cx=rr(-BX+1.5,BX-1.5),cy=rr(-BY+1,BY-1);const pat=rnd();
 const nRocks=Math.floor(2+lvl*5+rnd()*2);
 for(let i=0;i<nRocks;i++){let x,y,t=0;do{x=rr(-BX-2,BX+2);y=rr(-BY-1.5,BY+1.5);t++}while(Math.hypot(x-cx,y-cy)<3.3&&t<12);addRock(x,y,zz-rr(0,10),rr(.9,2.1+lvl*.8))}
 if(pat<.55){for(let i=0;i<5;i++)addPkg(cx+Math.sin(i*.8)*1.2,cy+Math.cos(i*.6)*.6,zz-i*3.2)}
 else if(pat<.75){addRing(cx,cy,zz-6);for(let i=0;i<3;i++)addPkg(cx,cy,zz-i*3.2+2)}
 else{for(let i=0;i<4;i++)addPkg(cx+(i-1.5)*1.6,cy+(i%2?.8:-.8),zz-i*2)}
}
function hud(force){$('score').textContent=Math.floor(G.score).toLocaleString('pl-PL');$('sub').textContent=`📦 ${G.pkgs} · ⚡ ${Math.round(G.speed)} km/s`;$('lives').textContent='❤'.repeat(Math.max(0,G.lives))+'🖤'.repeat(3-Math.max(0,G.lives));$('boostbar').firstElementChild.style.width=(G.boost>0?G.boost/4*100:G.charge)+'%'}
function say(t,c){const e=$('combo');e.textContent=t;e.style.color=c||'';e.style.opacity=1;clearTimeout(say.h);say.h=setTimeout(()=>e.style.opacity=0,900)}
function start(){audioInit();if(AC&&AC.state==='suspended')AC.resume();reset();G.mode='play';$('start').classList.add('hide');$('over').classList.add('hide')}
function over(){G.mode='over';sfx.over();const nb=G.score>G.best;if(nb){G.best=Math.floor(G.score);localStorage.kkBest=G.best}
 $('fs').textContent=Math.floor(G.score).toLocaleString('pl-PL');$('fd').textContent=`📦 ${G.pkgs} paczek · ⏱ ${Math.round(G.t)} s · ${nb?'🏆 NOWY REKORD!':'rekord: '+G.best.toLocaleString('pl-PL')}`;$('over').classList.remove('hide')}
$('go').onclick=start;$('again').onclick=start;

// ---------- sterowanie ----------
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(G.mode!=='play'&&(e.code==='Enter'||e.code==='Space'))start()});addEventListener('keyup',e=>keys[e.code]=0);
let drag=null;
addEventListener('pointerdown',e=>{if(e.target.tagName==='BUTTON')return;drag={x:e.clientX,y:e.clientY,sx:G.tx,sy:G.ty}});
addEventListener('pointerup',()=>drag=null);addEventListener('pointercancel',()=>drag=null);
addEventListener('pointermove',e=>{const k=(BX*2)/(innerWidth*(MOB?.62:.5));
 if(drag){G.tx=Math.max(-BX,Math.min(BX,drag.sx+(e.clientX-drag.x)*k*1.15));G.ty=Math.max(-BY,Math.min(BY,drag.sy-(e.clientY-drag.y)*k*1.15))}
 else if(e.pointerType==='mouse'){G.tx=((e.clientX/innerWidth)*2-1)*BX;G.ty=-((e.clientY/innerHeight)*2-1)*BY}});

// ---------- pętla ----------
const clk=new THREE.Clock();let flameT=0;
function step(dt){
 G.t+=dt;const targetSpeed=Math.min(MAXS,BASE+G.t*.45)*(G.boost>0?1.6:1);G.speed+=(targetSpeed-G.speed)*Math.min(1,dt*2.5);
 const mv=G.speed*dt;G.dist+=mv;G.score+=mv*.12*(G.boost>0?2:1);
 const kx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0),ky=(keys.ArrowUp||keys.KeyW?1:0)-(keys.ArrowDown||keys.KeyS?1:0);
 if(kx||ky){G.tx=Math.max(-BX,Math.min(BX,G.tx+kx*dt*13));G.ty=Math.max(-BY,Math.min(BY,G.ty+ky*dt*11))}
 const px=G.x,py=G.y;G.x+=(G.tx-G.x)*Math.min(1,dt*9);G.y+=(G.ty-G.y)*Math.min(1,dt*9);G.vx=(G.x-px)/dt;G.vy=(G.y-py)/dt;
 // spawn
 while(G.spawnAt<G.dist+150){spawnRow(-(G.spawnAt-G.dist)-0);G.spawnAt+=Math.max(13,22-G.t*.08)}
 if(G.inv>0)G.inv-=dt;if(G.boost>0){G.boost-=dt;if(G.boost<=0){G.boost=0;G.charge=0}}if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0}
 // obiekty
 for(const o of objs){if(o.dead)continue;o.m.position.z+=mv;o.m.rotation.x+=o.spin.x*dt;o.m.rotation.y+=o.spin.y*dt;o.m.rotation.z+=o.spin.z*dt;
  if(o.type==='pkg'&&G.boost>0&&o.m.position.z>-30){o.m.position.x+=(G.x-o.m.position.x)*dt*2;o.m.position.y+=(G.y-o.m.position.y)*dt*2}
  const dz=o.m.position.z;if(dz>-1.8&&dz<1.8){const d=Math.hypot(o.m.position.x-G.x,o.m.position.y-G.y);
   if(o.type==='pkg'&&d<o.r+1.0){G.combo=Math.min(5,G.combo+1);G.comboT=2.2;G.pkgs++;G.score+=100*G.combo*(G.boost>0?2:1);if(G.boost<=0)G.charge=Math.min(100,G.charge+9);burst(o.m.position.x,o.m.position.y,0,0xffd24a,12,6);sfx.pkg(G.combo);if(G.combo>=2)say('x'+G.combo+' COMBO','#ffe066');kill(o);if(G.charge>=100&&G.boost<=0){G.boost=4;say('⚡ TURBO!','#7fe7ff');sfx.ring()}}
   else if(o.type==='ring'&&d<o.r+.6){G.charge=Math.min(100,G.charge+45);G.score+=250;burst(o.m.position.x,o.m.position.y,0,0x40d0ff,40);sfx.ring();say('+RING','#7fe7ff');kill(o);if(G.charge>=100&&G.boost<=0){G.boost=4;say('⚡ TURBO!','#7fe7ff')}}
   else if(o.type==='rock'&&G.inv<=0&&G.boost<=0&&d<o.r+.85){G.lives--;G.hits++;G.inv=1.6;G.combo=0;G.shake=.7;burst(G.x,G.y,0,0xff7a3a,50,12);sfx.hit();$('flash').style.opacity=.55;setTimeout(()=>$('flash').style.opacity=0,120);if(G.lives<=0){over();break}}
   else if(o.type==='rock'&&G.boost>0&&d<o.r+.85){burst(o.m.position.x,o.m.position.y,0,0xaaaaaa,30,10);G.score+=50;sfx.hit();kill(o)}}
  if(o.m.position.z>12&&!o.dead){if(o.type==='rock')G.rocksPassed++;kill(o)}}
 for(let i=objs.length-1;i>=0;i--)if(objs[i].dead)objs.splice(i,1);
 hud();
}
function frame(){
 const dt=Math.min(.05,clk.getDelta());
 if(G.mode==='play')step(dt);else{G.x+=(Math.sin(performance.now()/1200)*2-G.x)*dt;G.y+=(Math.cos(performance.now()/1600)*1-G.y)*dt;G.speed=22}
 // statek
 ship.position.set(G.x,G.y,0);body.rotation.z=-G.vx*.035;body.rotation.x=G.vy*.02;body.rotation.y=-G.vx*.012;
 ship.visible=!(G.inv>0&&Math.floor(performance.now()/90)%2);
 shield.material.opacity+=((G.boost>0?.35:0)-shield.material.opacity)*.2;shield.rotation.y+=dt*2;
 flameT+=dt*30;const fs=1+(G.speed-20)/70+(G.boost>0?.8:0);flames.forEach((f,i)=>{f.scale.set(1+.15*Math.sin(flameT+i)*fs,(1.4+.5*Math.sin(flameT*1.3+i))*fs,1)});
 // kamera
 const sh=G.shake>0?G.shake:0;G.shake=Math.max(0,G.shake-dt*1.6);
 C.position.x+=(G.x*.55-C.position.x)*.08+(Math.random()-.5)*sh*.6;C.position.y+=(1.6+G.y*.5-C.position.y)*.08+(Math.random()-.5)*sh*.6;C.lookAt(G.x*.3,G.y*.3,-18);
 const zoomFov=(MOB?C.fov:70)+(G.boost>0?7:0);C.fov+=(zoomFov-C.fov)*.08;C.updateProjectionMatrix();
 // gwiazdy
 const smv=G.speed*dt*.5;for(let i=0;i<NS;i++){sp[i*3+2]+=smv;if(sp[i*3+2]>12)star(i),sp[i*3+2]=-300}sg.attributes.position.needsUpdate=true;
 planet.rotation.y+=dt*.01;ring.position.z+=0;
 // cząsteczki
 for(let i=0;i<NP;i++){if(pl[i]>0){pl[i]-=dt;pp[i*3]+=pv[i*3]*dt;pp[i*3+1]+=pv[i*3+1]*dt;pp[i*3+2]+=pv[i*3+2]*dt+G.speed*dt*.3;if(pl[i]<=0)pp[i*3+1]=-999}}
 pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;
 // ślad silnika
 if(G.mode==='play'&&Math.random()<.9){const i=pi++%NP;pp[i*3]=G.x+(Math.random()<.5?-.45:.45);pp[i*3+1]=G.y-.05;pp[i*3+2]=1.8;pv[i*3]=rr(-.5,.5);pv[i*3+1]=rr(-.5,.5);pv[i*3+2]=rr(6,12);const b=G.boost>0;pc[i*3]=b?.4:.3;pc[i*3+1]=b?.9:.6;pc[i*3+2]=1;pl[i]=rr(.15,.4)}
 if(AC){eng.frequency.value=45+G.speed*1.2;engG.gain.value=G.mode==='play'?.03+(G.boost>0?.03:0):.012}
 R.render(S,C);requestAnimationFrame(frame)}
frame();
