/*
============================================================
 LUCKY'S — 3D LOCKER ROOM  ·  lockers.js   (v2.0)
============================================================
 Procedural Three.js (WebGL) club locker rooms, modelled on the
 real stadium dressing rooms (U-shaped room, white bays, red
 dividers, curved header band, bench with open shelves, glowing
 floor strip, club crest on the floor).

 - Cinematic intro (counter -> "Enter with sound / muted")
 - Stand in the room, drag to look around, pinch / wheel to zoom
 - Hover a shirt (desktop) · tap / click to take it down off the
   rail · drag to turn it · tap outside to hang it back
 - "Add Kit" -> existing cart, "Personalize" -> existing customizer
 - Optional "Watch real tour" video per club (club.tour)

 INSTALL: upload next to index.html and keep
   <script src="lockers.js"></script>   just before </body>
============================================================
*/
(function(){
'use strict';
if(window.__lkInit)return;window.__lkInit=true;

/* ---------- injected styles ---------- */
var css=`
#page-lockers{position:fixed;inset:0;display:none;background:#0a0807;color:#fff}
#page-lockers.active{display:block}
.lk-wrap{position:absolute;inset:0;overflow:hidden;background:#0a0807}
#lk-canvas{width:100%;height:100%;display:block;touch-action:none;outline:none;cursor:grab}
#lk-canvas.lk-pointer{cursor:pointer}
.lk-dim{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .45s ease;z-index:10;background:radial-gradient(ellipse at 50% 42%,rgba(10,8,7,.18) 0%,rgba(10,8,7,.72) 100%)}
.lk-dim.on{opacity:1}
.lk-topbar{position:absolute;top:0;left:0;right:0;display:none;align-items:center;gap:8px;padding:12px 14px;z-index:20;background:linear-gradient(180deg,rgba(10,8,7,.72),rgba(10,8,7,0));pointer-events:none}
.lk-topbar *{pointer-events:auto}
.lk-back,.lk-ibtn{background:rgba(20,16,14,.55);border:1px solid rgba(255,255,255,.26);color:#fff;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.lk-back{padding:8px 14px}
.lk-ibtn{min-width:38px;height:36px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;font-size:15px}
.lk-teamname{font-size:15px;font-weight:800;color:#fff;letter-spacing:.4px;text-shadow:0 1px 3px rgba(0,0,0,.6);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lk-hint{position:absolute;left:0;right:0;display:none;text-align:center;font-size:12px;color:rgba(255,255,255,.88);z-index:15;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.8);bottom:82px;transition:opacity .6s ease}
.lk-picker{position:absolute;inset:0;overflow-y:auto;z-index:30;background:radial-gradient(ellipse at 50% -10%,rgba(235,2,2,.22),#0a0807 60%);padding:18px 14px 94px}
.lk-ptitle{font-family:var(--brand-font,Georgia,serif);font-size:28px;font-weight:400;color:#fff;line-height:1.1;margin:6px 0 4px}
.lk-ptitle span{color:var(--accent,#fff)}
.lk-psub{font-size:13px;color:rgba(255,255,255,.68);margin-bottom:16px}
.lk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.lk-card{border-radius:16px;padding:14px 16px 16px;cursor:pointer;border:1px solid rgba(255,255,255,.14);position:relative;overflow:hidden;color:#fff;min-height:104px;display:flex;flex-direction:column;justify-content:flex-end;transition:transform .15s ease;box-shadow:0 10px 24px rgba(0,0,0,.35)}
.lk-card:active{transform:scale(.96)}
.lk-card-emoji{font-size:24px;position:absolute;top:10px;right:12px;opacity:.9}
.lk-card-badge{position:absolute;top:12px;left:14px;font-size:9px;font-weight:800;letter-spacing:1px;background:rgba(255,255,255,.22);padding:3px 8px;border-radius:20px}
.lk-card-name{font-weight:800;font-size:16px;line-height:1.1;padding-right:30px}
.lk-card-sub{font-size:11px;opacity:.85;margin-top:3px}
.lk-card-3d{margin-top:8px;font-size:10px;font-weight:700;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 8px;display:inline-block;width:fit-content}
.lk-sheet{position:absolute;left:0;right:0;z-index:40;background:rgba(14,11,10,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid rgba(255,255,255,.16);border-radius:18px 18px 0 0;padding:14px 16px 16px;bottom:64px;transform:translateY(170%);transition:transform .38s cubic-bezier(.2,.9,.3,1)}
.lk-sheet.open{transform:translateY(0)}
.lk-sheet-top{display:flex;align-items:center;gap:13px;margin-bottom:12px}
.lk-num{min-width:54px;height:54px;border-radius:13px;display:flex;align-items:center;justify-content:center;font:900 24px Arial,sans-serif}
.lk-pname{font-size:17px;font-weight:800;color:#fff;line-height:1.1}
.lk-ppos{font-size:12px;color:rgba(255,255,255,.62);margin-top:2px}
.lk-btns{display:flex;gap:9px}
.lk-btn{flex:1;padding:13px 8px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;text-align:center}
.lk-btn-primary{background:var(--accent,#fff);color:#101218}
.lk-btn-ghost{background:rgba(255,255,255,.09);color:#fff;border:1px solid rgba(255,255,255,.22)}
.lk-note{margin-top:16px;font-size:11px;color:rgba(255,255,255,.55);line-height:1.6;text-align:center}
.lk-intro{position:absolute;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:#0a0807;transition:opacity .7s ease}
.lk-intro.out{opacity:0;pointer-events:none}
.lk-intro-kicker{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:18px}
.lk-intro-count{font-family:var(--brand-font,Georgia,serif);font-size:84px;line-height:1;font-weight:400;font-variant-numeric:tabular-nums;color:#fff;letter-spacing:2px}
.lk-intro-label{margin-top:14px;font-size:13px;color:rgba(255,255,255,.7);letter-spacing:.6px}
.lk-intro-bar{width:min(240px,60vw);height:2px;background:rgba(255,255,255,.14);margin:18px 0 0;border-radius:2px;overflow:hidden}
.lk-intro-bar i{display:block;height:100%;width:0;background:#fff}
.lk-intro-actions{display:none;flex-direction:column;align-items:center;gap:10px;margin-top:26px}
.lk-intro-actions.show{display:flex}
.lk-enter{min-width:220px;padding:14px 22px;border-radius:30px;border:none;background:#fff;color:#0a0807;font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.3px}
.lk-enter.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3);font-weight:600}
.lk-intro-note{font-size:11px;color:rgba(255,255,255,.45);margin-top:4px}
.lk-tour{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;flex-direction:column;padding:14px}
.lk-tour.show{display:flex}
.lk-tour video{width:100%;max-height:78%;border-radius:12px;background:#000}
.lk-tour button{margin-top:14px}
`;
(function(){var s=document.createElement('style');s.id='lk-style';s.textContent=css;document.head.appendChild(s);})();

/* ---------- state ---------- */
var curTeam=null,scene=null,camera=null,renderer=null,S=null,rafId=0,threePromise=null,SEL=null,T=null,maxAniso=4;
var AC=null,soundOn=false,ambient=null,introTimer=0,hintTimer=0;

/* ---------- helpers ---------- */
function $id(id){return document.getElementById(id)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function angDiff(d){while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d}
function lum(hex){var c=parseInt(hex.slice(1),16);return (0.2126*((c>>16)&255)+0.7152*((c>>8)&255)+0.0722*(c&255))/255}
function shade(hex,p){var c=parseInt(hex.slice(1),16),r=(c>>16)&255,g=(c>>8)&255,b=c&255;
r=Math.round(r*(1+p));g=Math.round(g*(1+p));b=Math.round(b*(1+p));
r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;
return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function surname(n){
  var w=String(n).split(' ');
  if(w.length===1) return n.toUpperCase();
  var last=w[w.length-1],prev=w[w.length-2].toLowerCase();
  if(['van','de','da','dos','di','le','von','ter','al'].indexOf(prev)>-1) return (w[w.length-2]+' '+last).toUpperCase();
  return last.toUpperCase();
}

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


/* ---------- extra identity used by the 3D rooms ---------- */
Object.assign(CLUBS.arsenal,{
  motto:'WE ARE THE ARSENAL',abbr:'AFC',icon:'cannon',tour:'arsenal-tour.mp4',
  /* colours sampled from the real room video */
  pal:{band:'#e2300a',div:'#d3200f',cushion:'#a3122a',floor:'#d9dde2',wall:'#f5f3f0',led:'#ff3b1f'}
});
/* To use the official crest on the floor, set  crestUrl:'crest.png'  on a club (transparent PNG). */
Object.keys(CLUBS).forEach(function(k){
  var c=CLUBS[k];
  if(!c.abbr) c.abbr=c.name.replace(/[^A-Za-z ]/g,'').split(' ').map(function(w){return w[0]}).join('').slice(0,3).toUpperCase();
  var P=c.pal||{};
  var brightMain=lum(c.color)>0.22?c.color:c.accent;
  c.P={band:P.band||c.color,div:P.div||c.color,cushion:P.cushion||shade(c.color,-0.34),floor:P.floor||'#d8dce0',wall:P.wall||'#f4f2ef',led:P.led||brightMain};
});

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
  $id('lk-picker').innerHTML=
    '<div class="lk-ptitle">🚪 The <span>Locker Rooms</span></div>'+
    '<div class="lk-psub">Pick a club — step inside their 3D locker room</div>'+
    '<div class="lk-grid">'+
    Object.keys(CLUBS).map(function(tid){
      var c=CLUBS[tid];
      return '<div class="lk-card" style="background:linear-gradient(135deg,'+c.color+' 0%,'+shade(c.color,-0.55)+' 100%)" onclick="lkEnter(\''+tid+'\')">'+
        '<div class="lk-card-badge">PREMIER LEAGUE</div>'+
        '<div class="lk-card-emoji">⚽</div>'+
        '<div class="lk-card-name">'+c.name+'</div>'+
        '<div class="lk-card-sub">2026/27 Squad · '+SQUADS[tid].players.length+' players</div>'+
        '<div class="lk-card-3d">▶ ENTER 3D ROOM</div>'+
      '</div>';
    }).join('')+
    '</div>'+
    '<div class="lk-note">Take a shirt off the rail · drag to look around · pinch / scroll to zoom<br>Player numbers follow each club’s official 2026/27 squad list.</div>';
}
function lkEnter(tid){
  curTeam=tid;
  $id('lk-picker').style.display='none';
  $id('lk-teamname').textContent=CLUBS[tid].name;
  $id('lk-topbar').style.display='flex';
  $id('lk-tour-btn').style.display=CLUBS[tid].tour?'inline-flex':'none';
  var hdr=document.getElementById('main-hdr');
  if(hdr) hdr.style.display='none';
  loadRoom(tid);
}
function lkExitRoom(){
  closeInspect(true);
  stopAmbient();
  clearTimeout(introTimer);
  $id('lk-intro').style.display='none';
  $id('lk-tour').classList.remove('show');
  var v=$id('lk-tour-video'); if(v){try{v.pause();}catch(e){}}
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

/* ---------- intro overlay (counter -> enter) ---------- */
var intro={shown:0,target:0,ready:false,timer:0};
function introShow(club){
  var el=$id('lk-intro');
  el.style.display='flex';
  el.classList.remove('out');
  el.style.background='radial-gradient(circle at 50% 36%,'+club.P.band+'33 0%,#0a0807 62%)';
  $id('lk-intro-label').textContent='Opening the '+club.name+' locker room';
  $id('lk-intro-actions').classList.remove('show');
  intro.shown=0;intro.target=8;intro.ready=false;
  introTick();
}
function introTick(){
  clearTimeout(intro.timer);
  var el=$id('lk-intro'); if(!el||el.style.display==='none') return;
  intro.shown+=(intro.target-intro.shown)*0.16+0.35;
  if(intro.shown>intro.target) intro.shown=intro.target;
  var v=Math.round(intro.shown);
  $id('lk-intro-count').textContent=('00'+v).slice(-3).replace(/^0*(\d{3})$/,'$1');
  $id('lk-intro-fill').style.width=v+'%';
  if(v>=100&&intro.ready){ $id('lk-intro-actions').classList.add('show'); return; }
  intro.timer=setTimeout(introTick,32);
}

/* ---------- audio (tiny WebAudio synth, no files) ---------- */
function audioInit(){ if(AC) return; try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; } }
function noiseBuf(sec){
  var n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=Math.random()*2-1;
  return b;
}
function startAmbient(){
  if(!AC||ambient) return;
  var src=AC.createBufferSource(); src.buffer=noiseBuf(4); src.loop=true;
  var f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=420;
  var g=AC.createGain(); g.gain.value=0.03;
  src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
  ambient={src:src};
}
function stopAmbient(){ if(ambient){ try{ambient.src.stop();}catch(e){} ambient=null; } }
function sfx(kind){
  if(!soundOn||!AC) return;
  try{
    var t=AC.currentTime,g=AC.createGain(); g.connect(AC.destination);
    if(kind==='take'){
      var s=AC.createBufferSource(); s.buffer=noiseBuf(0.5);
      var f=AC.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.2;
      f.frequency.setValueAtTime(500,t); f.frequency.exponentialRampToValueAtTime(2600,t+0.32);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.22,t+0.1); g.gain.exponentialRampToValueAtTime(0.0001,t+0.42);
      s.connect(f); f.connect(g); s.start(t); s.stop(t+0.5);
    }else{
      var o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(55,t+0.18);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.3,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
      o.connect(g); o.start(t); o.stop(t+0.25);
    }
  }catch(e){}
}
function setSound(on){
  soundOn=!!on;
  if(soundOn){ audioInit(); if(AC&&AC.state==='suspended'){try{AC.resume();}catch(e){}} startAmbient(); }
  else stopAmbient();
  var b=$id('lk-sound-btn'); if(b) b.textContent=soundOn?'🔊':'🔇';
}
function lkToggleSound(){ setSound(!soundOn); }

/* ---------- room load / dispose ---------- */
function loadRoom(tid){
  var club=CLUBS[tid];
  introShow(club);
  loadThree().then(function(){
    intro.target=46;
    setTimeout(function(){
      try{ buildRoom(tid); }
      catch(err){ if(window.console) console.error(err); $id('lk-intro').style.display='none'; lkExitRoom(); showToast('3D view failed to start on this device'); return; }
      intro.target=100; intro.ready=true;
    },80);
  }).catch(function(){
    $id('lk-intro').style.display='none';
    lkExitRoom();
    showToast('Could not load the 3D engine. Check your connection.');
  });
}
function disposeRoom(){
  if(rafId){cancelAnimationFrame(rafId);rafId=0;}
  if(scene){
    try{
      scene.traverse(function(o){
        if(o.geometry&&o.geometry.dispose) o.geometry.dispose();
        var m=o.material; if(!m) return;
        (Array.isArray(m)?m:[m]).forEach(function(mm){ if(mm.map&&mm.map.dispose) mm.map.dispose(); if(mm.dispose) mm.dispose(); });
      });
    }catch(e){}
  }
  if(renderer){try{renderer.dispose();}catch(e){}}
  scene=null;camera=null;renderer=null;S=null;
}

/* ---------- canvas helpers ---------- */
function loadImg(url,cb){
  try{
    var im=new Image();
    im.onload=function(){ if(scene) cb(im); };
    im.onerror=function(){};
    im.src=url;
  }catch(e){}
}
function cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function mkTex(c,repeat){
  var t=new T.CanvasTexture(c);
  if(T.SRGBColorSpace) t.colorSpace=T.SRGBColorSpace;
  t.anisotropy=maxAniso;
  if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}
  return t;
}
function numTex(num,color){
  var c=cv(256,256),g=c.getContext('2d');
  g.font='900 190px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=color;g.fillText(String(num),128,140);
  return mkTex(c);
}
function nameTex(name,color){
  var c=cv(512,96),g=c.getContext('2d'),fs=66;
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=color;
  g.font='800 '+fs+'px Arial,sans-serif';
  while(g.measureText(name).width>470&&fs>22){fs-=2;g.font='800 '+fs+'px Arial,sans-serif';}
  g.fillText(name,256,50);
  return mkTex(c);
}
function badgeTex(club,color){
  var c=cv(128,128),g=c.getContext('2d');
  g.strokeStyle=color;g.lineWidth=7;g.beginPath();g.arc(64,64,52,0,Math.PI*2);g.stroke();
  g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';g.font='800 34px Arial,sans-serif';
  g.fillText(club.abbr,64,66);
  return mkTex(c);
}
function drawCannon(g,cx,cy,col){
  g.save();g.strokeStyle=col;g.fillStyle=col;g.lineCap='round';g.lineJoin='round';
  var wx=cx-60,wy=cy+40;
  g.lineWidth=22;g.beginPath();g.arc(wx,wy,120,0,Math.PI*2);g.stroke();
  g.lineWidth=12;
  for(var i=0;i<8;i++){var a=i*Math.PI/4;g.beginPath();g.moveTo(wx,wy);g.lineTo(wx+Math.cos(a)*112,wy+Math.sin(a)*112);g.stroke();}
  g.beginPath();g.arc(wx,wy,24,0,Math.PI*2);g.fill();
  g.lineWidth=64;g.beginPath();g.moveTo(wx+10,wy-30);g.lineTo(cx+200,cy-62);g.stroke();
  g.lineWidth=20;g.beginPath();g.moveTo(cx+205,cy-100);g.lineTo(cx+232,cy-26);g.stroke();
  g.restore();
}
function crestCanvas(club){
  var c=cv(1024,1024),g=c.getContext('2d'),col=club.P.led;
  if(lum(club.color)>0.22) col=club.color;
  if(club.pal&&club.pal.band) col=club.pal.band;
  g.lineJoin='round';g.lineCap='round';
  g.beginPath();g.moveTo(170,140);g.quadraticCurveTo(512,70,854,140);g.lineTo(854,520);
  g.quadraticCurveTo(854,820,512,930);g.quadraticCurveTo(170,820,170,520);g.closePath();
  g.fillStyle='rgba(255,255,255,.42)';g.fill();g.lineWidth=34;g.strokeStyle=col;g.stroke();
  g.fillStyle=col;g.textAlign='center';g.textBaseline='middle';
  var nm=club.name.replace(/^Manchester /,'Man. ').replace(/ United$/,' Utd').replace(/ Hotspur$/,''),fs=190;
  g.font='italic 900 '+fs+'px Georgia,serif';
  while(g.measureText(nm).width>640&&fs>56){fs-=6;g.font='italic 900 '+fs+'px Georgia,serif';}
  g.fillText(nm,512,320);
  if(club.icon==='cannon') drawCannon(g,512,640,col);
  else{
    g.strokeStyle=col;g.lineWidth=22;g.beginPath();g.arc(512,620,118,0,Math.PI*2);g.stroke();
    g.lineWidth=12;g.beginPath();g.arc(512,620,56,0,Math.PI*2);g.stroke();
    g.font='800 64px Arial,sans-serif';g.fillText('2026/27',512,800);
  }
  return c;
}
function bandCanvas(club,img){
  var c=cv(2048,192),g=c.getContext('2d'),txt=club.motto||club.name.toUpperCase();
  g.fillStyle=club.P.band;g.fillRect(0,0,2048,192);
  var gr=g.createLinearGradient(0,0,0,192);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.16)');
  g.fillStyle=gr;g.fillRect(0,0,2048,192);
  g.fillStyle=club.color2;g.textAlign='center';g.textBaseline='middle';
  var fs=108;g.font='900 '+fs+'px "Arial Black",Arial,sans-serif';
  while(g.measureText(txt).width>1250&&fs>40){fs-=4;g.font='900 '+fs+'px "Arial Black",Arial,sans-serif';}
  g.fillText(txt,1024,100);
  var w=g.measureText(txt).width;
  [-1,1].forEach(function(sd){
    var ih=112,iw=(img&&img.width)?img.width*(ih/img.height):0;
    var x=1024+sd*(w/2+(iw?iw/2+64:150));
    if(iw){
      g.drawImage(img,x-iw/2,100-ih/2,iw,ih);
    }else if(club.icon==='cannon'){
      g.save();g.translate(x,104);if(sd<0)g.scale(-1,1);g.scale(0.27,0.27);drawCannon(g,0,0,club.color2);g.restore();
    }else{
      g.beginPath();g.arc(x,100,16,0,Math.PI*2);g.fill();
    }
  });
  return c;
}

/* ---------- room geometry: a U-shaped path the lockers follow ---------- */
var H=3.45,BY0=2.5,BY1=3.15,BAY=0.9,EYE=1.62;
function buildPath(N){
  var R=1.7,Lb=BAY*7,A=Lb/2+R;
  var Ls=Math.max(2.6,(N*BAY-Lb-Math.PI*R)/2);
  var step=0.08,pts=[],s=0;
  function push(x,z,dx,dz){pts.push({s:s,x:x,z:z,dx:dx,dz:dz,nx:-dz,nz:dx});}
  var i,n,a;
  n=Math.ceil(Ls/step);
  for(i=0;i<n;i++){push(-A,R+Ls-i*step,0,-1);s+=step;}
  n=Math.ceil((Math.PI*R/2)/step);
  for(i=0;i<n;i++){a=Math.PI+(i/n)*(Math.PI/2);push(-A+R+R*Math.cos(a),R+R*Math.sin(a),-Math.sin(a),Math.cos(a));s+=(Math.PI*R/2)/n;}
  n=Math.ceil(Lb/step);
  for(i=0;i<n;i++){push(-A+R+i*step,0,1,0);s+=step;}
  n=Math.ceil((Math.PI*R/2)/step);
  for(i=0;i<n;i++){a=1.5*Math.PI+(i/n)*(Math.PI/2);push(A-R+R*Math.cos(a),R+R*Math.sin(a),-Math.sin(a),Math.cos(a));s+=(Math.PI*R/2)/n;}
  n=Math.ceil(Ls/step);
  for(i=0;i<=n;i++){push(A,R+i*step,0,1);s+=step;}
  var total=s-step;
  var sBack=Ls+Math.PI*R/2+Lb/2;
  return {pts:pts,total:total,step:step,R:R,A:A,Ls:Ls,Lb:Lb,sBack:sBack,zEnd:R+Ls,zC:(R+Ls)*0.62};
}
function atS(P,s){
  s=clamp(s,0,P.total);
  var lo=0,hi=P.pts.length-2,mid;
  while(lo<hi){mid=(lo+hi+1)>>1;if(P.pts[mid].s<=s)lo=mid;else hi=mid-1;}
  var a=P.pts[lo],b=P.pts[lo+1],den=(b.s-a.s)||1,u=clamp((s-a.s)/den,0,1);
  var dx=a.dx+(b.dx-a.dx)*u,dz=a.dz+(b.dz-a.dz)*u,l=Math.hypot(dx,dz)||1;
  dx/=l;dz/=l;
  return {x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u,dx:dx,dz:dz,nx:-dz,nz:dx};
}
/* ribbon along the whole path. fn(p) -> [x0,y0,z0,x1,y1,z1]; u = s/uPer+uShift */
function stripGeo(P,fn,uPer,uShift){
  var pos=[],uv=[],idx=[],i,q,u,a;
  for(i=0;i<P.pts.length;i++){
    q=fn(P.pts[i]);pos.push(q[0],q[1],q[2],q[3],q[4],q[5]);
    u=P.pts[i].s/uPer+(uShift||0);uv.push(u,0,u,1);
    if(i>0){a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  return g;
}
function addStrip(P,fn,uPer,uShift,mat){
  var m=new T.Mesh(stripGeo(P,fn,uPer,uShift),mat);
  scene.add(m);return m;
}
function place(P,obj,s,lx,ly,lz){
  var p=atS(P,s);
  obj.position.set(p.x+p.dx*lx+p.nx*lz,ly,p.z+p.dz*lx+p.nz*lz);
  obj.rotation.y=Math.atan2(p.nx,p.nz);
  return p;
}
function std(color,rough,metal,extra){
  var o={color:color,roughness:rough==null?0.8:rough,metalness:metal||0};
  if(extra) for(var k in extra) o[k]=extra[k];
  return new T.MeshStandardMaterial(o);
}

/* ---------- build the whole room ---------- */
function buildRoom(tid){
  disposeRoom();
  T=window.THREE;
  var club=CLUBS[tid],P0=club.P;
  var players=SQUADS[tid].players.slice().sort(function(a,b){return a.num-b.num;});
  var N=players.length;
  var wrap=$id('lk-canvas-wrap'),canvas=$id('lk-canvas');
  var w=wrap.clientWidth||window.innerWidth,h=wrap.clientHeight||window.innerHeight;

  scene=new T.Scene();
  scene.background=new T.Color('#0a0807');
  camera=new T.PerspectiveCamera(70,w/h,0.05,60);
  camera.rotation.order='YXZ';
  try{ renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:'high-performance'}); }
  catch(e){ throw new Error('no webgl'); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(w,h,false);
  if(T.SRGBColorSpace) renderer.outputColorSpace=T.SRGBColorSpace;
  maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():4);

  var P=buildPath(N);
  var s0=(P.total-N*BAY)/2;

  /* lights: bright, soft, stadium-like */
  scene.add(new T.HemisphereLight(0xffffff,0xc9bcbc,0.78));
  var dl=new T.DirectionalLight(0xffffff,0.48);dl.position.set(0.5,6,P.zC+3);scene.add(dl);

  /* floor + crest + LED strip */
  var floor=new T.Mesh(new T.PlaneGeometry(40,40),std(P0.floor,0.4,0.06));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,P.zC);scene.add(floor);

  var crestT=mkTex(crestCanvas(club));
  var crest=new T.Mesh(new T.PlaneGeometry(4.2,4.2),new T.MeshStandardMaterial({map:crestT,transparent:true,roughness:0.5,depthWrite:false}));
  crest.rotation.x=-Math.PI/2;crest.position.set(0,0.006,P.R+P.Ls*0.2);scene.add(crest);
  loadImg(club.crestUrl||('crests/'+tid+'.png'),function(im){
    try{
      var c2=cv(1024,1024),g2=c2.getContext('2d'),r=Math.min(900/im.width,900/im.height);
      g2.drawImage(im,512-im.width*r/2,512-im.height*r/2,im.width*r,im.height*r);
      var nt=mkTex(c2);crest.material.map=nt;crest.material.needsUpdate=true;
    }catch(e){}
  });

  var ledC=cv(4,128),lg=ledC.getContext('2d'),grd=lg.createLinearGradient(0,128,0,0);
  grd.addColorStop(0,'rgba(255,255,255,.95)');grd.addColorStop(1,'rgba(255,255,255,0)');
  lg.fillStyle=grd;lg.fillRect(0,0,4,128);
  var glow=addStrip(P,function(p){return [p.x+p.nx*0.6,0.008,p.z+p.nz*0.6,p.x+p.nx*1.3,0.008,p.z+p.nz*1.3];},4,0,
    new T.MeshBasicMaterial({map:mkTex(ledC),color:P0.led,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,opacity:0.6}));
  addStrip(P,function(p){return [p.x+p.nx*0.7,0.012,p.z+p.nz*0.7,p.x+p.nx*0.76,0.012,p.z+p.nz*0.76];},4,0,
    new T.MeshBasicMaterial({color:P0.led,side:T.DoubleSide}));

  /* walls (white, with soft ambient-occlusion tile per bay) */
  var wc=cv(128,512),wg=wc.getContext('2d');
  wg.fillStyle=P0.wall;wg.fillRect(0,0,128,512);
  var yb=(1-BY0/H)*512,g1=wg.createLinearGradient(0,yb,0,yb+120);
  g1.addColorStop(0,'rgba(70,40,40,.32)');g1.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g1;wg.fillRect(0,yb,128,120);
  var g2=wg.createLinearGradient(0,512,0,512-130);
  g2.addColorStop(0,'rgba(70,40,40,.30)');g2.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g2;wg.fillRect(0,512-130,128,130);
  var g3=wg.createLinearGradient(0,0,20,0);g3.addColorStop(0,'rgba(70,40,40,.18)');g3.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g3;wg.fillRect(0,yb,20,512-yb);
  var g4=wg.createLinearGradient(128,0,108,0);g4.addColorStop(0,'rgba(70,40,40,.18)');g4.addColorStop(1,'rgba(70,40,40,0)');wg.fillStyle=g4;wg.fillRect(108,yb,20,512-yb);
  addStrip(P,function(p){return [p.x,0,p.z,p.x,H,p.z];},BAY,-s0/BAY,
    new T.MeshStandardMaterial({map:mkTex(wc,true),roughness:0.92,side:T.DoubleSide}));

  /* header band (curved overhang) with the club wording */
  var bandT=mkTex(bandCanvas(club),true);
  loadImg(club.iconUrl||('crests/'+tid+'-icon.png'),function(im){
    try{bandT.image=bandCanvas(club,im);bandT.needsUpdate=true;}catch(e){}
  });
  var tile=7.2;
  addStrip(P,function(p){return [p.x+p.nx*0.42,BY0,p.z+p.nz*0.42,p.x+p.nx*0.42,BY1,p.z+p.nz*0.42];},tile,-P.sBack/tile+0.5,
    new T.MeshStandardMaterial({map:bandT,roughness:0.45,side:T.DoubleSide}));
  addStrip(P,function(p){return [p.x,BY0,p.z,p.x+p.nx*0.42,BY0,p.z+p.nz*0.42];},4,0,
    std(shade(P0.band,-0.18),0.6,0,{side:T.DoubleSide}));
  addStrip(P,function(p){return [p.x+p.nx*0.42,BY1,p.z+p.nz*0.42,p.x+p.nx*0.42,BY1+0.03,p.z+p.nz*0.42];},4,0,
    new T.MeshBasicMaterial({color:0xfff2e0,side:T.DoubleSide}));

  /* bench: red cushion on open white shelves */
  var cc=cv(256,128),cg=cc.getContext('2d');
  cg.fillStyle='#f4f3f1';cg.fillRect(0,0,256,128);
  var ig=cg.createLinearGradient(0,14,0,114);ig.addColorStop(0,'#7d8087');ig.addColorStop(1,'#c9cbd0');
  cg.fillStyle=ig;cg.fillRect(14,14,228,100);
  addStrip(P,function(p){return [p.x+p.nx*0.58,0.05,p.z+p.nz*0.58,p.x+p.nx*0.58,0.37,p.z+p.nz*0.58];},BAY,-s0/BAY,
    new T.MeshStandardMaterial({map:mkTex(cc,true),roughness:0.7,side:T.DoubleSide}));
  var cush=std(P0.cushion,0.55,0.02,{side:T.DoubleSide});
  addStrip(P,function(p){return [p.x+p.nx*0.12,0.47,p.z+p.nz*0.12,p.x+p.nx*0.62,0.47,p.z+p.nz*0.62];},4,0,cush);
  addStrip(P,function(p){return [p.x+p.nx*0.62,0.36,p.z+p.nz*0.62,p.x+p.nx*0.62,0.47,p.z+p.nz*0.62];},4,0,cush);

  /* red dividers between bays */
  var divMat=std(P0.div,0.42,0.05),divGeo=new T.BoxGeometry(0.055,BY0-0.47,0.62);
  var i,d;
  for(i=0;i<=N;i++){
    d=new T.Mesh(divGeo,divMat);
    place(P,d,s0+i*BAY,0,0.47+(BY0-0.47)/2,0.31);
    scene.add(d);
  }

  /* ceiling + down-lights + entrance wall */
  var ceil=new T.Mesh(new T.PlaneGeometry(P.A*2+0.6,P.zEnd+0.6),std('#f6f4f1',1,0));
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,H,P.zEnd/2);scene.add(ceil);
  var dlGeo=new T.CircleGeometry(0.13,18),dlMat=new T.MeshBasicMaterial({color:0xffffff}),zi,xi,dm;
  for(zi=0;zi<4;zi++){ for(xi=-1;xi<=1;xi++){
    dm=new T.Mesh(dlGeo,dlMat);dm.rotation.x=Math.PI/2;
    dm.position.set(xi*2.3,H-0.01,P.R+0.8+zi*Math.max(1.6,(P.Ls-0.8)/3));scene.add(dm);
  }}
  var front=new T.Mesh(new T.PlaneGeometry(P.A*2+0.4,H),std(P0.wall,0.95,0));
  front.rotation.y=Math.PI;front.position.set(0,H/2,P.zEnd+0.02);scene.add(front);
  [-1,1].forEach(function(sd){
    var pil=new T.Mesh(new T.BoxGeometry(0.55,H,0.5),divMat);
    pil.position.set(sd*(P.A-0.55),H/2,P.zEnd-0.25);scene.add(pil);
  });
  var bc=cv(1024,512),bg=bc.getContext('2d'),bgr=bg.createLinearGradient(0,0,1024,512);
  bgr.addColorStop(0,shade(P0.band,0.05));bgr.addColorStop(1,shade(P0.band,-0.45));
  bg.fillStyle=bgr;bg.fillRect(0,0,1024,512);
  bg.fillStyle='rgba(255,255,255,.1)';
  for(i=0;i<220;i++){bg.beginPath();bg.arc(Math.random()*1024,Math.random()*512,2+Math.random()*7,0,Math.PI*2);bg.fill();}
  bg.fillStyle=club.color2;bg.textAlign='center';bg.textBaseline='middle';
  var bf=96;bg.font='900 '+bf+'px "Arial Black",Arial,sans-serif';
  var bt=(club.motto||club.name.toUpperCase());
  while(bg.measureText(bt).width>900&&bf>36){bf-=4;bg.font='900 '+bf+'px "Arial Black",Arial,sans-serif';}
  bg.fillText(bt,512,230);bg.font='700 40px Arial,sans-serif';bg.fillText('2026/27',512,330);
  var banner=new T.Mesh(new T.PlaneGeometry(3.6,1.8),new T.MeshBasicMaterial({map:mkTex(bc)}));
  banner.rotation.y=Math.PI;banner.position.set(0,1.7,P.zEnd+0.0);scene.add(banner);

  /* hanging rails, soft shadows, shirts */
  var railMat=std('#a8adb3',0.35,0.35),railGeo=new T.CylinderGeometry(0.011,0.011,BAY*0.98,8);
  var shC=cv(128,128),sg=shC.getContext('2d'),rg=sg.createRadialGradient(64,64,6,64,64,62);
  rg.addColorStop(0,'rgba(40,25,25,.30)');rg.addColorStop(1,'rgba(40,25,25,0)');sg.fillStyle=rg;sg.fillRect(0,0,128,128);
  var shMat=new T.MeshBasicMaterial({map:mkTex(shC),transparent:true,depthWrite:false}),shGeo=new T.PlaneGeometry(0.95,1.15);
  S={team:tid,club:club,P:P,shirts:[],pick:[],inspect:null,hover:null,ptr:{x:0,y:0,has:false},
     cam:{x:0,z:P.zEnd-0.9,yaw:0,pitch:0,yawT:0,pitchT:0,fov:70,fovT:70},
     intro:{active:false,t:0,dur:3.4,startZ:P.zEnd-0.9,endZ:P.zC},
     spin:0,spinT:0,tilt:0,tiltT:0,last:performance.now(),time:0,frame:0,
     ray:new T.Raycaster(),vtmp:new T.Vector3(),w:w,h:h};
  S.cam.z=S.intro.startZ;
  var kitCache={};
  for(i=0;i<N;i++){
    var s=s0+(i+0.5)*BAY,rail=new T.Mesh(railGeo,railMat);
    rail.rotation.order='YXZ';
    var pp=place(P,rail,s,0,2.0,0.16);rail.rotation.set(0,Math.atan2(pp.nx,pp.nz),Math.PI/2);scene.add(rail);
    var sh=new T.Mesh(shGeo,shMat);place(P,sh,s,0,1.5,0.02);scene.add(sh);
    var shirt=buildShirt(players[i],club,kitCache);
    place(P,shirt,s,0,1.93,0.16);
    shirt.userData.homePos=shirt.position.clone();
    shirt.userData.homeRot=shirt.rotation.y;
    shirt.userData.k=0;shirt.userData.h=0;shirt.userData.seed=i*1.7;
    scene.add(shirt);S.shirts.push(shirt);
  }
  S.shirts.forEach(function(sh){sh.traverse(function(o){if(o.isMesh&&o.userData.pickable)S.pick.push(o);});});

  bindRoomInput(canvas);
  onResize();
  animate();
}

/* ---------- the shirt (flat-lay silhouette on a hanger) ---------- */
function shirtShape(sign,kind){
  var s=new T.Shape();
  if(kind==='body'){
    s.moveTo(-0.085,0);s.lineTo(-0.235,-0.045);s.lineTo(-0.215,-0.19);s.lineTo(-0.215,-0.72);
    s.lineTo(0.215,-0.72);s.lineTo(0.215,-0.19);s.lineTo(0.235,-0.045);s.lineTo(0.085,0);
    s.quadraticCurveTo(0,-0.1,-0.085,0);
  }else{
    s.moveTo(sign*0.232,-0.044);s.lineTo(sign*0.405,-0.19);s.lineTo(sign*0.345,-0.29);s.lineTo(sign*0.212,-0.19);s.closePath();
  }
  return s;
}
var fabricTex=null;
function getFabric(){
  if(fabricTex) return fabricTex;
  var c=cv(64,64),g=c.getContext('2d');
  g.fillStyle='#ffffff';g.fillRect(0,0,64,64);
  g.strokeStyle='rgba(0,0,0,.07)';g.lineWidth=1;
  for(var i=-64;i<64;i+=4){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke();}
  fabricTex=new T.CanvasTexture(c);
  fabricTex.wrapS=fabricTex.wrapT=T.RepeatWrapping;fabricTex.repeat.set(22,22);
  return fabricTex;
}
function rod(x0,y0,x1,y1,r,mat){
  var L=Math.hypot(x1-x0,y1-y0),m=new T.Mesh(new T.CylinderGeometry(r,r,L,6),mat);
  m.position.set((x0+x1)/2,(y0+y1)/2,0);
  m.rotation.z=Math.atan2(y1-y0,x1-x0)-Math.PI/2;
  return m;
}
function buildShirt(player,club,cache){
  var kit=(player.pos==='g')?club.gkKit:club.kitHome;
  var sleeveC=kit.sleeves||kit.body;
  var key=kit.body+'|'+sleeveC;
  var C=cache[key];
  if(!C){
    var ex={depth:0.03,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1,curveSegments:8};
    var gb=new T.ExtrudeGeometry(shirtShape(0,'body'),ex);gb.translate(0,0,-0.015);
    var gl=new T.ExtrudeGeometry(shirtShape(-1,'sleeve'),{depth:0.032,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1,curveSegments:4});gl.translate(0,0,-0.016);
    var gr=new T.ExtrudeGeometry(shirtShape(1,'sleeve'),{depth:0.032,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:1,curveSegments:4});gr.translate(0,0,-0.016);
    C=cache[key]={gb:gb,gl:gl,gr:gr,
      mb:new T.MeshStandardMaterial({color:kit.body,map:getFabric(),roughness:0.88,metalness:0}),
      ms:new T.MeshStandardMaterial({color:sleeveC,map:getFabric(),roughness:0.88,metalness:0}),
      trim:new T.MeshStandardMaterial({color:club.color2,roughness:0.7}),
      wire:new T.MeshStandardMaterial({color:0x9a9fa6,roughness:0.4,metalness:0.4}),
      collar:new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(-0.085,0,0),new T.Vector3(0,-0.1,0),new T.Vector3(0.085,0,0)),12,0.008,6,false)
    };
  }
  var g=new T.Group();
  var body=new T.Mesh(C.gb,C.mb),sl=new T.Mesh(C.gl,C.ms),sr=new T.Mesh(C.gr,C.ms);
  [body,sl,sr].forEach(function(m){m.userData.pickable=true;m.userData.shirt=g;g.add(m);});
  [0.02,-0.02].forEach(function(z){var c=new T.Mesh(C.collar,C.trim);c.position.z=z;g.add(c);});
  /* hanger */
  g.add(rod(0,0.03,0.23,-0.045,0.0035,C.wire));
  g.add(rod(0,0.03,-0.23,-0.045,0.0035,C.wire));
  var hook=new T.Mesh(new T.TorusGeometry(0.02,0.0035,6,14,Math.PI*1.45),C.wire);
  hook.position.set(0,0.052,0);hook.rotation.z=Math.PI*0.25;g.add(hook);
  /* back print: name over number */
  var pm=function(t){return new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});};
  var nm=new T.Mesh(new T.PlaneGeometry(0.3,0.056),pm(nameTex(surname(player.n),kit.num)));nm.position.set(0,-0.17,0.0235);g.add(nm);
  var nu=new T.Mesh(new T.PlaneGeometry(0.27,0.27),pm(numTex(player.num,kit.num)));nu.position.set(0,-0.36,0.0235);g.add(nu);
  /* chest badge (front) */
  var bd=new T.Mesh(new T.PlaneGeometry(0.075,0.075),pm(badgeTex(club,kit.num)));bd.position.set(0.085,-0.15,-0.0235);bd.rotation.y=Math.PI;g.add(bd);
  g.userData.player=player;
  return g;
}

/* ---------- take a shirt down / hang it back ---------- */
function takeDown(sh){
  if(!S||S.inspect) return;
  S.inspect={shirt:sh};S.spin=0;S.spinT=0;S.tilt=0;S.tiltT=0;S.hover=null;
  var hp=sh.userData.homePos,c=S.cam;
  var tx=hp.x-c.x,ty=hp.y-0.36-EYE,tz=hp.z-c.z;
  c.yawT=c.yaw+angDiff(Math.atan2(-tx,-tz)-c.yaw);
  c.pitchT=clamp(Math.atan2(ty,Math.hypot(tx,tz)),-0.5,0.5);
  showSheet(sh.userData.player,S.club);
  $id('lk-dim').classList.add('on');
  $id('lk-hint').style.opacity='0';
  sfx('take');
}
function closeInspect(silent){
  if(!S||!S.inspect){ hideSheet(); var d0=$id('lk-dim'); if(d0)d0.classList.remove('on'); return; }
  S.inspect=null;
  hideSheet();
  $id('lk-dim').classList.remove('on');
  if(!silent) sfx('put');
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
function hideSheet(){ SEL=null; var s=$id('lk-sheet'); if(s) s.classList.remove('open'); }
function posLabel(p){return {g:'Goalkeeper',d:'Defender',m:'Midfielder',f:'Forward'}[p]||'Player'}

/* ---------- enter the room (after the intro) ---------- */
function lkEnterRoom(withSound){
  if(!S) return;
  setSound(!!withSound);
  var el=$id('lk-intro');el.classList.add('out');
  setTimeout(function(){ if(el.classList.contains('out')) el.style.display='none'; },750);
  S.intro.active=true;S.intro.t=0;
  var touch=window.matchMedia&&window.matchMedia('(hover:none)').matches;
  showHint(touch?'Drag to look around · Pinch to zoom · Tap a shirt to take it down':'Drag to look around · Scroll to zoom · Click a shirt to take it down',6000);
}
function showHint(txt,ms){
  var h=$id('lk-hint');h.textContent=txt;h.style.display='block';h.style.opacity='1';
  clearTimeout(hintTimer);hintTimer=setTimeout(function(){h.style.opacity='0';},ms||5000);
}
function lkResetView(){
  if(!S) return;
  closeInspect();
  S.cam.yawT=0;S.cam.pitchT=0;S.cam.fovT=70;
}
function lkTour(){
  var club=S&&S.club||CLUBS[curTeam];
  if(!club||!club.tour) return;
  var box=$id('lk-tour');
  box.innerHTML='<video id="lk-tour-video" src="'+club.tour+'" controls playsinline autoplay></video><button class="lk-btn lk-btn-ghost" style="flex:none;min-width:140px" onclick="lkCloseTour()">Close</button>';
  box.classList.add('show');
  var v=$id('lk-tour-video');
  v.onerror=function(){ box.classList.remove('show'); showToast('Tour video not found — upload '+club.tour+' next to index.html'); };
}
function lkCloseTour(){
  var box=$id('lk-tour'),v=$id('lk-tour-video');
  if(v){try{v.pause();}catch(e){}}
  box.classList.remove('show');box.innerHTML='';
}

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
  closeInspect(true);
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

/* ---------- input: look around, zoom, hover, tap ---------- */
function pickShirt(nx,ny){
  S.ray.setFromCamera({x:nx,y:ny},camera);
  var hit=S.ray.intersectObjects(S.pick,false)[0];
  return hit?hit.object.userData.shirt:null;
}
function ndc(canvas,e){
  var r=canvas.getBoundingClientRect();
  return {x:((e.clientX-r.left)/r.width)*2-1,y:-(((e.clientY-r.top)/r.height)*2-1)};
}
function bindRoomInput(canvas){
  if(canvas.__lkBound) return;
  canvas.__lkBound=true;
  var down=false,moved=false,lx=0,ly=0,sx=0,sy=0,pinching=false,pinchD=0,pinchFov=70,pinchEnd=0;
  canvas.addEventListener('pointerdown',function(e){
    if(!S) return;
    down=true;moved=false;lx=sx=e.clientX;ly=sy=e.clientY;
    if(canvas.setPointerCapture){try{canvas.setPointerCapture(e.pointerId);}catch(x){}}
  });
  canvas.addEventListener('pointermove',function(e){
    if(!S) return;
    if(!down){
      if(e.pointerType==='mouse'){var p=ndc(canvas,e);S.ptr.x=p.x;S.ptr.y=p.y;S.ptr.has=true;}
      return;
    }
    if(pinching) return;
    var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    if(Math.abs(e.clientX-sx)>6||Math.abs(e.clientY-sy)>6) moved=true;
    if(!moved) return;
    if(S.inspect){ S.spinT+=dx*0.013;S.tiltT=clamp(S.tiltT+dy*0.005,-0.45,0.45); }
    else{
      var k=S.cam.fov/70;
      S.cam.yawT+=dx*0.0052*k;
      S.cam.pitchT=clamp(S.cam.pitchT+dy*0.0042*k,-0.55,0.55);
    }
  });
  canvas.addEventListener('pointerup',function(e){
    if(!S) return;
    var was=down;down=false;
    if(!was||moved||pinching||Date.now()-pinchEnd<300) return;
    var p=ndc(canvas,e),sh=pickShirt(p.x,p.y);
    if(S.inspect){ if(!sh||sh!==S.inspect.shirt) closeInspect(); }
    else if(sh) takeDown(sh);
  });
  canvas.addEventListener('pointercancel',function(){down=false;});
  canvas.addEventListener('pointerleave',function(){ if(S) S.ptr.has=false; });
  canvas.addEventListener('touchstart',function(e){
    if(e.touches.length===2&&S){
      pinching=true;pinchFov=S.cam.fovT;
      pinchD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    }
  },{passive:true});
  canvas.addEventListener('touchmove',function(e){
    if(pinching&&e.touches.length===2&&S&&!S.inspect){
      var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      S.cam.fovT=clamp(pinchFov*(pinchD/d),42,88);
    }
  },{passive:true});
  canvas.addEventListener('touchend',function(e){ if(e.touches.length<2&&pinching){pinching=false;pinchEnd=Date.now();} },{passive:true});
  canvas.addEventListener('wheel',function(e){
    e.preventDefault();
    if(S&&!S.inspect) S.cam.fovT=clamp(S.cam.fovT+e.deltaY*0.03,42,88);
  },{passive:false});
  window.addEventListener('resize',onResize);
}
function onResize(){
  if(!renderer||!camera) return;
  var wrap=$id('lk-canvas-wrap');
  var w=wrap.clientWidth||window.innerWidth,h=wrap.clientHeight||window.innerHeight;
  if(!w||!h) return;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
  if(S){S.w=w;S.h=h;}
}

/* ---------- render loop ---------- */
function animate(){
  rafId=requestAnimationFrame(animate);
  if(!renderer||!S) return;
  var pg=$id('page-lockers');
  if(!pg||!pg.classList.contains('active')) return;
  var wrap=$id('lk-canvas-wrap');
  if(wrap&&(wrap.clientWidth!==S.w||wrap.clientHeight!==S.h)) onResize();

  var now=performance.now(),dt=Math.min(0.05,(now-S.last)/1000);S.last=now;S.time+=dt;S.frame++;
  var c=S.cam,k=Math.min(1,dt*9);

  /* walk-in */
  var bob=0;
  if(S.intro.active){
    S.intro.t+=dt;
    var u=clamp(S.intro.t/S.intro.dur,0,1),e3=1-Math.pow(1-u,3);
    c.z=S.intro.startZ+(S.intro.endZ-S.intro.startZ)*e3;
    bob=Math.sin(S.intro.t*7.5)*0.011*(1-u);
    if(u>=1) S.intro.active=false;
  }
  c.yaw+=angDiff(c.yawT-c.yaw)*k;
  c.pitch+=(c.pitchT-c.pitch)*k;
  c.fov+=(c.fovT-c.fov)*k;
  if(Math.abs(camera.fov-c.fov)>0.01){camera.fov=c.fov;camera.updateProjectionMatrix();}
  camera.position.set(c.x,EYE+bob,c.z);
  camera.rotation.set(c.pitch,c.yaw,0);

  /* hover (desktop) */
  if(!S.inspect&&S.ptr.has&&(S.frame&1)===0){
    var hs=pickShirt(S.ptr.x,S.ptr.y);
    if(hs!==S.hover){S.hover=hs;$id('lk-canvas').classList.toggle('lk-pointer',!!hs);}
  }else if(S.inspect&&S.hover){S.hover=null;$id('lk-canvas').classList.remove('lk-pointer');}

  /* shirt target in front of the camera while inspecting */
  var fx=-Math.sin(c.yaw)*Math.cos(c.pitch),fy=Math.sin(c.pitch),fz=-Math.cos(c.yaw)*Math.cos(c.pitch);
  var tgx=c.x+fx*1.25,tgy=EYE+fy*1.25+0.12+0.47,tgz=c.z+fz*1.25;
  var faceY=Math.atan2(-fx,-fz);
  S.spin+=(S.spinT-S.spin)*k;S.tilt+=(S.tiltT-S.tilt)*k;

  for(var i=0;i<S.shirts.length;i++){
    var sh=S.shirts[i],ud=sh.userData,isIn=S.inspect&&S.inspect.shirt===sh;
    ud.k+=((isIn?1:0)-ud.k)*Math.min(1,dt*6.5);
    ud.h+=((S.hover===sh?1:0)-ud.h)*Math.min(1,dt*10);
    var hp=ud.homePos,ke=ud.k*ud.k*(3-2*ud.k);
    if(ud.k>0.002){
      sh.position.set(hp.x+(tgx-hp.x)*ke,hp.y+(tgy-hp.y)*ke+Math.sin(Math.PI*ke)*0.22,hp.z+(tgz-hp.z)*ke);
      sh.rotation.y=ud.homeRot+angDiff(faceY-ud.homeRot)*ke+S.spin*ke;
      sh.rotation.x=S.tilt*ke;
      sh.rotation.z=0;
      var sc=1+0.3*ke;sh.scale.set(sc,sc,sc);
    }else{
      var sw=Math.sin(S.time*0.9+ud.seed)*0.012;
      sh.position.set(hp.x,hp.y+0.035*ud.h,hp.z);
      sh.rotation.set(0,ud.homeRot,sw);
      var hs2=1+0.05*ud.h;sh.scale.set(hs2,hs2,hs2);
    }
  }
  renderer.render(scene,camera);
}

/* ---------- expose + bootstrap ---------- */
window.showLockers=showLockers;
window.lkEnter=lkEnter;
window.lkExitRoom=lkExitRoom;
window.lkAddKit=lkAddKit;
window.lkPersonalize=lkPersonalize;
window.lkCloseLocker=function(){closeInspect();};
window.lkEnterRoom=lkEnterRoom;
window.lkToggleSound=lkToggleSound;
window.lkResetView=lkResetView;
window.lkTour=lkTour;
window.lkCloseTour=lkCloseTour;

function injectMarkup(){
  if($id('page-lockers')) return;
  var pg=document.createElement('div');
  pg.id='page-lockers';
  pg.className='page';
  pg.innerHTML=
    '<div class="lk-wrap" id="lk-canvas-wrap">'+
      '<canvas id="lk-canvas"></canvas>'+
      '<div class="lk-dim" id="lk-dim"></div>'+
      '<div class="lk-topbar" id="lk-topbar">'+
        '<button class="lk-back" onclick="lkExitRoom()">← Teams</button>'+
        '<div class="lk-teamname" id="lk-teamname"></div>'+
        '<button class="lk-ibtn" id="lk-tour-btn" style="display:none" onclick="lkTour()" title="Watch the real locker room">▶</button>'+
        '<button class="lk-ibtn" id="lk-reset-btn" onclick="lkResetView()" title="Reset view">⟲</button>'+
        '<button class="lk-ibtn" id="lk-sound-btn" onclick="lkToggleSound()" title="Sound">🔇</button>'+
      '</div>'+
      '<div class="lk-hint" id="lk-hint"></div>'+
      '<div class="lk-intro" id="lk-intro">'+
        '<div class="lk-intro-kicker">Interactive 3D locker room</div>'+
        '<div class="lk-intro-count" id="lk-intro-count">000</div>'+
        '<div class="lk-intro-label" id="lk-intro-label">Opening the locker room</div>'+
        '<div class="lk-intro-bar"><i id="lk-intro-fill"></i></div>'+
        '<div class="lk-intro-actions" id="lk-intro-actions">'+
          '<button class="lk-enter" onclick="lkEnterRoom(true)">🔊 Enter with sound</button>'+
          '<button class="lk-enter ghost" onclick="lkEnterRoom(false)">🔇 Enter muted</button>'+
          '<div class="lk-intro-note">Best with sound</div>'+
        '</div>'+
      '</div>'+
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
      '<div class="lk-tour" id="lk-tour"></div>'+
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
