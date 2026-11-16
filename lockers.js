/*
============================================================
 LUCKY'S — 3D LOCKER ROOM  ·  lockers.js   (v1.0)
============================================================
 Fully self-contained 3D club locker rooms (Three.js / WebGL).
 - Adds a "Lockers" tab to the bottom nav (replaces the old
   "Custom" tab at runtime — the customizer is still reachable
   via the "Personalize" button inside the locker room).
 - Team picker -> fully 3D, interactive, club-branded locker room.
 - Every locker = one real squad player (official 2026/27
   Premier League numbers, retrieved 16 Nov 2026).
 - Tap a locker -> it swings open, the player's kit hangs inside
   with his name + number. Drag to orbit, pinch/scroll to zoom.
 - "Add Kit" hooks into the existing cart; "Personalize" opens
   the existing jersey customizer pre-filled with the player.

 INSTALL (one line): upload this file next to index.html, and add
   <script src="lockers.js"></script>
 just before </body> in index.html. Nothing else changes.
============================================================
*/
(function(){
'use strict';
if(window.__lkInit)return;window.__lkInit=true;

/* ---------- injected styles ---------- */
var css="#page-lockers{position:fixed;inset:0;display:none;background:#0b0d12}"
+"#page-lockers.active{display:block}"
+".lk-wrap{position:absolute;inset:0;overflow:hidden}"
+"#lk-canvas{width:100%;height:100%;display:block;touch-action:none;outline:none}"
+".lk-topbar{position:absolute;top:0;left:0;right:0;display:none;align-items:center;gap:10px;padding:12px 14px;z-index:20;background:linear-gradient(180deg,rgba(0,0,0,.72),rgba(0,0,0,0));pointer-events:none}"
+".lk-topbar *{pointer-events:auto}"
+".lk-back{background:rgba(20,22,30,.55);border:1px solid rgba(255,255,255,.28);color:#fff;padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;backdrop-filter:blur(8px)}"
+".lk-teamname{font-size:15px;font-weight:800;color:#fff;letter-spacing:.4px;text-shadow:0 1px 3px rgba(0,0,0,.6)}"
+".lk-hint{position:absolute;left:0;right:0;display:none;text-align:center;font-size:12px;color:rgba(255,255,255,.85);z-index:15;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.75);bottom:74px;animation:lkFade 2.4s ease infinite}"
+"@keyframes lkFade{0%,100%{opacity:.4}50%{opacity:1}}"
+".lk-picker{position:absolute;inset:0;overflow-y:auto;z-index:30;background:var(--bg,#0e1016);padding:18px 14px 94px}"
+".lk-ptitle{font-size:24px;font-weight:900;color:var(--white,#fff);line-height:1.15;margin:6px 0 4px}"
+".lk-ptitle span{color:var(--accent,#fff)}"
+".lk-psub{font-size:13px;color:var(--gray,#99a);margin-bottom:16px}"
+".lk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}"
+".lk-card{border-radius:16px;padding:14px 16px 16px;cursor:pointer;border:1px solid rgba(255,255,255,.14);position:relative;overflow:hidden;color:#fff;min-height:96px;display:flex;flex-direction:column;justify-content:flex-end;transition:transform .15s ease;box-shadow:0 10px 24px rgba(0,0,0,.25)}"
+".lk-card:active{transform:scale(.96)}"
+".lk-card-emoji{font-size:24px;position:absolute;top:10px;right:12px;opacity:.9}"
+".lk-card-badge{position:absolute;top:12px;left:14px;font-size:9px;font-weight:800;letter-spacing:1px;background:rgba(255,255,255,.22);padding:3px 8px;border-radius:20px}"
+".lk-card-name{font-weight:800;font-size:16px;line-height:1.1;padding-right:30px}"
+".lk-card-sub{font-size:11px;opacity:.85;margin-top:3px}"
+".lk-card-3d{margin-top:8px;font-size:10px;font-weight:700;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 8px;display:inline-block;width:fit-content}"
+".lk-sheet{position:absolute;left:0;right:0;z-index:40;background:rgba(15,17,25,.94);backdrop-filter:blur(14px);border-top:1px solid rgba(255,255,255,.16);border-radius:18px 18px 0 0;padding:16px;bottom:64px;transform:translateY(160%);transition:transform .32s cubic-bezier(.2,.9,.3,1)}"
+".lk-sheet.open{transform:translateY(0)}"
+".lk-sheet-top{display:flex;align-items:center;gap:13px;margin-bottom:14px}"
+".lk-num{min-width:54px;height:54px;border-radius:13px;display:flex;align-items:center;justify-content:center;font:900 24px Arial,sans-serif}"
+".lk-pname{font-size:17px;font-weight:800;color:#fff;line-height:1.1}"
+".lk-ppos{font-size:12px;color:rgba(255,255,255,.6);margin-top:2px}"
+".lk-btns{display:flex;gap:9px}"
+".lk-btn{flex:1;padding:13px 8px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;text-align:center}"
+".lk-btn-primary{background:var(--accent,#fff);color:#101218}"
+".lk-btn-ghost{background:rgba(255,255,255,.09);color:#fff;border:1px solid rgba(255,255,255,.22)}"
+".lk-loading{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;z-index:35;background:#0b0d12}"
+".lk-spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.18);border-top-color:#fff;border-radius:50%;animation:lkSpin .9s linear infinite;margin-bottom:12px}"
+"@keyframes lkSpin{to{transform:rotate(360deg)}}"
+".lk-loading-txt{color:#fff;font-size:13px;font-weight:600}"
+".lk-note{margin-top:16px;font-size:11px;color:var(--gray,#8a8f9c);line-height:1.6;text-align:center}";
(function(){var s=document.createElement('style');s.id='lk-style';s.textContent=css;document.head.appendChild(s);})();

/* ---------- state ---------- */
var curTeam=null,scene=null,camera=null,renderer=null,S=null,rafId=0,threePromise=null,SEL=null;

/* ---------- helpers ---------- */
function $id(id){return document.getElementById(id)}
function shade(hex,p){var c=parseInt(hex.slice(1),16),r=(c>>16)&255,g=(c>>8)&255,b=c&255;
r=Math.round(r*(1+p));g=Math.round(g*(1+p));b=Math.round(b*(1+p));
r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;
return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}


/* ---------- squads — official 2026/27 PL numbers (retrieved 16 Nov 2026) ----------
   pos: g=gk, d=def, m=mid, f=fwd */
var SQUADS={
 arsenal:{players:[
  {n:'David Raya',num:1,pos:'g'},{n:'William Saliba',num:2,pos:'d'},{n:'Cristhian Mosquera',num:3,pos:'d'},{n:'Ben White',num:4,pos:'d'},
  {n:'Piero Hincapie',num:5,pos:'d'},{n:'Gabriel Magalhaes',num:6,pos:'d'},{n:'Bukayo Saka',num:7,pos:'f'},{n:'Martin Odegaard',num:8,pos:'m'},
  {n:'Gabriel Jesus',num:9,pos:'f'},{n:'Eberechi Eze',num:10,pos:'m'},{n:'Gabriel Martinelli',num:11,pos:'f'},{n:'Jurrien Timber',num:12,pos:'d'},
  {n:'Kepa Arrizabalaga',num:13,pos:'g'},{n:'Viktor Gyokeres',num:14,pos:'f'},{n:'Christos Tzolis',num:17,pos:'f'},{n:'Noni Madueke',num:20,pos:'f'},
  {n:'Fabio Vieira',num:21,pos:'m'},{n:'Ethan Nwaneri',num:22,pos:'m'},{n:'Mikel Merino',num:23,pos:'m'},{n:'Reiss Nelson',num:24,pos:'f'},
  {n:'Kai Havertz',num:29,pos:'f'},{n:'Illan Meslier',num:30,pos:'g'},{n:'Riccardo Calafiori',num:33,pos:'d'},{n:'Tommy Setford',num:35,pos:'g'},
  {n:'Martin Zubimendi',num:36,pos:'m'},{n:'Bruno Guimaraes',num:39,pos:'m'},{n:'Declan Rice',num:41,pos:'m'},{n:'Myles Lewis-Skelly',num:49,pos:'d'}]},
 mancity:{players:[
  {n:'Gianluigi Donnarumma',num:1,pos:'g'},{n:'Ruben Dias',num:3,pos:'d'},{n:'Elliot Anderson',num:5,pos:'m'},{n:'Marc Guehi',num:6,pos:'d'},
  {n:'Iliman Ndiaye',num:7,pos:'f'},{n:'Mateo Kovacic',num:8,pos:'m'},{n:'Erling Haaland',num:9,pos:'f'},{n:'Rayan Cherki',num:10,pos:'m'},
  {n:'Jeremy Doku',num:11,pos:'f'},{n:'Marcus Bettinelli',num:13,pos:'g'},{n:'Enzo Fernandez',num:17,pos:'m'},{n:'Rayan Ait-Nouri',num:21,pos:'d'},
  {n:'Vitor Reis',num:22,pos:'d'},{n:'Josko Gvardiol',num:24,pos:'d'},{n:'Matheus Nunes',num:27,pos:'m'},{n:'Geronimo Rulli',num:28,pos:'g'},
  {n:'Claudio Echeverri',num:30,pos:'f'},{n:'Ayyoub Bouaddi',num:32,pos:'m'},{n:"Nico O'Reilly",num:33,pos:'d'},{n:'Allan',num:37,pos:'m'},
  {n:'Antoine Semenyo',num:42,pos:'f'},{n:'Abdukodir Khusanov',num:45,pos:'d'},{n:'Phil Foden',num:47,pos:'f'},{n:'Ryan McAidoo',num:56,pos:'f'},
  {n:'Kaden Braithwaite',num:61,pos:'d'},{n:'Rico Lewis',num:82,pos:'d'}]},
 manutd:{players:[
  {n:'Senne Lammens',num:1,pos:'g'},{n:'Diogo Dalot',num:2,pos:'d'},{n:'Noussair Mazraoui',num:3,pos:'d'},{n:'Matthijs de Ligt',num:4,pos:'d'},
  {n:'Harry Maguire',num:5,pos:'d'},{n:'Lisandro Martinez',num:6,pos:'d'},{n:'Mason Mount',num:7,pos:'m'},{n:'Bruno Fernandes',num:8,pos:'m'},
  {n:'Marcus Rashford',num:9,pos:'f'},{n:'Matheus Cunha',num:10,pos:'m'},{n:'Joshua Zirkzee',num:11,pos:'f'},{n:'Karl Darlow',num:12,pos:'g'},
  {n:'Patrick Dorgu',num:13,pos:'d'},{n:'Leny Yoro',num:15,pos:'d'},{n:'Amad Diallo',num:16,pos:'f'},{n:'Andrey Santos',num:17,pos:'m'},
  {n:'Youri Tielemans',num:18,pos:'m'},{n:'Bryan Mbeumo',num:19,pos:'f'},{n:'Carlos Baleba',num:20,pos:'m'},{n:'Tom Heaton',num:22,pos:'g'},
  {n:'Luke Shaw',num:23,pos:'d'},{n:'Manuel Ugarte',num:25,pos:'m'},{n:'Ayden Heaven',num:26,pos:'d'},{n:'Benjamin Sesko',num:30,pos:'f'},
  {n:'Shea Lacey',num:31,pos:'f'},{n:'Kobbie Mainoo',num:37,pos:'m'},{n:'Harry Amass',num:41,pos:'d'}]},
 chelsea:{players:[
  {n:'Emiliano Martinez',num:1,pos:'g'},{n:'Marco Palestra',num:2,pos:'d'},{n:'Wesley Fofana',num:3,pos:'d'},{n:'Valentin Barco',num:4,pos:'d'},
  {n:'Maxence Lacroix',num:5,pos:'d'},{n:'Levi Colwill',num:6,pos:'d'},{n:'Pedro Neto',num:7,pos:'f'},{n:'Joao Pedro',num:9,pos:'f'},
  {n:'Cole Palmer',num:10,pos:'m'},{n:'Jamie Gittens',num:11,pos:'f'},{n:'Jordan Henderson',num:14,pos:'m'},{n:'Morgan Rogers',num:17,pos:'m'},
  {n:'Danny Welbeck',num:18,pos:'f'},{n:'Jorrel Hato',num:21,pos:'d'},{n:'Emmanuel Emegha',num:22,pos:'f'},{n:'Geovany Quenda',num:23,pos:'f'},
  {n:'Reece James',num:24,pos:'d'},{n:'Moises Caicedo',num:25,pos:'m'},{n:'Malo Gusto',num:27,pos:'d'},{n:'Teddy Sharman-Lowe',num:28,pos:'g'},
  {n:'Pep Chavarria',num:29,pos:'d'},{n:'Aaron Anselmino',num:30,pos:'d'},{n:'Mahdi Nicoll-Jazuli',num:32,pos:'m'},{n:'Josh Acheampong',num:34,pos:'d'},
  {n:'Olutayo Subuloye',num:37,pos:'f'},{n:'Mike Penders',num:39,pos:'d'},{n:'Estevao',num:41,pos:'f'},{n:'Gabriel Slonina',num:44,pos:'g'},
  {n:'Romeo Lavia',num:45,pos:'m'}]},
 liverpool:{players:[
  {n:'Alisson Becker',num:1,pos:'g'},{n:'Joe Gomez',num:2,pos:'d'},{n:'Wataru Endo',num:3,pos:'m'},{n:'Virgil van Dijk',num:4,pos:'d'},
  {n:'Jeremy Jacquet',num:5,pos:'d'},{n:'Milos Kerkez',num:6,pos:'d'},{n:'Florian Wirtz',num:7,pos:'m'},{n:'Dominik Szoboszlai',num:8,pos:'m'},
  {n:'Alexander Isak',num:9,pos:'f'},{n:'Alexis Mac Allister',num:10,pos:'m'},{n:'Conor Bradley',num:12,pos:'d'},{n:'Federico Chiesa',num:14,pos:'f'},
  {n:'Giovanni Leoni',num:15,pos:'d'},{n:'Cody Gakpo',num:18,pos:'f'},{n:'Kostas Tsimikas',num:21,pos:'d'},{n:'Hugo Ekitike',num:22,pos:'f'},
  {n:'Victor Munoz',num:23,pos:'d'},{n:'Giorgi Mamardashvili',num:25,pos:'g'},{n:'Freddie Woodman',num:28,pos:'g'},{n:'Bradley Barcola',num:29,pos:'f'},
  {n:'Jeremie Frimpong',num:30,pos:'d'},{n:'Ronald Araujo',num:33,pos:'d'},{n:'Ryan Gravenberch',num:38,pos:'m'},{n:'Trey Nyoni',num:42,pos:'m'},
  {n:'Luke Chambers',num:44,pos:'d'},{n:'Isaac Mabaya',num:52,pos:'d'},{n:'James McConnell',num:53,pos:'m'},{n:'Vitezslav Jaros',num:56,pos:'g'},
  {n:'Lewis Koumas',num:67,pos:'f'},{n:'Rio Ngumoha',num:73,pos:'f'},{n:'Jayden Danns',num:76,pos:'f'},{n:'Harvey Davies',num:95,pos:'g'}]},
 spurs:{players:[
  {n:'Antonin Kinsky',num:31,pos:'g'},{n:'Martin Dubravka',num:39,pos:'g'},{n:'Andy Robertson',num:3,pos:'d'},{n:'Tosin Adarabioyo',num:4,pos:'d'},
  {n:'Marcos Senesi',num:5,pos:'d'},{n:'Jan Paul van Hecke',num:6,pos:'d'},{n:'Destiny Udogie',num:13,pos:'d'},{n:'Pedro Porro',num:23,pos:'d'},
  {n:'Ben Davies',num:33,pos:'d'},{n:'Micky van de Ven',num:37,pos:'d'},{n:'Kota Takai',num:25,pos:'d'},{n:'Kevin Danso',num:26,pos:'d'},
  {n:'Xavi Simons',num:7,pos:'m'},{n:'Conor Gallagher',num:8,pos:'m'},{n:'James Maddison',num:10,pos:'m'},{n:'Archie Gray',num:14,pos:'m'},
  {n:'Lucas Bergvall',num:15,pos:'m'},{n:'Sandro Tonali',num:16,pos:'m'},{n:'Mateus Fernandes',num:18,pos:'m'},{n:'Mohammed Kudus',num:20,pos:'m'},
  {n:'Dejan Kulusevski',num:21,pos:'m'},{n:'Rodrigo Bentancur',num:30,pos:'m'},{n:'Pape Matar Sarr',num:29,pos:'m'},{n:'Souza',num:38,pos:'m'},
  {n:'Mathys Tel',num:11,pos:'f'},{n:'Richarlison',num:9,pos:'f'},{n:'Dominic Solanke',num:19,pos:'f'},{n:'Wilson Odobert',num:28,pos:'f'},
  {n:'Dane Scarlett',num:44,pos:'f'},{n:'Mikey Moore',num:47,pos:'f'},{n:'Callum Olusesi',num:52,pos:'m'},{n:'Luca Williams-Barnett',num:68,pos:'m'}]},
 newcastle:{players:[
  {n:'Nick Pope',num:1,pos:'g'},{n:'Tino Livramento',num:2,pos:'d'},{n:'Lewis Hall',num:3,pos:'d'},{n:'Sven Botman',num:4,pos:'d'},
  {n:'Fabian Schar',num:5,pos:'d'},{n:'Nico Gonzalez',num:6,pos:'m'},{n:'Joelinton',num:7,pos:'m'},{n:'Aladji Bamba',num:8,pos:'m'},
  {n:'Yoane Wissa',num:9,pos:'f'},{n:'William Osula',num:10,pos:'f'},{n:'Harvey Barnes',num:11,pos:'f'},{n:'Malick Thiaw',num:12,pos:'d'},
  {n:'Sean Steur',num:14,pos:'m'},{n:'Bazoumana Toure',num:17,pos:'f'},{n:'Anthony Elanga',num:19,pos:'f'},{n:'Matias Fernandez-Pardo',num:20,pos:'f'},
  {n:'Lukas Hornicek',num:21,pos:'g'},{n:'Jacob Murphy',num:23,pos:'f'},{n:'Ewen Jaouen',num:24,pos:'f'},{n:'Joe Willock',num:28,pos:'m'},
  {n:'Mark Gillespie',num:29,pos:'g'},{n:'Aidan Harris',num:31,pos:'d'},{n:'Dan Burn',num:33,pos:'d'},{n:'Amar Dedic',num:37,pos:'d'},
  {n:'Jacob Ramsey',num:41,pos:'m'},{n:'Leo Shahar',num:51,pos:'d'},{n:'Lewis Miley',num:67,pos:'m'}]}
};

/* dedupe: keep first occurrence per shirt number */
(function(){Object.keys(SQUADS).forEach(function(t){var seen={};SQUADS[t].players=SQUADS[t].players.filter(function(p){if(seen[p.num])return false;seen[p.num]=true;return true;});});})();

/* ---------- club identity ---------- */
var CLUBS={
 arsenal:{name:'Arsenal',color:'#EF0107',color2:'#FFFFFF',accent:'#9C824A',room:'#1a0f0f',kitHome:{body:'#EF0107',sleeves:'#FFFFFF',num:'#FFFFFF'},kitAway:{body:'#FFE500',sleeves:'#001D5A',num:'#001D5A'},gkKit:{body:'#2FBF71',num:'#01301D'}},
 mancity:{name:'Manchester City',color:'#6CABDD',color2:'#FFFFFF',accent:'#00285E',room:'#0e1626',kitHome:{body:'#6CABDD',sleeves:'#FFFFFF',num:'#00285E'},kitAway:{body:'#0E1177',sleeves:'#FFFFFF',num:'#FFFFFF'},gkKit:{body:'#FFD700',num:'#01301D'}},
 manutd:{name:'Manchester United',color:'#DA020E',color2:'#FFFFFF',accent:'#FBE122',room:'#1a0c0c',kitHome:{body:'#DA020E',sleeves:'#DA020E',num:'#FBE122'},kitAway:{body:'#111111',sleeves:'#111111',num:'#DA020E'},gkKit:{body:'#2FBF71',num:'#01301D'}},
 chelsea:{name:'Chelsea',color:'#034694',color2:'#FFFFFF',accent:'#EDEDED',room:'#0b1226',kitHome:{body:'#034694',sleeves:'#034694',num:'#FFFFFF'},kitAway:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#034694'},gkKit:{body:'#FFD700',num:'#01301D'}},
 liverpool:{name:'Liverpool',color:'#C8102E',color2:'#FFFFFF',accent:'#F6EB61',room:'#1c090c',kitHome:{body:'#C8102E',sleeves:'#C8102E',num:'#FFFFFF'},kitAway:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#C8102E'},gkKit:{body:'#2FBF71',num:'#01301D'}},
 spurs:{name:'Tottenham Hotspur',color:'#132257',color2:'#FFFFFF',accent:'#F1F5FC',room:'#0d1527',kitHome:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#132257'},kitAway:{body:'#132257',sleeves:'#132257',num:'#FFFFFF'},gkKit:{body:'#FFD700',num:'#01301D'}},
 newcastle:{name:'Newcastle United',color:'#2b2626',color2:'#FFFFFF',accent:'#41d6a3',room:'#141414',kitHome:{body:'#241F20',sleeves:'#FFFFFF',num:'#FFFFFF'},kitAway:{body:'#FFFFFF',sleeves:'#FFFFFF',num:'#241F20'},gkKit:{body:'#2FBF70',num:'#01301D'}}
};


/* ---------- team picker ---------- */
function showLockers(){
  setNav('lockers');
  showPage('lockers');
  if(!curTeam) renderPicker();
}
function renderPicker(){
  $id('lk-topbar').style.display='none';
  $id('lk-hint').style.display='none';
  $id('lk-picker').style.display='block';
  $id('lk-sheet').classList.remove('open');
  $id('lk-picker').innerHTML=`
    <div class="lk-ptitle">🚪 The <span>Locker Room</span></div>
    <div class="lk-psub">Pick a club — step inside their 3D locker room</div>
    <div class="lk-grid">`+
    Object.keys(CLUBS).map(function(tid){
      var c=CLUBS[tid];
      return '<div class="lk-card" style="background:linear-gradient(135deg,'+c.color+' 0%,'+shade(c.color,-0.45)+' 100%)" onclick="lkEnter(\''+tid+'\')">'+
        '<div class="lk-card-badge">PREMIER LEAGUE</div>'+
        '<div class="lk-card-emoji">⚽</div>'+
        '<div class="lk-card-name">'+c.name+'</div>'+
        '<div class="lk-card-sub">2026/27 Squad · '+SQUADS[tid].players.length+' players</div>'+
        '<div class="lk-card-3d">▶ ENTER 3D ROOM</div>'+
      '</div>';
    }).join('')+
    '</div>'+
    '<div class="lk-note">Tap a locker to open it · Drag to look around · Pinch/scroll to zoom<br>Player numbers follow each club’s official 2026/27 squad list.</div>';
}
function lkEnter(tid){
  curTeam=tid;
  $id('lk-picker').style.display='none';
  $id('lk-teamname').textContent=CLUBS[tid].name;
  $id('lk-topbar').style.display='flex';
  $id('lk-hint').style.display='block';
  var hdr=document.getElementById('main-hdr');
  if(hdr) hdr.style.display='none';
  loadRoom(tid);
}
function lkExitRoom(){
  disposeRoom();
  curTeam=null;
  var hdr=document.getElementById('main-hdr');
  if(hdr) hdr.style.display='flex';
  renderPicker();
}

/* ---------- three.js loader (classic global build) ---------- */
function loadThree(){
  if(window.THREE) return Promise.resolve();
  if(threePromise) return threePromise;
  threePromise=new Promise(function(res,rej){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js';
    s.onload=res;
    s.onerror=function(){threePromise=null;rej(new Error('3D engine failed to load'))};
    document.head.appendChild(s);
  });
  return threePromise;
}

/* ---------- room build ---------- */
function loadRoom(tid){
  $id('lk-loading').style.display='flex';
  $id('lk-loading-txt').textContent='Entering the '+CLUBS[tid].name+' locker room…';
  loadThree().then(function(){
    try{ buildRoom(tid); }
    catch(err){ lkExitRoom(); showToast('3D view failed to start on this device'); return; }
    $id('lk-loading').style.display='none';
  }).catch(function(){
    $id('lk-loading').style.display='none';
    lkExitRoom();
    showToast('Could not load the 3D engine. Check your connection.');
  });
}
function disposeRoom(){
  if(rafId){cancelAnimationFrame(rafId);rafId=0;}
  if(renderer){try{renderer.dispose();}catch(e){}}
  scene=null;camera=null;renderer=null;S=null;
}
function buildRoom(tid){
  disposeRoom();
  var club=CLUBS[tid], squad=SQUADS[tid].players;
  var T=window.THREE;
  var wrap=$id('lk-canvas-wrap'), canvas=$id('lk-canvas');
  var w=wrap.clientWidth||window.innerWidth, h=wrap.clientHeight||window.innerHeight;

  scene=new T.Scene();
  scene.fog=new T.Fog(club.room,9,30);
  scene.background=new T.Color(club.room);

  camera=new T.PerspectiveCamera(55,w/h,0.1,100);

  try{ renderer=new T.WebGLRenderer({canvas:canvas,antialias:true}); }
  catch(e){ throw new Error('no webgl'); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(w,h,false);

  scene.add(new T.AmbientLight(0xffffff,0.5));
  var key=new T.DirectionalLight(0xffffff,0.85); key.position.set(2,6,4); scene.add(key);
  var fill=new T.DirectionalLight(club.color,0.35); fill.position.set(-3,4,-2); scene.add(fill);
  var strip=new T.PointLight(club.color,1.1,11,1.8); strip.position.set(0,3.4,0); scene.add(strip);

  var floor=new T.Mesh(new T.PlaneGeometry(20,14),new T.MeshStandardMaterial({color:new T.Color(club.color).multiplyScalar(0.16),roughness:0.55,metalness:0.25}));
  floor.rotation.x=-Math.PI/2; scene.add(floor);

  var wallMat=new T.MeshStandardMaterial({color:club.room,roughness:0.9});
  var wallDefs=[[0,3,-9,0,20],[0,3,9,Math.PI,20],[9,3,0,-Math.PI/2,18],[-9,3,0,Math.PI/2,18]];
  wallDefs.forEach(function(w){
    var m=new T.Mesh(new T.PlaneGeometry(w[4],6),wallMat);
    m.position.set(w[0],w[1],w[2]); m.rotation.y=w[3]; scene.add(m);
  });

  var stripe=new T.Mesh(new T.PlaneGeometry(19.8,0.5),new T.MeshStandardMaterial({color:club.color,emissive:club.color,emissiveIntensity:0.22}));
  stripe.position.set(0,3.72,-8.95); scene.add(stripe);

  var ceil=new T.Mesh(new T.PlaneGeometry(20,18),new T.MeshStandardMaterial({color:shade(club.room,0.25),roughness:1}));
  ceil.rotation.x=Math.PI/2; ceil.position.y=6; scene.add(ceil);

  for(var i=0;i<4;i++){
    var bar=new T.Mesh(new T.BoxGeometry(6,0.08,0.3),new T.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.9}));
    bar.position.set(0,5.9,-6+i*4); scene.add(bar);
  }

  var rug=new T.Mesh(new T.CircleGeometry(2.6,40),new T.MeshStandardMaterial({color:shade(club.color,-0.25),roughness:1}));
  rug.rotation.x=-Math.PI/2; rug.position.set(0,0.01,-3); scene.add(rug);
  var ring=new T.Mesh(new T.RingGeometry(2.45,2.6,40),new T.MeshStandardMaterial({color:club.accent,emissive:club.accent,emissiveIntensity:0.4}));
  ring.rotation.x=-Math.PI/2; ring.position.set(0,0.012,-3); scene.add(ring);

  var benchMat=new T.MeshStandardMaterial({color:shade(club.color,-0.5),roughness:0.7});
  var benchTop=new T.Mesh(new T.BoxGeometry(10,0.1,0.5),benchMat);
  benchTop.position.set(0,0.45,-4.4); scene.add(benchTop);
  var legGeo=new T.BoxGeometry(0.12,0.45,0.4);
  [-4.6,-2.6,0,2.6,4.6].forEach(function(x){var l=new T.Mesh(legGeo,benchMat);l.position.set(x,0.225,-4.4);scene.add(l);});

  var crestTex=makeTextTexture(club.name.toUpperCase(),club,64,'900 84px Arial');
  var crestPlane=new T.Mesh(new T.PlaneGeometry(7,1.2),new T.MeshBasicMaterial({map:crestTex,transparent:true}));
  crestPlane.position.set(0,4.4,-8.97); scene.add(crestPlane);

  S={lockers:[],openLocker:null,team:tid,club:club,
     orbit:{lon:0,lat:8,dist:8},focus:null,
     ray:new T.Raycaster()};

  var players=squad;
  var cols=7;
  var cw=1.12,chh=1.34,gap=0.16;
  var totalW=cols*cw+(cols-1)*gap;
  var startX=-(totalW-cw)/2;
  var lockerFrame=new T.MeshStandardMaterial({color:shade(club.color,-0.45),roughness:0.6,metalness:0.35});
  var lockerDoor=new T.MeshStandardMaterial({color:club.color,roughness:0.4,metalness:0.2});
  var lockerInner=new T.MeshStandardMaterial({color:shade(club.room,0.18),roughness:0.95});
  var trimMat=new T.MeshStandardMaterial({color:club.accent,roughness:0.5,metalness:0.3});

  players.forEach(function(player,i){
    var col=i%cols,row=Math.floor(i/cols);
    var x=startX+col*(cw+gap);
    var y=1.62+row*1.55;
    var grp=new T.Group();
    grp.position.set(x,y,-8.78);
    var body=new T.Mesh(new T.BoxGeometry(cw,chh,0.6),lockerFrame);
    grp.add(body);
    var inner=new T.Mesh(new T.BoxGeometry(cw-0.1,chh-0.1,0.54),lockerInner);
    inner.position.z=-0.04; grp.add(inner);
    var door=new T.Group();
    var doorPanel=new T.Mesh(new T.BoxGeometry(cw-0.06,chh-0.06,0.05),lockerDoor);
    door.add(doorPanel);
    var numMesh=new T.Mesh(new T.PlaneGeometry(0.5,0.5),new T.MeshBasicMaterial({map:makeNumTexture(player.num,club),transparent:true}));
    numMesh.position.set(0,0.14,0.033); door.add(numMesh);
    var nameMesh=new T.Mesh(new T.PlaneGeometry(cw-0.14,0.2),new T.MeshBasicMaterial({map:makeNameTexture(player.n,club),transparent:true}));
    nameMesh.position.set(0,-0.42,0.033); door.add(nameMesh);
    var handle=new T.Mesh(new T.BoxGeometry(0.16,0.05,0.05),trimMat);
    handle.position.set((cw/2)-0.18,-0.28,0.05); door.add(handle);
    door.position.set(-(cw/2)+0.03,0,0.31);
    door.userData.targetRot=0;
    grp.add(door);
    grp.userData={player:player,door:door,open:false,jersey:null};
    scene.add(grp);
    S.lockers.push(grp);
  });

  bindRoomInput(canvas);
  onResize();
  animate();
}

/* ---------- canvas text textures ---------- */
function makeTextTexture(text,club,size,font){
  var c=document.createElement('canvas');c.width=512;c.height=size*1.6|0;
  var g=c.getContext('2d');
  g.font=font;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=club.color2;
  g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=6;
  g.strokeText(text,256,c.height/2);
  g.fillText(text,256,c.height/2);
  var t=new window.THREE.CanvasTexture(c);t.anisotropy=4;return t;
}
function makeNumTexture(num,club){
  var c=document.createElement('canvas');c.width=256;c.height=256;
  var g=c.getContext('2d');
  g.font='900 150px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=club.color2;g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=6;
  g.strokeText(String(num),128,132);g.fillText(String(num),128,132);
  var t=new window.THREE.CanvasTexture(c);t.anisotropy=4;return t;
}
function makeNameTexture(name,club){
  var c=document.createElement('canvas');c.width=512;c.height=96;
  var g=c.getContext('2d');
  g.font='700 34px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=club.color2;g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=5;
  g.strokeText(name.toUpperCase(),256,50);g.fillText(name.toUpperCase(),256,50);
  var t=new window.THREE.CanvasTexture(c);t.anisotropy=4;return t;
}


/* ---------- jersey inside locker ---------- */
function buildJersey(player,club){
  var T=window.THREE;
  var grp=new T.Group();
  var kit=(player.pos==='g')?club.gkKit:club.kitHome;
  var bodyMat=new T.MeshStandardMaterial({color:kit.body,roughness:0.85});
  var sleeveMat=new T.MeshStandardMaterial({color:kit.sleeves,roughness:0.85});
  var hangMat=new T.MeshStandardMaterial({color:0x888888,metalness:0.8,roughness:0.3});
  var bar=new T.Mesh(new T.CylinderGeometry(0.012,0.012,0.42,8),hangMat);
  bar.rotation.z=Math.PI/2; bar.position.y=0.5; grp.add(bar);
  var torso=new T.Mesh(new T.CylinderGeometry(0.2,0.24,0.58,16),bodyMat);
  torso.position.y=0.16; grp.add(torso);
  var shoulders=new T.Mesh(new T.SphereGeometry(0.235,16,12,0,Math.PI*2,0,Math.PI/2.6),bodyMat);
  shoulders.position.y=0.45; grp.add(shoulders);
  [-1,1].forEach(function(s){
    var sleeve=new T.Mesh(new T.CylinderGeometry(0.075,0.09,0.26,12),sleeveMat);
    sleeve.position.set(s*0.27,0.36,0); sleeve.rotation.z=s*Math.PI/5.2; grp.add(sleeve);
  });
  var collar=new T.Mesh(new T.TorusGeometry(0.115,0.03,8,20),sleeveMat);
  collar.rotation.x=Math.PI/2; collar.position.y=0.48; grp.add(collar);
  var numMesh=new T.Mesh(new T.PlaneGeometry(0.3,0.3),new T.MeshBasicMaterial({map:makeNumTexture(player.num,{color2:kit.num}),transparent:true}));
  numMesh.position.set(0,0.06,0.23); grp.add(numMesh);
  var nameMesh=new T.Mesh(new T.PlaneGeometry(0.5,0.12),new T.MeshBasicMaterial({map:makeNameTexture(player.n,{color2:kit.num}),transparent:true}));
  nameMesh.position.set(0,0.32,0.21); grp.add(nameMesh);
  return grp;
}

/* ---------- locker open/close + sheet ---------- */
function lkOpenLocker(grp){
  if(S.openLocker===grp){ lkCloseLocker(); return; }
  lkCloseLocker();
  var player=grp.userData.player, club=S.club;
  grp.userData.open=true;
  grp.userData.door.userData.targetRot=-1.9;
  if(!grp.userData.jersey){
    var j=buildJersey(player,club);
    j.position.set(0,-0.1,0.05);
    grp.add(j); grp.userData.jersey=j;
  }
  grp.userData.jersey.visible=true;
  S.openLocker=grp;
  S.focus={x:grp.position.x,y:grp.position.y-0.1,z:grp.position.z};
  showSheet(player,club);
}
function lkCloseLocker(){
  if(S&&S.openLocker){
    var g=S.openLocker;
    g.userData.open=false;
    g.userData.door.userData.targetRot=0;
    if(g.userData.jersey) g.userData.jersey.visible=false;
    S.openLocker=null;
  }
  if(S) S.focus=null;
  hideSheet();
}
function showSheet(player,club){
  SEL=player;
  var kitLbl=(player.pos==='g')?'Goalkeeper Kit':'Home Kit';
  var numEl=$id('lk-sheet-num');
  numEl.textContent=player.num;
  numEl.style.background=club.color;
  numEl.style.color=club.color2;
  $id('lk-sheet-name').textContent=player.n;
  $id('lk-sheet-pos').textContent=posLabel(player.pos)+' · '+club.name+' '+kitLbl;
  $id('lk-sheet').classList.add('open');
}
function hideSheet(){ SEL=null; $id('lk-sheet').classList.remove('open'); }
function posLabel(p){return {g:'Goalkeeper',d:'Defender',m:'Midfielder',f:'Forward'}[p]||'Player'}

/* ---------- buy / personalize hooks ---------- */
function lkAddKit(){
  if(!SEL) return;
  var team=null,prod=null;
  cfg.leagues.forEach(function(lg){ (lg.teams||[]).forEach(function(t){ if(t.id===S.team){ team=t; prod=(t.products||[]).find(function(p){return /home/i.test(p.kitType||'')})||(t.products||[])[0]; } }); });
  if(!prod){ showToast('Kit not found in shop catalog'); return; }
  var name=(team?team.name+' ':'')+prod.kitType;
  var item={...prod,name:name,teamName:team?team.name:'',size:(cfg.sizes&&cfg.sizes[2])||'M',qty:1};
  var ex=cart.find(function(i){return i.id===item.id&&i.size===item.size&&!i.custom});
  if(ex) ex.qty++; else cart.push(item);
  saveCart(); updateBadge();
  showToast(name+' added! 🛒');
}
function lkPersonalize(){
  if(!SEL) return;
  var targetId=null;
  cfg.leagues.forEach(function(lg){ (lg.teams||[]).forEach(function(t){ if(t.id===S.team) (t.products||[]).forEach(function(p){ if(/home/i.test(p.kitType||'')&&targetId===null) targetId=p.id; }); }); });
  var player=SEL;
  lkCloseLocker();
  if(typeof goCustom==='function') goCustom(targetId);
  setTimeout(function(){
    try{
      customState.name=player.n.split(' ').slice(-1)[0].toUpperCase();
      customState.number=String(player.num);
      var pn=$id('custom-preview-name'),pt=$id('custom-preview-number');
      if(pn) pn.textContent=customState.name;
      if(pt) pt.textContent=customState.number;
      var nIn=$id('custom-name-input'),tIn=$id('custom-number-input');
      if(nIn) nIn.value=customState.name;
      if(tIn) tIn.value=customState.number;
    }catch(e){}
  },80);
}

/* ---------- input: orbit, zoom, tap-to-open ---------- */
function bindRoomInput(canvas){
  var down=false,lastX=0,lastY=0,moved=false,downX=0,downY=0,pinchStart=0,pinchDist=0;
  function pos(e){var t=e.touches?e.touches[0]||e.changedTouches[0]:e;return {x:t.clientX,y:t.clientY}}
  canvas.addEventListener('pointerdown',function(e){
    down=true;moved=false;var p=pos(e);downX=lastX=p.x;downY=lastY=p.y;
    if(canvas.setPointerCapture){try{canvas.setPointerCapture(e.pointerId);}catch(x){}}
  });
  canvas.addEventListener('pointermove',function(e){
    if(!down)return;
    var p=pos(e);var dx=p.x-lastX,dy=p.y-lastY;
    if(Math.abs(p.x-downX)>7||Math.abs(p.y-downY)>7) moved=true;
    lastX=p.x;lastY=p.y;
    S.orbit.lon-=dx*0.22; S.orbit.lat+=dy*0.16;
    S.orbit.lat=Math.max(-6,Math.min(44,S.orbit.lat));
  });
  canvas.addEventListener('pointerup',function(e){
    down=false;
    if(moved) return;
    var r=canvas.getBoundingClientRect();
    pickLocker(((e.clientX-r.left)/r.width)*2-1, -(((e.clientY-r.top)/r.height)*2-1));
  });
  canvas.addEventListener('pointercancel',function(){down=false});
  canvas.addEventListener('touchstart',function(e){
    if(e.touches.length===2){
      pinchStart=S.orbit.dist;
      pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      down=false;
    }
  },{passive:true});
  canvas.addEventListener('touchmove',function(e){
    if(e.touches.length===2&&pinchStart){
      var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      S.orbit.dist=Math.max(3.4,Math.min(14,pinchStart*(pinchDist/d)));
    }
  },{passive:true});
  canvas.addEventListener('wheel',function(e){
    e.preventDefault();
    S.orbit.dist=Math.max(3.4,Math.min(14,S.orbit.dist+e.deltaY*0.004));
  },{passive:false});
  window.addEventListener('resize',onResize);
}

function pickLocker(x,y){
  var T=window.THREE;
  S.ray.setFromCamera({x:x,y:y},camera);
  var meshes=[];
  S.lockers.forEach(function(g){ g.traverse(function(o){ if(o.isMesh) meshes.push(o); }); });
  var hit=S.ray.intersectObjects(meshes,false)[0];
  if(!hit){ lkCloseLocker(); return; }
  var o=hit.object, grp=null;
  while(o){ if(o.userData&&o.userData.player){grp=o;break;} o=o.parent; }
  if(grp) lkOpenLocker(grp); else lkCloseLocker();
}

function onResize(){
  if(!renderer||!camera) return;
  var wrap=$id('lk-canvas-wrap');
  var w=wrap.clientWidth||window.innerWidth,h=wrap.clientHeight||window.innerHeight;
  camera.aspect=w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}

function animate(){
  rafId=requestAnimationFrame(animate);
  if(!renderer||!S) return;
  var o=S.orbit;
  var tx=0,ty=1.75,tz=-5.2,dist=o.dist;
  if(S.focus){ tx=S.focus.x; ty=S.focus.y; tz=S.focus.z+2.9; dist=2.5; }
  var phi=(90-o.lat)*Math.PI/180, theta=o.lon*Math.PI/180;
  var cx=tx+dist*Math.sin(phi)*Math.sin(theta);
  var cy=Math.max(0.6,ty+dist*Math.cos(phi)*0.42);
  var cz=tz+dist*Math.cos(phi)*Math.cos(theta);
  camera.position.lerp(new window.THREE.Vector3(cx,cy,cz),0.09);
  camera.lookAt(tx,ty,tz);
  S.lockers.forEach(function(g){
    var d=g.userData.door;
    d.rotation.y+=((d.userData.targetRot||0)-d.rotation.y)*0.16;
  });
  renderer.render(scene,camera);
}


/* ---------- expose + bootstrap ---------- */
window.showLockers=showLockers;
window.lkEnter=lkEnter;
window.lkExitRoom=lkExitRoom;
window.lkAddKit=lkAddKit;
window.lkPersonalize=lkPersonalize;
window.lkCloseLocker=lkCloseLocker;

function injectMarkup(){
  if($id('page-lockers')) return;
  var pg=document.createElement('div');
  pg.id='page-lockers';
  pg.className='page';
  pg.innerHTML=
    '<div class="lk-wrap" id="lk-canvas-wrap">'+
      '<canvas id="lk-canvas"></canvas>'+
      '<div class="lk-topbar" id="lk-topbar">'+
        '<button class="lk-back" onclick="lkExitRoom()">← Teams</button>'+
        '<div class="lk-teamname" id="lk-teamname"></div>'+
      '</div>'+
      '<div class="lk-hint" id="lk-hint">Tap a locker · Drag to look around · Pinch to zoom</div>'+
      '<div class="lk-loading" id="lk-loading"><div class="lk-spinner"></div><div class="lk-loading-txt" id="lk-loading-txt">Loading…</div></div>'+
      '<div class="lk-picker" id="lk-picker"></div>'+
      '<div class="lk-sheet" id="lk-sheet">'+
        '<div class="lk-sheet-top">'+
          '<div class="lk-num" id="lk-sheet-num">7</div>'+
          '<div style="flex:1"><div class="lk-pname" id="lk-sheet-name">—</div><div class="lk-ppos" id="lk-sheet-pos">—</div></div>'+
        '</div>'+
        '<div class="lk-btns">'+
          '<button class="lk-btn lk-btn-primary" onclick="lkAddKit()">Add Kit 🛒</button>'+
          '<button class="lk-btn lk-btn-ghost" onclick="lkPersonalize()">Personalize 🎨</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  document.body.appendChild(pg);

  /* replace the old Custom tab with Lockers */
  var navCustom=document.getElementById('nav-custom');
  if(navCustom){
    navCustom.id='nav-lockers';
    navCustom.setAttribute('onclick','showLockers()');
    navCustom.innerHTML='<div class="nav-icon">🚪</div><div class="nav-lbl">Lockers</div>';
  }

  /* hide the main header while inside a 3D room */
  var origShowPage=window.showPage;
  window.showPage=function(p){
    origShowPage(p);
    var hdr=document.getElementById('main-hdr');
    if(hdr&&p==='lockers') hdr.style.display=curTeam?'none':'flex';
  };

  /* nav highlight support */
  var origSetNav=window.setNav;
  window.setNav=function(p){
    origSetNav(p);
    var lock=document.getElementById('nav-lockers');
    if(lock) lock.classList.toggle('active',p==='lockers');
  };
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectMarkup);
else injectMarkup();
})();
